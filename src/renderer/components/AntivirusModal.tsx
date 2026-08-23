import { useEffect, useRef, useState } from 'react';
import { ShieldAlert, HelpCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

import { api } from '~renderer/utils/api';
import { type ModsStatus } from '~main/types';
import { useT } from '~renderer/i18n';

import TextButton from './styled/TextButton';

const DETECTION = 'Trojan:Win32/Vigorf.A';

const AntivirusModal = () => {
	const t = useT();
	const { data: runtime } = api.general.runtime.useQuery();
	const [status, setStatus] = useState<ModsStatus>();
	api.mods.observe.useSubscription(undefined, { onData: setStatus });

	const addExclusion = api.general.addDefenderExclusion.useMutation();

	const blocked = (status?.mods ?? [])
		.filter(m => m.state === 'error' && m.error?.includes('Defender'))
		.map(m => m.name);
	const blockedKey = blocked.join(',');

	const dialogRef = useRef<HTMLDialogElement>(null);
	const [view, setView] = useState<'av' | 'why' | null>(null);

	useEffect(() => {
		if (view) {
			dialogRef.current?.showModal();
			(document.activeElement as HTMLElement | null)?.blur();
		} else dialogRef.current?.close();
	}, [view]);

	useEffect(() => {
		if (blockedKey) setView('av');
	}, [blockedKey]);

	const names = blockedKey ? blockedKey.split(',') : [];
	if (runtime?.platform !== 'win32') return null;

	return createPortal(
		<dialog
			ref={dialogRef}
			onClose={() => setView(null)}
			className="h-full w-full items-center justify-center bg-[transparent] backdrop:backdrop-blur-sm [&[open]]:flex"
		>
			{view === 'av' && (
				<div className="tw-dialog !w-fit min-w-[380px] max-w-[480px] !gap-3">
					<h3 className="tw-color">{t('av.blockedTitle')}</h3>
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
					<TextButton
						icon={HelpCircle}
						onClick={() => setView('why')}
						className="self-start text-yellow hocus:!text-yellow"
					>
						{t('av.whyHappening')}
					</TextButton>
					<TextButton
						icon={ShieldAlert}
						loading={addExclusion.isLoading}
						onClick={() => addExclusion.mutate()}
						className="self-start text-orange"
					>
						{t('av.allowThrough')}
					</TextButton>
					{addExclusion.data?.ok === true && (
						<span className="s1 text-warmGreen">{t('av.addedRetry')}</span>
					)}
					{addExclusion.data?.ok === false && (
						<span className="s1 text-orange">{addExclusion.data.error}</span>
					)}
					<div className="mt-1 flex justify-end">
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
								{t('av.whatAllowDoesTitle')}
							</p>
							<p className="s1 mt-1 text-blueGray">
								{t('av.whatAllowDoesIntro')}{' '}
								<span className="text-warmGreen">Add-MpPreference</span>{' '}
								{t('av.whatAllowDoesIntroAfter')}
							</p>
							<ul className="mt-1 flex flex-col gap-1 pl-1">
								<li className="s1 text-blueGray">
									{t('av.exclusionFoldersBefore')}{' '}
									<span className="text-warmGreen">{t('av.gameFolder')}</span>{' '}
									{t('av.exclusionFoldersAnd')}{' '}
									<span className="text-warmGreen">
										{t('av.launcherFolder')}
									</span>
									{t('av.exclusionFoldersAfter')}
								</li>
								<li className="s1 text-blueGray">
									<span className="text-warmGreen">WoW.exe</span>{' '}
									{t('av.exclusionExesAnd')}{' '}
									<span className="text-warmGreen">VanillaFixes.exe</span>{' '}
									{t('av.exclusionExesAfter')}
								</li>
							</ul>
							<p className="s1 mt-1 text-blueGray">
								{t('av.whatAllowDoesOutro')}
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
