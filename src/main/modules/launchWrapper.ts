// runs the Windows client through a wrapper such as Wine, or through Proton when it is chosen in
// Settings (env vars: Tools/linux/README.md)

import fs from 'fs';
import path from 'path';

import { findOnPath, isLinux, isMac } from './platform';
import { findMacWine, macWinePrefix } from './macWine';
import { isProtonDir, protonCompatDataDir, steamClientDir } from './proton';

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
	if (isMac) return findMacWine() ?? 'wine';
	return isLinux ? 'wine' : undefined;
};

// macOS: the launcher's own prefix, and Wine's builtin d3d9 over the Windows dxvk copy in the game
// folder (dxvk needs Vulkan; Mach9's builtin d3d9 is mtld3d, which draws with Metal directly)
const macWineEnv = (): Record<string, string> => {
	const current = process.env.WINEDLLOVERRIDES ?? '';
	const mtld3d = process.env.MTLD3D_CONFIG ?? '';
	return {
		WINEPREFIX: macWinePrefix(),
		...(process.env.WINEDEBUG ? {} : { WINEDEBUG: '-all' }),
		...(/d3d9/i.test(current)
			? {}
			: { WINEDLLOVERRIDES: current ? `${current};d3d9=b` : 'd3d9=b' }),
		// mtld3d's overlay cursor: with the hardware cursor every hide/show (WoW hides it while a
		// mouse button turns the camera) delays the next frame by one refresh, a visible hitch
		...(/cursor\.software/i.test(mtld3d)
			? {}
			: {
					MTLD3D_CONFIG: mtld3d
						? `${mtld3d};cursor.software=true`
						: 'cursor.software=true'
			  })
	};
};

// Wine prefers its builtin d3d9 over the dxvk copy in the game folder
const wineEnv = (
	clientDir: string | undefined
): Record<string, string> | undefined => {
	if (isMac) return macWineEnv();
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
		...((isLinux || isMac) && !findOnPath(wrapper)
			? { missing: 'wine' as const }
			: {})
	};
};
