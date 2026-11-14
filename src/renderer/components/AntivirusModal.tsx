import { useEffect, useRef, useState } from 'react';
import { Copy, HelpCircle, RotateCcw, ShieldAlert } from 'lucide-react';
import { createPortal } from 'react-dom';

import { api } from '~renderer/utils/api';
import { type ModsStatus, type UpdaterStatus } from '~main/types';
import { useT } from '~renderer/i18n';

import TextButton from './styled/TextButton';

const DETECTION = 'Trojan:Win32/Vigorf.A';

const RESTORE_FAILURE_KEYS = {
	no_client: 'av.restoreNoClient',
	game_running: 'av.restoreGameRunning',
	busy: 'av.restoreBusy',
	server_unreachable: 'av.restoreServer',
	incomplete: 'av.restoreIncomplete',
	failed: 'av.restoreFailed'
} as const;

const AntivirusModal = () => {
	const t = useT();
	const [status, setStatus] = useState<ModsStatus>();
	api.mods.observe.useSubscription(undefined, { onData: setStatus });

	// re-scan for AV blocks once the updater settles (not mid-download); catches an aborted
	// download or a file quarantined after the fact
	const [updateState, setUpdateState] = useState<UpdaterStatus['state']>();
	api.updater.observe.useSubscription(undefined, {
		onData: s => setUpdateState(s?.state)
	});
	const settled =
		!!updateState && updateState !== 'verifying' && updateState !== 'updating';
	const { data: quarantined, refetch: refetchQuarantined } =
		api.general.antivirusBlocks.useQuery(undefined, {
			enabled: false,
			refetchOnWindowFocus: false,
			staleTime: Infinity
		});
	useEffect(() => {
		if (settled) refetchQuarantined();
	}, [updateState, settled, refetchQuarantined]);

	const blocked = [
		...new Set([
			...(quarantined ?? []),
			...(status?.mods ?? [])
				.filter(m => m.state === 'error' && m.error?.includes('Defender'))
				.map(m => m.name)
		])
	];
	const blockedKey = blocked.join(',');

	const dialogRef = useRef<HTMLDialogElement>(null);
	const [view, setView] = useState<'av' | 'why' | null>(null);

	const { data: folders } = api.general.defenderFolders.useQuery(undefined, {
		enabled: view === 'av',
		refetchOnWindowFocus: false
	});
	const openSettings = api.general.openDefenderSettings.useMutation();

	const checkAv = api.general.checkAntivirus.useMutation();
	const restoreAv = api.general.restoreBlockedFiles.useMutation();
	const busy = checkAv.isLoading || restoreAv.isLoading;
	const [feedback, setFeedback] = useState<{
		tone: 'ok' | 'warn';
		text: string;
	} | null>(null);
	const list = (names: string[]) => names.join(', ');

	const checkAgain = async () => {
		if (busy) return;
		setFeedback(null);
		try {
			const r = await checkAv.mutateAsync();
			setFeedback(
				r.blocked.length === 0
					? { tone: 'ok', text: t('av.allClear') }
					: {
							tone: 'warn',
							text: t('av.checkStillBlocked', { files: list(r.blocked) })
					  }
			);
		} catch {
			setFeedback({ tone: 'warn', text: t('av.checkFailed') });
		} finally {
			void refetchQuarantined();
		}
	};

	const restore = async () => {
		if (busy) return;
		setFeedback(null);
		try {
			const r = await restoreAv.mutateAsync();
			if (!r.ok)
				setFeedback({ tone: 'warn', text: t(RESTORE_FAILURE_KEYS[r.reason]) });
			else if (r.stillBlocked.length === 0)
				setFeedback({
					tone: 'ok',
					text: r.restored.length
						? t('av.restoreDoneFiles', { files: list(r.restored) })
						: t('av.allClear')
				});
			else if (r.restored.length)
				setFeedback({
					tone: 'warn',
					text: t('av.restorePartial', {
						restored: list(r.restored),
						files: list(r.stillBlocked)
					})
				});
			else
				setFeedback({
					tone: 'warn',
					text: t('av.restoreNone', { files: list(r.stillBlocked) })
				});
		} catch {
			setFeedback({ tone: 'warn', text: t('av.restoreFailed') });
		} finally {
			void refetchQuarantined();
		}
	};

	const [copied, setCopied] = useState<string | null>(null);
	const copy = (text: string) =>
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopied(text);
				setTimeout(() => setCopied(c => (c === text ? null : c)), 1500);
			})
			.catch(() => undefined);

	useEffect(() => {
		if (view) {
			// showModal() throws (and crashes to the error screen) if already open, e.g. the av<->why switch
			if (!dialogRef.current?.open) dialogRef.current?.showModal();
			(document.activeElement as HTMLElement | null)?.blur();
		} else {
			dialogRef.current?.close();
			setFeedback(null);
		}
	}, [view]);

	useEffect(() => {
		if (blockedKey) setView('av');
	}, [blockedKey]);

	// The settings dialog opens the explainer or the guide from its antivirus buttons.
	useEffect(() => {
		const openWhy = () => setView('why');
		const openGuide = () => setView('av');
		window.addEventListener('av-help', openWhy);
		window.addEventListener('av-guide', openGuide);
		return () => {
			window.removeEventListener('av-help', openWhy);
			window.removeEventListener('av-guide', openGuide);
		};
	}, []);

	const names = blockedKey ? blockedKey.split(',') : [];

	return createPortal(
		<dialog
			ref={dialogRef}
			onClose={() => setView(null)}
			className="h-full w-full items-center justify-center bg-[transparent] backdrop:backdrop-blur-sm [&[open]]:flex"
		>
			{view === 'av' && (
				<div className="tw-dialog !w-fit min-w-[380px] max-w-[520px] !gap-3">
					<h3 className="tw-color">
						{names.length ? t('av.blockedTitle') : t('av.howToAllowTitle')}
					</h3>
					{names.length > 0 && (
						<>
							<p className="s1">
								{names.length === 1 ? t('av.blockedOne') : t('av.blockedMany')}
							</p>
							<ul className="gap-0.5 flex flex-col pl-1">
								{names.map(n => (
									<li key={n} className="s1 text-orange">
										• {n}
									</li>
								))}
							</ul>
							<p className="s1 text-blueGray">{t('av.blockedExplain')}</p>
						</>
					)}
					<p className="s1 text-blueGray">{t('av.guideIntro')}</p>

					<p className="s1">{t('av.step1')}</p>
					<TextButton
						icon={ShieldAlert}
						loading={openSettings.isLoading}
						onClick={() => openSettings.mutate()}
						className="self-start text-orange"
					>
						{t('av.openWindowsSecurity')}
					</TextButton>
					{openSettings.data === false && (
						<span className="s1 text-orange">{t('av.openFailed')}</span>
					)}
					<ul className="flex flex-col gap-1 pl-1">
						{(folders ?? []).map(f => (
							<li key={f} className="s1 flex items-center gap-2">
								<span className="min-w-0 break-all text-warmGreen">{f}</span>
								<TextButton
									icon={Copy}
									size={14}
									onClick={() => void copy(f)}
									className="shrink-0 !p-0 text-blueGray"
								>
									{copied === f ? t('av.copied') : t('av.copy')}
								</TextButton>
							</li>
						))}
					</ul>

					<p className="s1">{t('av.step2')}</p>
					<TextButton
						icon={RotateCcw}
						loading={restoreAv.isLoading}
						disabled={busy}
						onClick={() => void restore()}
						className="self-start text-warmGreen"
					>
						{t('av.restoreFiles')}
					</TextButton>
					{restoreAv.isLoading && (
						<span className="s1 text-blueGray">{t('av.restoring')}</span>
					)}
					{checkAv.isLoading && (
						<span className="s1 text-blueGray">{t('av.checking')}</span>
					)}
					{feedback && (
						<span
							role="status"
							className={`s1 ${
								feedback.tone === 'ok' ? 'text-warmGreen' : 'text-orange'
							}`}
						>
							{feedback.text}
						</span>
					)}

					<TextButton
						icon={HelpCircle}
						onClick={() => setView('why')}
						className="self-start text-yellow hocus:!text-yellow"
					>
						{t('av.whyHappening')}
					</TextButton>
					<div className="mt-1 flex justify-end gap-3">
						<TextButton
							onClick={() => void checkAgain()}
							disabled={busy}
							className="text-blueGray"
						>
							{t('av.checkAgain')}
						</TextButton>
						<TextButton onClick={() => setView(null)} className="text-green">
							{t('av.close')}
						</TextButton>
					</div>
				</div>
			)}

			{view === 'why' && (
				<div className="tw-dialog !w-fit min-w-[420px] max-w-[560px] !gap-3">
					<h3 className="tw-color">{t('av.whyTitle')}</h3>
					<div className="flex max-h-[60vh] transform-gpu flex-col gap-3 overflow-y-auto overscroll-contain pr-1 [will-change:transform]">
						<p className="s1 text-blueGray">
							{t('av.whyIntro', { detection: DETECTION })}{' '}
							<span className="text-warmGreen">{t('av.falsePositive')}</span>.
						</p>
						<div>
							<p className="tw-color text-[21px] leading-tight">
								{t('av.whatSetsItOff')}
							</p>
							<p className="s1 text-blueGray">{t('av.whatSetsItOffIntro')}</p>
							<ul className="mt-1 flex flex-col gap-1 pl-1">
								<li className="s1 text-blueGray">
									<span className="text-orange">{t('av.dllInjection')}</span>:{' '}
									{t('av.dllInjectionText')}
								</li>
								<li className="s1 text-blueGray">
									<span className="text-orange">{t('av.exePatching')}</span>:{' '}
									{t('av.exePatchingText')}
								</li>
							</ul>
							<p className="s1 mt-1 text-blueGray">{t('av.heuristicNote')}</p>
						</div>
						<div>
							<p className="tw-color text-[21px] leading-tight">
								{t('av.whatModsDo')}
							</p>
							<ul className="mt-1 flex flex-col gap-1 pl-1">
								<li className="s1 text-blueGray">
									<span className="text-warmGreen">VanillaFixes</span>:{' '}
									{t('av.modVanillaFixes')}
								</li>
								<li className="s1 text-blueGray">
									<span className="text-warmGreen">nampower</span>:{' '}
									{t('av.modNampower')}
								</li>
								<li className="s1 text-blueGray">
									<span className="text-warmGreen">SuperWoW and UnitXP</span>:{' '}
									{t('av.modSuperWowUnitXp')}
								</li>
								<li className="s1 text-blueGray">
									<span className="text-warmGreen">DXVK</span>:{' '}
									{t('av.modDxvk')}
								</li>
							</ul>
						</div>
						<div>
							<p className="tw-color text-[21px] leading-tight">
								{t('av.howToVerify')}
							</p>
							<p className="s1 mt-1 text-blueGray">
								{t('av.howToVerifyText', {
									detection: DETECTION
								})}
							</p>
						</div>
						<div>
							<p className="tw-color text-[21px] leading-tight">
								{t('av.howToAllowTitle')}
							</p>
							<p className="s1 mt-1 text-blueGray">{t('av.howToAllowText')}</p>
							<p className="s1 mt-1 text-blueGray">
								{t('av.howToAllowSafety')}
							</p>
						</div>
					</div>
					<div className="flex items-center justify-end gap-3">
						<TextButton onClick={() => setView('av')} className="text-blueGray">
							{t('av.back')}
						</TextButton>
						<TextButton onClick={() => setView(null)} className="text-green">
							{t('av.close')}
						</TextButton>
					</div>
				</div>
			)}
		</dialog>,
		document.body
	);
};

export default AntivirusModal;
