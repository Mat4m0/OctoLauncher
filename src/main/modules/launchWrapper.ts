// runs the Windows client through a wrapper such as Wine, or through Proton when it is chosen in
// Settings (env vars: Tools/linux/README.md)

import fs from 'fs';
import path from 'path';

import { findOnPath, isLinux } from './platform';
import {
	isProtonDir,
	protonCompatDataDir,
	steamClientDir
} from './proton';

export type LaunchPlan = {
	command: string;
	args: string[];
	wrapped: boolean;
	env?: Record<string, string>;
	// what is missing to start it; nothing is started then
	missing?: 'wine' | 'proton';
};

const trimmed = (v: string | undefined): string | undefined => {
	const s = (v ?? '').trim();
	return s === '' ? undefined : s;
};

export const gameExeName = (): string =>
	trimmed(process.env.OCTO_GAME_EXE) ?? 'WoW.exe';

export const loaderExeName = (): string =>
	trimmed(process.env.OCTO_LOADER_EXE) ?? 'VanillaFixes.exe';

const wrapperBin = (): string | undefined => {
	const configured =
		trimmed(process.env.OCTO_WINE_WRAPPER) ??
		trimmed(process.env.OCTO_LAUNCH_WRAPPER);
	if (configured)
		return configured.toLowerCase() === 'none' ? undefined : configured;
	return isLinux ? 'wine' : undefined;
};

// Wine prefers its builtin d3d9 over the dxvk copy in the game folder
const wineEnv = (
	clientDir: string | undefined
): Record<string, string> | undefined => {
	if (!isLinux || !clientDir) return undefined;
	if (!fs.existsSync(path.join(clientDir, 'd3d9.dll'))) return undefined;
	const current = process.env.WINEDLLOVERRIDES ?? '';
	if (/d3d9/i.test(current)) return undefined;
	return { WINEDLLOVERRIDES: current ? `${current};d3d9=n,b` : 'd3d9=n,b' };
};

// `proton` is set when Proton is turned on in Settings (Linux): its folder, or '' when none is chosen
export const resolveLaunch = async (
	target: string,
	trailingArgs: string[],
	clientDir?: string,
	proton?: string
): Promise<LaunchPlan> => {
	if (isLinux && proton !== undefined) {
		const script = path.join(proton, 'proton');
		if (!proton || !(await isProtonDir(proton)))
			return { command: script, args: [], wrapped: true, missing: 'proton' };
		const compatData = protonCompatDataDir();
		await fs.promises.mkdir(compatData, { recursive: true });
		return {
			command: script,
			args: ['run', target, ...trailingArgs],
			wrapped: true,
			env: {
				STEAM_COMPAT_CLIENT_INSTALL_PATH: await steamClientDir(proton),
				STEAM_COMPAT_DATA_PATH: compatData,
				...wineEnv(clientDir)
			}
		};
	}

	const wrapper = wrapperBin();
	if (!wrapper) return { command: target, args: trailingArgs, wrapped: false };

	const extra = (trimmed(process.env.OCTO_LAUNCH_WRAPPER_ARGS) ?? '')
		.split(/\s+/)
		.filter(Boolean);
	return {
		command: wrapper,
		args: [...extra, target, ...trailingArgs],
		wrapped: true,
		env: wineEnv(clientDir),
		...(isLinux && !findOnPath(wrapper) ? { missing: 'wine' as const } : {})
	};
};
