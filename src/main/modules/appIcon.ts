import fs from 'fs';
import path from 'path';

import { app, nativeImage, type NativeImage } from 'electron';
import Logger from 'electron-log/main';

// The packaged app carries the icon as resources/icon.png (extraResources in the
// electron-builder configs); a dev run reads it from build/.
export const appIconPath = (): string | undefined => {
	const p = app.isPackaged
		? path.join(process.resourcesPath, 'icon.png')
		: path.join(app.getAppPath(), 'build', 'icon.png');
	return fs.existsSync(p) ? p : undefined;
};

let loaded: NativeImage | null | undefined;

export const appIcon = (): NativeImage | undefined => {
	if (loaded === undefined) {
		const p = appIconPath();
		const img = p ? nativeImage.createFromPath(p) : undefined;
		loaded = img && !img.isEmpty() ? img : null;
		if (loaded) {
			const { width, height } = loaded.getSize();
			Logger.log(`App icon loaded (${width}x${height})`);
		} else Logger.warn(`App icon missing or unreadable (${p ?? 'no file'})`);
	}
	return loaded ?? undefined;
};
