'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { StampCategory, ToolMode } from '@/types/editor';

interface SideSizeSliderProps {
	value: number;
	onChange: (newSize: number) => void;
	opened: boolean;
	onClose: () => void;
	currentMode: ToolMode;
	stampCategory?: StampCategory;
	canvasScale?: number;
	mainColor?: string;
	strokeColor?: string;
}

export const SideSizeSlider: React.FC<SideSizeSliderProps> = ({
	value,
	onChange,
	opened,
	onClose,
	currentMode,
	stampCategory,
	canvasScale = 1,
	mainColor = '#ed1c24',
	strokeColor = 'transparent',
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [isHovered, setIsHovered] = useState<boolean>(false);

	//! Закриття по кліку на полотно без блокування події (одразу малює/ставить штамп)
	useEffect(() => {
		if (!opened) return;

		const handlePointerDown = (e: PointerEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;
			// Якщо клік всередині бічного слайдера або по кнопці розміру в тулбарі — не закриваємо
			if (
				containerRef.current?.contains(target) ||
				target.closest('.btn-size-value') ||
				target.closest('.btn-size-step')
			) {
				return;
			}
			onClose();
		};

		window.addEventListener('pointerdown', handlePointerDown, { capture: true });
		return () => {
			window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
		};
	}, [onClose, opened]);

	const updateSizeFromY = useCallback(
		(clientY: number) => {
			const track = trackRef.current;
			if (!track) return;
			const rect = track.getBoundingClientRect();
			const trackH = rect.height;
			if (trackH <= 0) return;

			// Вгорі 100, внизу 1
			const relY = Math.max(0, Math.min(trackH, clientY - rect.top));
			const ratio = 1 - relY / trackH;
			const newSize = Math.max(1, Math.min(100, Math.round(ratio * 99 + 1)));
			onChange(newSize);
		},
		[onChange],
	);

	const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		setIsDragging(true);
		updateSizeFromY(e.clientY);
	};

	const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!isDragging) return;
		e.preventDefault();
		updateSizeFromY(e.clientY);
	};

	const handleTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!isDragging) return;
		try {
			(e.target as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			// Pointer capture might have already been released
		}
		setIsDragging(false);
	};

	if (!opened || currentMode === 'ruler') {
		return null;
	}

	const fillPercent = Math.max(0, Math.min(100, ((value - 1) / 99) * 100));
	const isStamp = currentMode === 'stamp';
	const showPreviewDot =
		currentMode === 'pencil' ||
		currentMode === 'eraser' ||
		(currentMode === 'stamp' && stampCategory === 'draw');
	const isTransparent = isStamp && strokeColor === 'transparent';
	const previewBorder = isStamp
		? isTransparent
			? 'rgba(255, 255, 255, 0.4)'
			: strokeColor
		: 'transparent';

	//! Реальний 1:1 розмір малювання на екрані з урахуванням зуму полотна
	const basePx = currentMode === 'eraser' ? value * 1.5 : currentMode === 'stamp' ? value * 2 : value;
	const previewDiameter = Math.max(2, Math.round(basePx * canvasScale));

	return (
		<aside
			ref={containerRef}
			id="side-size-slider"
			className={`floating ${isDragging || isHovered ? 'active' : ''}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			aria-label="Бічний слайдер розміру"
		>
			<button
				type="button"
				className="side-slider-step-btn"
				onClick={() => onChange(Math.min(100, value + 1))}
				title="Збільшити (+1)"
				aria-label="Збільшити розмір"
			>
				<Plus className="icon" />
			</button>

			<div
				ref={trackRef}
				className="side-slider-track"
				onPointerDown={handleTrackPointerDown}
				onPointerMove={handleTrackPointerMove}
				onPointerUp={handleTrackPointerUp}
				onPointerCancel={handleTrackPointerUp}
			>
				<div className="side-slider-bar" style={{ height: `${fillPercent}%` }} />
				<div className="side-slider-thumb" style={{ bottom: `${fillPercent}%` }} />
			</div>

			<button
				type="button"
				className="side-slider-step-btn"
				onClick={() => onChange(Math.max(1, value - 1))}
				title="Зменшити (-1)"
				aria-label="Зменшити розмір"
			>
				<Minus className="icon" />
			</button>

			{/* Спливаючий бабл з числовим значенням (кружечок прев'ю 1:1 тільки для малювання та гумки) */}
			<div className="side-slider-bubble">
				{showPreviewDot && (
					<div
						className="side-slider-preview-dot"
						style={{
							width: `${previewDiameter}px`,
							height: `${previewDiameter}px`,
							backgroundColor: currentMode === 'eraser' ? '#ffffff' : mainColor,
							borderColor: previewBorder,
							borderWidth: isStamp && !isTransparent ? '2px' : '1px',
							borderStyle: 'solid',
						}}
					/>
				)}
				<span className="side-slider-bubble-text">{value} px</span>
			</div>
		</aside>
	);
};

