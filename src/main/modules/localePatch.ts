import path from 'node:path';

import fs from 'fs-extra';
import Logger from 'electron-log/main';

import Preferences from './preferences';

// old installs may have a copied patch-<letter>.mpq that overrides patch-5; sweep by marker
const ALL_LETTERS = 'BCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MARKER = 'octolocale.marker';

const patchFile = (dataDir: string, letter: string) =>
	path.join(dataDir, `patch-${letter}.mpq`);

// stormlib-node is optional: its bundled static library does not link on macOS. Without it no
// archive counts as ours, so nothing is removed.
type StormLib = {
	SFileOpenArchive(path: string, flags: number): bigint;
	SFileHasFile(archive: bigint, path: string): boolean;
	SFileCloseArchive(archive: bigint): void;
};

const loadStormLib = (): StormLib | undefined => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		return require('stormlib-node');
	} catch {
		return undefined;
	}
};

const STREAM_FLAG_READ_ONLY = 0x100;

const isOurPatch = (mpqPath: string): boolean => {
	if (!fs.existsSync(mpqPath)) return false;
	const storm = loadStormLib();
	if (!storm) return false;
	const { SFileOpenArchive, SFileHasFile, SFileCloseArchive } = storm;
	try {
		const h = SFileOpenArchive(mpqPath, STREAM_FLAG_READ_ONLY);
		try {
			return SFileHasFile(h, MARKER);
		} finally {
			SFileCloseArchive(h);
		}
	} catch {
		return false;
	}
};

// remove locale patches we copied in (marker-carrying archives only); never throws
export const removeLegacyLocalePatches = async (
	clientDir: string | undefined
): Promise<void> => {
	if (!clientDir) return;
	const dataDir = path.join(clientDir, 'Data');
	if (!(await fs.pathExists(dataDir))) return;

	for (const letter of ALL_LETTERS) {
		const f = patchFile(dataDir, letter);
		if (!isOurPatch(f)) continue;
		try {
			await fs.remove(f);
			Logger.log(`Removed the retired locale patch patch-${letter}.mpq`);
		} catch (e) {
			Logger.error(`Could not remove patch-${letter}.mpq`, e);
		}
	}

	// clear the stale tracking keys
	if (Preferences.data.localePatchLetter || Preferences.data.localePatchLocale)
		Preferences.data = {
			localePatchLetter: undefined,
			localePatchLocale: undefined
		};
};
