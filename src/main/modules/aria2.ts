import crypto from 'crypto';
import path from 'path';
import { spawn, type ChildProcess } from 'child_process';

import { app } from 'electron';
import fs from 'fs-extra';
import Logger from 'electron-log/main';

import { mapPort, type PortMapping } from './upnp';
import { isMac, isWindows } from './platform';
import {
	MANAGED_MOD_FILES,
	classifyModFile,
	noteDownloadSize
} from './playerFiles';

const TORRENT_NAME = 'client';

const BIN_NAME = isWindows ? 'aria2c.exe' : 'aria2c';

const bin = () => {
	const bundled = app.isPackaged
		? path.join(process.resourcesPath, BIN_NAME)
		: path.join(app.getAppPath(), 'resources', BIN_NAME);
	if (isWindows || fs.existsSync(bundled)) return bundled;
	// an app started from Finder has no Homebrew folder on its PATH
	if (isMac)
		return (
			['/opt/homebrew/bin/aria2c', '/usr/local/bin/aria2c'].find(p =>
				fs.existsSync(p)
			) ?? 'aria2c'
		);
	return 'aria2c';
};

// the static Linux aria2c has one compiled-in CA path; point it at this distro's bundle
const CA_BUNDLES = [
	'/etc/ssl/certs/ca-certificates.crt',
	'/etc/pki/tls/certs/ca-bundle.crt',
	'/etc/ssl/ca-bundle.pem',
	'/etc/ssl/cert.pem'
];
const caArgs = (): string[] => {
	if (isWindows) return [];
	const found = CA_BUNDLES.find(p => fs.existsSync(p));
	return found ? [`--ca-certificate=${found}`] : [];
};

type SyncOpts = {
	torrent: string;
	clientDir: string;
	totalBytes?: number;
	checkIntegrity?: boolean;
	seedTime?: number;
	selectFiles?: number[];
	onProgress?: (p: SyncProgress) => void;
	signal?: AbortSignal;
};

export type SyncProgress = {
	progress: number;
	bytesDone: number;
	bytesTotal: number;
	bytesPerSecond: number;
};

const ensureJunction = async (clientDir: string): Promise<string> => {
	await fs.ensureDir(clientDir);
	const staging = path.join(app.getPath('userData'), 'torrent-root');
	await fs.ensureDir(staging);
	const link = path.join(staging, TORRENT_NAME);

	const target = path.resolve(clientDir);
	try {
		const cur = await fs.lstat(link);
		if (cur.isSymbolicLink() || cur.isDirectory()) {
			const resolved = await fs.realpath(link).catch(() => '');
			if (path.resolve(resolved) === target) return staging;
		}
		await fs.remove(link);
	} catch {}
	await fs.symlink(target, link, 'junction');
	return staging;
};

const SIZE_UNITS: Record<string, number> = {
	B: 1,
	KiB: 1024,
	MiB: 1024 ** 2,
	GiB: 1024 ** 3,
	TiB: 1024 ** 4
};

const toBytes = (s: string): number => {
	const m = /^([\d.]+)(B|KiB|MiB|GiB|TiB)$/.exec(s.trim());
	if (!m) return 0;
	return parseFloat(m[1]) * (SIZE_UNITS[m[2]] ?? 1);
};

const parseProgress = (
	line: string,
	totalHint: number
): SyncProgress | undefined => {
	const chk =
		/CHK:([\d.]+(?:B|KiB|MiB|GiB|TiB))\/([\d.]+(?:B|KiB|MiB|GiB|TiB))\((\d+)%\)/.exec(
			line
		);
	if (chk)
		return {
			progress: parseInt(chk[3], 10) / 100,
			bytesDone: toBytes(chk[1]),
			bytesTotal: toBytes(chk[2]) || totalHint,
			bytesPerSecond: 0
		};
	const frac =
		/([\d.]+(?:B|KiB|MiB|GiB|TiB))\/([\d.]+(?:B|KiB|MiB|GiB|TiB))\((\d+)%\)/.exec(
			line
		);
	if (!frac) return undefined;
	const dl = /DL:([\d.]+(?:B|KiB|MiB|GiB|TiB))/.exec(line);
	return {
		progress: parseInt(frac[3], 10) / 100,
		bytesDone: toBytes(frac[1]),
		bytesTotal: toBytes(frac[2]) || totalHint,
		bytesPerSecond: dl ? toBytes(dl[1]) : 0
	};
};

