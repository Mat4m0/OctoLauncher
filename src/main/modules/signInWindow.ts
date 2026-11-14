import { BrowserWindow } from 'electron';
import Logger from 'electron-log/main';

import { mainWindow } from '~main/index';

const SENTINEL_PATH = '/launcher/authorized';

export const openSignInWindow = (authorizeUrl: string): Promise<string> =>
	new Promise<string>((resolve, reject) => {
		let win: BrowserWindow | null = new BrowserWindow({
			parent: mainWindow ?? undefined,
			modal: !!mainWindow,
			width: 480,
			height: 760,
			resizable: true,
			minimizable: false,
			maximizable: false,
			autoHideMenuBar: true,
			title: 'OctoLauncher sign-in',
			backgroundColor: '#14130f',
			webPreferences: {
				// own session: the CSP the launcher sets on the default one breaks the login page
				partition: 'persist:octo-signin',
				contextIsolation: true,
				sandbox: true,
				nodeIntegration: false,
				devTools: true
			}
		});

		let settled = false;
		const finish = (fn: () => void) => {
			if (settled) return;
			settled = true;
			try {
				fn();
			} finally {
				if (win && !win.isDestroyed()) win.destroy();
				win = null;
			}
		};

		const consumeSentinel = (urlStr: string): boolean => {
			let u: URL;
			try {
				u = new URL(urlStr);
			} catch {
				return false;
			}
			if (!u.pathname.endsWith(SENTINEL_PATH)) return false;

			const code = u.searchParams.get('code');
			if (code) finish(() => resolve(code));
			else finish(() => reject(new Error('no_code')));
			return true;
		};

		const onNavigate = (e: Electron.Event, urlStr: string) => {
			if (consumeSentinel(urlStr)) e.preventDefault();
		};

		win.webContents.on('will-redirect', onNavigate);
		win.webContents.on('will-navigate', onNavigate);
		// in case the sentinel page loaded before the navigation could be prevented
		win.webContents.on('did-navigate', (_e, urlStr) => {
			consumeSentinel(urlStr);
		});

		win.on('closed', () => {
			finish(() => reject(new Error('cancelled')));
		});

		win.webContents.on('did-fail-load', (_e, code, desc, u, isMainFrame) =>
			Logger.warn(
				`Sign-in page failed to load (${code} ${desc}) ${u} main=${isMainFrame}`
			)
		);
		win.webContents.on('render-process-gone', (_e, details) =>
			Logger.error(`Sign-in renderer gone: ${JSON.stringify(details)}`)
		);
		win.webContents.on(
			'console-message',
			(_e, level, message, line, sourceId) => {
				if (level >= 2)
					Logger.warn(
						`Sign-in page console[L${level}]: ${message} (${sourceId}:${line})`
					);
			}
		);

		win.loadURL(authorizeUrl).catch(e => {
			Logger.error('Failed to load the sign-in page', e);
			finish(() => reject(new Error('load_failed')));
		});
	});
