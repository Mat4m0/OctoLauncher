import { z } from 'zod';

export const ModIdSchema = z.enum([
	'dxvk',
	'nampower',
	'multiMonitorFix',
	'superWow',
	'classicApi',
	'unitXp',
	'vanillaFixes',
	'vanillaHelpers'
]);
export type ModId = z.infer<typeof ModIdSchema>;

export type ModSource =
	| {
			kind: 'directFile';
			url: string;
			parseLatest?: 'githubRelease' | 'gitlabRelease' | 'codebergRelease';
			apiUrl?: string;
			pinnedTag?: string;
			assetName: string;
			sha256?: string;
	  }
	| {
			kind: 'archive';
			url: string;
			apiUrl?: string;
			parseLatest?: 'githubRelease' | 'gitlabRelease' | 'codebergRelease';
			pinnedTag?: string;
			format: 'zip' | 'tar.gz';
			extractMap: Record<string, string>;
			sha256?: string;
	  }
	| { kind: 'managed' };

export type ModEntry = {
	id: ModId;
	name: string;
	version: string;
	description: string;
	recommended?: boolean;
	requires?: ModId[];
	repoUrl: string;
	source: ModSource;
	registerInDllsTxt?: string;
	// hidden from the Mods tab, never enabled on fresh installs; existing installs keep it
	disabled?: boolean;
	// not in the client torrent: fetched only when the player turns it on, removed when turned off
	separateDownload?: boolean;
};

