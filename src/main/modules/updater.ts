import path from 'node:path';
import crypto from 'node:crypto';
import { exec } from 'node:child_process';
import { promises as fsp } from 'node:fs';
import os from 'node:os';

import { app } from 'electron';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import Logger from 'electron-log/main';

import { nestedGet, nestedSet, formatFileSize } from '~common/utils';
import { usesWine, wineProcessRunning } from '~main/modules/platform';
import { mainWindow } from '~main/index';
import { getClientVersion } from '~main/utils';
import {
	torrentUrl,
	loadClientTorrent,
	lastLoadedTorrentSha,
	publishedTorrentSha,
	bytesStillNeeded,
	aria2Available,
	SyncCancelled,
	SyncStalled,
	type ClientTorrent,
	syncClient,
	refreshPristineWow,
	isPristineWow,
	isLauncherPatchedWow,
	isWowExeDamaged,
	clearTorrentResumeState,
	raidVisualsUrl,
	clientPatchUrl,
	pruneStaleArchives,
	torrentTreeIntact,
	torrentDownloadSelection,
	torrentFilesToCheck,
	changedSameSizeFiles,
	saveSyncedTorrent,
	readSyncedTorrent,
	startSeeding,
	stopSeeding
} from '~main/modules/aria2';

import {
	healRealmlist,
	patchExecutable,
	stripPrivateRealmFromConfig
} from '~main/modules/patcher';
import {
	classifyModFile,
	playerOwnedInDownload,
	restorePlayerFiles,
	setAsidePlayerFiles
} from '~main/modules/playerFiles';

import Preferences from './preferences';
import Observable from './observable';

type FolderTags = 'allowExtra';
type FileTags = 'vanillaFixes' | 'raidVisuals';
type FileManifest = { name: string } & (
	| { type: 'del' }
	| { type: 'dir'; files: FileManifest[]; tags?: FolderTags[] }
	| { type: 'mpq'; files: FileManifest[]; hash: string; size: number }
	| {
			type: 'file';
			hash: string;
			version?: number;
			size: number;
			tags?: FileTags[];
	  }
);

type CacheEntry = [hash: string, mtime: number];
type CacheTree = { [key: string]: CacheTree & CacheEntry };

const getManifestItem = (
	m?: FileManifest,
	p?: string[]
): FileManifest | undefined => {
	if (!p?.length) return m;

	if (m?.type === 'file' || m?.type === 'del')
		throw Error(`Can't access ${p.join('.')} from file ${m.name}`);

	const [next, ...rest] = p;
	return getManifestItem(
		m?.files.find(f => f.name === next),
		rest
	);
};

const ownedDataArchives = async (): Promise<Set<string>> => {
	try {
		const j = await fs.readJSON(
			path.join(Preferences.userDataDir, 'manifest.json')
		);
		const data = getManifestItem(j?.root ?? j, ['Data']);
		if (!data || data.type === 'file' || data.type === 'del') return new Set();
		return new Set(
			data.files
				.filter(f => f.type !== 'dir' && /\.mpq$/i.test(f.name))
				.map(f => f.name.toLowerCase())
		);
	} catch {
		return new Set();
	}
};

const sha256File = (p: string): Promise<string> =>
	new Promise((resolve, reject) => {
		const h = crypto.createHash('sha256');
		fs.createReadStream(p)
			.on('data', d => h.update(d))
			.on('end', () => resolve(h.digest('hex')))
			.on('error', reject);
	});

export const isGameRunning = (executablePath: string) =>
	os.platform() === 'win32'
		? new Promise<boolean>(resolve => {
				const exeName = path.basename(executablePath);
				exec(
					`tasklist /FI "IMAGENAME eq ${exeName}" /FO CSV /NH`,
					(error, stdout) => {
						if (error) {
							Logger.warn(
								`tasklist probe for "${exeName}" failed; assuming game ` +
									`is not running. Error: ${error.message}`
							);
							resolve(false);
							return;
						}
						resolve(
							stdout.toLowerCase().includes(`"${exeName.toLowerCase()}"`)
						);
					}
				);
		  })
		: usesWine
		? wineProcessRunning(path.basename(executablePath))
		: false;

