import http from 'node:http';
import crypto from 'node:crypto';
import { AddressInfo } from 'node:net';

import { shell } from 'electron';
import Logger from 'electron-log/main';

const TIMEOUT_MS = 5 * 60_000;

const page = (title: string, heading: string, body: string): string =>
	`<!doctype html><html lang="en"><head><meta charset="utf-8">` +
	`<meta name="viewport" content="width=device-width, initial-scale=1">` +
	`<meta name="robots" content="noindex,nofollow"><title>${title}</title>` +
	`<style>:root{color-scheme:dark}html,body{height:100%;margin:0}` +
	`body{background:#14130f;color:#d8d2c2;font-family:system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;` +
	`display:flex;align-items:center;justify-content:center}` +
	`.box{max-width:360px;width:calc(100% - 32px);padding:28px 24px;text-align:center;` +
	`border:1px solid rgba(158,151,131,.15);background:#1d1b16;border-radius:6px}` +
	`h1{font-size:20px;margin:0 0 12px;color:#bee375}p{font-size:14px;line-height:1.5;color:#8c8775}</style>` +
	`</head><body><main class="box"><h1>${heading}</h1><p>${body}</p></main></body></html>`;

const OK_PAGE = page(
	'OctoLauncher sign-in complete',
	'You are signed in',
	'You can close this tab and return to OctoLauncher.'
);
const FAIL_PAGE = page(
	'OctoLauncher sign-in',
	'Sign-in could not be completed',
	'Please close this tab and try again from OctoLauncher.'
);

// the website redirects the browser back to a loopback listener with the code;
// rejects with 'timeout', 'state_mismatch', 'no_code' or another error
export const signInViaBrowser = (authorizeUrl: string): Promise<string> =>
	new Promise<string>((resolve, reject) => {
		const state = crypto.randomBytes(16).toString('hex');
		let settled = false;

		const server = http.createServer((req, res) => {
			let u: URL;
			try {
				u = new URL(req.url ?? '/', 'http://127.0.0.1');
			} catch {
				res.writeHead(400).end('Bad request');
				return;
			}
			if (!u.pathname.startsWith('/callback')) {
				res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
				return;
			}
			const code = u.searchParams.get('code');
			const st = u.searchParams.get('st');
			if (st !== state) {
				res.writeHead(400, { 'content-type': 'text/html' }).end(FAIL_PAGE);
				finish(() => reject(new Error('state_mismatch')));
				return;
			}
			if (!code) {
				res.writeHead(400, { 'content-type': 'text/html' }).end(FAIL_PAGE);
				finish(() => reject(new Error('no_code')));
				return;
			}
			res.writeHead(200, { 'content-type': 'text/html' }).end(OK_PAGE);
			finish(() => resolve(code));
		});

		const timer = setTimeout(
			() => finish(() => reject(new Error('timeout'))),
			TIMEOUT_MS
		);

		const finish = (fn: () => void) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			try {
				fn();
			} finally {
				try {
					server.close();
				} catch {}
			}
		};

		server.on('error', e => {
			Logger.error('Loopback sign-in server error', e);
			finish(() => reject(e instanceof Error ? e : new Error(String(e))));
		});

		server.listen(0, '127.0.0.1', () => {
			const addr = server.address() as AddressInfo | null;
			const port = addr?.port;
			if (!port) {
				finish(() => reject(new Error('no_port')));
				return;
			}
			const sep = authorizeUrl.includes('?') ? '&' : '?';
			const target = `${authorizeUrl}${sep}lp=${port}&st=${state}`;
			Logger.info(`Opening system-browser sign-in on loopback :${port}`);
			shell.openExternal(target).catch(e => {
				Logger.error('Could not open the system browser for sign-in', e);
				finish(() => reject(e instanceof Error ? e : new Error(String(e))));
			});
		});
	});
