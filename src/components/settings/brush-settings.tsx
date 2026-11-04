'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Slider } from '@mantine/core';
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
	//! Відображення лейблу з розміром під слайдером у момент зміни розміру
	const [isChanging, setIsChanging] = useState<boolean>(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const isMountedRef = useRef<boolean>(false);

	useEffect(() => {
		if (!isMountedRef.current) {
			isMountedRef.current = true;
			return;
		}
		setIsChanging(true);
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			setIsChanging(false);
		}, 1200);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [brushSize]);

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

			<button
				type="button"
				className="btn-size-step"
				aria-label="Зменшити розмір"
				onClick={handleDecrease}
			>
				<Minus className="icon" />
			</button>

			<div className="brush-slider-wrap">
				<Slider
					size="xs"
					color="indigo"
					min={1}
					max={100}
					value={brushSize}
					onChange={onChangeSize}
					label={(val) => `${val} px`}
					labelAlwaysOn={isChanging}
					classNames={{
						root: 'brush-slider-root',
						track: 'brush-slider-track',
						bar: 'brush-slider-bar',
						thumb: 'brush-slider-thumb',
						label: 'brush-slider-label',
					}}
				/>
			</div>

			<button
				type="button"
				className="btn-size-step"
				aria-label="Збільшити розмір"
				onClick={handleIncrease}
			>
				<Plus className="icon" />
			</button>

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