type UpdaterState =
	| 'verifying'
	| 'serverUnreachable'
	| 'noClient'
	| 'updateAvailable'
	| 'updating'
	| 'upToDate'
	| 'failed';

export type UpdaterStatus = {
	state: UpdaterState;
	progress?: number;
	message?: string;
	messageKey?: string;
	messageArgs?: Record<string, string>;
	cancellable?: boolean;
	bytesDone?: number;
	bytesTotal?: number;
	bytesPerSecond?: number;
	etaSeconds?: number;
};

const SIDECAR_TIMEOUT_MS = 30_000;

const FREE_SPACE_MARGIN = 256 * 1024 ** 2;

const freeBytes = async (dir: string): Promise<number | undefined> => {
	const statfs = (
		fsp as unknown as {
			statfs?: (
				p: string
			) => Promise<{ bavail: number | bigint; bsize: number | bigint }>;
		}
	).statfs;
	if (!statfs) return undefined;
	try {
		const s = await statfs(dir);
		return Number(s.bavail) * Number(s.bsize);
	} catch {
		return undefined;
	}
};

const failed = (
	messageKey: string,
	message: string,
	messageArgs?: Record<string, string>
): UpdaterStatus => ({ state: 'failed', message, messageKey, messageArgs });

const updateFailure = (e: unknown): UpdaterStatus => {
	if (e instanceof SyncCancelled)
		return {
			state: 'updateAvailable',
			message: 'Download stopped. Click Update to continue where it left off.',
			messageKey: 'update.cancelled'
		};
	if (e instanceof SyncStalled)
		return failed(
			'update.stalled',
			'The download stopped making progress. Click Retry to try again.'
		);
	if ((e as NodeJS.ErrnoException)?.code === 'ENOENT')
		return failed(
			'update.downloaderMissing',
			'The downloader (aria2c.exe) is missing, most likely removed by your antivirus. Restore it from quarantine or reinstall the launcher, then click Retry.'
		);
	const code = /aria2c exited with code (\d+)/.exec(
		e instanceof Error ? e.message : String(e)
	)?.[1];
	switch (Number(code)) {
		case 9:
			return failed(
				'update.diskFull',
				"Not enough free disk space on the game's drive. Free up some space, then click Retry."
			);
		case 2:
		case 6:
		case 19:
		case 29:
			return failed(
				'update.network',
				'Could not reach the download servers. Check your connection, then click Retry.'
			);
		case 15:
		case 16:
		case 17:
		case 18:
			return failed(
				'update.fileAccess',
				'Could not write the game files. Close the game and anything using its folder, check your antivirus, then click Retry.'
			);
		default:
			return {
				state: 'failed',
				message: 'The update could not be completed. Please try again.'
			};
	}
};

class UpdaterClass extends Observable<UpdaterStatus> {
	#cachePath = path.join(Preferences.userDataDir, 'cache.json');
	#cache: CacheTree = this.#readCache();

