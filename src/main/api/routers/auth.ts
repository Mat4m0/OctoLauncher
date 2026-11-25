import {
	signIn,
	signInWithBrowser,
	signOut,
	authStatus
} from '~main/modules/authClient';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const authRouter = createTRPCRouter({
	status: publicProcedure.query(() => authStatus()),

	signIn: publicProcedure.mutation(() => signIn()),

	signInWithBrowser: publicProcedure.mutation(() => signInWithBrowser()),

	signOut: publicProcedure.mutation(async () => {
		await signOut();
		return { ok: true };
	})
});
