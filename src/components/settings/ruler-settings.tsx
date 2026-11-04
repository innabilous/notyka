'use client';

import React from 'react';
import {
	AlignVerticalDistributeCenter,
	Eye,
	EyeOff,
	Link,
	MoveVertical,
	Unlink,
} from 'lucide-react';

interface RulerSettingsProps {
	visible: boolean;
	attachContent: boolean;
	showDistance: boolean;
	rulersCount: number;
	onToggleVisible: () => void;
	onToggleAttachContent: () => void;
	onToggleShowDistance: () => void;
	onDistributeRulers: () => void;
}

export const RulerSettings: React.FC<RulerSettingsProps> = ({
	visible,
	attachContent,
	showDistance,
	rulersCount,
	onToggleVisible,
	onToggleAttachContent,
	onToggleShowDistance,
	onDistributeRulers,
}) => {
	const canDistribute = rulersCount > 2;

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

			<button
				type="button"
				className={`ruler-setting-btn ${showDistance ? 'active' : ''}`}
				onClick={onToggleShowDistance}
				title="Відстань між лінійками"
				aria-label="Відстань між лінійками"
			>
				<MoveVertical className="icon" />
				<span>Відстань</span>
			</button>

			<button
				type="button"
				className={`ruler-setting-btn ${canDistribute ? 'active' : ''}`}
				onClick={onDistributeRulers}
				title="Вирівняти відстань між лінійками"
				aria-label="Вирівняти відстань між лінійками"
				style={{
					opacity: canDistribute ? 1 : 0.6,
					cursor: 'pointer',
				}}
			>
				<AlignVerticalDistributeCenter className="icon" />
				<span>Вирівняти</span>
			</button>
		</div>
	);
};
