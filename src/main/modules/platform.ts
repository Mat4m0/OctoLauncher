import { execFile } from 'child_process';
import fs, { promises as fsp } from 'fs';
import os from 'os';
import path from 'path';

// on Linux and macOS the game is still the Windows client, run through Wine
export const isWindows = process.platform === 'win32';
export const isLinux = process.platform === 'linux';
export const isMac = process.platform === 'darwin';
export const usesWine = isLinux || isMac;

const winePrefix = (): string =>
	path.resolve(process.env.WINEPREFIX || path.join(os.homedir(), '.wine'));

// a command name looked up on PATH, or a path, that can be run
export const findOnPath = (cmd: string): string | undefined => {
	const runnable = (p: string) => {
		try {
			fs.accessSync(p, fs.constants.X_OK);
			return fs.statSync(p).isFile();
		} catch {
			return false;
		}
	};
	if (cmd.includes('/')) return runnable(cmd) ? cmd : undefined;
	for (const dir of (process.env.PATH ?? '').split(path.delimiter))
		if (dir && runnable(path.join(dir, cmd))) return path.join(dir, cmd);
	return undefined;
};

export const toWinePath = (unixPath: string, prefix = winePrefix()): string => {
	const abs = path.resolve(unixPath);
	const driveC = path.join(prefix, 'drive_c');
	if (abs === driveC || abs.startsWith(driveC + path.sep))
		return 'C:\\' + path.relative(driveC, abs).split(path.sep).join('\\');
	return 'Z:' + abs.split(path.sep).join('\\');
};

// macOS has no /proc; ps prints each command line as one string, so match its words
const macProcessRunning = (matches: (arg: string) => boolean) =>
	new Promise<boolean>(resolve => {
		execFile('/bin/ps', ['-axo', 'pid=,command='], (error, stdout) => {
			if (error) return resolve(false);
			resolve(
				stdout.split('\n').some(line => {
					const [pid, ...words] = line.trim().split(/\s+/);
					return Number(pid) !== process.pid && words.some(matches);
				})
			);
		});
	});

// Wine processes carry the Windows exe path in their command line, so scan /proc
export const wineProcessRunning = async (exeName: string): Promise<boolean> => {
	const want = exeName.toLowerCase();
	const matches = (arg: string) => {
		const a = arg.toLowerCase();
		return a === want || a.endsWith('\\' + want) || a.endsWith('/' + want);
	};
	if (isMac) return macProcessRunning(matches);
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