let syncChild: ChildProcess | undefined;

// aria2's --stop-with-process is unreliable on Windows; kill the download
// child explicitly on quit or it keeps running headless
export const stopSyncing = (): void => {
	syncChild?.kill();
	syncChild = undefined;
};

// aria2's cached .torrent metadata, matched by extension since the server picks the
// filename; --continue would otherwise keep reusing a stale copy
const clearTorrentMetadata = async (dir: string): Promise<void> => {
	const entries = await fs.readdir(dir).catch(() => [] as string[]);
	await Promise.all(
		entries
			.filter(n => /\.torrent(\.aria2)?$/i.test(n))
			.map(n => fs.remove(path.join(dir, n)).catch(() => undefined))
	);
};

export class SyncCancelled extends Error {
	constructor() {
		super('download cancelled');
	}
}

export class SyncStalled extends Error {
	constructor() {
		super('download stalled');
	}
}

// --bt-stop-timeout misses an aria2c that hangs or stops printing
const STALL_MS = 10 * 60_000;

export const syncClient = (opts: SyncOpts): Promise<void> =>
	new Promise<void>((resolve, reject) => {
		let child: ChildProcess | undefined;
		ensureJunction(opts.clientDir)
			.then(async dir => {
				await clearTorrentMetadata(dir);
				const args = [
					`--dir=${dir}`,
					`--seed-time=${opts.seedTime ?? 0}`,
					`--check-integrity=${opts.checkIntegrity ? 'true' : 'false'}`,
					'--bt-save-metadata=true',
					'--bt-remove-unselected-file=false',
					'--continue=true',
					'--allow-overwrite=true',
					'--auto-file-renaming=false',
					'--file-allocation=none',
					'--disk-cache=128M',
					'--stream-piece-selector=inorder',
					'--max-tries=0',
					'--retry-wait=5',
					'--bt-stop-timeout=120',
					'--auto-save-interval=15',
					'--summary-interval=1',
					'--console-log-level=warn',
					'--enable-dht=true',
					'--bt-enable-lpd=true',
					'--max-connection-per-server=8',
					'--split=16',
					'--min-split-size=1M',
					...(opts.selectFiles?.length
						? [`--select-file=${opts.selectFiles.join(',')}`]
						: []),
					...caArgs(),
					'--stop-with-process=' + process.pid,
					opts.torrent
				];
				Logger.log(`aria2c ${args.join(' ')}`);
				if (opts.signal?.aborted) throw new SyncCancelled();
				child = spawn(bin(), args, { windowsHide: true });
				syncChild = child;

				let stopped: Error | undefined;
				let lastBytes = -1;
				let lastChecked = '';
				let lastMove = Date.now();
				const watchdog = setInterval(() => {
					if (Date.now() - lastMove < STALL_MS || stopped) return;
					Logger.warn(
						`aria2c made no progress for ${
							STALL_MS / 60_000
						} minutes; stopping it`
					);
					stopped = new SyncStalled();
					child?.kill();
				}, 15_000);

				const onLine = (buf: Buffer) => {
					for (const line of buf.toString().split(/\r?\n/)) {
						if (!line.trim()) continue;
						const p = parseProgress(line, opts.totalBytes ?? 0);
						const checked =
							/CHK:([\d.]+(?:B|KiB|MiB|GiB|TiB))/.exec(line)?.[1] ?? '';
						if (
							(p && p.bytesDone > lastBytes) ||
							(checked && checked !== lastChecked)
						) {
							lastMove = Date.now();
							if (p) lastBytes = p.bytesDone;
							lastChecked = checked;
						}
						if (p) opts.onProgress?.(p);
						else Logger.log(`[aria2] ${line}`);
					}
				};
				child.stdout?.on('data', onLine);
				child.stderr?.on('data', onLine);

				opts.signal?.addEventListener('abort', () => {
					stopped ??= new SyncCancelled();
					child?.kill();
				});

				child.on('error', e => {
					clearInterval(watchdog);
					reject(e);
				});
				child.on('close', code => {
					clearInterval(watchdog);
					if (syncChild === child) syncChild = undefined;
					if (stopped) reject(stopped);
					else if (code === 0) resolve();
					else reject(new Error(`aria2c exited with code ${code}`));
				});
			})
			.catch(reject);
	});