	#readCache(): CacheTree {
		try {
			return fs.existsSync(this.#cachePath)
				? fs.readJSONSync(this.#cachePath)
				: {};
		} catch {
			return {};
		}
	}

	async #saveCache() {
		await fs.writeJSON(this.#cachePath, this.#cache);
	}

	async #getHash(clientPath: string, ...filePath: string[]) {
		if (!(await fs.exists(path.join(clientPath, ...filePath)))) {
			nestedSet(this.#cache, filePath, undefined);
			return undefined;
		}

		const stats = await fs.stat(path.join(clientPath, ...filePath));
		if (stats.isDirectory())
			throw Error(`Tried to get hash of directory ${path.join(...filePath)}`);

		const c = nestedGet<CacheEntry>(this.#cache, filePath);

		if (c?.[0] && c[1] === stats.mtimeMs) return c[0];

		const newHash = crypto
			.createHash('sha1')
			.update(await fs.readFile(path.join(clientPath, ...filePath)))
			.digest('hex')
			.toLocaleUpperCase();
		nestedSet(this.#cache, filePath, {
			...c,
			[0]: newHash,
			[1]: stats.mtimeMs
		});
		return newHash;
	}

	protected _value: UpdaterStatus = { state: 'failed' };

	get status() {
		return this._value;
	}
	#checkedAt = 0;

	get checkedAt() {
		return this.#checkedAt;
	}

	private set status(v: UpdaterStatus) {
		this._value = v;
		if (v.state === 'upToDate') this.#checkedAt = Date.now();
		this._notifyObservers(v);
		if (this.status.state === 'failed') {
			mainWindow?.setProgressBar(1, { mode: 'error' });
		} else if (this.status.progress === 1) {
			mainWindow?.setProgressBar(0);
		} else {
			mainWindow?.setProgressBar(this.status.progress ?? 0, {
				mode: this.status.progress === -1 ? 'indeterminate' : 'normal'
			});
		}
	}

	// set before the first await so a racing click cannot start a second aria2 run
	#busy = false;

	get busy() {
		return this.#busy;
	}

	async #exclusive<T>(op: () => Promise<T>): Promise<T | undefined> {
		if (this.#busy) {
			Logger.log('Updater is busy; ignoring a second request');
			return undefined;
		}
		this.#busy = true;
		try {
			return await op();
		} finally {
			this.#busy = false;
		}
	}

	async refreshSeeding() {
		// no seeding while dxvk is off: aria2 would recreate the parked
		// d3d9.dll as a 0-byte stub and break the game's d3d9 import
		const dxvkOff = Preferences.data.mods?.dxvk?.enabled === false;
		if (
			Preferences.data.shareDownloads !== false &&
			Preferences.data.clientDir &&
			this.status.state === 'upToDate' &&
			!dxvkOff &&
			!playerOwnedInDownload().length
		)
			await startSeeding(Preferences.data.clientDir);
		else stopSeeding();
	}

	async #torrentVerify(clientPath: string) {
		const url = torrentUrl();
		if (!url) {
			this.status = { state: 'serverUnreachable' };
			return;
		}
		this.status = {
			state: 'verifying',
			progress: -1,
			message: 'Checking for updates...'
		};
		// an interrupted sync can leave realmlist.wtf as a 0-byte placeholder
		await healRealmlist(clientPath).catch(e =>
			Logger.warn('realmlist heal failed', e)
		);
		await stripPrivateRealmFromConfig(clientPath).catch(e =>
			Logger.warn('Config.wtf realm cleanup failed', e)
		);
		await restorePlayerFiles(clientPath).catch(e =>
			Logger.warn('Putting set-aside player files back failed', e)
		);
		try {
			const torrent = await loadClientTorrent(url);
			const sha = torrent.sha;
			await this.#reconcileClientPatch(clientPath);
			await this.#reconcileRaidVisuals(clientPath);
			const haveExe = await fs.pathExists(path.join(clientPath, 'WoW.exe'));
			if (this.#unfinished(clientPath) || (await isWowExeDamaged(clientPath))) {
				this.status = {
					state: 'updateAvailable',
					message: 'Download incomplete. Click update to finish.'
				};
				await this.refreshSeeding();
				return;
			}
			if (
				haveExe &&
				sha !== Preferences.data.syncedTorrentHash &&
				(await this.#torrentFastForward(clientPath, torrent))
			) {
				this.status = { state: 'upToDate', progress: 1 };
				await this.refreshSeeding();
				return;
			}
			const upToDate =
				haveExe &&
				sha === Preferences.data.syncedTorrentHash &&
				(await torrentTreeIntact(clientPath, torrent));
			if (upToDate) {
				await clearTorrentResumeState().catch(() => undefined);
				if (!(await readSyncedTorrent(sha)))
					await saveSyncedTorrent(torrent).catch(e =>
						Logger.warn('Could not keep the synced client torrent', e)
					);
				const removed = await pruneStaleArchives(
					clientPath,
					torrent,
					new Set()
				);
				if (removed.length)
					Logger.log(`Removed stale archives: ${removed.join(', ')}`);
			}
			this.status = upToDate
				? { state: 'upToDate', progress: 1 }
				: { state: 'updateAvailable' };
			await this.refreshSeeding();
		} catch (e) {
			Logger.error('Torrent verify failed', e);
			this.status = { state: 'serverUnreachable' };
		}
	}

