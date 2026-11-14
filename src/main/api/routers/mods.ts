import path from 'path';

import { z } from 'zod';
import Logger from 'electron-log/main';

import Mods from '~main/modules/mods';
import Preferences from '~main/modules/preferences';
import Updater, { isGameRunning } from '~main/modules/updater';
import { ModIdSchema } from '~common/mods';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const modsRouter = createTRPCRouter({
	list: publicProcedure.query(() => Mods.status),
	verify: publicProcedure.mutation(() => Mods.verify()),
	toggle: publicProcedure
		.input(z.object({ id: ModIdSchema, enabled: z.boolean() }))
		.mutation(({ input }) => Mods.toggle(input.id, input.enabled)),
	toggleCustom: publicProcedure
		.input(z.object({ name: z.string(), enabled: z.boolean() }))
		.mutation(({ input }) => Mods.toggleCustom(input.name, input.enabled)),
	addCustomDll: publicProcedure
		.input(z.object({ path: z.string() }))
		.mutation(({ input }) => Mods.addCustomDll(input.path)),
	setIgnoreUpdates: publicProcedure
		.input(z.object({ id: ModIdSchema, ignore: z.boolean() }))
		.mutation(({ input }) => Mods.setIgnoreUpdates(input.id, input.ignore)),
	useLauncherVersion: publicProcedure
		.input(z.object({ id: ModIdSchema }))
		.mutation(async ({ input }) => {
			const clientDir = Preferences.data?.clientDir;
			if (clientDir && (await isGameRunning(path.join(clientDir, 'WoW.exe'))))
				throw new Error('Please close WoW first, before updating.');
			return Mods.useLauncherVersion(input.id);
		}),
	applyAll: publicProcedure.mutation(() => Mods.applyAll()),
	repair: publicProcedure.mutation(async () => {
		const clientDir = Preferences.data?.clientDir;
		if (clientDir) {
			const exePath = path.join(clientDir, 'WoW.exe');
			if (await isGameRunning(exePath))
				throw new Error('Please close WoW first before verifying files.');
		}
		// not awaited, so the dialog closes while the client check and mod repair run
		void (async () => {
			await Updater.update(true).catch(e =>
				Logger.error('Verify game files: the check failed', e)
			);
			await Mods.applyAll({ repairOnly: true }).catch(e =>
				Logger.warn('Verify game files: the mod repair failed', e)
			);
		})();
	}),
	observe: publicProcedure.subscription(() => Mods.observe())
});
