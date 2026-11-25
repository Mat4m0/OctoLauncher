import path from 'path';
import { spawn, type ChildProcess } from 'child_process';

import fs from 'fs-extra';
import { app } from 'electron';
import Logger from 'electron-log/main';

import Preferences from '~main/modules/preferences';
import Mods from '~main/modules/mods';
import { mainWindow } from '~main/index';
import Updater, { isGameRunning } from '~main/modules/updater';
import {
	patchConfig,
	patchExecutable,
	ensureDxvkConf,
	restorePublicRealm
} from '~main/modules/patcher';
import { removeLegacyLocalePatches } from '~main/modules/localePatch';
import { syncVanillaFixesCache } from '~main/modules/dllsTxt';
import { isClientBaseWow, stopSeeding } from '~main/modules/aria2';
import { minimizeToTray, restoreFromTray } from '~main/modules/tray';
import { getMod } from '~common/mods';
import {
	preparePrivateRoute,
	privateRouteInUse,
	endPrivateRoute
} from '~main/modules/authClient';
import {
	resolveLaunch,
	gameExeName,
	loaderExeName
} from '~main/modules/launchWrapper';
import { isLinux, isMac, usesWine } from '~main/modules/platform';
import {
	MACH9_DOWNLOAD_URL,
	ensureRetinaMode,
	macWinePrefix
} from '~main/modules/macWine';
import { protonWinePrefix } from '~main/modules/proton';
import {
	ensureGameDesktopEntry,
	gameEnv,
	spawnGame
} from '~main/modules/gameProcess';

import { createTRPCRouter, publicProcedure } from '../trpc';

const chainloaderNeeded = async (clientDir: string): Promise<boolean> => {
	const installed = Mods.status.mods.filter(r => r.installedVersion);
	if (installed.some(r => r.id === 'vanillaFixes')) return true;
	if (installed.some(r => getMod(r.id)?.requires?.includes('vanillaFixes')))
		return true;

	const dllsPath = path.join(clientDir, 'dlls.txt');
	if (await fs.pathExists(dllsPath)) {
		const raw = await fs.readFile(dllsPath, 'utf8');
		return raw.split(/\r?\n/).some(l => l.trim() && !l.trim().startsWith('#'));
	}
	return false;
};

type StartResult = { ok: boolean; error?: string; errorKey?: string };

const WINE_MISSING = isMac
	? `Mach9 is needed to run WoW on this Mac. Download it from ${MACH9_DOWNLOAD_URL}, move it to ` +
	  'Applications, then press Play again.'
	: 'Wine is needed to run WoW on Linux. Install it with your package manager ' +
	  '(for example: sudo apt install wine), then press Play again.';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const RECHECK_AFTER_MS = 10 * 60_000;
const RELEASE_CHECK_MS = 6_000;

let starting = false;
let openGames = 0;
const privateLaunches: { clientDir: string; host: string }[] = [];

