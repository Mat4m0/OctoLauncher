import { ExternalLink, ShieldCheck } from 'lucide-react';

import { useT } from '~renderer/i18n';
import { api } from '~renderer/utils/api';

import TextButton from './styled/TextButton';

const REASON_KEY: Record<string, string> = {
	account_too_new: 'priority.accountTooNew',
	not_good_standing: 'priority.notGoodStanding',
	email_unverified: 'priority.emailUnverified',
	hosting_or_vpn: 'priority.hostingOrVpn',
	shared_vpn_ip: 'priority.sharedVpnIp',
	origin_blocked: 'priority.notOnThisConnection',
	not_public_ip: 'priority.notOnThisConnection',
	no_character: 'priority.noCharacter',
	not_in_rollout: 'priority.notInRollout',
	no_active_edge: 'priority.notAvailableNow',
	feature_disabled: 'priority.notAvailableNow'
};

const PriorityLogin = () => {
	const t = useT();
	const { data: state, refetch, isLoading } = api.auth.status.useQuery();
	const signIn = api.auth.signInWithBrowser.useMutation();
	const signOut = api.auth.signOut.useMutation();

	const doSignIn = async () => {
		if (signIn.isLoading) return;
		await signIn.mutateAsync();
		await refetch();
	};
	const doSignOut = async () => {
		await signOut.mutateAsync();
		await refetch();
	};

	if (isLoading || !state) return null;

	const error =
		signIn.data && !signIn.data.ok && signIn.data.error
			? signIn.data.error
			: undefined;

	if (state.signedIn && state.usingPrivate) {
		return (
			<div className="s1 flex items-center gap-2 text-warmGreen">
				<ShieldCheck size={14} className="shrink-0" />
				<span>{t('priority.active')}</span>
				<TextButton
					onClick={doSignOut}
					loading={signOut.isLoading}
					className="!p-0 text-blueGray"
				>
					{t('priority.signOut')}
				</TextButton>
			</div>
		);
	}

	const signInButton = (label: string) => (
		<>
			<TextButton
				icon={ExternalLink}
				onClick={doSignIn}
				loading={signIn.isLoading}
				className="self-start !p-0 text-green"
			>
				{label}
			</TextButton>
			{signIn.isLoading && (
				<span className="text-blueGray">{t('priority.finishInBrowser')}</span>
			)}
			{error && <span className="text-orange">{error}</span>}
		</>
	);

	if (state.signedIn) {
		return (
			<div className="s1 flex flex-col gap-1">
				<span className="text-blueGray">
					{t(
						(state.reason && REASON_KEY[state.reason]) ||
							'priority.standardLogin'
					)}
				</span>
				{signInButton(t('priority.tryAgain'))}
			</div>
		);
	}

	return (
		<div className="s1 flex flex-col gap-1">
			{signInButton(t('priority.signIn'))}
		</div>
	);
};

export default PriorityLogin;
