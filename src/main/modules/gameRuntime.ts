import path from 'node:path';
import os from 'node:os';
import { execFile, spawn, type ChildProcess } from 'node:child_process';

import fs from 'fs-extra';

import Preferences from './preferences';

const WINE_DOWNLOAD_URL = 'https://github.com/Gcenx/macOS_Wine_builds/releases';

const wineCandidates = () => {
	const names = ['Wine Staging', 'Wine Stable', 'Wine Devel'];
	const appBinaries = names.flatMap(name =>
		['wine', 'wine64'].map(binary =>
			path.join(
				'/Applications',
				`${name}.app`,
				'Contents/Resources/wine/bin',
				binary
			)
		)
	);
	return [
		process.env.OCTOLAUNCHER_WINE,
		'/opt/homebrew/bin/wine',
		'/usr/local/bin/wine',
		...appBinaries
	].filter((candidate): candidate is string => !!candidate);
};

export const findWine = () => wineCandidates().find(fs.existsSync);

const hasRosetta = () =>
	process.arch !== 'arm64' ||
	fs.existsSync('/Library/Apple/usr/libexec/oah/libRosettaRuntime');

export const getRecommendedClientDir = () =>
	path.join(os.homedir(), 'Games', 'OctoWoW');

export const getGameRuntimeStatus = () => {
	if (process.platform === 'win32')
		return {
			kind: 'native' as const,
			available: true,
			platform: process.platform,
			recommendedClientDir: undefined,
			winePrefix: undefined,
			downloadUrl: undefined
		};

	if (process.platform === 'darwin') {
		const executable = findWine();
		const rosettaAvailable = hasRosetta();
		return {
			kind: 'wine' as const,
			available: !!executable && rosettaAvailable,
			platform: process.platform,
			executable,
			rosettaAvailable,
			recommendedClientDir: getRecommendedClientDir(),
			winePrefix: path.join(Preferences.userDataDir, 'wine'),
			downloadUrl: WINE_DOWNLOAD_URL
		};
	}

	return {
		kind: 'unsupported' as const,
		available: false,
		platform: process.platform,
		recommendedClientDir: undefined,
		winePrefix: undefined,
		downloadUrl: undefined
	};
};

type LaunchOptions = {
	clientDir: string;
	executable: string;
	args?: string[];
	detached: boolean;
};

export const spawnGame = ({
	clientDir,
	executable,
	args = [],
	detached
}: LaunchOptions): ChildProcess => {
	if (process.platform === 'win32')
		return spawn(executable, args, { cwd: clientDir, detached });

	if (process.platform !== 'darwin')
		throw new Error(`Playing is not supported on ${process.platform}.`);

	const wine = findWine();
	if (!wine)
		throw new Error(
			'Wine is not installed. Install the free Wine Staging build, restart ' +
				'OctoLauncher, and try again.'
		);
	if (!hasRosetta())
		throw new Error(
			'Rosetta 2 is required on Apple Silicon. Install it with Software Update, ' +
				'restart OctoLauncher, and try again.'
		);

	return spawn(wine, [executable, ...args], {
		cwd: clientDir,
		detached,
		env: {
			...process.env,
			WINEPREFIX: path.join(Preferences.userDataDir, 'wine'),
			WINEDEBUG: '-all'
		}
	});
};

export const isGameRunning = async (executablePath: string) => {
	if (process.platform === 'win32') {
		const exeName = path.basename(executablePath);
		return new Promise<boolean>(resolve => {
			execFile(
				'tasklist',
				['/FI', `IMAGENAME eq ${exeName}`, '/FO', 'CSV', '/NH'],
				(error, stdout) =>
					resolve(
						!error && stdout.toLowerCase().includes(`"${exeName.toLowerCase()}"`)
					)
			);
		});
	}

	if (process.platform === 'darwin') {
		return new Promise<boolean>(resolve => {
			execFile('/bin/ps', ['-ax', '-o', 'command='], (error, stdout) => {
				if (error) return resolve(false);
				const exeName = path.basename(executablePath).toLowerCase();
				resolve(
					stdout
						.toLowerCase()
						.split('\n')
						.some(line => line.includes(exeName))
				);
			});
		});
	}

	return false;
};
