import path from 'path';
import { createHash } from 'crypto';

import fs from 'fs-extra';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';
import * as tar from 'tar';
import Logger from 'electron-log/main';

import { MODS, type ModEntry, type ModId, getMod } from '~common/mods';
import { type ModState } from '~common/schemas';

import Preferences from './preferences';
import Observable from './observable';
import Updater from './updater';
import { addDll, removeDll } from './dllsTxt';
import { enumerateDisplays } from './displays';

const MOD_DOWNLOAD_TIMEOUT_MS = 60_000;

const AV_ERROR =
	'Windows Defender blocked this download. Use "Allow through antivirus" and apply again.';

const looksLikeAvBlock = (msg: string) =>
	/windows defender|virus|potentially unwanted/i.test(msg);

export type ModRowStatus = {
	id: ModId;
	name: string;
	description: string;
	repoUrl: string;
	recommended: boolean;
	requires: ModId[];
	enabled: boolean;
	ignoreUpdates: boolean;
	installedVersion?: string;
	latestVersion: string;
	state: 'idle' | 'downloading' | 'installing' | 'uninstalling' | 'error';
	progress?: number;
	error?: string;
	unsupportedReason?: string;
};

export type ModsStatus = {
	state: 'verifying' | 'idle' | 'busy';
	dirty: boolean;
	mods: ModRowStatus[];
};

class ModsClass extends Observable<ModsStatus> {
	protected _value: ModsStatus = {
		state: 'verifying',
		dirty: false,
		mods: []
	};

