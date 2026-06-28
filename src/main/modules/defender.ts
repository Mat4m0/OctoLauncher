import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

import { app } from 'electron';
import Logger from 'electron-log/main';

import Preferences from './preferences';

export type ExclusionResult = { ok: boolean; error?: string; paths?: string[] };

const psSingleQuote = (s: string) => `'${s.replace(/'/g, "''")}'`;

export const addDefenderExclusions = async (): Promise<ExclusionResult> => {
	if (os.platform() !== 'win32')
		return {
			ok: false,
			error: 'Antivirus exclusions are only needed on Windows.'
		};

	const clientDir = Preferences.data.clientDir;
	if (!clientDir)
		return {
			ok: false,
			error: 'Set your game folder first, then add the exclusion.'
		};

	const launcherDir =
		process.env.PORTABLE_EXECUTABLE_DIR ?? path.dirname(app.getPath('exe'));
	const paths = [...new Set([clientDir, launcherDir])];

	const inner = [
		'$ErrorActionPreference = "Stop"',
		'try {',
		...paths.map(p => `Add-MpPreference -ExclusionPath ${psSingleQuote(p)}`),
		'Add-MpPreference -ExclusionProcess "WoW.exe"',
		'Add-MpPreference -ExclusionProcess "VanillaFixes.exe"',
		'exit 0',
		'} catch { exit 2 }'
	].join('\n');
	const encoded = Buffer.from(inner, 'utf16le').toString('base64');

	const outer =
		'try { $p = Start-Process powershell -Verb RunAs -WindowStyle Hidden ' +
		"-Wait -PassThru -ArgumentList '-NoProfile','-NonInteractive'," +
		`'-EncodedCommand','${encoded}'; exit $p.ExitCode } catch { exit 1 }`;

	return new Promise<ExclusionResult>(resolve => {
		const child = spawn(
			'powershell.exe',
			['-NoProfile', '-NonInteractive', '-Command', outer],
			{ windowsHide: true }
		);
		let stderr = '';
		child.stderr.on('data', d => (stderr += String(d)));
		child.on('error', e => {
			Logger.error('Failed to launch PowerShell for Defender exclusion', e);
			resolve({ ok: false, error: 'Could not run Windows PowerShell.' });
		});
		child.on('exit', code => {
			if (code === 0) {
				Logger.info(`Added Defender exclusions: ${paths.join(', ')}`);
				resolve({ ok: true, paths });
			} else if (code === 1) {
				resolve({
					ok: false,
					error:
						'No permission granted. Click Yes on the Windows prompt to add the exclusion.'
				});
			} else {
				Logger.error(`Defender exclusion failed (code ${code}): ${stderr}`);
				resolve({
					ok: false,
					error:
						'Could not add the exclusion automatically. You may need to add it in Windows Security manually.'
				});
			}
		});
	});
};
