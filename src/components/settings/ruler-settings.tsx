'use client';

import React from 'react';
import { Eye, EyeOff, Link, Unlink } from 'lucide-react';

interface RulerSettingsProps {
	visible: boolean;
	attachContent: boolean;
	onToggleVisible: () => void;
	onToggleAttachContent: () => void;
}

export const RulerSettings: React.FC<RulerSettingsProps> = ({
	visible,
	attachContent,
	onToggleVisible,
	onToggleAttachContent,
}) => {
	return (
		<div id="ruler-settings">
			<button
				type="button"
				className={`ruler-setting-btn ${visible ? 'active' : ''}`}
				onClick={onToggleVisible}
				title={visible ? 'Приховати лінійки' : 'Показати лінійки'}
				aria-label={visible ? 'Приховати лінійки' : 'Показати лінійки'}
			>
				{visible ? <Eye className="icon" /> : <EyeOff className="icon" />}
				<span>{visible ? 'Показати' : 'Приховано'}</span>
			</button>

			<button
				type="button"
				className={`ruler-setting-btn ${attachContent ? 'active' : ''}`}
				onClick={onToggleAttachContent}
				title={
					attachContent
						? 'Рухати контент разом з лінійкою (Увімкнено)'
						: 'Рухати тільки лінійку (Вимкнено)'
				}
				aria-label={
					attachContent
						? 'Рухати контент разом з лінійкою (Увімкнено)'
						: 'Рухати тільки лінійку (Вимкнено)'
				}
			>
				{attachContent ? <Link className="icon" /> : <Unlink className="icon" />}
				<span>{attachContent ? 'Рухати з контентом' : 'Тільки лінійка'}</span>
			</button>
		</div>
	);
};

