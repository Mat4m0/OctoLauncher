import path from 'node:path';

import { app, dialog, shell } from 'electron';
import Logger from 'electron-log/main';
import { observable } from '@trpc/server/observable';
import { z } from 'zod';

import { mainWindow } from '~main/index';
import Preferences from '~main/modules/preferences';
import {
	defenderExclusionFolders,
	detectAntivirusBlocks,
	openDefenderExclusionSettings
} from '~main/modules/defender';
import { detectHardware, recommendFarClip } from '~main/modules/hardware';
import {
	checkAntivirusBlocks,
	restoreBlockedFiles
} from '~main/modules/avRestore';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const generalRouter = createTRPCRouter({
	appVersion: publicProcedure.query(() => app.getVersion()),
	hardware: publicProcedure.query(() => {
		const hardware = Preferences.data.hardware ?? null;
		return { hardware, recommendedFarClip: recommendFarClip(hardware) };
	}),
	redetectHardware: publicProcedure.mutation(async () => {
		const hardware = await detectHardware();
		Preferences.data = { hardware };
		return { hardware, recommendedFarClip: recommendFarClip(hardware) };
	}),
	quit: publicProcedure.mutation(() => app.quit()),
	minimize: publicProcedure.mutation(() => mainWindow?.minimize()),
	toggleMaximize: publicProcedure.mutation(() => {
		if (!mainWindow) return;
		if (mainWindow.isMaximized()) mainWindow.unmaximize();
		else mainWindow.maximize();
	}),
	maximized: publicProcedure.subscription(() =>
		observable<boolean>(emit => {
			const win = mainWindow;
			if (!win) return () => undefined;
			const send = () => emit.next(win.isMaximized());
			send();
			win.on('maximize', send);
			win.on('unmaximize', send);
			return () => {
				win.off('maximize', send);
				win.off('unmaximize', send);
			};
		})
	),
	openLink: publicProcedure
		.input(z.string().url())
		.mutation(({ input }) => shell.openExternal(input)),
	openInstallFolder: publicProcedure.mutation(() => {
		// Explorer needs native separators; a stored forward-slash path fails to open.
		const dir = Preferences.data.clientDir;
		if (dir) shell.openPath(path.normalize(dir));
	}),
	openLogFile: publicProcedure.mutation(() => {
		const file = Logger.transports.file.getFile().path;
		shell.openPath(path.normalize(file));
	}),
	defenderFolders: publicProcedure.query(() => defenderExclusionFolders()),
	openDefenderSettings: publicProcedure.mutation(() =>
		openDefenderExclusionSettings()
	),
	antivirusBlocks: publicProcedure.query(() => detectAntivirusBlocks()),
	checkAntivirus: publicProcedure.mutation(() => checkAntivirusBlocks()),
	restoreBlockedFiles: publicProcedure.mutation(() => restoreBlockedFiles()),
	filePicker: publicProcedure
		.input(
			z.object({
				title: z.string().optional(),
				message: z.string().optional(),
				filters: z
					.array(
						z.object({
							name: z.string(),
							extensions: z.array(z.string())
						})
					)
					.optional(),
				properties: z
					.array(
						z.enum([
							'openDirectory',
							'openFile',
							'multiSelections',
							'showHiddenFiles',
							'createDirectory',
							'promptToCreate',
							'noResolveAliases',
							'treatPackageAsDirectory',
							'dontAddToRecent'
						])
					)
					.optional()
			})
		)
		.mutation(async ({ input }) => {
			if (!mainWindow) return { canceled: true } as const;
			const { canceled, filePaths } = await dialog.showOpenDialog(
				mainWindow,
				input
			);

			return canceled
				? ({ canceled: true } as const)
				: ({
						canceled: false,
						path: filePaths as [string, ...string[]]
				  } as const);
		})
});
