import path from 'path';

import fs from 'fs-extra';
import Logger from 'electron-log/main';

import Preferences from '~main/modules/preferences';

// Not in settings.json: preferences.get sends the whole settings object to the
// renderer, and this holds the session token.
export type AuthState = {
	sessionToken?: string;
	address?: string;
	eligible?: boolean;
	reason?: string;
	addressExpiresAt?: number; // epoch ms
	edgeId?: number;
	signedInAt?: number;
};

const file = () => path.join(Preferences.userDataDir, 'auth.json');

abstract class AuthStore {
	static #data: AuthState = {};

	static async load(): Promise<void> {
		try {
			const json = await fs.readJSON(file());
			this.#data =
				json && typeof json === 'object' && !Array.isArray(json)
					? (json as AuthState)
					: {};
		} catch {
			this.#data = {};
		}
	}

	static get(): AuthState {
		return this.#data;
	}

	static async set(patch: Partial<AuthState>): Promise<void> {
		this.#data = { ...this.#data, ...patch };
		try {
			await fs.ensureDir(Preferences.userDataDir);
			const tmp = `${file()}.tmp`;
			await fs.writeJSON(tmp, this.#data, { spaces: 2 });
			await fs.move(tmp, file(), { overwrite: true });
		} catch (e) {
			Logger.warn('Failed to persist auth.json', e);
		}
	}

	static async clear(): Promise<void> {
		this.#data = {};
		try {
			await fs.remove(file());
		} catch (e) {
			Logger.warn('Failed to remove auth.json', e);
		}
	}

	static get token(): string | undefined {
		return this.#data.sessionToken;
	}

	static get signedIn(): boolean {
		return !!this.#data.sessionToken;
	}
}

export default AuthStore;