export const MODS: ModEntry[] = [
	{
		id: 'dxvk',
		name: 'dxvk',
		version: 'v2.7.1-1',
		description: 'Enables Vulkan based rendering mode for better performance.',
		recommended: true,
		repoUrl: 'https://gitlab.com/Ph42oN/dxvk-gplasync',
		// fallback for the client download's copy; pinned to a commit since a branch path can change
		source: {
			kind: 'archive',
			url: 'https://gitlab.com/Ph42oN/dxvk-gplasync/-/raw/159ee8ef743d18769dfea284ea95393aca6b8421/releases/dxvk-gplasync-v2.7.1-1.tar.gz',
			pinnedTag: 'v2.7.1-1',
			format: 'tar.gz',
			extractMap: {
				'dxvk-gplasync-v2.7.1-1/x32/d3d9.dll': 'd3d9.dll'
			},
			sha256: '590050b88be7b156cf641abe762e1ad47ebbe828f7f0edb2970aa4716ee3af6d'
		}
	},
	{
		id: 'nampower',
		name: 'nampower',
		version: 'v4.6.2',
		description:
			'A client modification that minimizes your input lag if you have higher latency.',
		repoUrl: 'https://github.com/Emyrk/nampower',
		requires: ['vanillaFixes'],
		source: {
			kind: 'directFile',
			url: 'https://github.com/Emyrk/nampower/releases/download/v4.6.2/nampower.dll',
			pinnedTag: 'v4.6.2',
			assetName: 'nampower.dll'
		},
		registerInDllsTxt: 'nampower.dll'
	},
	{
		id: 'multiMonitorFix',
		name: 'no1600x1200',
		version: '0.2',
		description: 'Fix for larger resolutions or multi monitor setups.',
		repoUrl: 'https://github.com/Mates1500/VanillaMultiMonitorFix',
		requires: ['vanillaFixes'],
		source: {
			kind: 'archive',
			url: 'https://github.com/Mates1500/VanillaMultiMonitorFix/releases/download/0.2/release.zip',
			apiUrl:
				'https://api.github.com/repos/Mates1500/VanillaMultiMonitorFix/releases/latest',
			parseLatest: 'githubRelease',
			pinnedTag: '0.2',
			format: 'zip',
			extractMap: {
				'VanillaMultiMonitorFix.dll': 'VanillaMultiMonitorFix.dll'
			}
		},
		registerInDllsTxt: 'VanillaMultiMonitorFix.dll'
	},
	{
		id: 'superWow',
		name: 'SuperWoW',
		version: '2.2',
		description:
			'Extends the client Lua API with unit GUIDs and other data many addons rely on.',
		repoUrl: 'https://github.com/balakethelock/SuperWoW',
		requires: ['vanillaFixes'],
		source: {
			kind: 'archive',
			url: 'https://github.com/balakethelock/SuperWoW/releases/download/Release/SuperWoW.release.2.2.zip',
			apiUrl:
				'https://api.github.com/repos/balakethelock/SuperWoW/releases/latest',
			parseLatest: 'githubRelease',
			pinnedTag: '2.2',
			format: 'zip',
			extractMap: {
				'SuperWoWhook.dll': 'SuperWoWhook.dll'
			}
		},
		registerInDllsTxt: 'SuperWoWhook.dll',
		// disabled pending distribution permission; delete this line to re-enable
		disabled: true
	},
	{
		id: 'classicApi',
		name: 'ClassicAPI',
		version: 'v1.15.16',
		description:
			'Backports 550+ modern WoW API functions, 50+ events, and Lua 5.1 into the 1.12 client, so modern addons run with little or no change. Required by the ClassicAPI addon variants.',
		repoUrl: 'https://github.com/brues-code/ClassicAPI',
		requires: ['vanillaFixes'],
		source: {
			kind: 'directFile',
			url: 'https://github.com/brues-code/ClassicAPI/releases/download/v1.15.16/ClassicAPI.dll',
			apiUrl:
				'https://api.github.com/repos/brues-code/ClassicAPI/releases/latest',
			parseLatest: 'githubRelease',
			pinnedTag: 'v1.15.16',
			assetName: 'ClassicAPI.dll',
			// injected into the game client, so never accept a changed download
			sha256: 'e34886fb9725b9059375a5c37bff81ce220633c4e2c39719ef3223a6b8fc703d'
		},
		registerInDllsTxt: 'ClassicAPI.dll',
		separateDownload: true
	},
	{
		id: 'unitXp',
		name: 'unitXp',
		version: 'v89',
		description: 'An attempt to make Vanilla 1.12 modern.',
		repoUrl: 'https://codeberg.org/konaka/UnitXP_SP3',
		requires: ['vanillaFixes'],
		source: {
			kind: 'archive',
			url: 'https://codeberg.org/konaka/UnitXP_SP3/releases/download/v89/UnitXP_SP3%20v89.zip',
			pinnedTag: 'v89',
			format: 'zip',
			extractMap: {
				'UnitXP_SP3.dll': 'UnitXP_SP3.dll'
			}
		},
		registerInDllsTxt: 'UnitXP_SP3.dll'
	},
	{
		id: 'vanillaFixes',
		name: 'vanillaFixes',
		version: 'v1.5.3',
		description:
			'A client modification that eliminates stutter and animation lag.',
		recommended: true,
		repoUrl: 'https://github.com/hannesmann/vanillafixes',
		source: {
			kind: 'archive',
			url: 'https://github.com/hannesmann/vanillafixes/releases/download/v1.5.3/vanillafixes-1.5.3.zip',
			apiUrl:
				'https://api.github.com/repos/hannesmann/vanillafixes/releases/latest',
			parseLatest: 'githubRelease',
			pinnedTag: 'v1.5.3',
			format: 'zip',
			extractMap: {
				'VfPatcher.dll': 'VfPatcher.dll',
				'VanillaFixes.exe': 'VanillaFixes.exe'
			}
		}
	},
	{
		id: 'vanillaHelpers',
		name: 'vanillaHelpers',
		version: 'v1.1.2',
		description:
			'Utility library that might be required by other patches and addons.',
		repoUrl: 'https://github.com/isfir/VanillaHelpers',
		requires: ['vanillaFixes'],
		source: {
			kind: 'directFile',
			url: 'https://github.com/isfir/VanillaHelpers/releases/download/v1.1.2/VanillaHelpers.dll',
			apiUrl:
				'https://api.github.com/repos/isfir/VanillaHelpers/releases/latest',
			parseLatest: 'githubRelease',
			pinnedTag: 'v1.1.2',
			assetName: 'VanillaHelpers.dll'
		},
		registerInDllsTxt: 'VanillaHelpers.dll'
	}
];

export const getMod = (id: ModId): ModEntry | undefined =>
	MODS.find(m => m.id === id);

// fallback for profiles with no stored state: enabled, so legacy installs
// keep their mods; fresh installs seed explicit off rows instead (do NOT
// flip this list to change defaults, it strips mods from legacy profiles)
export const DEFAULT_ENABLED_MODS: ModId[] = MODS.filter(m => !m.disabled).map(
	m => m.id
);
