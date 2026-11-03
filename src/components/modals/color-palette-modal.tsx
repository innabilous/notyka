'use client';

import React from 'react';
import { Pipette } from 'lucide-react';
import { PALETTE_COLORS } from '@/constants/editor';
import { ToolMode } from '@/types/editor';

interface ColorPaletteModalProps {
	opened: boolean;
	currentMode: ToolMode;
	mainColor: string;
	strokeColor: string;
	onChangeMainColor: (color: string) => void;
	onChangeStrokeColor: (color: string) => void;
}

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
	opened,
	currentMode,
	mainColor,
	strokeColor,
	onChangeMainColor,
	onChangeStrokeColor,
}) => {
	if (!opened) return null;

	const isStamp = currentMode === 'stamp';

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
						<span>Колір обводки:</span>
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