export const aria2Available = () => fs.pathExists(bin());

export const downloadIsComplete = async (): Promise<boolean> => {
	const control = path.join(
		app.getPath('userData'),
		'torrent-root',
		`${TORRENT_NAME}.aria2`
	);
	return !(await fs.pathExists(control));
};

export const clearTorrentResumeState = async (): Promise<void> => {
	const dir = path.join(app.getPath('userData'), 'torrent-root');
	await fs
		.remove(path.join(dir, `${TORRENT_NAME}.aria2`))
		.catch(() => undefined);
	await clearTorrentMetadata(dir);
};

export const torrentUrl = (): string | undefined =>
	import.meta.env.MAIN_VITE_CLIENT_TORRENT_URL || undefined;

export const isTorrentMode = (): boolean => !!torrentUrl();

export const raidVisualsUrl = (): string | undefined =>
	import.meta.env.MAIN_VITE_RAID_VISUALS_URL || undefined;

export const clientPatchUrl = (): string | undefined =>
	import.meta.env.MAIN_VITE_CLIENT_PATCH_URL || undefined;

export type TorrentFile = { path: string[]; length: number };

export type ClientTorrent = {
	sha: string;
	bytes: Buffer;
	name: string;
	files: TorrentFile[];
	webSeeds: string[];
	pieceLength: number;
	pieces: Buffer;
	file: string;
};

const TORRENT_TRIES = 3;
const TORRENT_TIMEOUT_MS = 20_000;

const localTorrentFile = () =>
	path.join(app.getPath('userData'), 'client-download.torrent');

const parseClientTorrent = (
	bytes: Buffer
): Omit<ClientTorrent, 'sha' | 'bytes' | 'file'> => {
	const [t] = bdecode(bytes) as [
		{
			'url-list'?: unknown;
			'info'?: {
				'name'?: unknown;
				'piece length'?: unknown;
				'pieces'?: unknown;
				'files'?: { path?: unknown; length?: unknown }[];
			};
		},
		number
	];
	const info = t?.info;
	const files = info?.files;
	if (
		!info ||
		typeof info.name !== 'string' ||
		typeof info['piece length'] !== 'number' ||
		typeof info.pieces !== 'string' ||
		info.pieces.length === 0 ||
		info.pieces.length % 20 !== 0 ||
		!Array.isArray(files) ||
		!files.length
	)
		throw new Error('not a client torrent');
	for (const f of files)
		if (
			!Array.isArray(f.path) ||
			!f.path.length ||
			f.path.some(p => typeof p !== 'string') ||
			typeof f.length !== 'number' ||
			f.length < 0
		)
			throw new Error('client torrent has a malformed file entry');
	return {
		name: info.name,
		files: files as TorrentFile[],
		webSeeds: [t['url-list'] ?? []]
			.flat()
			.filter((u): u is string => typeof u === 'string'),
		pieceLength: info['piece length'],
		pieces: Buffer.from(info.pieces, 'latin1')
	};
};

const syncedTorrentFile = () =>
	path.join(app.getPath('userData'), 'client-synced.torrent');