	async releasePending(): Promise<boolean> {
		const url = torrentUrl();
		const patchUrl = clientPatchUrl();
		const seenTorrent = lastLoadedTorrentSha();
		const seenPatch = Preferences.data.clientPatchHash;
		const [torrentSha, patchSha] = await Promise.all([
			url && seenTorrent ? publishedTorrentSha(url) : undefined,
			patchUrl && seenPatch ? this.#fetchSidecarSha(patchUrl) : undefined
		]);
		return (
			(!!torrentSha && torrentSha !== seenTorrent) ||
			(!!patchSha && patchSha !== seenPatch)
		);
	}

	async #fetchSidecarSha(url: string): Promise<string> {
		const ac = new AbortController();
		const t = setTimeout(() => ac.abort(), SIDECAR_TIMEOUT_MS);
		return fetch(`${url}.sha256`, { signal: ac.signal })
			.then(r => {
				if (!r.ok) throw new Error(`sha256 HTTP ${r.status}`);
				return r.text();
			})
			.then(s => s.trim())
			.finally(() => clearTimeout(t));
	}

	async #fetchSidecarFile(
		url: string,
		dest: string,
		storedHash: string | undefined,
		busyMessage: string
	): Promise<string | undefined> {
		const sha = await this.#fetchSidecarSha(url);
		if ((await fs.pathExists(dest)) && storedHash === sha) return undefined;
		this.status = { state: 'updating', progress: -1, message: busyMessage };
		const buf = await this.#downloadWithIdleTimeout(url);
		if (crypto.createHash('sha256').update(buf).digest('hex') !== sha)
			throw new Error('checksum mismatch');
		await fs.ensureDir(path.dirname(dest));
		await fs.writeFile(`${dest}.part`, buf);
		await fs.move(`${dest}.part`, dest, { overwrite: true });
		return sha;
	}

	async #downloadWithIdleTimeout(url: string): Promise<Buffer> {
		const ac = new AbortController();
		let idle: ReturnType<typeof setTimeout> | undefined;
		const arm = () => {
			if (idle) clearTimeout(idle);
			idle = setTimeout(() => ac.abort(), SIDECAR_TIMEOUT_MS);
		};
		arm();
		try {
			const res = await fetch(url, { signal: ac.signal });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const body = res.body as NodeJS.ReadableStream | null;
			if (!body) throw new Error('empty response body');
			const chunks: Buffer[] = [];
			for await (const chunk of body) {
				arm();
				chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
			}
			return Buffer.concat(chunks);
		} finally {
			if (idle) clearTimeout(idle);
		}
	}

	async #reconcileClientPatch(clientPath: string) {
		const url = clientPatchUrl();
		if (!url) return;
		const dest = path.join(clientPath, 'Data', 'patch-5.mpq');
		try {
			const sha = await this.#fetchSidecarFile(
				url,
				dest,
				Preferences.data.clientPatchHash,
				'Updating game files...'
			);
			if (sha) Preferences.data = { clientPatchHash: sha };
		} catch (e) {
			Logger.warn('Content patch reconcile failed', e);
			if (!(await fs.pathExists(dest)))
				throw new Error(
					'Could not download core game content. Please check your connection and try again.'
				);
		}
	}

	async #reconcileRaidVisuals(clientPath: string) {
		const url = raidVisualsUrl();
		if (!url) return;
		const dest = path.join(clientPath, 'Data', 'patch-O.mpq');
		const stored = Preferences.data.raidVisualsHash;
		try {
			const present = await fs.pathExists(dest);
			if (!Preferences.data.config?.raidVisuals) {
				if (present) {
					const current = await sha256File(dest);
					const ours =
						current === stored ||
						current ===
							(await this.#fetchSidecarSha(url).catch(() => undefined));
					if (ours) {
						await fs.remove(dest);
						Preferences.data = { raidVisualsHash: undefined };
					} else
						Logger.log(
							"Keeping Data/patch-O.mpq: it is not the launcher's download"
						);
				}
				return;
			}
			if (present) {
				const published = await this.#fetchSidecarSha(url);
				if (stored !== published) {
					const current = await sha256File(dest);
					if (current === published) {
						Preferences.data = { raidVisualsHash: published };
						return;
					}
					if (current !== stored) {
						Logger.log(
							"Keeping Data/patch-O.mpq: it is not the launcher's download"
						);
						return;
					}
				}
			}
			const sha = await this.#fetchSidecarFile(
				url,
				dest,
				stored,
				'Updating raid visuals...'
			);
			if (sha) Preferences.data = { raidVisualsHash: sha };
		} catch (e) {
			Logger.warn('Raid visuals reconcile failed', e);
		}
	}

	syncRaidVisuals() {
		return this.#exclusive(async () => {
			if (
				this.status?.state === 'verifying' ||
				this.status?.state === 'updating'
			)
				return;
			const before = this.status;
			const clientPath = Preferences.data.clientDir;
			if (!clientPath) return;
			if (await isGameRunning(path.join(clientPath, 'WoW.exe'))) {
				this.status = {
					state: 'failed',
					message: 'Please close WoW first, before updating.'
				};
				return;
			}
			if (!torrentUrl()) return this.#verify();
			await this.#reconcileRaidVisuals(clientPath);
			this.status =
				before.state === 'upToDate'
					? { state: 'upToDate', progress: 1 }
					: before;
		});
	}

	async #torrentFastForward(
		clientPath: string,
		torrent: ClientTorrent
	): Promise<boolean> {
		// sizes cannot show an unfinished download (a full-length file can have holes)
		if (this.#unfinished(clientPath)) return false;
		if (await isWowExeDamaged(clientPath)) return false;
		if (!(await torrentTreeIntact(clientPath, torrent))) return false;
		const changed = await this.#changedSameSize(clientPath, torrent);
		if (changed.length) {
			Logger.log(
				`New client version changes ${
					changed.length
				} file(s) without changing their size: ${changed
					.map(i => torrent.files[i - 1].path.join('/'))
					.join(', ')}`
			);
			return false;
		}
		// adopt a complete tree even on a fresh profile; empty delta selection
		// would otherwise fall through to a full re-download
		await clearTorrentResumeState().catch(() => {});
		await refreshPristineWow(clientPath);
		const removed = await pruneStaleArchives(
			clientPath,
			torrent,
			await ownedDataArchives()
		);
		if (removed.length)
			Logger.log(`Removed stale archives: ${removed.join(', ')}`);
		Preferences.data = {
			syncedTorrentHash: torrent.sha,
			version: await getClientVersion()
		};
		await saveSyncedTorrent(torrent).catch(e =>
			Logger.warn('Could not keep the synced client torrent', e)
		);
		return true;
	}

	#unfinished(clientPath: string) {
		const { activeSelection, activeClientDir } = Preferences.data;
		return activeClientDir === clientPath && !!activeSelection?.length;
	}

	async #reapplyTweaks(clientPath: string, exePatched: boolean) {
		if (
			exePatched &&
			Preferences.data.patchedLocale &&
			Preferences.data.clientDir === clientPath &&
			(await isPristineWow(clientPath).catch(() => false))
		) {
			Logger.log(
				'The download replaced WoW.exe; re-applying the launcher tweaks and language'
			);
			stopSeeding();
			try {
				await patchExecutable();
				await this.recordPatchedWow();
			} catch (e) {
				Logger.error('Re-applying the WoW.exe tweaks failed', e);
			}
		}
		Preferences.data = { activeRepatch: false };
	}

	async #changedSameSize(clientPath: string, torrent: ClientTorrent) {
		if (torrent.sha === Preferences.data.syncedTorrentHash) return [];
		const prev = await readSyncedTorrent(Preferences.data.syncedTorrentHash);
		if (!prev) return [];
		return torrentFilesToCheck(
			clientPath,
			torrent,
			changedSameSizeFiles(prev, torrent)
		);
	}

	#syncAbort: AbortController | undefined;

	cancel() {
		this.#syncAbort?.abort();
	}

	async #torrentUpdate(clientPath: string, clean?: boolean) {
		const url = torrentUrl();
		if (!url) {
			this.status = { state: 'serverUnreachable' };
			return;
		}
		try {
			stopSeeding();
			await restorePlayerFiles(clientPath);
			let torrent: ClientTorrent;
			try {
				torrent = await loadClientTorrent(url);
			} catch (e) {
				Logger.error(
					'Torrent update: the client torrent could not be loaded',
					e
				);
				this.status = { state: 'serverUnreachable' };
				return;
			}
			const sha = torrent.sha;
			if (!clean && (await this.#torrentFastForward(clientPath, torrent))) {
				await this.#reconcileClientPatch(clientPath);
				await this.#reconcileRaidVisuals(clientPath);
				this.status = { state: 'upToDate', progress: 1 };
				await this.refreshSeeding();
				return;
			}
			const isUpdate = await fs.pathExists(path.join(clientPath, 'WoW.exe'));
			const changed = clean
				? []
				: await this.#changedSameSize(clientPath, torrent);
			const staleContext =
				Preferences.data.activeTorrentHash !== sha ||
				Preferences.data.activeClientDir !== clientPath;
			// an older torrent's file numbers do not carry over, so every file gets checked
			const carried = staleContext && this.#unfinished(clientPath);
			const resuming =
				carried ||
				(!staleContext &&
					(Preferences.data.syncedTorrentHash !== sha ||
						!!Preferences.data.activeSelection?.length));
			const carriedFiles = carried
				? await torrentFilesToCheck(clientPath, torrent)
				: null;
			if (carried && !carriedFiles)
				throw new Error('Torrent file list unavailable');
			if (staleContext) {
				await clearTorrentResumeState();
				Preferences.data = {
					activeTorrentHash: sha,
					activeClientDir: clientPath,
					activeRepatch: carried && Preferences.data.activeRepatch === true,
					activeSelection: carriedFiles ?? []
				};
			}
			// classify WoW.exe before the download rewrites it
			const exeSize = await fs.stat(path.join(clientPath, 'WoW.exe')).then(
				s => s.size,
				() => -1
			);
			const exeSigned =
				exeSize > 0 &&
				(await isLauncherPatchedWow(clientPath).catch(() => false));
			const exePatched =
				exeSigned ||
				(Preferences.data.activeRepatch === true && (exeSize <= 0 || resuming));
			Preferences.data = { activeRepatch: exePatched };
			await Preferences.save();
			const exeIndex =
				torrent.files.findIndex(
					f => f.path.length === 1 && f.path[0].toLowerCase() === 'wow.exe'
				) + 1;
			const exeDamaged =
				!clean && exeIndex > 0 && (await isWowExeDamaged(clientPath));
			const resumed = [
				...(carried
					? carriedFiles ?? []
					: this.#unfinished(clientPath)
					? Preferences.data.activeSelection ?? []
					: []),
				...(exeDamaged ? [exeIndex] : [])
			];
			const sizeSelection = clean
				? []
				: await torrentDownloadSelection(clientPath, torrent, staleContext);
			if (sizeSelection === null)
				throw new Error('could not work out which client files to download');
			const picked = clean
				? await torrentFilesToCheck(clientPath, torrent)
				: [...new Set([...sizeSelection, ...changed, ...resumed])].sort(
						(a, b) => a - b
				  );
			const checkIntegrity =
				!!clean || changed.length > 0 || resumed.length > 0;
			const selectFiles = picked.length > 0 ? picked : undefined;
			const download = !!selectFiles;
			if (download && os.platform() === 'win32' && !(await aria2Available())) {
				this.status = updateFailure(
					Object.assign(new Error('aria2c.exe missing'), { code: 'ENOENT' })
				);
				return;
			}
			if (selectFiles && !clean) {
				const need =
					(await bytesStillNeeded(clientPath, torrent, selectFiles)) +
					FREE_SPACE_MARGIN;
				const free = await freeBytes(clientPath);
				if (free !== undefined && need > free) {
					const size = formatFileSize(need - free, 1);
					Logger.warn(
						`Not enough free disk space for the download: ${size} short`
					);
					this.status = failed(
						'update.diskFullSize',
						`Not enough free disk space: the download needs about ${size} more on the game's drive. Free up space, then click Retry.`,
						{ size }
					);
					return;
				}
			}
			if (selectFiles) {
				Preferences.data = { activeSelection: selectFiles };
				await Preferences.save();
			}
			if (download) {
				const abort = new AbortController();
				this.#syncAbort = abort;
				this.status = {
					state: 'updating',
					progress: -1,
					cancellable: true,
					message: clean
						? 'Verifying game files...'
						: isUpdate
						? 'Connecting...'
						: 'Preparing download...'
				};
				let downloading = false;
				// aria2 writes pieces into neighbouring files, so set the player's mods aside
				await setAsidePlayerFiles(clientPath);
				try {
					await syncClient({
						torrent: torrent.file,
						clientDir: clientPath,
						checkIntegrity,
						selectFiles,
						seedTime: 0,
						signal: abort.signal,
						onProgress: p => {
							if (p.bytesPerSecond > 0) downloading = true;
							const phase = downloading
								? 'Downloading'
								: clean
								? 'Verifying game files'
								: isUpdate
								? 'Connecting'
								: 'Preparing';
							this.status = {
								state: 'updating',
								progress: p.progress,
								bytesDone: p.bytesDone,
								bytesTotal: p.bytesTotal,
								bytesPerSecond: p.bytesPerSecond,
								cancellable: true,
								message: `${phase}...`
							};
						}
					});
				} finally {
					this.#syncAbort = undefined;
					await restorePlayerFiles(clientPath);
				}
			}
			if (!(await torrentTreeIntact(clientPath, torrent))) {
				await healRealmlist(clientPath).catch(() => undefined);
				this.status = {
					state: 'updateAvailable',
					message: 'Download incomplete. Click update to finish.'
				};
				return;
			}
			await clearTorrentResumeState().catch(() => undefined);
			const baseOk = await refreshPristineWow(clientPath).then(
				() => true,
				e => {
					Logger.warn('Could not cache the WoW.exe base', e);
					return false;
				}
			);
			await this.#reapplyTweaks(clientPath, baseOk && exePatched);
			Preferences.data = { activeSelection: [] };
			const removed = await pruneStaleArchives(
				clientPath,
				torrent,
				await ownedDataArchives()
			);
			if (removed.length)
				Logger.log(`Removed stale archives: ${removed.join(', ')}`);
			// a sync can recreate d3d9.dll (clean pass, or piece spillover);
			// drop it while dxvk is off, the mods verify owns park/restore
			if (
				Preferences.data.mods?.dxvk?.enabled === false &&
				(await classifyModFile(clientPath, 'd3d9.dll')).kind !== 'player'
			)
				await fs
					.remove(path.join(clientPath, 'd3d9.dll'))
					.catch(() => undefined);
			// an integrity pass rewrites realmlist.wtf to the shipped default; heal it here too
			await healRealmlist(clientPath).catch(() => undefined);
			await this.#reconcileClientPatch(clientPath);
			await this.#reconcileRaidVisuals(clientPath);
			Preferences.data = { version: await getClientVersion() };
			if (baseOk) {
				Preferences.data = { syncedTorrentHash: sha };
				await saveSyncedTorrent(torrent).catch(e =>
					Logger.warn('Could not keep the synced client torrent', e)
				);
			}
			this.status = { state: 'upToDate', progress: 1 };
			await this.refreshSeeding();
		} catch (e) {
			Logger.error('Torrent update failed', e);
			await healRealmlist(clientPath).catch(() => undefined);
			this.status = updateFailure(e);
		}
	}

	verify() {
		return this.#exclusive(() => this.#verify());
	}

	async #verify() {
		if (this.status?.state === 'verifying' || this.status?.state === 'updating')
			return;

		const clientPath = Preferences.data.clientDir;
		if (!clientPath) {
			this.status = { state: 'noClient' };
			return;
		}

		if (os.platform() === 'win32' && clientPath.length > 220) {
			this.status = {
				state: 'failed',
				message:
					'Path to current install location is too long and may cause issues.'
			};
			return;
		}

		if (await isGameRunning(path.join(clientPath, 'WoW.exe')))
			return this.#checkWhileGameOpen(clientPath);

		return this.#torrentVerify(clientPath);
	}

	async #checkWhileGameOpen(clientPath: string) {
		const url = torrentUrl();
		if (!url) {
			this.status = { state: 'serverUnreachable' };
			return;
		}
		this.status = {
			state: 'verifying',
			progress: -1,
			message: 'Checking for updates...'
		};
		try {
			const torrent = await loadClientTorrent(url);
			const patchUrl = clientPatchUrl();
			const patchSha = patchUrl
				? await this.#fetchSidecarSha(patchUrl).catch(() => undefined)
				: undefined;
			const patchPending =
				!!patchUrl &&
				(!(await fs.pathExists(path.join(clientPath, 'Data', 'patch-5.mpq'))) ||
					(!!patchSha && patchSha !== Preferences.data.clientPatchHash));
			const upToDate =
				!this.#unfinished(clientPath) &&
				!patchPending &&
				torrent.sha === Preferences.data.syncedTorrentHash &&
				(await torrentTreeIntact(clientPath, torrent));
			this.status = upToDate
				? { state: 'upToDate', progress: 1 }
				: {
						state: 'failed',
						message: 'Please close WoW first, before updating.'
				  };
		} catch (e) {
			Logger.error('Update check with WoW open failed', e);
			this.status = { state: 'serverUnreachable' };
		}
	}

	update(clean?: boolean) {
		return this.#exclusive(() => this.#update(clean));
	}

	async #update(clean?: boolean) {
		if (this.status?.state === 'verifying' || this.status?.state === 'updating')
			return;

		const clientPath = Preferences.data.clientDir;
		if (!clientPath) {
			this.status = { state: 'noClient' };
			return;
		}

		if (await isGameRunning(path.join(clientPath, 'WoW.exe'))) {
			this.status = {
				state: 'failed',
				message: 'Please close WoW first, before updating.'
			};
			return;
		}

		return this.#torrentUpdate(clientPath, clean);
	}

	async recordPatchedWow() {
		const clientPath = Preferences.data.clientDir;
		if (!clientPath) return;
		const patchedWowHash = await this.#getHash(clientPath, 'WoW.exe');
		await this.#saveCache();
		Preferences.data = {
			lastPatchedLauncherVersion: app.getVersion(),
			expectedPatchedWowHash: patchedWowHash
		};
	}
}

const Updater = new UpdaterClass();
export default Updater;
