// macOS: the Wine that runs the Windows client, and the prefix it uses.
// Mach9 comes first: an arm64 Wine (no Rosetta) whose D3D9 runs on Metal through mtld3d, the
// fastest renderer for WoW 1.12 on Apple Silicon. Rosetta Wine builds (Gcenx) are the fallback.

import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { app } from 'electron';

export const MACH9_DOWNLOAD_URL = 'https://mach9.app';

const candidates = (): string[] => [
	'/Applications/Mach9.app/Contents/Resources/wine/bin/wine',
	...['Wine Staging', 'Wine Stable', 'Wine Devel'].map(name =>
		path.join(
			'/Applications',
			`${name}.app`,
			'Contents/Resources/wine/bin/wine'
		)
	),
	'/opt/homebrew/bin/wine',
	'/usr/local/bin/wine'
];

export const findMacWine = (): string | undefined =>
	candidates().find(p => fs.existsSync(p));

export const isMach9 = (wine: string): boolean => wine.includes('/Mach9.app/');

// a prefix of its own, apart from ~/.wine; the first start builds it (about a minute)
export const macWinePrefix = (): string =>
	path.resolve(
		process.env.WINEPREFIX || path.join(app.getPath('userData'), 'wine-prefix')
	);

// Retina mode: without it Wine reports the screen in points, WoW draws at half the panel's
// pixels and macOS stretches the frame, which blurs text. A RetinaMode value already in the
// prefix (also "n") is the player's choice and is left alone. A new prefix is built by this call.
export const ensureRetinaMode = async (wine: string, prefix: string) => {
	const userReg = await fs.promises
		.readFile(path.join(prefix, 'user.reg'), 'utf8')
		.catch(() => '');
	if (/^"RetinaMode"=/m.test(userReg)) return false;
	await promisify(execFile)(
		wine,
		[
			'reg',
			'add',
			'HKCU\\Software\\Wine\\Mac Driver',
			'/v',
			'RetinaMode',
			'/d',
			'y',
			'/f'
		],
		{ env: { ...process.env, WINEPREFIX: prefix, WINEDEBUG: '-all' } }
	);
	return true;
};