export const saveSyncedTorrent = async (
	torrent: ClientTorrent
): Promise<void> => {
	const file = syncedTorrentFile();
	const tmp = `${file}.${process.pid}.tmp`;
	await fs.writeFile(tmp, torrent.bytes);
	await fs.rename(tmp, file);
};

export const readSyncedTorrent = async (
	sha: string | undefined
): Promise<ClientTorrent | undefined> => {
	if (!sha) return undefined;
	const bytes = await fs.readFile(syncedTorrentFile()).catch(() => null);
	if (!bytes || crypto.createHash('sha1').update(bytes).digest('hex') !== sha)
		return undefined;
	try {
		return {
			...parseClientTorrent(bytes),
			bytes,
			sha,
			file: syncedTorrentFile()
		};
	} catch {
		return undefined;
	}
};

export const changedSameSizeFiles = (
	prev: ClientTorrent,
	next: ClientTorrent
): number[] => {
	const offsets = (t: ClientTorrent) => {
		let o = 0;
		return t.files.map(f => {
			const start = o;
			o += f.length;
			return start;
		});
	};
	const prevOffsets = offsets(prev);
	const nextOffsets = offsets(next);
	const prevIndex = new Map(
		prev.files.map((f, i) => [f.path.join('/').toLowerCase(), i])
	);
	const coveringPieces = (t: ClientTorrent, start: number, length: number) => {
		const first = Math.floor(start / t.pieceLength);
		const last = Math.floor((start + length - 1) / t.pieceLength);
		return t.pieces.subarray(first * 20, (last + 1) * 20).toString('hex');
	};
	const changed: number[] = [];
	next.files.forEach((f, i) => {
		const j = prevIndex.get(f.path.join('/').toLowerCase());
		if (j === undefined || prev.files[j].length !== f.length || f.length === 0)
			return;
		const same =
			prev.pieceLength === next.pieceLength &&
			prevOffsets[j] % prev.pieceLength === nextOffsets[i] % next.pieceLength &&
			coveringPieces(prev, prevOffsets[j], f.length) ===
				coveringPieces(next, nextOffsets[i], f.length);
		if (!same) changed.push(i + 1);
	});
	return changed;
};

const fetchClientTorrent = async (url: string, tries = TORRENT_TRIES) => {
	let lastError: unknown;
	for (let attempt = 1; attempt <= tries; attempt++) {
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), TORRENT_TIMEOUT_MS);
		try {
			const r = await fetch(url, { signal: ctrl.signal });
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			const bytes = Buffer.from(await r.arrayBuffer());
			return {
				...parseClientTorrent(bytes),
				bytes,
				sha: crypto.createHash('sha1').update(bytes).digest('hex')
			};
		} catch (e) {
			lastError = e;
			Logger.warn(`Client torrent fetch ${attempt}/${tries} failed`, e);
			if (attempt < tries)
				await new Promise(r => setTimeout(r, attempt * 2_000));
		} finally {
			clearTimeout(timer);
		}
	}
	throw lastError instanceof Error ? lastError : new Error(String(lastError));
};

let lastTorrent: { torrent: ClientTorrent; at: number } | undefined;

export const lastLoadedTorrentSha = (): string | undefined =>
	lastTorrent?.torrent.sha;

export const publishedTorrentSha = async (url: string): Promise<string> =>
	(await fetchClientTorrent(url, 1)).sha;

export const loadClientTorrent = async (
	url: string
): Promise<ClientTorrent> => {
	const t = await fetchClientTorrent(url);
	const file = localTorrentFile();
	const tmp = `${file}.${process.pid}.tmp`;
	await fs.writeFile(tmp, t.bytes);
	await fs.rename(tmp, file);
	const torrent = { ...t, file };
	lastTorrent = { torrent, at: Date.now() };
	return torrent;
};

