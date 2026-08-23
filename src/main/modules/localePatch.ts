import path from 'node:path';

import fs from 'fs-extra';
import Logger from 'electron-log/main';

import Preferences from './preferences';
import { StormLib, STREAM_READ_ONLY } from './stormLib';

const PREFERRED = 'L';
const ALL_LETTERS = 'BCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const RAID_LETTER = 'O';
const ALLOC_LETTERS = ALL_LETTERS.filter(l => l !== RAID_LETTER);
const MARKER = 'octolocale.marker';

const patchFile = (dataDir: string, letter: string) =>
	path.join(dataDir, `patch-${letter}.mpq`);

const prebuiltFor = (dataDir: string, locale: string) =>
	path.join(dataDir, locale, 'patch-L.mpq');

const isOurPatch = (mpqPath: string): boolean => {
	if (!fs.existsSync(mpqPath)) return false;
	try {
		const h = StormLib.SFileOpenArchive(mpqPath, STREAM_READ_ONLY);
		try {
			return StormLib.SFileHasFile(h, MARKER);
		} finally {
			StormLib.SFileCloseArchive(h);
		}
	} catch {
		if (process.platform !== 'darwin') return false;
		const tracked = Preferences.data.localePatchLetter;
		return (
			!!tracked &&
			path.resolve(mpqPath) ===
				path.resolve(patchFile(path.dirname(mpqPath), tracked))
		);
	}
};

const usableSlot = (dataDir: string, letter: string): boolean => {
	if (fs.existsSync(path.join(dataDir, `patch-${letter}.MPQ`))) return false;
	const f = patchFile(dataDir, letter);
	return !fs.existsSync(f) || isOurPatch(f);
};

const removeOurPatch = async (dataDir: string) => {
	for (const l of ALL_LETTERS) {
		const f = patchFile(dataDir, l);
		if (isOurPatch(f)) await fs.remove(f).catch(() => {});
	}
	if (Preferences.data.localePatchLetter || Preferences.data.localePatchLocale)
		Preferences.data = {
			localePatchLetter: undefined,
			localePatchLocale: undefined
		};
};

export const applyLocalePatch = async (
	clientDir: string | undefined,
	locale: string | undefined
): Promise<void> => {
	if (!clientDir) return;
	const dataDir = path.join(clientDir, 'Data');

	const nextLocale = !locale || locale === 'enUS' ? undefined : locale;
	if (Preferences.data.localePatchLocale !== nextLocale)
		await fs.remove(path.join(clientDir, 'WDB')).catch(() => {});

	if (!locale || locale === 'enUS') {
		await removeOurPatch(dataDir);
		return;
	}

	const source = prebuiltFor(dataDir, locale);
	if (!(await fs.pathExists(source))) {
		Logger.warn(
			`Locale patch: no prebuilt patch-L for ${locale}; leaving UI as-is`
		);
		return;
	}

	const tracked = Preferences.data.localePatchLetter;
	const letter =
		(tracked && tracked !== RAID_LETTER && usableSlot(dataDir, tracked)
			? tracked
			: undefined) ??
		(usableSlot(dataDir, PREFERRED)
			? PREFERRED
			: ALLOC_LETTERS.find(l => usableSlot(dataDir, l)));
	if (!letter) {
		Logger.warn('Locale patch: no usable patch slot');
		return;
	}
	const target = patchFile(dataDir, letter);

	try {
		if (
			Preferences.data.localePatchLocale === locale &&
			isOurPatch(target) &&
			fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs
		)
			return;
	} catch {
	}

	try {
		for (const l of ALL_LETTERS) {
			if (l === letter) continue;
			const f = patchFile(dataDir, l);
			if (isOurPatch(f)) await fs.remove(f).catch(() => {});
		}
		await fs.copy(source, target, { overwrite: true });
		Preferences.data = { localePatchLetter: letter, localePatchLocale: locale };
		Logger.log(
			`Locale patch: swapped prebuilt ${locale} -> patch-${letter}.mpq`
		);
	} catch (e) {
		Logger.error('Locale patch: failed to swap in prebuilt patch', e);
	}
};
