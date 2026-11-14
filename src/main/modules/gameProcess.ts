// Linux: start the game outside the launcher's own process scope and taskbar identity, so the desktop
// shows WoW as its own window with its own icon instead of grouping it under OctoLauncher

import { execFile, spawn, type ChildProcess } from 'child_process';
import os from 'os';
import path from 'path';

import fs from 'fs-extra';
import { app } from 'electron';
import Logger from 'electron-log/main';

import { exeIcon } from './exeIcon';
import { findOnPath } from './platform';

// set for the launcher by the AppImage runtime and the desktop session; a game that inherits them is
// counted as part of the launcher
const LAUNCHER_IDENTITY_ENV = [
	'BAMF_DESKTOP_FILE_HINT',
	'DESKTOP_STARTUP_ID',
	'GIO_LAUNCHED_DESKTOP_FILE',
	'GIO_LAUNCHED_DESKTOP_FILE_PID',
	'XDG_ACTIVATION_TOKEN',
	'APPIMAGE',
	'APPDIR',
	'OWD',
	'ARGV0',
	'APPIMAGE_EXTRACT_AND_RUN',
	'APPIMAGE_SILENT_MESSAGE'
];

export const gameEnv = (extra?: Record<string, string>): NodeJS.ProcessEnv => {
	const env: NodeJS.ProcessEnv = { ...process.env, ...extra };
	for (const key of LAUNCHER_IDENTITY_ENV) delete env[key];
	return env;
};

// a desktop session runs a user systemd instance that can give the game its own scope; without one
// (a container, some minimal setups) `systemd-run --user` fails, so it is tried once
let userScope: Promise<boolean> | undefined;
const userScopeWorks = () =>
	(userScope ??= new Promise<boolean>(resolve => {
		if (!findOnPath('systemd-run')) return resolve(false);
		execFile(
			'systemd-run',
			['--user', '--scope', '--quiet', '--collect', 'true'],
			{ timeout: 5000 },
			err => resolve(!err)
		);
	}));

// The game outlives the launcher in every case; Play tracks it by its process, not by this child.
export const spawnGame = async (
	command: string,
	args: string[],
	cwd: string,
	env: NodeJS.ProcessEnv
): Promise<ChildProcess> => {
	const options = { cwd, env, detached: true, stdio: 'ignore' as const };
	if (await userScopeWorks()) {
		const unit = `octolauncher-game-${process.pid}-${Date.now()}`;
		Logger.log(`Starting the game in its own systemd scope (${unit})`);
		return spawn(
			'systemd-run',
			['--user', '--scope', '--quiet', '--collect', `--unit=${unit}`, command, ...args],
			options
		);
	}
	if (findOnPath('setsid')) {
		Logger.log('Starting the game in its own session (setsid)');
		return spawn('setsid', ['--fork', command, ...args], options);
	}
	return spawn(command, args, options);
};

// Wine names the game window's class after the exe (wow.exe). A hidden desktop entry with that
// StartupWMClass and the exe's own icon lets the desktop show the window as WoW. Without an icon
// the entry is not written: an entry with no icon would show a generic one.
export const ensureGameDesktopEntry = async (exePath: string) => {
	const iconFile = path.join(app.getPath('userData'), 'game-icon.ico');
	if (!(await fs.pathExists(iconFile))) {
		const ico = exeIcon(await fs.readFile(exePath));
		if (!ico) {
			Logger.log('No icon found in the game exe; no desktop entry written');
			return;
		}
		await fs.ensureDir(path.dirname(iconFile));
		await fs.writeFile(iconFile, ico);
	}
	const dataHome =
		process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
	const dir = path.join(dataHome, 'applications');
	const file = path.join(dir, 'octolauncher-game.desktop');
	const body = [
		'[Desktop Entry]',
		'Type=Application',
		'Name=World of Warcraft',
		'Exec=true',
		`Icon=${iconFile}`,
		'NoDisplay=true',
		'Terminal=false',
		'StartupNotify=false',
		`StartupWMClass=${path.basename(exePath).toLowerCase()}`,
		''
	].join('\n');
	if ((await fs.readFile(file, 'utf8').catch(() => '')) === body) return;
	await fs.ensureDir(dir);
	await fs.writeFile(file, body, 'utf8');
	execFile('update-desktop-database', [dir], () => {});
	Logger.log(`Desktop entry written: ${file}`);
};