	#unsupportedReason(id: ModId) {
		if (process.platform === 'darwin' && id === 'dxvk')
			return 'Wine provides the graphics translation on macOS; this Windows DXVK build would conflict with it.';
		return undefined;
	}

	get status(): ModsStatus {
		return this._value;
	}

	#initialRow(m: ModEntry): ModRowStatus {
		const state = Preferences.data?.mods?.[m.id];
		const unsupportedReason = this.#unsupportedReason(m.id);
		return {
			id: m.id,
			name: m.name,
			description: m.description,
			repoUrl: m.repoUrl,
			recommended: !!m.recommended,
			requires: m.requires ?? [],
			enabled: !!state?.enabled && !unsupportedReason,
			ignoreUpdates: !!state?.ignoreUpdates,
			installedVersion: state?.installedVersion,
			latestVersion: m.version,
			state: 'idle',
			unsupportedReason
		};
	}

	#patchRow(id: ModId, patch: Partial<ModRowStatus>) {
		this._value = {
			...this._value,
			mods: this._value.mods.map(r => (r.id === id ? { ...r, ...patch } : r))
		};
		this._value = { ...this._value, dirty: this.#computeDirty() };
		this._notifyObservers();
	}

	#computeDirty(): boolean {
		return this._value.mods.some(r => {
			const wantInstalled = r.enabled;
			const isInstalled = !!r.installedVersion;
			if (wantInstalled !== isInstalled) return true;
			if (
				r.installedVersion &&
				r.installedVersion !== r.latestVersion &&
				!r.ignoreUpdates
			)
				return true;
			return false;
		});
	}

	load() {
		this._value = {
			state: 'verifying',
			dirty: false,
			mods: MODS.map(m => this.#initialRow(m))
		};
	}

	async #syncPreferredMonitor(clientDir: string) {
		const vmmfDll = path.join(clientDir, 'VanillaMultiMonitorFix.dll');
		if (!(await fs.pathExists(vmmfDll))) return;

		const vmmfCfg = path.join(clientDir, 'VMMFix_preferred_monitor.txt');
		const existsCfg = await fs.pathExists(vmmfCfg);
		const current = existsCfg
			? Number(
					await fs
						.readFile(vmmfCfg, 'utf8')
						.then(s => s.trim())
						.catch(() => '')
			  )
			: NaN;
		const hasCurrent = Number.isInteger(current);
		const ours = Preferences.data?.vmmfWrittenIndex;

		const devices = await enumerateDisplays();
		const usable = devices?.filter(d => d.attached && d.width > 0);
		if (!devices || !usable?.length) {
			Logger.warn('Could not enumerate displays; preferred monitor unchanged');
			return;
		}
		const primary = usable.find(d => d.primary) ?? usable[0];

		if (hasCurrent && ours === undefined) {
			const pinned = devices.find(d => d.index === current);
			const broken = !pinned || !pinned.attached || !pinned.primary;
			if (!broken) {
				Preferences.data = { vmmfWrittenIndex: current };
				Logger.info(`Adopting existing preferred monitor ${current} as chosen`);
				return;
			}
			Logger.warn(
				`Preferred monitor ${current} (${
					pinned ? pinned.deviceName : 'missing'
				}) is ${
					!pinned || !pinned.attached
						? 'not attached'
						: 'not the primary display'
				}; healing to ${primary.index}`
			);
		} else if (hasCurrent && current !== ours) {
			Logger.info(
				`Preferred monitor ${current} was set manually; leaving it alone`
			);
			Preferences.data = { vmmfWrittenIndex: current };
			return;
		} else if (hasCurrent && current === primary.index) {
			return;
		}

		await fs
			.writeFile(vmmfCfg, `${primary.index}\n`, 'utf8')
			.then(() => {
				Preferences.data = { vmmfWrittenIndex: primary.index };
				Logger.info(
					`Preferred monitor set to ${primary.index} (${primary.deviceName} ${primary.width}x${primary.height})`
				);
			})
			.catch(e => Logger.warn('Failed to write preferred monitor', e));
	}

	async verify() {
		this.load();
		this._notifyObservers();

		const clientDir = Preferences.data?.clientDir;

		if (clientDir) {
			await this.#syncPreferredMonitor(clientDir);
		}

		for (const m of MODS) {
			const state = Preferences.data?.mods?.[m.id];
			let installedVersion = state?.installedVersion;
			if (state?.enabled && this.#unsupportedReason(m.id))
				await this.#savePref(m.id, { ...state, enabled: false });

			if (clientDir && installedVersion) {
				const filesPresent = await Promise.all(
					(state?.installedFiles ?? []).map(rel =>
						fs.pathExists(path.join(clientDir, rel))
					)
				);
				if (state?.installedFiles?.length && !filesPresent.every(Boolean)) {
					installedVersion = undefined;
					await this.#savePref(m.id, {
						enabled: state?.enabled ?? false,
						installedVersion: undefined,
						installedFiles: [],
						ignoreUpdates: state?.ignoreUpdates ?? false
					});
				}
			}

			if (clientDir && m.registerInDllsTxt)
				await (installedVersion
					? addDll(clientDir, m.registerInDllsTxt)
					: removeDll(clientDir, m.registerInDllsTxt)
				).catch(() => {});

			this.#patchRow(m.id, {
				installedVersion,
				latestVersion: m.version,
				enabled: !!state?.enabled && !this.#unsupportedReason(m.id),
				ignoreUpdates: !!state?.ignoreUpdates
			});
		}

		this._value = {
			...this._value,
			state: 'idle',
			dirty: this.#computeDirty()
		};
		this._notifyObservers();
	}

	async toggle(id: ModId, enabled: boolean) {
		if (enabled && this.#unsupportedReason(id)) return;
		const cur = Preferences.data?.mods?.[id];
		await this.#savePref(id, {
			enabled,
			installedVersion: cur?.installedVersion,
			installedFiles: cur?.installedFiles ?? [],
			ignoreUpdates: cur?.ignoreUpdates ?? false
		});
		this.#patchRow(id, { enabled });
	}

	async setIgnoreUpdates(id: ModId, ignore: boolean) {
		const cur = Preferences.data?.mods?.[id];
		await this.#savePref(id, {
			enabled: cur?.enabled ?? false,
			installedVersion: cur?.installedVersion,
			installedFiles: cur?.installedFiles ?? [],
			ignoreUpdates: ignore
		});
		this.#patchRow(id, { ignoreUpdates: ignore });
	}

	async applyAll(opts: { repairOnly?: boolean } = {}) {
		const clientDir = Preferences.data?.clientDir;
		if (!clientDir) {
			Logger.warn('No clientDir set; cannot apply mods.');
			return;
		}
		if (this._value.state === 'busy') {
			Logger.warn('applyAll already running; ignoring re-entrant call.');
			return;
		}
		await this.verify();
		this._value = { ...this._value, state: 'busy' };
		this._notifyObservers();

		const queue = [...this._value.mods];
		queue.sort((a, b) => {
			if (a.id === 'vanillaFixes') return -1;
			if (b.id === 'vanillaFixes') return 1;
			return 0;
		});

		const failures = new Map<ModId, string>();
		for (const row of queue) {
			const m = getMod(row.id);
			if (!m) continue;

			const wantInstalled = row.enabled && !row.unsupportedReason;
			const isInstalled = !!row.installedVersion;
			const updateAvailable =
				isInstalled &&
				row.installedVersion !== row.latestVersion &&
				!row.ignoreUpdates;

			try {
				if (wantInstalled && !isInstalled) {
					await this.#install(m);
				} else if (!wantInstalled && isInstalled) {
					await this.#uninstall(m);
				} else if (wantInstalled && updateAvailable && !opts.repairOnly) {
					await this.#uninstall(m);
					await this.#install(m);
				}
			} catch (e) {
				Logger.error(`Failed to apply ${m.id}:`, e);
				const msg = e instanceof Error ? e.message : String(e);
				failures.set(m.id, looksLikeAvBlock(msg) ? AV_ERROR : msg);
			}
		}

		this._value = { ...this._value, state: 'idle' };
		await this.verify();
		for (const [id, error] of failures)
			this.#patchRow(id, { state: 'error', error });
		await Updater.verify();
	}

	async #install(m: ModEntry) {
		const clientDir = Preferences.data?.clientDir;
		if (!clientDir) throw new Error('No client dir');
		if (m.source.kind === 'managed') return;

		Logger.info(`Installing mod ${m.id}...`);
		this.#patchRow(m.id, {
			state: 'downloading',
			progress: 0,
			error: undefined
		});

		const written: string[] = [];
		const missing: string[] = [];

		if (m.source.kind === 'directFile') {
			const dest = path.join(clientDir, m.source.assetName);
			await this.#downloadTo(m.source.url, dest, m.source.sha256);
			written.push(m.source.assetName);
		} else if (m.source.kind === 'archive') {
			const scratch = path.join(clientDir, '.octolauncher-tmp');
			await fs.ensureDir(scratch);
			const tmp = path.join(
				scratch,
				`${m.id}-${Date.now()}.${m.source.format}`
			);
			await this.#downloadTo(m.source.url, tmp, m.source.sha256);
			this.#patchRow(m.id, { state: 'installing' });

			const map = m.source.extractMap;
			if (m.source.format === 'zip') {
				const zip = new AdmZip(tmp);
				const entries = zip.getEntries();
				for (const [src, dst] of Object.entries(map)) {
					const entry = entries.find(e => e.entryName === src);
					if (!entry) {
						missing.push(src);
						continue;
					}
					const target = path.join(clientDir, dst);
					await fs.ensureDir(path.dirname(target));
					await fs.writeFile(target, entry.getData());
					written.push(dst);
				}
			} else {
				const stagingDir = path.join(scratch, `${m.id}-${Date.now()}-extract`);
				await fs.ensureDir(stagingDir);
				await tar.x({ file: tmp, cwd: stagingDir });
				for (const [src, dst] of Object.entries(map)) {
					const srcPath = path.join(stagingDir, src);
					if (!(await fs.pathExists(srcPath))) {
						missing.push(src);
						continue;
					}
					const target = path.join(clientDir, dst);
					await fs.ensureDir(path.dirname(target));
					await fs.copy(srcPath, target);
					written.push(dst);
				}
				await fs.remove(stagingDir).catch(() => {});
			}
			await fs.remove(tmp).catch(() => {});
		}

		if (missing.length)
			throw new Error(
				`${m.name}: download is missing expected file(s): ${missing.join(', ')}`
			);

		if (m.registerInDllsTxt) {
			await addDll(clientDir, m.registerInDllsTxt);
		}

		await this.#savePref(m.id, {
			enabled: true,
			installedVersion: m.version,
			installedFiles: written,
			ignoreUpdates: Preferences.data?.mods?.[m.id]?.ignoreUpdates ?? false
		});

		this.#patchRow(m.id, {
			state: 'idle',
			installedVersion: m.version,
			progress: 1
		});
	}

	async #uninstall(m: ModEntry) {
		const clientDir = Preferences.data?.clientDir;
		if (!clientDir) throw new Error('No client dir');
		if (m.source.kind === 'managed') return;

		Logger.info(`Uninstalling mod ${m.id}...`);
		this.#patchRow(m.id, { state: 'uninstalling', error: undefined });

		const cur = Preferences.data?.mods?.[m.id];
		const files = cur?.installedFiles ?? [];

		for (const rel of files) {
			const fullPath = path.join(clientDir, rel);
			await fs
				.remove(fullPath)
				.catch(err => Logger.warn(`Couldn't remove ${fullPath}:`, err));
		}

		if (m.registerInDllsTxt) {
			await removeDll(clientDir, m.registerInDllsTxt);
		}

		await this.#savePref(m.id, {
			enabled: cur?.enabled ?? false,
			installedVersion: undefined,
			installedFiles: [],
			ignoreUpdates: cur?.ignoreUpdates ?? false
		});

		this.#patchRow(m.id, { state: 'idle', installedVersion: undefined });
	}

	async #downloadTo(url: string, dest: string, sha256?: string) {
		const res = await fetch(url, {
			headers: { 'User-Agent': 'OctoLauncher' },
			timeout: MOD_DOWNLOAD_TIMEOUT_MS
		});
		if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
		await fs.ensureDir(path.dirname(dest));
		const buf = await res.arrayBuffer();

		if (sha256) {
			const got = createHash('sha256').update(Buffer.from(buf)).digest('hex');
			if (got !== sha256.toLowerCase())
				throw new Error(
					`Checksum mismatch for ${path.basename(dest)}: expected ${sha256}, got ${got}. Refusing to install.`
				);
		}

		await fs.writeFile(dest, Buffer.from(buf));
		if (!(await fs.pathExists(dest)))
			throw new Error(
				`Downloaded file disappeared after writing: ${path.basename(dest)}. ` +
					'This is often Windows Defender quarantine; if so, use "Allow through antivirus" and apply again.'
			);
	}

	async #savePref(id: ModId, state: ModState) {
		const allMods = { ...(Preferences.data?.mods ?? {}), [id]: state };
		Preferences.data = { mods: allMods };
	}
}

const Mods = new ModsClass();
export default Mods;
