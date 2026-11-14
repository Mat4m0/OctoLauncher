import { useEffect, useState, type ReactElement } from 'react';
import cls from 'classnames';
import log from 'electron-log/renderer';

import { type UpdaterStatus, type ModsStatus } from '~main/types';
import { formatFileSize } from '~common/utils';
import { api } from '~renderer/utils/api';
import { useT } from '~renderer/i18n';

import Button from './styled/Button';
import DialogButton from './styled/DialogButton';
import ClientDirDialog from './ClientDirDialog';
import PriorityLogin from './PriorityLogin';

const formatDuration = (seconds: number) => {
	const s = Math.max(0, Math.round(seconds));
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	const rem = s % 60;
	if (m < 60) return rem ? `${m}m ${rem}s` : `${m}m`;
	const h = Math.floor(m / 60);
	const minRem = m % 60;
	return minRem ? `${h}h ${minRem}m` : `${h}h`;
};

const formatPercent = (progress: number) =>
	`${parseFloat((progress * 100).toFixed(1))}%`;

const ProgressDetails = ({ status }: { status: UpdaterStatus }) => {
	const t = useT();
	const { bytesDone, bytesTotal, bytesPerSecond, etaSeconds, progress } =
		status;
	if (bytesTotal === undefined || bytesDone === undefined) return null;

	const pct =
		progress !== undefined && progress >= 0 ? formatPercent(progress) : '—';

	return (
		<p className="s1 text-blueGray">
			<span className="tw-color">{pct}</span>
			<span>
				{' '}
				· {formatFileSize(bytesDone)} / {formatFileSize(bytesTotal)}
			</span>
			{bytesPerSecond !== undefined && bytesPerSecond > 0 && (
				<span> · {formatFileSize(bytesPerSecond, 1)}/s</span>
			)}
			<span>
				{' · '}
				{etaSeconds !== undefined
					? `~${formatDuration(etaSeconds)} ${t('launch.remaining')}`
					: t('launch.calculating')}
			</span>
		</p>
	);
};