export const bytesStillNeeded = async (
	clientDir: string,
	torrent: ClientTorrent,
	selection: number[]
): Promise<number> => {
	let need = 0;
	for (const i of selection) {
		const f = torrent.files[i - 1];
		if (!f) continue;
		const st = await fs.stat(path.join(clientDir, ...f.path)).catch(() => null);
		need += Math.max(0, f.length - (st && st.size <= f.length ? st.size : 0));
	}
	return need;
};

const bdecode = (buf: Buffer, pos = 0): [unknown, number] => {
	if (pos >= buf.length) throw new Error('bencode: unexpected end of data');
	const ch = buf[pos];
	if (ch === 0x69) {
		const end = buf.indexOf(0x65, pos);
		if (end === -1) throw new Error('bencode: unterminated integer');
		return [parseInt(buf.toString('latin1', pos + 1, end), 10), end + 1];
	}
	if (ch === 0x6c) {
		const list: unknown[] = [];
		let p = pos + 1;
		while (buf[p] !== 0x65) {
			if (p >= buf.length) throw new Error('bencode: unterminated list');
			const [v, np] = bdecode(buf, p);
			list.push(v);
			p = np;
		}
		return [list, p + 1];
	}
	if (ch === 0x64) {
		const dict: Record<string, unknown> = {};
		let p = pos + 1;
		while (buf[p] !== 0x65) {
			if (p >= buf.length) throw new Error('bencode: unterminated dict');
			const [k, kp] = bdecode(buf, p);
			const [v, vp] = bdecode(buf, kp);
			dict[k as string] = v;
			p = vp;
		}
		return [dict, p + 1];
	}
	const colon = buf.indexOf(0x3a, pos);
	if (colon === -1) throw new Error('bencode: unterminated string length');
	const len = parseInt(buf.toString('latin1', pos, colon), 10);
	if (!Number.isInteger(len) || len < 0 || colon + 1 + len > buf.length)
		throw new Error('bencode: invalid string length');
	const start = colon + 1;
	return [buf.toString('latin1', start, start + len), start + len];
};

export const clientDownloadFileUrl = async (
	name: string
): Promise<string | undefined> => {
	const url = torrentUrl();
	if (!url) return undefined;
	try {
		const torrent =
			lastTorrent && Date.now() - lastTorrent.at < 10 * 60_000
				? lastTorrent.torrent
				: await fetchClientTorrent(url, 1);
		const seed = torrent.webSeeds.find(u => u.startsWith('https://'));
		// keep the torrent's spelling: web seed paths are case-sensitive
		const listed = torrent.files.find(
			f => f.path.length === 1 && f.path[0].toLowerCase() === name.toLowerCase()
		)?.path[0];
		if (!seed || !listed) return undefined;
		return `${seed.endsWith('/') ? seed : `${seed}/`}${encodeURIComponent(
			torrent.name
		)}/${encodeURIComponent(listed)}`;
	} catch {
		return undefined;
	}
};

const torrentDataArchives = (torrentBytes: Buffer): Set<string> => {
	const [torrent] = bdecode(torrentBytes) as [
		{ info?: { files?: { path?: string[] }[] } },
		number
	];
	const files = torrent?.info?.files ?? [];
	return new Set(
		files
			.filter(
				f =>
					f.path?.length === 2 &&
					f.path[0] === 'Data' &&
					/\.mpq$/i.test(f.path[1])
			)
			.map(f => f.path![1].toLowerCase())
	);
};

const LOCALE_DIRS = new Set([
	'enus',
	'engb',
	'encn',
	'entw',
	'kokr',
	'frfr',
	'dede',
	'zhcn',
	'zhtw',
	'eses',
	'esmx',
	'ruru',
	'ptbr',
	'ptpt',
	'itit'
]);

const torrentDataDirs = (torrentBytes: Buffer): Set<string> => {
	const [torrent] = bdecode(torrentBytes) as [
		{ info?: { files?: { path?: string[] }[] } },
		number
	];
	const files = torrent?.info?.files ?? [];
	return new Set(
		files
			.filter(f => (f.path?.length ?? 0) >= 3 && f.path![0] === 'Data')
			.map(f => f.path![1].toLowerCase())
	);
};

