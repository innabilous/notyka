'use client';

import React from 'react';
import { Box, Group, UnstyledButton } from '@mantine/core';
import { ArrowUpDown, Lock, Minus, Plus, Unlock } from 'lucide-react';
import { StampCategory, ToolMode } from '@/types/editor';

interface BrushSettingsProps {
	currentMode: ToolMode;
	stampCategory?: StampCategory;
	brushSize: number;
	sizeLocked: boolean;
	mainColor: string;
	strokeColor: string;
	isSideSliderOpen?: boolean;
	onChangeSize: (size: number) => void;
	onToggleLock: (e: React.MouseEvent) => void;
	onTogglePalette: (e: React.MouseEvent) => void;
	onToggleSideSlider?: () => void;
	onSyncCategorySizes?: () => void;
}

export const BrushSettings: React.FC<BrushSettingsProps> = ({
	currentMode,
	stampCategory,
	brushSize,
	sizeLocked,
	mainColor,
	strokeColor,
	isSideSliderOpen,
	onChangeSize,
	onToggleLock,
	onTogglePalette,
	onToggleSideSlider,
	onSyncCategorySizes,
}) => {

	if (currentMode === 'ruler') {
		return null;
	}

	const isStamp = currentMode === 'stamp' || currentMode === 'select';
	const isEraser = currentMode === 'eraser';
	const isShapes = isStamp && stampCategory === 'shapes';
	const isFillTransparent = isStamp && mainColor === 'transparent';
	const isStrokeTransparent = isStamp && strokeColor === 'transparent';

	// Для фігур, якщо заливка прозора, а обводка кольорова — показуємо колір обводки як заливку для прев'ю
	const previewBgColor =
		isShapes && isFillTransparent && !isStrokeTransparent
			? strokeColor
			: isFillTransparent
				? 'transparent'
				: mainColor;

	let previewBorderColor = 'rgba(255, 255, 255, 0.35)';
	if (isStamp) {
		previewBorderColor = isShapes
			? strokeColor !== 'transparent'
				? strokeColor
				: 'rgba(255, 255, 255, 0.4)'
			: isFillTransparent
				? isStrokeTransparent
					? 'rgba(255, 255, 255, 0.4)'
					: strokeColor
				: isStrokeTransparent
					? 'rgba(255, 255, 255, 0.4)'
					: strokeColor;
	}

	const handleDecrease = () => {
		onChangeSize(Math.max(1, brushSize - 1));
	};

	const handleIncrease = () => {
		onChangeSize(Math.min(100, brushSize + 1));
	};

	return (
		<Group gap={4} id="brush-settings">
			<UnstyledButton
				id="btn-size-lock"
				className={`${sizeLocked ? 'locked' : ''} ${!isStamp ? 'hidden' : ''}`}
				aria-label={
					sizeLocked ? 'Спільний розмір для всіх нот' : 'Кожна нота має власний розмір'
				}
				onClick={onToggleLock}
			>
				{sizeLocked ? <Lock className="icon" /> : <Unlock className="icon" />}
			</UnstyledButton>

			{isStamp && onSyncCategorySizes && (
				<UnstyledButton
					id="btn-size-sync-category"
					className="btn-size-step"
					aria-label="Підлаштувати розмір решти елементів під поточний"
					title="Підлаштувати розмір решти елементів розділу під поточний"
					onClick={onSyncCategorySizes}
				>
					<ArrowUpDown className="icon" />
				</UnstyledButton>
			)}

			<Group gap={0} className="size-stepper-wrap">
				<UnstyledButton
					className="btn-size-step"
					aria-label="Зменшити розмір"
					title="Зменшити (-1)"
					onClick={handleDecrease}
				>
					<Minus className="icon" />
				</UnstyledButton>

				<UnstyledButton
					className={`btn-size-value ${isSideSliderOpen ? 'active' : ''}`}
					aria-label={`Розмір: ${brushSize}px. Натисніть для повзунка`}
					title="Змінити розмір повзунком"
					onClick={onToggleSideSlider}
				>
					<span>{brushSize}</span>
					<span className="unit">px</span>
				</UnstyledButton>

				<UnstyledButton
					className="btn-size-step"
					aria-label="Збільшити розмір"
					title="Збільшити (+1)"
					onClick={handleIncrease}
				>
					<Plus className="icon" />
				</UnstyledButton>
			</Group>

			<UnstyledButton
				id="btn-toggle-palette"
				className={isEraser ? 'hidden' : ''}
				aria-label="Кольори"
				onClick={onTogglePalette}
			>
				<Box
					id="color-preview"
					style={{
						backgroundColor: previewBgColor,
						borderColor: previewBorderColor,
					}}
				>
					<span
						id="stroke-transparent-icon"
						className={isShapes || !(isStrokeTransparent && !isFillTransparent) ? 'hidden' : ''}
					>
						✕
					</span>
				</Box>
			</UnstyledButton>
		</Group>
	);
};
