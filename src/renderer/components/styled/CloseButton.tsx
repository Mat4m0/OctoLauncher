import { X } from 'lucide-react';

import { useT } from '~renderer/i18n';

import TextButton from './TextButton';

const CloseButton = ({ close }: { close: () => void }) => {
	const t = useT();
	return (
		<TextButton
			title={t('misc.close')}
			icon={X}
			size={16}
			onClick={close}
			className="absolute right-1 top-1 text-blueGray hocus:text-red"
		/>
	);
};
export default CloseButton;
