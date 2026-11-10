'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box, Text, UnstyledButton } from '@mantine/core';
import clsx from 'clsx';
import { Minus, Plus } from 'lucide-react';
import { StampCategory, ToolMode } from '@/types/editor.types';
import classes from './side-size-slider.module.css';

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

export function SideSizeSlider({
	value,
	onChange,
	opened,
	onClose,
	currentMode,
	stampCategory,
	canvasScale = 1,
	mainColor = '#ef4444',
	strokeColor = 'transparent',
}: SideSizeSliderProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [isHovered, setIsHovered] = useState<boolean>(false);

	// Close when clicking outside without blocking the pointer event on the canvas
	useEffect(() => {
		if (!opened) return;

		function handlePointerDown(e: PointerEvent) {
			if (!(e.target instanceof Element)) return;
			if (
				containerRef.current?.contains(e.target) ||
				e.target.closest('.btn-size-value') ||
				e.target.closest('.btn-size-step')
			) {
				return;
			}
			onClose();
		}

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

			// Top is 100, bottom is 1
			const relY = Math.max(0, Math.min(trackH, clientY - rect.top));
			const ratio = 1 - relY / trackH;
			const newSize = Math.max(1, Math.min(100, Math.round(ratio * 99 + 1)));
			onChange(newSize);
		},
		[onChange],
	);

	function handleTrackPointerDown(e: React.PointerEvent<HTMLDivElement>) {
		e.preventDefault();
		e.stopPropagation();
		e.currentTarget.setPointerCapture(e.pointerId);
		setIsDragging(true);
		updateSizeFromY(e.clientY);
	}

	function handleTrackPointerMove(e: React.PointerEvent<HTMLDivElement>) {
		if (!isDragging) return;
		e.preventDefault();
		updateSizeFromY(e.clientY);
	}

	function handleTrackPointerUp(e: React.PointerEvent<HTMLDivElement>) {
		if (!isDragging) return;
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			// Pointer capture might have already been released
		}
		setIsDragging(false);
	}

	const fillPercent = Math.max(0, Math.min(100, ((value - 1) / 99) * 100));
	const isStamp = currentMode === 'stamp' || currentMode === 'select';
	const showPreviewDot =
		currentMode === 'pencil' ||
		currentMode === 'eraser' ||
		(currentMode === 'stamp' && stampCategory === 'draw');
	const isTransparent = isStamp && strokeColor === 'transparent';
	const previewBorder = isStamp
		? isTransparent
			? 'var(--line-strong)'
			: strokeColor
		: 'transparent';

	// 1:1 on-screen brush diameter accounting for canvas zoom level
	const basePx =
		currentMode === 'eraser'
			? value * 1.5
			: currentMode === 'stamp' || currentMode === 'select'
				? value * 2
				: value;
	const previewDiameter = Math.max(2, Math.round(basePx * canvasScale));

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.style.setProperty('--slider-fill', `${fillPercent}%`);
		el.style.setProperty('--dot-size', `${previewDiameter}px`);
		el.style.setProperty('--dot-bg', currentMode === 'eraser' ? '#ffffff' : mainColor);
		el.style.setProperty('--dot-border', previewBorder);
		el.style.setProperty('--dot-border-width', isStamp && !isTransparent ? '2px' : '1px');
	}, [
		currentMode,
		fillPercent,
		isStamp,
		isTransparent,
		mainColor,
		 opened,
		previewBorder,
		previewDiameter,
	]);

	if (!opened || currentMode === 'ruler') {
		return null;
	}

	return (
		<Box
			component="aside"
			ref={containerRef}
			id="side-size-slider"
			className={clsx('floating', (isDragging || isHovered) && 'active')}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			aria-label="Бічний слайдер розміру"
		>
			<UnstyledButton
				className="side-slider-step-btn"
				onClick={() => onChange(Math.min(100, value + 1))}
				title="Збільшити (+1)"
				aria-label="Збільшити розмір"
			>
				<Plus className="icon" />
			</UnstyledButton>

			<Box
				ref={trackRef}
				className="side-slider-track"
				onPointerDown={handleTrackPointerDown}
				onPointerMove={handleTrackPointerMove}
				onPointerUp={handleTrackPointerUp}
				onPointerCancel={handleTrackPointerUp}
			>
				<Box className={clsx('side-slider-bar', classes.bar)} />
				<Box className={clsx('side-slider-thumb', classes.thumb)} />
			</Box>

			<UnstyledButton
				className="side-slider-step-btn"
				onClick={() => onChange(Math.max(1, value - 1))}
				title="Зменшити (-1)"
				aria-label="Зменшити розмір"
			>
				<Minus className="icon" />
			</UnstyledButton>

			{/* Floating size readout bubble */}
			<Box className="side-slider-bubble">
				{showPreviewDot && (
					<Box className={clsx('side-slider-preview-dot', classes.previewDot)} />
				)}
				<Text component="span" className="side-slider-bubble-text">
					{value} px
				</Text>
			</Box>
		</Box>
	);
}
