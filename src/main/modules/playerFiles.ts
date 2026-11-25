import path from 'path';
import { createHash } from 'crypto';

import fs from 'fs-extra';
import Logger from 'electron-log/main';

import { MODS, type ModEntry } from '~common/mods';

import Preferences from './preferences';

export const modTargetFiles = (m: ModEntry): string[] => {
	if (m.source.kind === 'directFile') return [m.source.assetName];
	if (m.source.kind === 'archive') return Object.values(m.source.extractMap);
	return [];
};

const lc = (s: string) => s.toLowerCase();

export const MANAGED_MOD_FILES = new Set(
	MODS.filter(m => !m.disabled)
		.flatMap(modTargetFiles)
		.map(lc)
);

const PINNED: Record<string, { sha256: string; size: number }> = {
	// dxvk-gplasync v2.7.1-1 x32, the build the client ships
	'd3d9.dll': {
		sha256: 'a2cd6841e102f37189527c118ec416fa5071ac4d3120762973d9a0c6c5fd067e',
		size: 4501518
	},
	// ClassicAPI v1.15.16 release asset
	'classicapi.dll': {
		sha256: 'e34886fb9725b9059375a5c37bff81ce220633c4e2c39719ef3223a6b8fc703d',
		size: 1449984
	}
};

export const pinnedSha256 = (name: string): string | undefined =>
	PINNED[lc(name)]?.sha256;

export type FileKind = 'missing' | 'ours' | 'broken' | 'player' | 'unknown';

export type FileExpect = {
	recordedSha?: string;
	pinned?: { sha256: string; size: number };
	downloadSize?: number;
	launcherWrote?: boolean;
};

export const isCompletePe = (b: Buffer): boolean => {
	if (b.length < 0x40 || b.readUInt16LE(0) !== 0x5a4d) return false;
	const pe = b.readUInt32LE(0x3c);
	if (pe + 24 > b.length || b.readUInt32LE(pe) !== 0x00004550) return false;
	const sections = b.readUInt16LE(pe + 6);
	const table = pe + 24 + b.readUInt16LE(pe + 20);
	if (sections === 0 || table + sections * 40 > b.length) return false;
	for (let i = 0; i < sections; i++) {
		const s = table + i * 40;
		const rawSize = b.readUInt32LE(s + 16);
		const rawPtr = b.readUInt32LE(s + 20);
		if (rawSize > 0 && rawPtr + rawSize > b.length) return false;
	}
	return true;
};

const isExecutable = (name: string) => /\.(dll|exe)$/i.test(name);

export const classifyFile = async (
	abs: string,
	e: FileExpect
): Promise<{ kind: FileKind; sha?: string }> => {
	const st = await fs.stat(abs).catch(() => null);
	if (!st || !st.isFile()) return { kind: 'missing' };
	if (st.size === 0) return { kind: 'broken' };
	const buf = await fs.readFile(abs).catch(() => null);
	if (!buf) return { kind: 'unknown' };
	const sha = createHash('sha256').update(buf).digest('hex');
	if (sha === e.recordedSha || sha === e.pinned?.sha256)
		return { kind: 'ours', sha };
	if (e.pinned && st.size === e.pinned.size) return { kind: 'broken', sha };
	if (e.downloadSize !== undefined && st.size === e.downloadSize)
		return { kind: 'ours', sha };
	if (isExecutable(abs) && !isCompletePe(buf)) return { kind: 'broken', sha };
	if (e.launcherWrote && !e.recordedSha) return { kind: 'ours', sha };
	if (!e.recordedSha && !e.pinned && e.downloadSize === undefined)
		return { kind: 'unknown', sha };
	return { kind: 'player', sha };
};

const downloadSizes = new Map<string, number>();
export const noteDownloadSize = (name: string, size: number) => {
	downloadSizes.set(lc(name), size);
};
export const downloadSizeOf = (name: string): number | undefined =>
	downloadSizes.get(lc(name));

const playerOwned = new Set<string>();
export const playerOwnedFiles = (): string[] => [...playerOwned];
export const playerOwnedInDownload = (): string[] =>
	[...playerOwned].filter(n => downloadSizes.has(n));

const launcherWroteFile = (name: string): boolean => {
	const mods = Preferences.data?.mods ?? {};
	return Object.values(mods).some(st =>
		(st?.installedFiles ?? []).some(f => lc(f) === lc(name))
	);
};

const recordOurs = (name: string, sha: string) => {
	const cur = Preferences.data?.modFileHashes ?? {};
	if (cur[lc(name)] === sha) return;
	Preferences.data = { modFileHashes: { ...cur, [lc(name)]: sha } };
};

export const classifyModFile = async (
	clientDir: string,
	name: string,
	downloadSize = downloadSizeOf(name)
): Promise<{ kind: FileKind; sha?: string }> => {
	const key = lc(name);
	const r = await classifyFile(path.join(clientDir, name), {
		recordedSha: Preferences.data?.modFileHashes?.[key],
		pinned: PINNED[key],
		downloadSize,
		launcherWrote: launcherWroteFile(name)
	});
	if (r.kind === 'ours' && r.sha) recordOurs(name, r.sha);
	if (r.kind === 'player') playerOwned.add(key);
	else if (r.kind !== 'unknown') playerOwned.delete(key);
	return r;
};

export const recordWritten = async (clientDir: string, name: string) => {
	try {
		const sha = createHash('sha256')
			.update(await fs.readFile(path.join(clientDir, name)))
			.digest('hex');
		recordOurs(name, sha);
		playerOwned.delete(lc(name));
	} catch {
		// the next verify decides
	}
};

const KEEP = '.octo-keep';

// aria2 can write pieces into neighbouring files, and a full check rewrites every file
export const setAsidePlayerFiles = async (
	clientDir: string
): Promise<string[]> => {
	const moved: string[] = [];
	for (const entry of await fs.readdir(clientDir).catch(() => [] as string[])) {
		if (!MANAGED_MOD_FILES.has(lc(entry))) continue;
		if ((await classifyModFile(clientDir, entry)).kind !== 'player') continue;
		const abs = path.join(clientDir, entry);
		try {
			await fs.move(abs, abs + KEEP, { overwrite: true });
			moved.push(entry);
		} catch (e) {
			Logger.warn(`Could not set ${entry} aside for the download`, e);
		}
	}
	if (moved.length)
		Logger.log(`Kept the player's own ${moved.join(', ')} out of the download`);
	return moved;
};

export const restorePlayerFiles = async (
	clientDir: string
): Promise<string[]> => {
	const restored: string[] = [];
	for (const entry of await fs.readdir(clientDir).catch(() => [] as string[])) {
		if (!entry.toLowerCase().endsWith(KEEP)) continue;
		const name = entry.slice(0, -KEEP.length);
		if (!MANAGED_MOD_FILES.has(lc(name))) continue;
		const target = path.join(clientDir, name);
		try {
			await fs.remove(target);
			await fs.move(path.join(clientDir, entry), target);
			playerOwned.add(lc(name));
			restored.push(name);
		} catch (e) {
			Logger.warn(`Could not put the player's ${name} back`, e);
		}
	}
	if (restored.length)
		Logger.log(`Put the player's own ${restored.join(', ')} back`);
	return restored;
};

export const removePlayerCopy = async (clientDir: string, name: string) => {
	await fs.remove(path.join(clientDir, name));
	playerOwned.delete(lc(name));
	Logger.log(`Player chose the launcher's ${name}; removed their copy`);
};
