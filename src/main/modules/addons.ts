import path from 'node:path';

import git, { type ProgressCallback } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import Logger from 'electron-log/main';

import { isNotUndef } from '~common/utils';
import { type AddonData, type TocData } from '~common/schemas';
import { runWorker } from '~main/utils';
import gitPull from '~main/workers/gitPull?nodeWorker';
import gitClone from '~main/workers/gitClone?nodeWorker';

import Preferences from './preferences';
import Observable from './observable';

export type AddonsStatus = {
	state: 'verifying' | 'done';
	addons: { [name: string]: AddonData };
	available: AddonData[];
};

type AddonsList = {
	name: string;
	owner: string;
	branch?: string;
	ref?: string;
	git: string;
	toc?: TocData;
	description?: string;
	lastUpdated?: string;
	stars?: number;
	dependencies?: string[];
}[];

const readTocData = (content: string) =>
	(content.charCodeAt(0) === 0xfeff ? content.slice(1) : content)
		.split('\n')
		.filter(l => l.startsWith('## '))
		.map(l => l.slice(3))
		.map(l => {
			const idx = l.indexOf(':');
			if (idx === -1) return null;
			return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()] as const;
		})
		.filter((e): e is readonly [string, string] => !!e)
		.reduce((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {} as TocData);

// windows drops trailing dots and spaces (".. " opens ".."), and device names are not folders
const isUnsafeFolder = (name?: string) =>
	!name ||
	name === '.' ||
	name === '..' ||
	name.length > 100 ||
	/[/\\:*?"<>|\u0000-\u001f]/.test(name) ||
	/[. ]$/.test(name) ||
	/^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i.test(name);

// on a case-sensitive disk "Addons" would be a second folder the game never reads
const addonsRoot = async (clientPath: string): Promise<string> => {
	const iface = path.join(clientPath, 'Interface');
	const names: string[] = await fs.readdir(iface).catch(() => []);
	const found =
		names.find(n => n === 'AddOns') ??
		names.find(n => n.toLowerCase() === 'addons');
	return path.join(iface, found ?? 'AddOns');
};

const addonDir = (addonsPath: string, folder?: string): string | undefined => {
	if (!folder || isUnsafeFolder(folder)) return undefined;
	const dir = path.join(addonsPath, folder);
	return path.dirname(dir) === path.join(addonsPath) ? dir : undefined;
};

const isSafeRef = (ref?: string | null) =>
	ref == null ||
	(/^[A-Za-z0-9._/-]{1,200}$/.test(ref) &&
		!ref.includes('..') &&
		!/^[/.-]|[/.]$|\/\//.test(ref));

const ADDONS_FETCH_TIMEOUT_MS = 8_000;

const ALLOWED_GIT_HOSTS = [
	'github.com',
	'gitlab.com',
	'gitea.com',
	'codeberg.org',
	'octowow.st'
];

// git clients cannot fetch through the octowow.st/git pages; git.octowow.st serves the same repos
const OCTO_GIT_PAGE =
	/^(?:https?:\/\/)?(?:www\.)?octowow\.st\/git\/([^/?#]+)\/([^/?#]+)/i;

const toGitUrl = (url: string) => {
	const clean = url.trim().replace(/\/+$/, '');
	const octo = OCTO_GIT_PAGE.exec(clean);
	if (octo)
		return `https://git.octowow.st/git/${octo[1]}/${octo[2].replace(
			/\.git$/i,
			''
		)}.git`;
	return clean.endsWith('.git') ? clean : `${clean}.git`;
};

const isAllowedGitUrl = (url: string) => {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'https:') return false;
		const host = parsed.hostname.toLowerCase();
		return ALLOWED_GIT_HOSTS.some(h => host === h || host.endsWith('.' + h));
	} catch {
		return false;
	}
};

const removeOwnCopy = async (folder: string, dir: string) => {
	if (!(await fs.pathExists(dir))) return;
	await fs.remove(dir);
	Logger.log(`Removed the player's own "${folder}" for the launcher's copy`);
};

const repoKey = (url?: string) =>
	(url ?? '')
		.trim()
		.toLowerCase()
		.replace(/^git\+/, '')
		.replace(/^https?:\/\/(www\.)?/, '')
		.replace(/\/+$/, '')
		.replace(/\.git$/, '');

export const sameRepo = (a?: string, b?: string) =>
	!!a && !!b && repoKey(a) === repoKey(b);

const parseAddonsList = (json: unknown): AddonsList => {
	if (!Array.isArray(json)) {
		Logger.error('The addon list from the server is not a list; ignoring it');
		return [];
	}
	return json.filter((a): a is AddonsList[number] => {
		const safe =
			!!a &&
			typeof a === 'object' &&
			typeof a.name === 'string' &&
			!isUnsafeFolder(a.name) &&
			typeof a.git === 'string' &&
			isAllowedGitUrl(a.git) &&
			(a.branch == null ||
				(typeof a.branch === 'string' && isSafeRef(a.branch))) &&
			(a.ref == null || (typeof a.ref === 'string' && isSafeRef(a.ref)));
		if (!safe)
			Logger.warn(
				`Skipping an unsafe addon list entry: ${JSON.stringify(
					a?.name ?? null
				).slice(0, 80)}`
			);
		return safe;
	});
};

const fetchAddons = async () => {
	try {
		const response = await fetch(
			`${
				import.meta.env.MAIN_VITE_SERVER_URL || 'https://octowow.st'
			}/api/addons.json`,
			{ timeout: ADDONS_FETCH_TIMEOUT_MS }
		);
		return parseAddonsList(await response.json());
	} catch (e) {
		Logger.error('Failed to reach update server', e);
		return [];
	}
};

class AddonsClass extends Observable<AddonsStatus> {
	protected _value: AddonsStatus = {
		state: 'done',
		addons: {},
		available: []
	};

	get status() {
		return this._value;
	}
	private set status(v: AddonsStatus) {
		this._value = v;
		this._notifyObservers(v);
	}

	#onProgress =
		(folder: string, data: AddonData): ProgressCallback =>
		progress => {
			const getPhase = (step: string) => {
				switch (step) {
					case 'Counting objects':
						return 1;
					case 'Compressing objects':
						return 2;
					case 'Receiving objects':
						return 3;
					case 'Resolving deltas':
						return 4;
					case 'Analyzing workdir':
						return 5;
					case 'Updating workdir':
						return 6;
					default:
						return 0;
				}
			};
			this.#setAddon(folder, {
				...data,
				progress: `${Math.round(
					(progress.loaded / (progress.total ?? progress.loaded)) * 100
				)}% (${getPhase(progress.phase)}/6)`
			});
		};

	async checkGitUrl(url: string) {
		const gitUrl = toGitUrl(url);
		if (!isAllowedGitUrl(gitUrl)) return undefined;
		try {
			await git.getRemoteInfo({
				http,
				url: gitUrl
			});

			let preview: string | undefined;
			try {
				const page = gitUrl.slice(0, -4);
				if (isAllowedGitUrl(page)) {
					const response = await fetch(page, {
						timeout: ADDONS_FETCH_TIMEOUT_MS
					}).then(r => r.text());
					preview = response.match(
						/property="og:image" content="([^"]*)"/
					)?.[1];
				}
			} catch {}

			const folder = gitUrl.slice(0, -4).split('/').at(-1);
			if (isUnsafeFolder(folder)) return undefined;
			return {
				status: 'available',
				folder,
				git: gitUrl,
				preview
			} as AddonData;
		} catch {
			return undefined;
		}
	}

	async verify() {
		if (this.status.state !== 'done') return;

		this.status = {
			...this.status,
			state: 'verifying'
		};

		const remoteAddons = await fetchAddons();
		const available: AddonData[] = remoteAddons.map(a => ({
			status: 'available',
			git: a.git,
			toc: a.toc,
			description: a.description,
			folder: a.name,
			branch: a.branch,
			ref: a.ref
		}));

		const clientPath = Preferences.data.clientDir;
		if (!clientPath) {
			this.status = { state: 'done', addons: {}, available };
			return;
		}

		const addonsPath = await addonsRoot(clientPath);
		const dirs = (await fs.pathExists(addonsPath))
			? await fs.readdir(addonsPath)
			: [];
		const addons: AddonsStatus['addons'] = Object.fromEntries(
			dirs
				.filter(d => !d.startsWith('Blizzard_') && !/\.(tmp|bak)$/.test(d))
				.map(name => [name, { status: 'fetching' as const, folder: name }])
		);

		this.status = { state: 'verifying', addons, available };

		const verifyOne = async (folder: string) => {
			const dir = path.join(addonsPath, folder);

			if (!fs.existsSync(path.join(dir, `${folder}.toc`))) {
				this.#setAddon(folder, {
					status: 'invalid',
					error: 'Missing .toc file',
					folder
				});
				return;
			}

			const toc = await readTocData(
				await fs.readFile(path.join(dir, `${folder}.toc`), 'utf-8')
			);

			const remote = await git
				.listRemotes({ fs, dir })
				.then(r => r[0])
				.catch(() => null);

			const avail = remoteAddons.find(a => a.name === folder);
			if (!remote) {
				Logger.log(`Addon "${folder}" is not a git repository`);
				this.#setAddon(
					folder,
					avail
						? {
								status: 'custom',
								git: avail.git,
								toc,
								description: avail.description,
								folder
						  }
						: { status: 'unknown', toc, folder }
				);
				return;
			}
			const listed =
				avail && sameRepo(remote.url, avail.git) ? avail : undefined;

			try {
				await git.fetch({ fs, dir, http, tags: true });

				const branch = listed?.branch ?? (await git.currentBranch({ fs, dir }));

				const localCommit = await git
					.log({ fs, dir, ref: 'HEAD', depth: 1 })
					.then(r => r[0].oid)
					.catch(() => null);

				const remoteCommit = listed?.ref
					? await git.resolveRef({ fs, dir, ref: listed.ref }).catch(() => null)
					: await git
							.log({ fs, dir, ref: `${remote.remote}/${branch}`, depth: 1 })
							.then(r => r[0].oid)
							.catch(() => null);

				// [file, head, workdir, stage]: local edits are kept, only a missing tracked file needs an update
				const status = await git.statusMatrix({ fs, dir });
				const edited = status.some(([, , workdir]) => workdir === 2);
				const damaged = status.some(
					([, head, workdir]) => head === 1 && workdir === 0
				);

				const isUpToDate =
					!damaged && !!remoteCommit && localCommit === remoteCommit;
				this.#setAddon(folder, {
					git: remote.url,
					status: isUpToDate ? 'upToDate' : 'outOfDate',
					edited: edited || undefined,
					toc,
					description: avail?.description,
					ref: listed?.ref,
					folder
				});

				Logger.log(
					isUpToDate
						? `Addon "${folder}" is up to date${
								avail?.ref ? ` (pinned ${avail.ref})` : ''
						  }`
						: `Addon "${folder}" has an update available`
				);
			} catch (e) {
				this.#setAddon(folder, {
					git: remote.url,
					status: 'invalid',
					error: 'Failed to verify',
					toc,
					folder
				});
				Logger.error(`Addon "${folder}" failed to verify`, e);
			}
		};

		const folders = Object.keys(addons);
		const VERIFY_CONCURRENCY = 6;
		let idx = 0;
		await Promise.all(
			Array.from(
				{ length: Math.min(VERIFY_CONCURRENCY, folders.length) },
				async () => {
					while (true) {
						const i = idx++;
						if (i >= folders.length) return;
						await verifyOne(folders[i]);
					}
				}
			)
		);

		this.status = { ...this.status, state: 'done' };
	}

	async update(
		toUpdate = Object.values(this.status.addons)
			.filter(e => e.status === 'outOfDate')
			.map(e => e.folder)
			.filter(isNotUndef)
	) {
		const clientPath = Preferences.data.clientDir;
		if (!clientPath) return;
		if (this.status.state !== 'done') return;

		const addonsPath = await addonsRoot(clientPath);

		for (const folder of toUpdate) {
			if (this.status.addons[folder]?.status === 'downloading') continue;
			const dir = addonDir(addonsPath, folder);
			if (!dir) {
				Logger.error(
					`Refusing to update an addon with an unsafe folder name: "${folder}"`
				);
				continue;
			}

			const avail = this.status.available.find(a => a.folder === folder);
			const data: AddonData = {
				...avail,
				...this.status.addons[folder],
				status: 'downloading'
			};
			this.#setAddon(folder, data);

			const remote = await git
				.listRemotes({ fs, dir })
				.then(r => r?.[0])
				.catch(() => null);

			try {
				if (!remote) {
					if (
						!data.git ||
						!isAllowedGitUrl(data.git) ||
						!isSafeRef(data.ref ?? data.branch)
					)
						throw new Error(
							`"${folder}" has no allowed git URL to install from`
						);
					await removeOwnCopy(folder, dir);
					await runWorker(
						gitClone,
						{ dir, url: data.git, ref: data.ref ?? data.branch },
						{ onProgress: this.#onProgress(folder, data) }
					);
				} else {
					const listed =
						avail && sameRepo(remote.url, avail.git) ? avail : undefined;
					const branch =
						listed?.branch ??
						(await git.currentBranch({ fs, dir })) ??
						'master';
					await runWorker(
						gitPull,
						{
							dir,
							remote: remote.remote,
							branch,
							ref: listed?.ref
						},
						{ onProgress: this.#onProgress(folder, data) }
					);
				}
				const toc = readTocData(
					await fs.readFile(path.join(dir, `${folder}.toc`), 'utf-8')
				);

				this.#setAddon(folder, { ...data, toc, status: 'upToDate' });
				Logger.log(`Updated addon "${folder}"`);
			} catch (e) {
				this.#setAddon(folder, {
					...data,
					status: 'invalid',
					error: 'Failed to update'
				});
				Logger.error(`Addon "${folder}" failed to update`, e);
			}
		}
	}

	async remove(toRemove: string[]) {
		const clientPath = Preferences.data.clientDir;
		if (!clientPath) return;
		if (this.status.state !== 'done') return;

		const addonsPath = await addonsRoot(clientPath);
		for (const folder of toRemove) {
			const dir = addonDir(addonsPath, folder);
			if (!dir) {
				Logger.error(
					`Refusing to remove an addon with an unsafe folder name: "${folder}"`
				);
				continue;
			}
			if (fs.existsSync(dir)) await fs.remove(dir);
			this.#setAddon(folder);
			Logger.log(`Removed addon "${folder}"`);
		}
	}

	async install(data: AddonData) {
		const clientPath = Preferences.data.clientDir;
		if (!clientPath) return;
		const addonsPath = await addonsRoot(clientPath);
		const dir = addonDir(addonsPath, data.folder);
		if (!dir) {
			Logger.error(`Refusing addon with unsafe folder name: "${data.folder}"`);
			this.#setAddon(data.folder, {
				...data,
				status: 'invalid',
				error: 'Invalid addon name'
			});
			return;
		}

		if (
			!data.git ||
			!isAllowedGitUrl(data.git) ||
			!isSafeRef(data.ref ?? data.branch)
		) {
			Logger.error(`Refusing addon from disallowed git host: "${data.git}"`);
			this.#setAddon(data.folder, {
				...data,
				status: 'invalid',
				error: 'Addon URL is not from an allowed git host'
			});
			return;
		}

		try {
			await removeOwnCopy(data.folder, dir);
			await runWorker(
				gitClone,
				{ dir, url: data.git, ref: data.ref ?? data.branch },
				{ onProgress: this.#onProgress(data.folder, data) }
			);
			const toc = await readTocData(
				await fs.readFile(path.join(dir, `${data.folder}.toc`), 'utf-8')
			);
			this.#setAddon(data.folder, { ...data, toc, status: 'upToDate' });
			Logger.log(`Installed addon "${data.folder}"`);
		} catch (e) {
			this.#setAddon(data.folder, {
				...data,
				status: 'invalid',
				error: 'Failed to install'
			});
			Logger.error(`Addon "${data.folder}" failed to install`, e);
		}
	}

	#setAddon(folder: string, data?: AddonData) {
		const { [folder]: _, ...addons } = this.status.addons;
		this.status = {
			...this.status,
			addons: data ? { ...addons, [folder]: data } : addons
		};
	}
}

const Addons = new AddonsClass();
export default Addons;
