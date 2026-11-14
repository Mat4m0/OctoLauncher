// runs the Windows client through a wrapper such as Wine (env vars: Tools/linux/README.md)

import fs from 'fs';
import path from 'path';

import { isLinux } from './platform';

export type LaunchPlan = {
	command: string;
	args: string[];
	wrapped: boolean;
	env?: Record<string, string>;
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

export const resolveLaunch = (
	target: string,
	trailingArgs: string[],
	clientDir?: string
): LaunchPlan => {
	const wrapper = wrapperBin();
	if (!wrapper) return { command: target, args: trailingArgs, wrapped: false };

	const extra = (trimmed(process.env.OCTO_LAUNCH_WRAPPER_ARGS) ?? '')
		.split(/\s+/)
		.filter(Boolean);
	return {
		command: wrapper,
		args: [...extra, target, ...trailingArgs],
		wrapped: true,
		env: wineEnv(clientDir)
	};
};
