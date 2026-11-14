import { promises as fsp } from 'fs';
import os from 'os';
import path from 'path';

// on Linux the game is still the Windows client, run through Wine
export const isWindows = process.platform === 'win32';
export const isLinux = process.platform === 'linux';

const winePrefix = (): string =>
	path.resolve(process.env.WINEPREFIX || path.join(os.homedir(), '.wine'));

export const toWinePath = (unixPath: string): string => {
	const abs = path.resolve(unixPath);
	const driveC = path.join(winePrefix(), 'drive_c');
	if (abs === driveC || abs.startsWith(driveC + path.sep))
		return 'C:\\' + path.relative(driveC, abs).split(path.sep).join('\\');
	return 'Z:' + abs.split(path.sep).join('\\');
};

// Wine processes carry the Windows exe path in their command line, so scan /proc
export const wineProcessRunning = async (exeName: string): Promise<boolean> => {
	const want = exeName.toLowerCase();
	const matches = (arg: string) => {
		const a = arg.toLowerCase();
		return a === want || a.endsWith('\\' + want) || a.endsWith('/' + want);
	};
	try {
		const pids = (await fsp.readdir('/proc')).filter(d => /^\d+$/.test(d));
		for (const pid of pids) {
			if (Number(pid) === process.pid) continue;
			const cmd = await fsp
				.readFile(path.join('/proc', pid, 'cmdline'), 'utf8')
				.catch(() => '');
			if (cmd && cmd.split('\0').some(matches)) return true;
		}
	} catch {
		return false;
	}
	return false;
};
