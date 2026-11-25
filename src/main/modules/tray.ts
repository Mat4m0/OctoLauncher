import { Tray, Menu, nativeImage, app } from 'electron';
import Logger from 'electron-log/main';

import { mainWindow } from '~main/index';
import { appIcon } from '~main/modules/appIcon';
import { isLinux, isMac } from '~main/modules/platform';

let tray: Tray | null = null;
let isMinimizedToTray = false;

const restoreWindow = () => {
	if (!mainWindow) return;
	mainWindow.show();
	if (mainWindow.isMinimized()) mainWindow.restore();
	mainWindow.focus();
	isMinimizedToTray = false;
};

const ensureTray = () => {
	if (tray) return tray;
	// many Linux panels show a 16 px status icon as an empty slot
	const size = isLinux ? 32 : 16;
	const icon = appIcon();
	tray = new Tray(
		icon ? icon.resize({ width: size, height: size }) : nativeImage.createEmpty()
	);
	tray.setToolTip('OctoLauncher');
	tray.setContextMenu(
		Menu.buildFromTemplate([
			{ label: 'Show launcher', click: restoreWindow },
			{ type: 'separator' },
			{ label: 'Quit', click: () => app.quit() }
		])
	);
	tray.on('click', restoreWindow);
	return tray;
};

export const minimizeToTray = () => {
	if (!mainWindow) return;
	// macOS: no menu-bar icon; the Dock icon stays and a click on it brings the window back
	if (!isMac) ensureTray();
	mainWindow.hide();
	isMinimizedToTray = true;
	Logger.info('Minimized to tray');
};

export const restoreFromTray = () => {
	if (!isMinimizedToTray) return;
	restoreWindow();
};

export const isInTray = () => isMinimizedToTray;

export const destroyTray = () => {
	tray?.destroy();
	tray = null;
};
