import http from 'node:http';
import https from 'node:https';

import fetch from 'node-fetch';
import { app } from 'electron';
import Logger from 'electron-log/main';

import AuthStore from '~main/modules/authStore';
import { openSignInWindow } from '~main/modules/signInWindow';
import { signInViaBrowser } from '~main/modules/browserSignIn';
import { probeAuthEdge, type ProbeResult } from '~main/modules/routeProbe';

const DEFAULT_SERVER = 'https://octowow.st';
const REQUEST_TIMEOUT_MS = 10_000;
const QUIET_REFRESH_TIMEOUT_MS = 4_000;
const PRELAUNCH_BUDGET_MS = 4_000;
const PLAY_REFRESH_WAIT_MS = 1_500;
const REPORT_TIMEOUT_MS = 3_000;

const base = () =>
	(import.meta.env.MAIN_VITE_SERVER_URL || DEFAULT_SERVER).replace(/\/+$/, '');

const ipv4Agents = {
	http: new http.Agent({ family: 4 } as http.AgentOptions),
	https: new https.Agent({ family: 4 } as https.AgentOptions)
};

const postJson = async (
	urlPath: string,
	body: unknown,
	headers: Record<string, string> = {},
	timeoutMs: number = REQUEST_TIMEOUT_MS
) => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(`${base()}${urlPath}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'accept': 'application/json',
				'x-launcher-version': app.getVersion(),
				...headers
			},
			body: JSON.stringify(body ?? {}),
			signal: controller.signal,
			agent: url =>
				url.protocol === 'http:' ? ipv4Agents.http : ipv4Agents.https
		});
	} finally {
		clearTimeout(timer);
	}
};

export type SignInResult = {
	ok: boolean;
	eligible?: boolean;
	reason?: string;
	error?: string;
};

type AddressResult = {
	ok: boolean;
	eligible?: boolean;
	reason?: string;
	error?: string;
};

const completeWithCode = async (code: string): Promise<SignInResult> => {
	let token: string;
	try {
		const res = await postJson('/api/launcher/session', { code });
		if (res.status === 429)
			return {
				ok: false,
				error: 'Too many sign-in attempts. Please wait a minute and try again.'
			};
		if (!res.ok)
			return {
				ok: false,
				error: 'Sign-in could not be completed. Please try again.'
			};
		const data = (await res.json()) as { token?: string };
		if (!data?.token)
			return {
				ok: false,
				error: 'Sign-in did not return a session. Please try again.'
			};
		token = data.token;
	} catch (e) {
		Logger.error('Session exchange failed', e);
		return {
			ok: false,
			error:
				'Could not reach the sign-in service. Please check your connection.'
		};
	}

	await AuthStore.set({ sessionToken: token, signedInAt: Date.now() });

	const resolved = await refreshAddress();
	if (!resolved.ok) {
		Logger.warn(
			`Signed in for priority login; the first address lookup failed (${resolved.reason})`
		);
		return {
			ok: true,
			eligible: false,
			reason: resolved.reason,
			error: resolved.error
		};
	}

	Logger.info(
		`Signed in for priority login (${
			resolved.eligible
				? 'priority route available'
				: `standard login: ${resolved.reason}`
		})`
	);
	return { ok: true, eligible: resolved.eligible, reason: resolved.reason };
};

export const signIn = async (): Promise<SignInResult> => {
	let code: string;
	try {
		code = await openSignInWindow(`${base()}/launcher/authorize`);
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		if (msg === 'cancelled')
			return { ok: false, error: 'Sign-in was cancelled.' };
		Logger.error('Sign-in window failed', e);
		return {
			ok: false,
			error: 'The sign-in window could not be opened. Please try again.'
		};
	}
	return completeWithCode(code);
};

export const signInWithBrowser = async (): Promise<SignInResult> => {
	let code: string;
	try {
		code = await signInViaBrowser(`${base()}/launcher/authorize`);
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		if (msg === 'timeout')
			return { ok: false, error: 'Sign-in timed out. Please try again.' };
		if (msg === 'state_mismatch' || msg === 'no_code')
			return {
				ok: false,
				error: 'Sign-in could not be completed. Please try again.'
			};
		Logger.error('Browser sign-in failed', e);
		return {
			ok: false,
			error: 'Could not open your browser for sign-in. Please try again.'
		};
	}
	return completeWithCode(code);
};

export const refreshAddress = async (
	timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<AddressResult> => {
	const token = AuthStore.token;
	if (!token) return { ok: false, reason: 'not_signed_in' };

	try {
		const res = await postJson(
			'/api/launcher/address',
			{},
			{ authorization: `Bearer ${token}` },
			timeoutMs
		);

		if (res.status === 401) {
			await AuthStore.set({
				sessionToken: undefined,
				address: undefined,
				addressExpiresAt: undefined,
				edgeId: undefined,
				eligible: undefined,
				reason: 'invalid_session'
			});
			return {
				ok: false,
				reason: 'invalid_session',
				error: 'Your launcher sign-in expired. Please sign in again.'
			};
		}
		if (res.status === 429)
			return {
				ok: false,
				reason: 'rate_limited',
				error: 'Too many requests. Please wait a minute and try again.'
			};
		if (!res.ok)
			return {
				ok: false,
				reason: 'server_error',
				error: 'Could not refresh the login address.'
			};

		const data = (await res.json()) as {
			address?: string;
			eligible?: boolean;
			reason?: string;
			edge?: number | null;
			ttl?: number;
		};
		if (!data?.address)
			return {
				ok: false,
				reason: 'bad_response',
				error: 'Unexpected response from the server.'
			};

		const ttl = typeof data.ttl === 'number' && data.ttl > 0 ? data.ttl : 3600;
		await AuthStore.set({
			address: data.address,
			eligible: !!data.eligible,
			reason: data.reason,
			edgeId:
				typeof data.edge === 'number' && data.edge > 0 ? data.edge : undefined,
			addressExpiresAt: Date.now() + ttl * 1000
		});
		// keep the address out of the log; players share their log files
		Logger.info(
			`Login address refreshed (${
				data.eligible
					? 'priority route available'
					: `standard login: ${data.reason}`
			})`
		);
		return { ok: true, eligible: !!data.eligible, reason: data.reason };
	} catch (e) {
		Logger.error('Address refresh failed', e);
		return {
			ok: false,
			reason: 'network',
			error: 'Could not reach the login service.'
		};
	}
};

export const refreshAddressQuietly = async (
	timeoutMs: number = QUIET_REFRESH_TIMEOUT_MS
): Promise<void> => {
	if (!AuthStore.signedIn) return;
	try {
		await refreshAddress(timeoutMs);
	} catch (e) {
		Logger.warn(
			'Quiet address refresh failed; using the cached/public host',
			e
		);
	}
};

export const refreshAtStartup = (): void => {
	void refreshAddressQuietly(REQUEST_TIMEOUT_MS);
};

// in memory only, so every Play probes the private address again
let routeCheck: { address: string; ok: boolean } | null = null;

const settleWithin = <T>(p: Promise<T>, ms: number): Promise<T | undefined> =>
	new Promise(resolve => {
		const timer = setTimeout(() => resolve(undefined), Math.max(0, ms));
		p.then(
			v => {
				clearTimeout(timer);
				resolve(v);
			},
			() => {
				clearTimeout(timer);
				resolve(undefined);
			}
		);
	});

export const preparePrivateRoute = async (): Promise<void> => {
	routeCheck = null;
	if (!AuthStore.signedIn) return;
	const started = Date.now();
	try {
		// with a valid cached address, refresh in the background so the probe keeps its budget
		const refresh = refreshAddress(QUIET_REFRESH_TIMEOUT_MS).catch(
			() => undefined
		);
		if (!privateActive()) await settleWithin(refresh, PLAY_REFRESH_WAIT_MS);

		const s = AuthStore.get();
		if (!privateActive() || !s.address) return;

		const address = s.address;
		const edgeId = s.edgeId;
		const result = await probeAuthEdge(
			address,
			PRELAUNCH_BUDGET_MS - (Date.now() - started)
		);
		routeCheck = { address, ok: result.ok };
		if (result.ok) {
			Logger.log(
				`Priority route reachable in ${result.durationMs} ms; using it for this launch`
			);
			return;
		}
		if (result.attempts === 0) {
			Logger.warn(
				'No time left to check the priority route; using the standard login for this launch'
			);
			return;
		}
		Logger.warn(
			`Priority route unreachable (${result.kind}${
				result.silent
					? ', connected but the login server never answered (a VPN or filter on this connection?)'
					: ''
			}, ${result.durationMs} ms, ${result.attempts} attempt(s)); ` +
				'using the standard login for this launch'
		);
		void reportProbeFailure(edgeId, result);
	} catch (e) {
		routeCheck = null;
		Logger.warn(
			'Priority route check failed; using the standard login for this launch',
			e
		);
	}
};

const reportProbeFailure = async (
	edgeId: number | undefined,
	r: ProbeResult
): Promise<void> => {
	const token = AuthStore.token;
	if (!token) return;
	try {
		await postJson(
			'/api/launcher/probe-report',
			{
				edge: edgeId ?? null,
				kind: r.kind ?? 'error',
				duration_ms: Math.max(0, Math.round(r.durationMs)),
				attempts: Math.max(1, r.attempts),
				version: app.getVersion()
			},
			{ authorization: `Bearer ${token}` },
			REPORT_TIMEOUT_MS
		);
	} catch {
		// best-effort
	}
};

export const signOut = async (): Promise<void> => {
	routeCheck = null;
	await AuthStore.clear();
};

const privateActive = (): boolean => {
	const s = AuthStore.get();
	return !!(
		s.sessionToken &&
		s.eligible &&
		s.address &&
		s.addressExpiresAt &&
		s.addressExpiresAt > Date.now()
	);
};

export const resolveRealmHost = (fallback: string): string => {
	const s = AuthStore.get();
	if (!privateActive() || !s.address) return fallback;
	return routeCheck?.ok && routeCheck.address === s.address
		? s.address
		: fallback;
};

export const privateRouteInUse = (): string | undefined => {
	const s = AuthStore.get();
	return privateActive() &&
		s.address &&
		routeCheck?.ok &&
		routeCheck.address === s.address
		? s.address
		: undefined;
};

export const endPrivateRoute = (): void => {
	routeCheck = null;
};

export const knownPrivateAddress = (): string | undefined =>
	AuthStore.get().address;

// sent to the renderer: never include the token or the address
export const authStatus = () => {
	const s = AuthStore.get();
	return {
		signedIn: !!s.sessionToken,
		usingPrivate: privateActive(),
		reason: s.reason,
		expiresAt: s.addressExpiresAt
	};
};
