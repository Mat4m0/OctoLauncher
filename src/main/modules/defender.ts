import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { app, shell } from 'electron';
import Logger from 'electron-log/main';

import Preferences from './preferences';

// the player adds exclusions by hand; Defender flags apps that add their own
export const defenderExclusionFolders = (): string[] => {
	if (os.platform() !== 'win32') return [];
	const clientDir = Preferences.data.clientDir;
	const launcherDir =
		process.env.PORTABLE_EXECUTABLE_DIR ?? path.dirname(app.getPath('exe'));
	return [
		...new Set(
			[clientDir, launcherDir]
				.filter((p): p is string => !!p)
				.map(p => path.normalize(p))
		)
	];
};

export const openDefenderExclusionSettings = async (): Promise<boolean> => {
	if (os.platform() !== 'win32') return false;
	for (const uri of [
		'windowsdefender://threatsettings/',
		'windowsdefender:',
		'ms-settings:windowsdefender'
	]) {
		try {
			await shell.openExternal(uri);
			return true;
		} catch (e) {
			Logger.warn(`Could not open ${uri}`, e);
		}
	}
	return false;
};

// only files the client torrent ships: a missing one is reported as quarantined
const SENSITIVE_FILES = [
	'WoW.exe',
	'VanillaFixes.exe',
	'd3d9.dll',
	'UnitXP_SP3.dll',
	'nampower.dll',
	'VfPatcher.dll',
	'VanillaHelpers.dll',
	'VanillaMultiMonitorFix.dll',
	'transmogfix.dll'
];

export const detectAntivirusBlocks = async (): Promise<string[]> => {
	if (os.platform() !== 'win32') return [];

	const clientDir = Preferences.data.clientDir;
	const launcherDir =
		process.env.PORTABLE_EXECUTABLE_DIR ?? path.dirname(app.getPath('exe'));
	const roots = [clientDir, launcherDir]
		.filter((p): p is string => !!p)
		.map(p => p.toLowerCase());
	if (!roots.length) return [];

	const blocked = new Set<string>();

	if (clientDir && Preferences.data.syncedTorrentHash)
		for (const name of SENSITIVE_FILES) {
			// d3d9.dll is deliberately parked while dxvk is off, not blocked
			if (
				name === 'd3d9.dll' &&
				Preferences.data.mods?.dxvk?.enabled === false
			)
				continue;
			if (!fs.existsSync(path.join(clientDir, name))) blocked.add(name);
		}

	const script =
		'Get-MpThreatDetection | Where-Object ' +
		'{ $_.InitialDetectionTime -gt (Get-Date).AddHours(-12) } | ' +
		'Select-Object -ExpandProperty Resources';
	await new Promise<void>(resolve => {
		const child = spawn(
			'powershell.exe',
			['-NoProfile', '-NonInteractive', '-Command', script],
			{ windowsHide: true }
		);
		let out = '';
		let settled = false;
		const timer = setTimeout(() => {
			try {
				child.kill();
			} catch {}
		}, 15_000);
		const finish = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve();
		};
		child.stdout.on('data', d => (out += String(d)));
		child.on('error', finish);
		child.on('exit', () => {
			for (const line of out.split(/\r?\n/)) {
				const m = /^file:_?(.+)$/.exec(line.trim());
				if (!m) continue;
				const full = m[1];
				if (
					roots.some(r => full.toLowerCase().startsWith(r)) &&
					!fs.existsSync(full)
				)
					blocked.add(path.basename(full));
			}
			finish();
		});
	});

	return [...blocked];
};