// archives the old client shipped under names the current one no longer uses;
// matched by name AND exact size so player mods reusing a name are never touched
const LEGACY_ARCHIVES: Record<string, number> = {
	'patch-6.mpq': 451195806,
	'patch-7.mpq': 175256564,
	'patch-8.mpq': 484649870,
	'patch-9.mpq': 506808141,
	'patch-a.mpq': 241751337
};

export const pruneStaleArchives = async (
	clientDir: string,
	torrent: ClientTorrent,
	_owned: Set<string>
): Promise<string[]> => {
	try {
		const bytes = torrent.bytes;
		const expected = torrentDataArchives(bytes);
		if (!expected.size) return [];
		for (const u of [clientPatchUrl(), raidVisualsUrl()])
			if (u) expected.add(path.basename(u).toLowerCase());
		const usedDirs = torrentDataDirs(bytes);
		const dataDir = path.join(clientDir, 'Data');
		const onDisk = await fs.readdir(dataDir).catch(() => []);
		const removed: string[] = [];
		for (const name of onDisk) {
			const lc = name.toLowerCase();
			const full = path.join(dataDir, name);
			const st = await fs.stat(full).catch(() => null);
			if (!st) continue;
			if (st.isDirectory()) {
				if (LOCALE_DIRS.has(lc) && !usedDirs.has(lc)) {
					await fs.remove(full);
					removed.push(name + '/');
				}
				continue;
			}
			if (!/\.mpq$/i.test(name) || expected.has(lc)) continue;
			if (LEGACY_ARCHIVES[lc] !== st.size) continue;
			await fs.remove(full);
			removed.push(name);
		}
		return removed;
	} catch (e) {
		Logger.warn('Prune of stale archives failed', e);
		return [];
	}
};

// files the torrent ships but a mod toggle owns; the sync must not re-add
// them or count their absence as an incomplete tree
const LAUNCHER_OWNED_FILES = new Set(['d3d9.dll', 'realmlist.wtf']);
const isLauncherOwned = (parts: string[]) =>
	parts.length === 1 && LAUNCHER_OWNED_FILES.has(parts[0].toLowerCase());

const isPlayerFile = async (
	clientDir: string,
	parts: string[],
	length: number
): Promise<boolean> => {
	if (parts.length !== 1) return false;
	noteDownloadSize(parts[0], length);
	if (!MANAGED_MOD_FILES.has(parts[0].toLowerCase())) return false;
	return (await classifyModFile(clientDir, parts[0], length)).kind === 'player';
};

export const torrentDownloadSelection = async (
	clientDir: string,
	torrent: ClientTorrent,
	dropMismatched = false
): Promise<number[] | null> => {
	try {
		const files = torrent.files;
		if (!files.length) return null;
		const need: number[] = [];
		let missing = false;
		for (let i = 0; i < files.length; i++) {
			const f = files[i];
			if (!f.path?.length || typeof f.length !== 'number') return null;
			if (await isPlayerFile(clientDir, f.path, f.length)) continue;
			if (isLauncherOwned(f.path)) continue;
			const dest = path.join(clientDir, ...f.path);
			const st = await fs.stat(dest).catch(() => null);
			if (!st) {
				missing = true;
				need.push(i + 1);
				continue;
			}
			if (st.size !== f.length) {
				if (dropMismatched || st.size > f.length)
					await fs.remove(dest).catch(() => {});
				need.push(i + 1);
			}
		}
		// a deleted file poisons the resume state (its pieces are marked
		// done, so aria2 skips them forever); partial files keep it so an
		// interrupted download resumes instead of restarting
		if (missing) await clearTorrentResumeState().catch(() => undefined);
		return need;
	} catch (e) {
		Logger.warn('Torrent selection computation failed', e);
		return null;
	}
};

