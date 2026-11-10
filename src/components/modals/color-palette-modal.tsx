'use client';

import React from 'react';
import {
	ActionIcon,
	Box,
	ColorSwatch,
	Group,
	Paper,
	SegmentedControl,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { Ban, Check, Pipette } from 'lucide-react';
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

const isLightColor = (color: string): boolean => {
	const c = color.toLowerCase();
	return c === '#ffffff' || c === '#fff200' || c === '#ffff00' || c === '#f59e0b';
};

interface PaletteGridProps {
	selectedColor: string;
	onSelectColor: (color: string) => void;
	showTransparent?: boolean;
	isTransparentSelected?: boolean;
	isTransparentDisabled?: boolean;
	transparentTooltip?: string;
	onSelectTransparent?: () => void;
	ariaPrefix: string;
}

const PaletteGrid: React.FC<PaletteGridProps> = ({
	selectedColor,
	onSelectColor,
	showTransparent = false,
	isTransparentSelected = false,
	isTransparentDisabled = false,
	transparentTooltip = 'Без кольору (прозоро)',
	onSelectTransparent,
	ariaPrefix,
}) => {
	const normSelected = selectedColor.toLowerCase();

	return (
		<Box
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(11, 1fr)',
				gap: 5,
				alignItems: 'center',
				justifyItems: 'center',
				padding: '4px 2px',
			}}
		>
			{PALETTE_COLORS.map((color) => {
				const isSelected = normSelected === color.toLowerCase();
				const isLight = isLightColor(color);

				return (
					<ColorSwatch
						key={`${ariaPrefix}-${color}`}
						component="button"
						type="button"
						color={color}
						size={24}
						radius="xl"
						style={{
							cursor: 'pointer',
							flexShrink: 0,
							border: 'none',
							boxShadow: isSelected
								? '0 0 0 2px var(--panel), 0 0 0 3.5px var(--accent)'
								: 'inset 0 0 0 1px rgba(0, 0, 0, 0.15)',
							transition: 'box-shadow 0.12s ease',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
						onClick={() => onSelectColor(color)}
						aria-label={`Обрати ${ariaPrefix} ${color}`}
					>
						{isSelected && (
							<Check
								size={13}
								strokeWidth={3}
								color={isLight ? '#000000' : '#ffffff'}
								style={{ display: 'block', pointerEvents: 'none' }}
							/>
						)}
					</ColorSwatch>
				);
			})}

			{showTransparent ? (
				<Tooltip label={transparentTooltip}>
					<ActionIcon
						variant="subtle"
						size={24}
						radius="xl"
						style={{
							flexShrink: 0,
							background: 'transparent',
							boxShadow: isTransparentSelected
								? '0 0 0 2px var(--panel), 0 0 0 3.5px #ef4444'
								: 'inset 0 0 0 1px rgba(0, 0, 0, 0.15)',
							transition: 'box-shadow 0.12s ease',
						}}
						disabled={isTransparentDisabled}
						onClick={onSelectTransparent}
						aria-label="Вимкнути колір"
					>
						<Ban
							size={13}
							color="#ef4444"
							strokeWidth={isTransparentSelected ? 2.5 : 2}
						/>
					</ActionIcon>
				</Tooltip>
			) : (
				<Box w={24} h={24} />
			)}
		</Box>
	);
};

interface PipettePickerProps {
	value: string;
	onChange: (color: string) => void;
}

const PipettePicker: React.FC<PipettePickerProps> = ({ value, onChange }) => (
	<Box
		component="label"
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 4,
			cursor: 'pointer',
			color: 'var(--muted)',
			fontSize: '0.75rem',
			opacity: 0.75,
			transition: 'opacity 0.12s ease',
		}}
		onMouseEnter={(e) => {
			e.currentTarget.style.opacity = '1';
		}}
		onMouseLeave={(e) => {
			e.currentTarget.style.opacity = '0.75';
		}}
	>
		<Pipette size={12} strokeWidth={2} />
		<Text size="xs" c="dimmed">
			Свій
		</Text>
		<input
			type="color"
			value={value.startsWith('#') ? value : '#ef4444'}
			onChange={(e) => onChange(e.target.value)}
			style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
		/>
	</Box>
);

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
					: '#ef4444';

		const handleSetArrowColor = (color: string) => {
			onChangeMainColor(color);
			onChangeStrokeColor(color);
		};

		return (
			<Paper
				id="color-palette-popup"
				className="popup"
				p="xs"
				shadow="none"
				radius="lg"
				onClick={(e) => e.stopPropagation()}
			>
				<Stack gap={6}>
					<Group justify="space-between" align="center">
						<Text size="xs" fw={600} c="dimmed">
							Колір стрілки:
						</Text>
						<PipettePicker value={arrowColor} onChange={handleSetArrowColor} />
					</Group>

					<PaletteGrid
						selectedColor={arrowColor}
						onSelectColor={handleSetArrowColor}
						showTransparent={false}
						ariaPrefix="колір стрілки"
					/>
				</Stack>
			</Paper>
		);
	}

	//! Для прямокутника та кола/овалу: може бути і обводка, і заливка, але не обидві прозорі одночасно
	if (isShapes && (selectedShape === 'rect' || selectedShape === 'circle')) {
		const isFillTransparent = mainColor === 'transparent';
		const isStrokeTransparent = strokeColor === 'transparent';

		return (
			<Paper
				id="color-palette-popup"
				className="popup"
				p="xs"
				shadow="none"
				radius="lg"
				onClick={(e) => e.stopPropagation()}
			>
				<Stack gap="xs">
					{/* 1. Заливка фігури */}
					<Stack gap={6}>
						<Group justify="space-between" align="center">
							<Text size="xs" fw={600} c="dimmed">
								Заливка фігури:
							</Text>
							<PipettePicker value={mainColor} onChange={onChangeMainColor} />
						</Group>

						<PaletteGrid
							selectedColor={mainColor}
							onSelectColor={onChangeMainColor}
							showTransparent={true}
							isTransparentSelected={isFillTransparent}
							isTransparentDisabled={isStrokeTransparent}
							transparentTooltip={
								isStrokeTransparent
									? 'Фігура має мати обводку або заливку'
									: 'Без заливки (прозоро)'
							}
							onSelectTransparent={() =>
								!isStrokeTransparent && onChangeMainColor('transparent')
							}
							ariaPrefix="заливка"
						/>
					</Stack>

					{/* 2. Обводка фігури */}
					<Stack gap={6}>
						<Group justify="space-between" align="center">
							<Text size="xs" fw={600} c="dimmed">
								Обводка фігури:
							</Text>
							<PipettePicker value={strokeColor} onChange={onChangeStrokeColor} />
						</Group>

						<PaletteGrid
							selectedColor={strokeColor}
							onSelectColor={onChangeStrokeColor}
							showTransparent={true}
							isTransparentSelected={isStrokeTransparent}
							isTransparentDisabled={isFillTransparent}
							transparentTooltip={
								isFillTransparent
									? 'Фігура має мати обводку або заливку'
									: 'Без обводки (прозоро)'
							}
							onSelectTransparent={() =>
								!isFillTransparent && onChangeStrokeColor('transparent')
							}
							ariaPrefix="обводка"
						/>
					</Stack>
				</Stack>
			</Paper>
		);
	}

	return (
		<Paper
			id="color-palette-popup"
			className="popup"
			p="xs"
			shadow="none"
			radius="lg"
			onClick={(e) => e.stopPropagation()}
		>
			<Stack gap="xs">
				<Stack gap={6}>
					<Group justify="space-between" align="center">
						<Text size="xs" fw={600} c="dimmed">
							{isStamp ? 'Колір штампа:' : 'Колір олівця:'}
						</Text>
						<PipettePicker value={mainColor} onChange={onChangeMainColor} />
					</Group>

					<PaletteGrid
						selectedColor={mainColor}
						onSelectColor={onChangeMainColor}
						showTransparent={false}
						ariaPrefix={isStamp ? 'колір штампа' : 'колір олівця'}
					/>
				</Stack>

				{isStamp && (
					<Stack gap={6}>
						<Group justify="space-between" align="center">
							<Text size="xs" fw={600} c="dimmed">
								{stampBadgeMode ? 'Колір плашки:' : 'Колір обводки:'}
							</Text>
							<PipettePicker value={strokeColor} onChange={onChangeStrokeColor} />
						</Group>

						{/* Перемикач стилю: обводка або суцільна плашка */}
						<SegmentedControl
							fullWidth
							size="xs"
							withItemsBorders={false}
							value={stampBadgeMode ? 'badge' : 'stroke'}
							onChange={(val) => onToggleBadgeMode?.(val === 'badge')}
							data={[
								{ label: 'Обводка', value: 'stroke' },
								{ label: 'Плашка', value: 'badge' },
							]}
						/>

						<PaletteGrid
							selectedColor={strokeColor}
							onSelectColor={onChangeStrokeColor}
							showTransparent={true}
							isTransparentSelected={strokeColor === 'transparent'}
							transparentTooltip="Вимкнути обводку"
							onSelectTransparent={() => onChangeStrokeColor('transparent')}
							ariaPrefix="обводка штампа"
						/>
					</Stack>
				)}
			</Stack>
		</Paper>
	);
};
