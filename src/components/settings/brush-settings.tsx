'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { Box, UnstyledButton } from '@mantine/core';
import clsx from 'clsx';
import { ArrowUpDown, Lock, Minus, Plus, Unlock } from 'lucide-react';
import { StampCategory, ToolMode } from '@/types/editor';
import classes from './brush-settings.module.css';

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

export function BrushSettings({
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
}: BrushSettingsProps) {
	const previewRef = useRef<HTMLDivElement>(null);

	const isStamp = currentMode === 'stamp' || currentMode === 'select';
	const isEraser = currentMode === 'eraser';
	const isShapes = isStamp && stampCategory === 'shapes';
	const isFillTransparent = isStamp && mainColor === 'transparent';
	const isStrokeTransparent = isStamp && strokeColor === 'transparent';

	// For shapes with transparent fill and colored stroke, display stroke color as preview fill
	const previewBgColor =
		isShapes && isFillTransparent && !isStrokeTransparent
			? strokeColor
			: isFillTransparent
				? 'transparent'
				: mainColor;

	// Preview border color: use visible stamp stroke color when present, otherwise neutral border
	const previewBorderColor =
		isStamp && !isStrokeTransparent ? strokeColor : 'var(--line-strong)';

	useLayoutEffect(() => {
		const el = previewRef.current;
		if (!el) return;
		el.style.setProperty('--preview-bg', previewBgColor);
		el.style.setProperty('--preview-border', previewBorderColor);
	}, [previewBgColor, previewBorderColor]);

	if (currentMode === 'ruler') {
		return null;
	}

	function handleDecrease() {
		onChangeSize(Math.max(1, brushSize - 1));
	}

	function handleIncrease() {
		onChangeSize(Math.min(100, brushSize + 1));
	}

	return (
		<Box id="brush-settings" className={classes.root}>
			<UnstyledButton
				id="btn-size-lock"
				className={clsx(sizeLocked && 'locked', !isStamp && 'hidden')}
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

			<Box className="size-stepper-wrap">
				<UnstyledButton
					className="btn-size-step"
					aria-label="Зменшити розмір"
					title="Зменшити (-1)"
					onClick={handleDecrease}
				>
					<Minus className="icon" />
				</UnstyledButton>

				<UnstyledButton
					className={clsx('btn-size-value', isSideSliderOpen && 'active')}
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
			</Box>

			<UnstyledButton
				id="btn-toggle-palette"
				className={clsx(isEraser && 'hidden')}
				aria-label="Кольори"
				onClick={onTogglePalette}
			>
				<Box id="color-preview" ref={previewRef} className={classes.colorPreview}>
					<span
						id="stroke-transparent-icon"
						className={clsx(
							classes.transparentIcon,
							(isShapes || !(isStrokeTransparent && !isFillTransparent)) && 'hidden',
						)}
					>
						✕
					</span>
				</Box>
			</UnstyledButton>
		</Box>
	);
}
