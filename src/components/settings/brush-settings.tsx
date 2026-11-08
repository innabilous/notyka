'use client';

import React from 'react';
import { ArrowUpDown, Lock, Minus, Plus, Unlock } from 'lucide-react';
import { ToolMode } from '@/types/editor';

interface BrushSettingsProps {
	currentMode: ToolMode;
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

	const isStamp = currentMode === 'stamp';
	const isEraser = currentMode === 'eraser';
	const isStrokeTransparent = isStamp && strokeColor === 'transparent';

	let previewBorderColor = 'rgba(255, 255, 255, 0.35)';
	if (isStamp) {
		previewBorderColor = isStrokeTransparent ? 'rgba(255, 255, 255, 0.4)' : strokeColor;
	}

	const handleDecrease = () => {
		onChangeSize(Math.max(1, brushSize - 1));
	};

	const handleIncrease = () => {
		onChangeSize(Math.min(100, brushSize + 1));
	};

	return (
		<div id="brush-settings">
			<button
				id="btn-size-lock"
				type="button"
				className={`${sizeLocked ? 'locked' : ''} ${!isStamp ? 'hidden' : ''}`}
				aria-label={
					sizeLocked ? 'Спільний розмір для всіх нот' : 'Кожна нота має власний розмір'
				}
				onClick={onToggleLock}
			>
				{sizeLocked ? <Lock className="icon" /> : <Unlock className="icon" />}
			</button>

			{isStamp && onSyncCategorySizes && (
				<button
					id="btn-size-sync-category"
					type="button"
					className="btn-size-step"
					aria-label="Підлаштувати розмір решти елементів під поточний"
					title="Підлаштувати розмір решти елементів розділу під поточний"
					onClick={onSyncCategorySizes}
				>
					<ArrowUpDown className="icon" />
				</button>
			)}

			<div className="size-stepper-wrap">
				<button
					type="button"
					className="btn-size-step"
					aria-label="Зменшити розмір"
					title="Зменшити (-1)"
					onClick={handleDecrease}
				>
					<Minus className="icon" />
				</button>

				<button
					type="button"
					className={`btn-size-value ${isSideSliderOpen ? 'active' : ''}`}
					aria-label={`Розмір: ${brushSize}px. Натисніть для повзунка`}
					title="Змінити розмір повзунком"
					onClick={onToggleSideSlider}
				>
					<span>{brushSize}</span>
					<span className="unit">px</span>
				</button>

				<button
					type="button"
					className="btn-size-step"
					aria-label="Збільшити розмір"
					title="Збільшити (+1)"
					onClick={handleIncrease}
				>
					<Plus className="icon" />
				</button>
			</div>

			<button
				id="btn-toggle-palette"
				type="button"
				className={isEraser ? 'hidden' : ''}
				aria-label="Кольори"
				onClick={onTogglePalette}
			>
				<div
					id="color-preview"
					style={{
						backgroundColor: mainColor,
						borderColor: previewBorderColor,
					}}
				>
					<span id="stroke-transparent-icon" className={!isStrokeTransparent ? 'hidden' : ''}>
						✕
					</span>
				</div>
			</button>
		</div>
	);
};