export const torrentFilesToCheck = async (
	clientDir: string,
	torrent: ClientTorrent,
	indices: number[] = torrent.files.map((_, i) => i + 1)
): Promise<number[]> => {
	const out: number[] = [];
	for (const i of indices) {
		const f = torrent.files[i - 1];
		if (!f) continue;
		if (await isPlayerFile(clientDir, f.path, f.length)) continue;
		if (isLauncherOwned(f.path)) continue;
		out.push(i);
	}
	return out;
};

export const torrentTreeIntact = async (
	clientDir: string,
	torrent: ClientTorrent
): Promise<boolean> => {
	try {
		const files = torrent.files;
		if (!files.length) return false;
		for (const f of files) {
			if (!f.path?.length || typeof f.length !== 'number') return false;
			if (await isPlayerFile(clientDir, f.path, f.length)) continue;
			if (isLauncherOwned(f.path)) continue;
			const st = await fs
				.stat(path.join(clientDir, ...f.path))
				.catch(() => null);
			if (!st || st.size !== f.length) return false;
		}
		return true;
	} catch (e) {
		Logger.warn('Torrent tree check failed', e);
		return false;
	}
};

const pristineWowPath = () =>
	path.join(app.getPath('userData'), 'base-WoW.exe');

const LOCALE_CARRIERS = [
	'enUS',
	'koKR',
	'frFR',
	'deDE',
	'zhCN',
	'zhTW',
	'esES',
	'xxYY'
];

const STOCK_LOCALE_SITES: [number, Buffer][] = [
	[0x1b2115, Buffer.from([0xa1, 0xa4, 0xa2, 0xc2, 0x00])],
	[0x253c, Buffer.from([0x33, 0xf6, 0x8b, 0xff, 0x8b, 0x04, 0xb5])],
	...LOCALE_CARRIERS.map((name, i): [number, Buffer] => [
		0x45591c - i * 8,
		Buffer.from(name, 'latin1')
	])
];

export const isPristineWow = async (clientDir: string): Promise<boolean> => {
	const exe = path.join(clientDir, 'WoW.exe');
	if (!(await fs.pathExists(exe))) return false;
	const fd = await fs.open(exe, 'r');
	try {
		for (const [offset, stock] of STOCK_LOCALE_SITES) {
			const b = Buffer.alloc(stock.length);
			const { bytesRead } = await fs.read(fd, b, 0, b.length, offset);
			if (bytesRead !== b.length || !b.equals(stock)) return false;
		}
		return true;
	} finally {
		await fs.close(fd);
	}
};

export const isWowExeDamaged = async (clientDir: string): Promise<boolean> => {
	const exe = path.join(clientDir, 'WoW.exe');
	if (!(await fs.pathExists(exe))) return false;
	const fd = await fs.open(exe, 'r');
	try {
		const dos = Buffer.alloc(64);
		const { bytesRead } = await fs.read(fd, dos, 0, dos.length, 0);
		if (bytesRead < dos.length || dos.toString('latin1', 0, 2) !== 'MZ')
			return true;
		const pe = Buffer.alloc(4);
		const r = await fs.read(fd, pe, 0, pe.length, dos.readUInt32LE(0x3c));
		return r.bytesRead < pe.length || pe.toString('latin1') !== 'PE\0\0';
	} finally {
		await fs.close(fd);
	}
};

// tag site only: the index site shares the first torrent piece with other files
export const isLauncherPatchedWow = async (
	clientDir: string
): Promise<boolean> => {
	const exe = path.join(clientDir, 'WoW.exe');
	if (!(await fs.pathExists(exe))) return false;
	const fd = await fs.open(exe, 'r');
	try {
		const tag = Buffer.alloc(5);
		await fs.read(fd, tag, 0, tag.length, 0x1b2115);
		return (
			tag[0] === 0xb8 &&
			LOCALE_CARRIERS.some(c =>
				tag.subarray(1).equals(Buffer.from(c, 'latin1').reverse())
			)
		);
	} finally {
		await fs.close(fd);
	}
};

