'use client';

import React from 'react';
import { Lock, Minus, Plus, Unlock } from 'lucide-react';
import { ToolMode } from '@/types/editor';

interface BrushSettingsProps {
	currentMode: ToolMode;
	brushSize: number;
	sizeLocked: boolean;
	mainColor: string;
	strokeColor: string;
	onChangeSize: (size: number) => void;
	onToggleLock: (e: React.MouseEvent) => void;
	onTogglePalette: (e: React.MouseEvent) => void;
}

export const BrushSettings: React.FC<BrushSettingsProps> = ({
	currentMode,
	brushSize,
	sizeLocked,
	mainColor,
	strokeColor,
	onChangeSize,
	onToggleLock,
	onTogglePalette,
}) => {
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

			<input
				type="range"
				id="brush-size"
				min="1"
				max="100"
				value={brushSize}
				onChange={(e) => onChangeSize(parseInt(e.target.value, 10))}
			/>

			<div className="size-stepper-group">
				<button
					type="button"
					className="btn-size-step"
					aria-label="Зменшити розмір"
					onClick={handleDecrease}
				>
					<Minus className="icon" />
				</button>

				<button
					type="button"
					className="btn-size-step"
					aria-label="Збільшити розмір"
					onClick={handleIncrease}
				>
					<Plus className="icon" />
				</button>
			</div>

			<span id="brush-size-val">{brushSize}px</span>

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
