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
				title="Показати"
				aria-label="Показати"
			>
				{visible ? <Eye className="icon" /> : <EyeOff className="icon" />}
				<span>Показати</span>
			</button>

			<button
				type="button"
				className={`ruler-setting-btn ${attachContent ? 'active' : ''}`}
				onClick={onToggleAttachContent}
				title="Рухати з контентом"
				aria-label="Рухати з контентом"
			>
				{attachContent ? <Link className="icon" /> : <Unlink className="icon" />}
				<span>Рухати з контентом</span>
			</button>
		</div>
	);
};