const LaunchPanel = () => {
	const t = useT();
	const [status, setStatus] = useState<UpdaterStatus>({ state: 'verifying' });
	api.updater.observe.useSubscription(undefined, {
		onData: setStatus,
		onError: err => log.error('Updater subscription error:', err)
	});

	const { data: pref } = api.preferences.get.useQuery();

	const [modsStatus, setModsStatus] = useState<ModsStatus>();
	api.mods.observe.useSubscription(undefined, {
		onData: setModsStatus
	});

	const verify = api.updater.verify.useMutation();
	const update = api.updater.update.useMutation();
	const cancel = api.updater.cancel.useMutation();
	const start = api.launcher.start.useMutation();
	const applyMods = api.mods.applyAll.useMutation();
	const message = status.messageKey
		? t(status.messageKey, status.messageArgs)
		: status.message;
	const startError =
		start.data && !start.data.ok
			? start.data.errorKey
				? t(start.data.errorKey)
				: start.data.error
			: undefined;

	useEffect(() => {
		if (start.data?.errorKey === 'launch.blockedByAntivirus')
			window.dispatchEvent(new Event('av-guide'));
	}, [start.data]);

	const modRows = modsStatus?.mods ?? [];
	const enabledIds = new Set(modRows.filter(m => m.enabled).map(m => m.id));
	const missingDeps = [
		...new Set(
			modRows
				.filter(m => m.enabled)
				.flatMap(m => m.requires.filter(d => !enabledIds.has(d)))
		)
	];
	const modName = (id: string) => modRows.find(m => m.id === id)?.name ?? id;

	const props: Record<
		UpdaterStatus['state'],
		{ button: ReactElement; helperText?: ReactElement }
	> = {
		verifying: { button: <Button disabled>{t('launch.verifying')}</Button> },
		serverUnreachable: {
			button: pref?.version ? (
				<Button disabled={start.isLoading} onClick={() => start.mutateAsync()}>
					{t('launch.play')}
				</Button>
			) : (
				<Button
					disabled={verify.isLoading}
					onClick={() => verify.mutateAsync()}
				>
					{t('launch.retry')}
				</Button>
			),
			helperText: (
				<div className="-mb-2">
					<p>
						<span className="text-orange">{t('launch.errorLabel')}</span>{' '}
						{t('launch.serverFail')}
					</p>
					<p className="s1 text-blueGray">
						{pref?.version
							? t('launch.localVersion', { version: pref.version })
							: t('launch.tryLater')}
					</p>
				</div>
			)
		},
		noClient: {
			button: (
				<DialogButton
					clickAway
					dialog={close => <ClientDirDialog close={close} />}
				>
					{open => (
						<Button primary onClick={open}>
							{t('launch.install')}
						</Button>
					)}
				</DialogButton>
			)
		},
		updateAvailable: {
			button: (
				<Button
					disabled={update.isLoading}
					onClick={() => update.mutateAsync()}
				>
					{t('launch.update')}
				</Button>
			),
			helperText: (
				<div className="-mb-2 flex flex-col gap-1">
					<p>{t('launch.updateAvailable')}</p>
					<p className="s1 text-blueGray">
						{status.progress !== undefined &&
							status.bytesDone !== undefined &&
							status.bytesTotal !== undefined && (
								<>
									<span className="tw-color">
										{formatPercent(status.progress)}
									</span>
									<span>
										{' '}
										· {formatFileSize(status.bytesDone)} /{' '}
										{formatFileSize(status.bytesTotal)} {t('launch.onDisk')} ·{' '}
									</span>
								</>
							)}
						<span className="break-all">{message}</span>
					</p>
				</div>
			)
		},
		updating: {
			button: status.cancellable ? (
				<Button
					disabled={cancel.isLoading}
					onClick={() => cancel.mutateAsync()}
				>
					{t('launch.cancel')}
				</Button>
			) : (
				<Button disabled>{t('launch.updating')}</Button>
			),
			helperText: (
				<div className="-mb-2 flex flex-col gap-1">
					{message && <p className="s1 truncate text-blueGray">{message}</p>}
					<ProgressDetails status={status} />
				</div>
			)
		},
		upToDate: {
			button: modsStatus?.dirty ? (
				<Button
					primary
					onClick={() => applyMods.mutateAsync()}
					disabled={
						applyMods.isLoading ||
						modsStatus?.state === 'busy' ||
						missingDeps.length > 0
					}
				>
					{modsStatus?.state === 'busy'
						? t('launch.applying')
						: t('mods.apply')}
				</Button>
			) : (
				<Button
					primary
					disabled={start.isLoading}
					onClick={() => start.mutateAsync()}
				>
					{t('launch.play')}
				</Button>
			),
			helperText: (
				<div className="-mb-2">
					{modsStatus?.dirty ? (
						missingDeps.length ? (
							<p className="text-orange">
								{t('mods.enableRequired', {
									mods: missingDeps.map(modName).join(', ')
								})}
							</p>
						) : (
							<p>{t('launch.modsChanged')}</p>
						)
					) : (
						<p>{t('launch.upToDate')}</p>
					)}
					<p className="s1 text-blueGray">
						{t('launch.version', { version: pref?.version ?? '' })}
					</p>
				</div>
			)
		},
		failed: {
			button: (
				<Button
					disabled={verify.isLoading}
					onClick={() => verify.mutateAsync()}
				>
					{t('launch.retry')}
				</Button>
			),
			helperText: (
				<div className="-mb-2">
					<p>
						<span className="text-orange">{t('launch.errorLabel')}</span>{' '}
						{message}
					</p>
					<p className="s1 text-blueGray">{t('launch.verifyHint')}</p>
				</div>
			)
		}
	};

	return (
		<div className="flex gap-3">
			<div className="flex flex-grow flex-col justify-end gap-3">
				<PriorityLogin />
				{props[status.state].helperText ??
					(message && <p className="s1 -mb-2 text-blueGray">{message}</p>)}
				{startError && <p className="s1 -mb-2 text-orange">{startError}</p>}
				<div className="tw-loading-wrapper">
					{status.progress !== undefined && (
						<div
							className={cls('tw-loading', {
								'tw-loading-unknown': status.progress === -1
							})}
							style={
								status.progress !== -1
									? {
											clipPath: `inset(0 ${
												100 - Math.ceil(Math.abs(status.progress) * 100)
											}% 0 0)`
									  }
									: undefined
							}
						/>
					)}
				</div>
			</div>
			<div className="flex h-[82px] shrink-0 self-end">
				{props[status.state].button}
			</div>
		</div>
	);
};

export default LaunchPanel;
