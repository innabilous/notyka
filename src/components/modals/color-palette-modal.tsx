'use client';

import React from 'react';
import { SegmentedControl } from '@mantine/core';
import { Pipette } from 'lucide-react';
import { PALETTE_COLORS } from '@/constants/editor';
import { ShapeType, StampCategory, ToolMode } from '@/types/editor';

interface ColorPaletteModalProps {
	opened: boolean;
	currentMode: ToolMode;
	stampCategory?: StampCategory;
	selectedShape?: ShapeType;
	mainColor: string;
	strokeColor: string;
	stampBadgeMode?: boolean;
	onChangeMainColor: (color: string) => void;
	onChangeStrokeColor: (color: string) => void;
	onToggleBadgeMode?: (isBadge: boolean) => void;
}

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
	opened,
	currentMode,
	stampCategory,
	selectedShape = 'rect',
	mainColor,
	strokeColor,
	stampBadgeMode = false,
	onChangeMainColor,
	onChangeStrokeColor,
	onToggleBadgeMode,
}) => {
	if (!opened) return null;

	const isStamp = currentMode === 'stamp' || currentMode === 'select';
	const isShapes = isStamp && stampCategory === 'shapes';

	//! Для стрілки відображаємо тільки один колір стрілки (без заливок/прозоростей)
	if (isShapes && selectedShape === 'arrow') {
		const arrowColor =
			strokeColor && strokeColor !== 'transparent'
				? strokeColor
				: mainColor && mainColor !== 'transparent'
					? mainColor
					: '#ed1c24';

		const handleSetArrowColor = (color: string) => {
			onChangeMainColor(color);
			onChangeStrokeColor(color);
		};

		return (
			<div id="color-palette-popup" className="popup" onClick={(e) => e.stopPropagation()}>
				<div className="pal-block">
					<div className="pal-head">
						<span id="pal-fill-title">Колір стрілки:</span>
						<label>
							<Pipette className="icon" />
							Свій
							<input
								type="color"
								id="color-picker-fill"
								value={arrowColor.startsWith('#') ? arrowColor : '#ed1c24'}
								onChange={(e) => handleSetArrowColor(e.target.value)}
							/>
						</label>
					</div>
					<div id="palette-row-fill" className="palette-row">
						{PALETTE_COLORS.map((color) => {
							const isSelected = arrowColor.toLowerCase() === color.toLowerCase();
							return (
								<button
									key={`arrow-${color}`}
									type="button"
									className={`swatch ${isSelected ? 'active' : ''}`}
									style={{ backgroundColor: color }}
									onClick={() => handleSetArrowColor(color)}
									aria-label={`Обрати колір стрілки ${color}`}
								/>
							);
						})}
					</div>
				</div>
			</div>
		);
	}

	//! Для прямокутника та кола/овалу: може бути і обводка, і заливка, але не обидві прозорі одночасно
	if (isShapes && (selectedShape === 'rect' || selectedShape === 'circle')) {
		const isFillTransparent = mainColor === 'transparent';
		const isStrokeTransparent = strokeColor === 'transparent';

		return (
			<div id="color-palette-popup" className="popup" onClick={(e) => e.stopPropagation()}>
				{/* 1. Заливка фігури */}
				<div className="pal-block">
					<div className="pal-head">
						<span id="pal-fill-title">Заливка фігури:</span>
						<label>
							<Pipette className="icon" />
							Свій
							<input
								type="color"
								id="color-picker-fill"
								value={mainColor.startsWith('#') ? mainColor : '#ed1c24'}
								onChange={(e) => onChangeMainColor(e.target.value)}
							/>
						</label>
					</div>
					<div id="palette-row-fill" className="palette-row">
						{PALETTE_COLORS.map((color) => {
							const isSelected = mainColor.toLowerCase() === color.toLowerCase();
							return (
								<button
									key={`fill-${color}`}
									type="button"
									className={`swatch ${isSelected ? 'active' : ''}`}
									style={{ backgroundColor: color }}
									onClick={() => onChangeMainColor(color)}
									aria-label={`Обрати колір заливки ${color}`}
								/>
							);
						})}
						<button
							type="button"
							className={`swatch none ${isFillTransparent ? 'active' : ''}`}
							disabled={isStrokeTransparent}
							style={isStrokeTransparent ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}
							onClick={() => {
								if (!isStrokeTransparent) {
									onChangeMainColor('transparent');
								}
							}}
							title={
								isStrokeTransparent
									? 'Фігура має мати обводку або заливку'
									: 'Без заливки (прозоро)'
							}
							aria-label="Вимкнути заливку"
						>
							✕
						</button>
					</div>
				</div>

				{/* 2. Обводка фігури */}
				<div className="pal-block">
					<div className="pal-head">
						<span id="pal-stroke-title">Обводка фігури:</span>
						<label>
							<Pipette className="icon" />
							Свій
							<input
								type="color"
								id="color-picker-stroke"
								value={strokeColor.startsWith('#') ? strokeColor : '#ed1c24'}
								onChange={(e) => onChangeStrokeColor(e.target.value)}
							/>
						</label>
					</div>
					<div id="palette-row-stroke" className="palette-row">
						{PALETTE_COLORS.map((color) => {
							const isSelected = strokeColor.toLowerCase() === color.toLowerCase();
							return (
								<button
									key={`stroke-${color}`}
									type="button"
									className={`swatch ${isSelected ? 'active' : ''}`}
									style={{ backgroundColor: color }}
									onClick={() => onChangeStrokeColor(color)}
									aria-label={`Обрати колір обводки ${color}`}
								/>
							);
						})}
						<button
							type="button"
							className={`swatch none ${isStrokeTransparent ? 'active' : ''}`}
							disabled={isFillTransparent}
							style={isFillTransparent ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}
							onClick={() => {
								if (!isFillTransparent) {
									onChangeStrokeColor('transparent');
								}
							}}
							title={
								isFillTransparent
									? 'Фігура має мати обводку або заливку'
									: 'Без обводки (прозоро)'
							}
							aria-label="Вимкнути обводку"
						>
							✕
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div id="color-palette-popup" className="popup" onClick={(e) => e.stopPropagation()}>
			<div className="pal-block">
				<div className="pal-head">
					<span id="pal-fill-title">{isStamp ? 'Колір штампа:' : 'Колір олівця:'}</span>
					<label>
						<Pipette className="icon" />
						Свій
						<input
							type="color"
							id="color-picker-fill"
							value={mainColor.startsWith('#') ? mainColor : '#ff0055'}
							onChange={(e) => onChangeMainColor(e.target.value)}
						/>
					</label>
				</div>
				<div id="palette-row-fill" className="palette-row">
					{PALETTE_COLORS.map((color) => {
						const isSelected = mainColor.toLowerCase() === color.toLowerCase();
						return (
							<button
								key={`fill-${color}`}
								type="button"
								className={`swatch ${isSelected ? 'active' : ''}`}
								style={{ backgroundColor: color }}
								onClick={() => onChangeMainColor(color)}
								aria-label={`Обрати колір ${color}`}
							/>
						);
					})}
				</div>
			</div>

			{isStamp && (
				<div className="pal-block">
					<div className="pal-head">
						<span>{stampBadgeMode ? 'Колір плашки:' : 'Колір обводки:'}</span>
						<label>
							<Pipette className="icon" />
							Свій
							<input
								type="color"
								id="color-picker-stroke"
								value={strokeColor.startsWith('#') ? strokeColor : '#000000'}
								onChange={(e) => onChangeStrokeColor(e.target.value)}
							/>
						</label>
					</div>

					{/* Перемикач стилю: обводка або суцільна плашка */}
					<div className="pal-badge-mode-toggle" style={{ marginBottom: '0.45rem' }}>
						<SegmentedControl
							fullWidth
							size="xs"
							radius="xl"
							withItemsBorders={false}
							value={stampBadgeMode ? 'badge' : 'stroke'}
							onChange={(val) => onToggleBadgeMode?.(val === 'badge')}
							data={[
								{ label: 'Обводка', value: 'stroke' },
								{ label: 'Плашка', value: 'badge' },
							]}
							classNames={{
								root: 'stamp-segmented-root',
								indicator: 'stamp-segmented-indicator',
								label: 'stamp-segmented-label',
							}}
						/>
					</div>

					<div id="palette-row-stroke" className="palette-row">
						{PALETTE_COLORS.map((color) => {
							const isSelected = strokeColor.toLowerCase() === color.toLowerCase();
							return (
								<button
									key={`stroke-${color}`}
									type="button"
									className={`swatch ${isSelected ? 'active' : ''}`}
									style={{ backgroundColor: color }}
									onClick={() => onChangeStrokeColor(color)}
									aria-label={`Обрати обводку ${color}`}
								/>
							);
						})}
						<button
							type="button"
							className={`swatch none ${strokeColor === 'transparent' ? 'active' : ''}`}
							onClick={() => onChangeStrokeColor('transparent')}
							aria-label="Вимкнути обводку"
						>
							✕
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
