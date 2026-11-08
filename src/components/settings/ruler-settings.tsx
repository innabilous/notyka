'use client';

import React from 'react';
import {
	AlignVerticalDistributeCenter,
	Columns3,
	Eye,
	EyeOff,
	Link,
	Magnet,
	MoveVertical,
	Trash2,
	Unlink,
} from 'lucide-react';

interface RulerSettingsProps {
	visible: boolean;
	snap: boolean;
	snapItems: boolean;
	attachContent: boolean;
	showDistance: boolean;
	lockEqualDistance: boolean;
	rulersCount: number;
	onToggleVisible: () => void;
	onToggleSnap: () => void;
	onToggleSnapItems: () => void;
	onToggleAttachContent: () => void;
	onToggleShowDistance: () => void;
	onToggleLockEqualDistance: () => void;
	onClearRulers: () => void;
}

export const RulerSettings: React.FC<RulerSettingsProps> = ({
	visible,
	snap,
	snapItems,
	attachContent,
	showDistance,
	lockEqualDistance,
	rulersCount,
	onToggleVisible,
	onToggleSnap,
	onToggleSnapItems,
	onToggleAttachContent,
	onToggleShowDistance,
	onToggleLockEqualDistance,
	onClearRulers,
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
				className={`ruler-setting-btn ${snap ? 'active' : ''}`}
				onClick={onToggleSnap}
				title="Прив'язка до лінійок"
				aria-label="Прив'язка до лінійок"
			>
				<Magnet className="icon" />
				<span>Прив&apos;язка</span>
			</button>

			<button
				type="button"
				className={`ruler-setting-btn ${snapItems ? 'active' : ''}`}
				onClick={onToggleSnapItems}
				title="Прив'язка до нот на інших лінійках (Smart Guides)"
				aria-label="Прив'язка до нот на інших лінійках"
			>
				<Columns3 className="icon" />
				<span>Снеп нот</span>
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
				className={`ruler-setting-btn ${lockEqualDistance ? 'active' : ''}`}
				onClick={onToggleLockEqualDistance}
				title={
					lockEqualDistance
						? 'Зафіксовано рівновіддаленість лінійок'
						: 'Зафіксувати рівну відстань між лінійками'
				}
				aria-label="Зафіксувати рівну відстань між лінійками"
				style={{
					opacity: canDistribute || lockEqualDistance ? 1 : 0.65,
					cursor: 'pointer',
				}}
			>
				<AlignVerticalDistributeCenter className="icon" />
				<span>Рівновіддаленість</span>
			</button>

			<button
				type="button"
				className="ruler-setting-btn"
				onClick={onClearRulers}
				title="Очистити всі лінійки"
				aria-label="Очистити всі лінійки"
				style={{
					opacity: rulersCount > 0 ? 1 : 0.5,
					cursor: rulersCount > 0 ? 'pointer' : 'default',
				}}
			>
				<Trash2 className="icon" />
				<span>Очистити</span>
			</button>
		</div>
	);
};
