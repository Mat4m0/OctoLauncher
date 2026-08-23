import { createRequire } from 'node:module';

export type StormHandle = bigint;

type StormLibApi = {
	SFileOpenArchive(path: string, flags: number): StormHandle;
	SFileHasFile(archive: StormHandle, path: string): boolean;
	SFileCloseArchive(archive: StormHandle): void;
	SFileOpenFileEx(
		archive: StormHandle,
		path: string,
		scope: number
	): StormHandle;
	SFileReadFile(file: StormHandle, buffer: ArrayBuffer): void;
	SFileGetFileSize(file: StormHandle): bigint;
	SFileCloseFile(file: StormHandle): void;
	SFileCreateFile(
		archive: StormHandle,
		path: string,
		fileTime: number,
		fileSize: number,
		locale: number,
		flags: number
	): StormHandle;
	SFileWriteFile(
		file: StormHandle,
		data: ArrayBuffer,
		compression: number
	): void;
	SFileFinishFile(file: StormHandle): void;
	SFileFlushArchive(archive: StormHandle): void;
	SFileRemoveFile(archive: StormHandle, path: string): void;
	SFileCompactArchive(archive: StormHandle): void;
};

export const STREAM_READ_ONLY = 256;
export const MPQ_FILE_COMPRESS = 512;
export const MPQ_COMPRESSION_ZLIB = 2;

const nodeRequire = createRequire(__filename);
let loaded: StormLibApi | undefined;

export const StormLib = new Proxy({} as StormLibApi, {
	get(_target, property) {
		try {
			loaded ??= nodeRequire('stormlib-node') as StormLibApi;
			return loaded[property as keyof StormLibApi];
		} catch (error) {
			if (process.platform === 'darwin')
				throw new Error(
					'This operation needs native MPQ support. The macOS launcher can ' +
						'download complete MPQ replacements but cannot mutate an archive.'
				);
			throw error;
		}
	}
});
