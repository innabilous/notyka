'use client';

import React from 'react';
import { Box, UnstyledButton } from '@mantine/core';
import clsx from 'clsx';
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
import classes from './ruler-settings.module.css';

interface RulerSettingsProps {
	visible: boolean;
	snap: boolean;
	snapItems: boolean;
	attachContent: boolean;
	showDistance: boolean;
	lockEqualDistance: boolean;
	rulersCount: number;
	compact?: boolean;
	onToggleVisible: () => void;
	onToggleSnap: () => void;
	onToggleSnapItems: () => void;
	onToggleAttachContent: () => void;
	onToggleShowDistance: () => void;
	onToggleLockEqualDistance: () => void;
	onClearRulers?: () => void;
}

export function RulerSettings({
	visible,
	snap,
	snapItems,
	attachContent,
	showDistance,
	lockEqualDistance,
	rulersCount,
	compact = false,
	onToggleVisible,
	onToggleSnap,
	onToggleSnapItems,
	onToggleAttachContent,
	onToggleShowDistance,
	onToggleLockEqualDistance,
	onClearRulers,
}: RulerSettingsProps) {
	const canDistribute = rulersCount > 2;

	return (
		<Box
			component="nav"
			id="ruler-settings"
			className={clsx(compact && 'compact')}
			aria-label="Панель налаштувань лінійок"
		>
			<UnstyledButton
				className={clsx('ruler-setting-btn', visible && 'active')}
				onClick={onToggleVisible}
				title={visible ? 'Приховати лінійки' : 'Показати лінійки'}
				aria-label="Показати/приховати лінійки"
			>
				{visible ? <Eye className="icon" /> : <EyeOff className="icon" />}
				<span>{visible ? 'Показати' : 'Приховати'}</span>
			</UnstyledButton>

			<UnstyledButton
				className={clsx('ruler-setting-btn', snap && 'active')}
				onClick={onToggleSnap}
				title="Прив'язка до лінійок"
				aria-label="Прив'язка до лінійок"
			>
				<Magnet className="icon" />
				<span>Прив&apos;язка</span>
			</UnstyledButton>

			<UnstyledButton
				className={clsx('ruler-setting-btn', snapItems && 'active')}
				onClick={onToggleSnapItems}
				title="Снеп нот між лінійками (Smart Guides)"
				aria-label="Снеп нот між лінійками"
			>
				<Columns3 className="icon" />
				<span>Снеп нот</span>
			</UnstyledButton>

			<UnstyledButton
				className={clsx('ruler-setting-btn', attachContent && 'active')}
				onClick={onToggleAttachContent}
				title="Рухати контент разом з лінійкою"
				aria-label="Рухати контент разом з лінійкою"
			>
				{attachContent ? <Link className="icon" /> : <Unlink className="icon" />}
				<span>{compact ? 'З контентом' : 'Рух з контентом'}</span>
			</UnstyledButton>

			<UnstyledButton
				className={clsx('ruler-setting-btn', showDistance && 'active')}
				onClick={onToggleShowDistance}
				title="Показувати відстань між лінійками"
				aria-label="Відстань між лінійками"
			>
				<MoveVertical className="icon" />
				<span>Відстань</span>
			</UnstyledButton>

			<UnstyledButton
				className={clsx(
					'ruler-setting-btn',
					lockEqualDistance && 'active',
					!(canDistribute || lockEqualDistance) && classes.dimmed,
				)}
				onClick={onToggleLockEqualDistance}
				title={
					lockEqualDistance
						? 'Зафіксовано рівновіддаленість лінійок'
						: 'Зафіксувати рівну відстань між лінійками'
				}
				aria-label="Зафіксувати рівну відстань між лінійками"
			>
				<AlignVerticalDistributeCenter className="icon" />
				<span>Рівна відстань</span>
			</UnstyledButton>

			{compact && onClearRulers && (
				<UnstyledButton
					className={clsx(
						'ruler-setting-btn',
						'ruler-clear-btn',
						rulersCount <= 0 && classes.clearDisabled,
					)}
					onClick={onClearRulers}
					title="Очистити всі лінійки"
					aria-label="Очистити всі лінійки"
				>
					<Trash2 className="icon" />
					<span>Очистити</span>
				</UnstyledButton>
			)}
		</Box>
	);
}
