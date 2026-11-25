// Linux: the Proton builds Steam (or a manually added GE-Proton) put on this machine, and the folders a
// Proton launch uses

import os from 'os';
import path from 'path';

import fs from 'fs-extra';
import { app } from 'electron';

export type ProtonInstall = { name: string; path: string };

const steamRoots = (): string[] => {
	const home = os.homedir();
	const flatpak = path.join(home, '.var', 'app', 'com.valvesoftware.Steam');
	return [
		path.join(home, '.local', 'share', 'Steam'),
		path.join(home, '.steam', 'steam'),
		path.join(home, '.steam', 'root'),
		path.join(flatpak, '.local', 'share', 'Steam'),
		path.join(flatpak, 'data', 'Steam')
	];
};

// .steam/steam and .steam/root are usually links to the same install
const existingSteamRoots = async (): Promise<string[]> => {
	const seen = new Set<string>();
	for (const root of steamRoots()) {
		const real = await fs.realpath(root).catch(() => undefined);
		if (real) seen.add(real);
	}
	return [...seen];
};

export const isProtonDir = (dir: string): Promise<boolean> =>
	fs.stat(path.join(dir, 'proton')).then(
		s => s.isFile(),
		() => false
	);

const scan = async (dir: string, only?: RegExp): Promise<ProtonInstall[]> => {
	const names = await fs.readdir(dir).catch(() => [] as string[]);
	const found: ProtonInstall[] = [];
	for (const name of names) {
		if (only && !only.test(name)) continue;
		const p = path.join(dir, name);
		if (await isProtonDir(p)) found.push({ name, path: p });
	}
	return found;
};

export const listProtonVersions = async (): Promise<ProtonInstall[]> => {
	if (process.platform !== 'linux') return [];
	const byPath = new Map<string, ProtonInstall>();
	for (const root of await existingSteamRoots())
		for (const install of [
			...(await scan(path.join(root, 'steamapps', 'common'), /^proton/i)),
			...(await scan(path.join(root, 'compatibilitytools.d')))
		]) {
			const real = await fs.realpath(install.path).catch(() => install.path);
			if (!byPath.has(real)) byPath.set(real, { name: install.name, path: real });
		}
	return [...byPath.values()].sort((a, b) =>
		b.name.localeCompare(a.name, undefined, { numeric: true })
	);
};

export const steamClientDir = async (protonDir: string): Promise<string> =>
	(await existingSteamRoots())[0] ?? path.dirname(protonDir);

// Proton keeps its own Wine prefix (pfx/ inside this folder), apart from ~/.wine
export const protonCompatDataDir = (): string =>
	path.join(app.getPath('userData'), 'proton-prefix');

export const protonWinePrefix = (): string =>
	path.join(protonCompatDataDir(), 'pfx');