export const launcherRouter = createTRPCRouter({
	start: publicProcedure.mutation(async (): Promise<StartResult> => {
		if (starting) return { ok: false, error: 'The game is already launching.' };
		starting = true;
		try {
			const { cleanWdb, minimizeToTrayOnPlay, clientDir } = Preferences.data;
			if (!clientDir) return { ok: false, error: 'No game folder is set.' };

			const exePath = path.join(clientDir, gameExeName());
			if (!(await fs.pathExists(exePath)))
				return {
					ok: false,
					error: `${gameExeName()} was not found in the game folder.`
				};
			const gameOpen = await isGameRunning(exePath);
			if (gameOpen)
				Logger.log(
					'WoW is already open; starting another (WoW.exe and WDB left as they are)'
				);

			if (Mods.status.dirty)
				return {
					ok: false,
					error: 'You have unapplied mod changes. Click Apply first.'
				};

			if (
				Updater.status.state === 'upToDate' &&
				Date.now() - Updater.checkedAt > RECHECK_AFTER_MS
			) {
				const pending = await Promise.race([
					Updater.releasePending().catch(e => {
						Logger.warn('Release check before Play failed', e);
						return false;
					}),
					delay(RELEASE_CHECK_MS).then(() => false)
				]);
				if (pending) {
					Logger.log('A release came out since the last check; updating first');
					void Updater.verify();
					return {
						ok: false,
						error:
							'A game update came out while the launcher was open. Let the launcher ' +
							'finish checking and updating, then click Play.',
						errorKey: 'launch.updateFirst'
					};
				}
			}

			stopSeeding();

			if (cleanWdb && !gameOpen) {
				Logger.log('Cleaning up WDB...');
				await fs.remove(path.join(clientDir, 'WDB'));
			}

			Logger.log('Syncing preferred monitor...');
			await Mods.verify();

			Logger.log('Checking the login route...');
			await preparePrivateRoute();

			Logger.log('Checking Config.wtf...');
			await patchConfig();
			await ensureDxvkConf(clientDir);
			const privateHost = privateRouteInUse();

			await removeLegacyLocalePatches(clientDir);

			if (gameOpen) {
				// a language or tweak change waits for a Play with no game open
			} else if (Preferences.data.patchedLocale !== Preferences.data.locale) {
				Logger.log(
					`Applying the client language (${Preferences.data.locale})...`
				);
				try {
					await patchExecutable();
					await patchConfig(true);
					await Updater.recordPatchedWow();
					if (!cleanWdb)
						await fs.remove(path.join(clientDir, 'WDB')).catch(() => {});
				} catch (e) {
					Logger.error(
						'Could not apply the client language; launching with the previous one',
						e
					);
				}
			} else if (await isClientBaseWow(clientDir).catch(() => false)) {
				Logger.log('WoW.exe lost the launcher tweaks; applying them again...');
				try {
					await patchExecutable();
					await Updater.recordPatchedWow();
				} catch (e) {
					Logger.error(
						'Could not apply the WoW.exe tweaks; launching without them',
						e
					);
				}
			}

			// Linux: Proton when it is turned on in Settings ('' = on, but none chosen)
			const proton =
				isLinux && Preferences.data.useProton
					? Preferences.data.protonPath ?? ''
					: undefined;

			const loaderPath = path.join(clientDir, loaderExeName());
			const needsLoader = await chainloaderNeeded(clientDir);
			const useLoader = needsLoader && (await fs.pathExists(loaderPath));
			if (useLoader)
				await syncVanillaFixesCache(
					clientDir,
					proton ? protonWinePrefix() : isMac ? macWinePrefix() : undefined
				);
			if (needsLoader && !useLoader)
				Logger.warn(
					'VanillaFixes.exe is missing but mods/dlls.txt expect a chainloader; ' +
						'launching WoW.exe directly (mods will not load).'
				);

			const plan = useLoader
				? await resolveLaunch(loaderPath, [gameExeName()], clientDir, proton)
				: await resolveLaunch(exePath, [], clientDir, proton);
			if (plan.missing === 'proton')
				return {
					ok: false,
					error:
						'The Proton version chosen in Settings was not found. Choose another one, ' +
						'or turn Proton off, then click Play again.',
					errorKey: 'launch.protonMissing'
				};
			if (plan.missing === 'wine') return { ok: false, error: WINE_MISSING };
			if (isMac && plan.wrapped && /\/wine[^/]*$/.test(plan.command))
				await ensureRetinaMode(plan.command, macWinePrefix())
					.then(
						set => set && Logger.log('Turned on Retina mode in the Wine prefix')
					)
					.catch(e => Logger.warn('Could not turn on Retina mode', e));
			const launchLabel = `${plan.command} ${plan.args.join(' ')}`.trim();
			Logger.log(
				`Launching${plan.wrapped ? ' via a wrapper' : ''}: ${launchLabel}` +
					(plan.env ? ` (env ${Object.keys(plan.env).join(', ')})` : '')
			);
			if (isLinux)
				await ensureGameDesktopEntry(exePath).catch(e =>
					Logger.warn('Could not write the game desktop entry', e)
				);
			let child: ChildProcess;
			try {
				child = usesWine
					? await spawnGame(
							plan.command,
							plan.args,
							clientDir,
							gameEnv(plan.env)
					  )
					: spawn(plan.command, plan.args, {
							cwd: clientDir,
							detached: !minimizeToTrayOnPlay,
							...(plan.env ? { env: { ...process.env, ...plan.env } } : {})
					  });
				await new Promise<void>((resolve, reject) => {
					child.once('spawn', resolve);
					child.once('error', reject);
				});
			} catch (e) {
				Logger.error('Failed to launch the game', e);
				// a flagged exe fails with ERROR_VIRUS_INFECTED, which libuv has no errno for
				if (!usesWine && (e as NodeJS.ErrnoException)?.code === 'UNKNOWN')
					return {
						ok: false,
						error:
							'Your antivirus stopped the game from starting. Add the game folder as an ' +
							'exception (Settings, "Allow through antivirus"), then click Play again.',
						errorKey: 'launch.blockedByAntivirus'
					};
				if (
					usesWine &&
					plan.wrapped &&
					(e as NodeJS.ErrnoException)?.code === 'ENOENT'
				)
					return { ok: false, error: WINE_MISSING };
				const message = e instanceof Error ? e.message : String(e);
				return { ok: false, error: `Failed to launch the game: ${message}` };
			}

			child.on('error', e => Logger.error('Game process error', e));

			const afterGame = async (): Promise<boolean> => {
				Logger.log('WoW stopped');
				if (--openGames > 0) return false;
				const ended = privateLaunches.splice(0);
				if (ended.length) endPrivateRoute();
				for (const l of ended)
					await restorePublicRealm(l.clientDir, l.host)
						.then(() =>
							Logger.log(
								'Standard login address restored after the game closed'
							)
						)
						.catch(e =>
							Logger.warn('Could not restore the standard login address', e)
						);
				return true;
			};
			// The loader, Proton and the Linux game scope or session can return before the game ends, so
			// those launches follow the game process itself. A first Proton start builds its prefix first.
			const followGameProcess = useLoader || usesWine;
			const appearWithinMs = usesWine ? 120_000 : 30_000;
			const watchGame = (onExit: () => void) => {
				if (followGameProcess) {
					void (async () => {
						try {
							const started = Date.now();
							while (
								Date.now() - started < appearWithinMs &&
								!(await isGameRunning(exePath))
							)
								await delay(1000);
							while (await isGameRunning(exePath)) await delay(3000);
						} finally {
							onExit();
						}
					})();
				} else {
					child.on('exit', onExit);
				}
			};

			if (privateHost) privateLaunches.push({ clientDir, host: privateHost });

			if (!minimizeToTrayOnPlay) {
				if (!privateLaunches.length) {
					mainWindow?.close();
					return { ok: true };
				}
				openGames++;
				mainWindow?.hide();
				watchGame(() => {
					void afterGame().then(last => {
						if (
							last &&
							(!mainWindow ||
								mainWindow.isDestroyed() ||
								!mainWindow.isVisible())
						)
							app.quit();
					});
				});
				return { ok: true };
			}

			openGames++;
			minimizeToTray();
			watchGame(() => {
				void afterGame().then(last => {
					if (last) restoreFromTray();
				});
			});
			return { ok: true };
		} catch (e) {
			Logger.error('Failed to start the game', e);
			return { ok: false, error: e instanceof Error ? e.message : String(e) };
		} finally {
			starting = false;
		}
	})
});
