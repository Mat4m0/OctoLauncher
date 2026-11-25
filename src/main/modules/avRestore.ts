import path from 'node:path';

import Logger from 'electron-log/main';

import Preferences from './preferences';
import Updater, { isGameRunning } from './updater';
import Mods from './mods';
import { detectAntivirusBlocks } from './defender';

export type AvCheckResult = { ok: true; blocked: string[] };

export type AvRestoreFailure =
	| 'no_client'
	| 'game_running'
	| 'busy'
	| 'server_unreachable'
	| 'incomplete'
	| 'failed';

export type AvRestoreResult =
	| { ok: true; restored: string[]; stillBlocked: string[] }
	| { ok: false; reason: AvRestoreFailure; stillBlocked: string[] };

export const checkAntivirusBlocks = async (): Promise<AvCheckResult> => {
	try {
		await Mods.verify();
	} catch (e) {
		Logger.warn('Mod verify during the antivirus check failed', e);
	}
	const blocked = await detectAntivirusBlocks();
	Logger.info(
		`Antivirus check: ${
			blocked.length
				? `still blocked [${blocked.join(', ')}]`
				: 'nothing blocked'
		}`
	);
	return { ok: true, blocked };
};

export const restoreBlockedFiles = async (): Promise<AvRestoreResult> => {
	const clientDir = Preferences.data.clientDir;
	if (!clientDir) return { ok: false, reason: 'no_client', stillBlocked: [] };

	const before = await detectAntivirusBlocks();
	if (await isGameRunning(path.join(clientDir, 'WoW.exe')))
		return { ok: false, reason: 'game_running', stillBlocked: before };
	const current = Updater.status?.state;
	if (Updater.busy || current === 'verifying' || current === 'updating')
		return { ok: false, reason: 'busy', stillBlocked: before };

	let failed = false;
	try {
		await Updater.update();
	} catch (e) {
		Logger.error('Antivirus restore: client re-sync failed', e);
		failed = true;
	}
	const sync = Updater.status?.state;
	try {
		await Mods.applyAll({ repairOnly: true });
	} catch (e) {
		Logger.warn('Antivirus restore: mod repair failed', e);
	}
	const after = await detectAntivirusBlocks();
	const restored = before.filter(name => !after.includes(name));
	Logger.info(
		`Antivirus restore: sync=${sync ?? 'none'}, restored [${restored.join(
			', '
		)}], ` + `still blocked [${after.join(', ')}]`
	);

	if (failed || sync === 'failed')
		return { ok: false, reason: 'failed', stillBlocked: after };
	if (sync === 'serverUnreachable')
		return { ok: false, reason: 'server_unreachable', stillBlocked: after };
	if (sync === 'updateAvailable')
		return { ok: false, reason: 'incomplete', stillBlocked: after };
	return { ok: true, restored, stillBlocked: after };
};
