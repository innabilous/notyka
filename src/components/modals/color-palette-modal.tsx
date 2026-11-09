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
			<Paper
				id="color-palette-popup"
				className="popup"
				p="xs"
				withBorder
				shadow="xl"
				radius="md"
				onClick={(e) => e.stopPropagation()}
			>
				<Stack gap={6}>
					<Group justify="space-between" align="center">
						<Text size="xs" fw={600} c="dimmed">
							Колір стрілки:
						</Text>
						<Box component="label" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.75rem' }}>
							<Pipette size={14} />
							<Text size="xs">Свій</Text>
							<input
								type="color"
								value={arrowColor.startsWith('#') ? arrowColor : '#ed1c24'}
								onChange={(e) => handleSetArrowColor(e.target.value)}
								style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
							/>
						</Box>
					</Group>

					<Group gap={6} wrap="wrap">
						{PALETTE_COLORS.map((color) => {
							const isSelected = arrowColor.toLowerCase() === color.toLowerCase();
							return (
								<ColorSwatch
									key={`arrow-${color}`}
									component="button"
									type="button"
									color={color}
									size={26}
									radius="sm"
									style={{ cursor: 'pointer' }}
									onClick={() => handleSetArrowColor(color)}
									aria-label={`Обрати колір стрілки ${color}`}
								>
									{isSelected && <Check size={14} color="#ffffff" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }} />}
								</ColorSwatch>
							);
						})}
					</Group>
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
				withBorder
				shadow="xl"
				radius="md"
				onClick={(e) => e.stopPropagation()}
			>
				<Stack gap="xs">
					{/* 1. Заливка фігури */}
					<Stack gap={6}>
						<Group justify="space-between" align="center">
							<Text size="xs" fw={600} c="dimmed">
								Заливка фігури:
							</Text>
							<Box component="label" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.75rem' }}>
								<Pipette size={14} />
								<Text size="xs">Свій</Text>
								<input
									type="color"
									value={mainColor.startsWith('#') ? mainColor : '#ed1c24'}
									onChange={(e) => onChangeMainColor(e.target.value)}
									style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
								/>
							</Box>
						</Group>

						<Group gap={6} wrap="wrap">
							{PALETTE_COLORS.map((color) => {
								const isSelected = mainColor.toLowerCase() === color.toLowerCase();
								return (
									<ColorSwatch
										key={`fill-${color}`}
										component="button"
										type="button"
										color={color}
										size={26}
										radius="sm"
										style={{ cursor: 'pointer' }}
										onClick={() => onChangeMainColor(color)}
										aria-label={`Обрати колір заливки ${color}`}
									>
										{isSelected && <Check size={14} color="#ffffff" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }} />}
									</ColorSwatch>
								);
							})}

							<Tooltip
								label={
									isStrokeTransparent
										? 'Фігура має мати обводку або заливку'
										: 'Без заливки (прозоро)'
								}
							>
								<ActionIcon
									variant={isFillTransparent ? 'filled' : 'subtle'}
									color="red"
									size={26}
									radius="sm"
									disabled={isStrokeTransparent}
									onClick={() => !isStrokeTransparent && onChangeMainColor('transparent')}
									aria-label="Вимкнути заливку"
								>
									<Ban size={14} />
								</ActionIcon>
							</Tooltip>
						</Group>
					</Stack>

					{/* 2. Обводка фігури */}
					<Stack gap={6}>
						<Group justify="space-between" align="center">
							<Text size="xs" fw={600} c="dimmed">
								Обводка фігури:
							</Text>
							<Box component="label" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.75rem' }}>
								<Pipette size={14} />
								<Text size="xs">Свій</Text>
								<input
									type="color"
									value={strokeColor.startsWith('#') ? strokeColor : '#ed1c24'}
									onChange={(e) => onChangeStrokeColor(e.target.value)}
									style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
								/>
							</Box>
						</Group>

						<Group gap={6} wrap="wrap">
							{PALETTE_COLORS.map((color) => {
								const isSelected = strokeColor.toLowerCase() === color.toLowerCase();
								return (
									<ColorSwatch
										key={`stroke-${color}`}
										component="button"
										type="button"
										color={color}
										size={26}
										radius="sm"
										style={{ cursor: 'pointer' }}
										onClick={() => onChangeStrokeColor(color)}
										aria-label={`Обрати колір обводки ${color}`}
									>
										{isSelected && <Check size={14} color="#ffffff" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }} />}
									</ColorSwatch>
								);
							})}

							<Tooltip
								label={
									isFillTransparent
										? 'Фігура має мати обводку або заливку'
										: 'Без обводки (прозоро)'
								}
							>
								<ActionIcon
									variant={isStrokeTransparent ? 'filled' : 'subtle'}
									color="red"
									size={26}
									radius="sm"
									disabled={isFillTransparent}
									onClick={() => !isFillTransparent && onChangeStrokeColor('transparent')}
									aria-label="Вимкнути обводку"
								>
									<Ban size={14} />
								</ActionIcon>
							</Tooltip>
						</Group>
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
			withBorder
			shadow="xl"
			radius="md"
			onClick={(e) => e.stopPropagation()}
		>
			<Stack gap="xs">
				<Stack gap={6}>
					<Group justify="space-between" align="center">
						<Text size="xs" fw={600} c="dimmed">
							{isStamp ? 'Колір штампа:' : 'Колір олівця:'}
						</Text>
						<Box component="label" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.75rem' }}>
							<Pipette size={14} />
							<Text size="xs">Свій</Text>
							<input
								type="color"
								value={mainColor.startsWith('#') ? mainColor : '#ff0055'}
								onChange={(e) => onChangeMainColor(e.target.value)}
								style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
							/>
						</Box>
					</Group>

					<Group gap={6} wrap="wrap">
						{PALETTE_COLORS.map((color) => {
							const isSelected = mainColor.toLowerCase() === color.toLowerCase();
							return (
								<ColorSwatch
									key={`fill-${color}`}
									component="button"
									type="button"
									color={color}
									size={26}
									radius="sm"
									style={{ cursor: 'pointer' }}
									onClick={() => onChangeMainColor(color)}
									aria-label={`Обрати колір ${color}`}
								>
									{isSelected && <Check size={14} color="#ffffff" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }} />}
								</ColorSwatch>
							);
						})}
					</Group>
				</Stack>

				{isStamp && (
					<Stack gap={6}>
						<Group justify="space-between" align="center">
							<Text size="xs" fw={600} c="dimmed">
								{stampBadgeMode ? 'Колір плашки:' : 'Колір обводки:'}
							</Text>
							<Box component="label" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.75rem' }}>
								<Pipette size={14} />
								<Text size="xs">Свій</Text>
								<input
									type="color"
									value={strokeColor.startsWith('#') ? strokeColor : '#000000'}
									onChange={(e) => onChangeStrokeColor(e.target.value)}
									style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
								/>
							</Box>
						</Group>

						{/* Перемикач стилю: обводка або суцільна плашка */}
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
						/>

						<Group gap={6} wrap="wrap">
							{PALETTE_COLORS.map((color) => {
								const isSelected = strokeColor.toLowerCase() === color.toLowerCase();
								return (
									<ColorSwatch
										key={`stroke-${color}`}
										component="button"
										type="button"
										color={color}
										size={26}
										radius="sm"
										style={{ cursor: 'pointer' }}
										onClick={() => onChangeStrokeColor(color)}
										aria-label={`Обрати обводку ${color}`}
									>
										{isSelected && <Check size={14} color="#ffffff" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }} />}
									</ColorSwatch>
								);
							})}

							<Tooltip label="Вимкнути обводку">
								<ActionIcon
									variant={strokeColor === 'transparent' ? 'filled' : 'subtle'}
									color="red"
									size={26}
									radius="sm"
									onClick={() => onChangeStrokeColor('transparent')}
									aria-label="Вимкнути обводку"
								>
									<Ban size={14} />
								</ActionIcon>
							</Tooltip>
						</Group>
					</Stack>
				)}
			</Stack>
		</Paper>
	);
};