export const isClientBaseWow = async (clientDir: string): Promise<boolean> => {
	if (!(await isPristineWow(clientDir))) return false;
	const cache = pristineWowPath();
	const exe = path.join(clientDir, 'WoW.exe');
	const [base, cur] = await Promise.all([
		fs.stat(cache).catch(() => null),
		fs.stat(exe)
	]);
	if (!base || base.size !== cur.size) return false;
	const [a, b] = await Promise.all([fs.readFile(cache), fs.readFile(exe)]);
	return a.equals(b);
};

export const refreshPristineWow = async (clientDir: string): Promise<void> => {
	if (!(await isPristineWow(clientDir))) return;
	await fs.copy(path.join(clientDir, 'WoW.exe'), pristineWowPath(), {
		overwrite: true
	});
	Logger.log('Cached pristine WoW.exe base');
};

export const readPristineWow = async (clientDir: string): Promise<Buffer> => {
	const cache = pristineWowPath();
	// a cached base of another size is stale; the stock exe is its own base
	const exe = path.join(clientDir, 'WoW.exe');
	if (
		(await fs.pathExists(cache)) &&
		(await isPristineWow(clientDir).catch(() => false)) &&
		(await fs.stat(cache)).size !== (await fs.stat(exe)).size
	)
		return fs.readFile(exe);
	if (await fs.pathExists(cache)) return fs.readFile(cache);
	return fs.readFile(path.join(clientDir, 'WoW.exe'));
};

let seeder: ChildProcess | undefined;
let mapping: Promise<PortMapping> | undefined;
let wantSeeding = false;
let starting = false;

const SEED_PORT = 6881;
const SEED_TIME_MINUTES = 525600;

export const isSeeding = (): boolean => !!seeder;

const releaseMapping = (): void => {
	const m = mapping;
	mapping = undefined;
	if (m) void m.then(x => x.stop()).catch(() => {});
};

export const stopSeeding = (): void => {
	wantSeeding = false;
	seeder?.kill();
	seeder = undefined;
	releaseMapping();
};

export const startSeeding = async (
	clientDir: string,
	uploadLimit = '2M'
): Promise<void> => {
	wantSeeding = true;
	if (seeder || starting) return;
	starting = true;
	try {
		const url = torrentUrl();
		if (!url) return;
		const from = (await fs.pathExists(localTorrentFile()))
			? localTorrentFile()
			: url;
		const dir = await ensureJunction(clientDir);
		if (!wantSeeding || seeder) return;
		const args = [
			`--dir=${dir}`,
			'--bt-seed-unverified=true',
			`--seed-time=${SEED_TIME_MINUTES}`,
			'--check-integrity=false',
			// no prealloc: the seeder must not recreate missing files as zeros
			'--file-allocation=none',
			'--continue=true',
			'--bt-save-metadata=true',
			'--enable-dht=true',
			'--bt-enable-lpd=true',
			`--listen-port=${SEED_PORT}`,
			`--dht-listen-port=${SEED_PORT}`,
			`--max-overall-upload-limit=${uploadLimit}`,
			'--summary-interval=0',
			'--console-log-level=warn',
			...caArgs(),
			'--stop-with-process=' + process.pid,
			from
		];
		Logger.log('aria2c (seed) ' + args.join(' '));
		const child = spawn(bin(), args, { windowsHide: true });
		seeder = child;
		const onExit = () => {
			if (seeder === child) {
				seeder = undefined;
				releaseMapping();
			}
		};
		child.on('close', onExit);
		child.on('error', e => {
			Logger.warn('Seeder failed', e);
			onExit();
		});

		mapping = mapPort(SEED_PORT, { description: 'OctoWoW' });
		void mapping.catch(() => undefined);
	} catch (e) {
		Logger.warn('startSeeding failed', e);
	} finally {
		starting = false;
	}
};
