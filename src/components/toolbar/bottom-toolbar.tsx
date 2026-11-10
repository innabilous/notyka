'use client';

import React from 'react';
import { Box, UnstyledButton } from '@mantine/core';
import clsx from 'clsx';
import { Eraser, MousePointer, Pencil, Ruler, Stamp } from 'lucide-react';
import { ToolMode } from '@/types/editor';
import classes from './bottom-toolbar.module.css';

interface BottomToolbarProps {
	currentMode: ToolMode;
	visibleTools?: Record<ToolMode, boolean>;
	onSelectMode: (mode: ToolMode) => void;
}

export function BottomToolbar({
	currentMode,
	visibleTools,
	onSelectMode,
}: BottomToolbarProps) {
	function isVisible(tool: ToolMode): boolean {
		return visibleTools?.[tool] ?? true;
	}

	return (
		<Box id="toolbar" className={classes.root}>
			{isVisible('select') && (
				<UnstyledButton
					id="btn-select"
					className={clsx(
						'tool',
						classes.tool,
						currentMode === 'select' && 'active',
						currentMode === 'select' && classes.active,
					)}
					aria-label="Виділення"
					title="Виділення (редагування об'єктів)"
					onClick={() => onSelectMode('select')}
				>
					<MousePointer className="icon lg" />
				</UnstyledButton>
			)}

			{isVisible('pencil') && (
				<UnstyledButton
					id="btn-pencil"
					className={clsx(
						'tool',
						classes.tool,
						currentMode === 'pencil' && 'active',
						currentMode === 'pencil' && classes.active,
					)}
					aria-label="Олівець"
					title="Олівець (малювання)"
					onClick={() => onSelectMode('pencil')}
				>
					<Pencil className="icon lg" />
				</UnstyledButton>
			)}

			{isVisible('stamp') && (
				<UnstyledButton
					id="btn-stamp"
					className={clsx(
						'tool',
						classes.tool,
						currentMode === 'stamp' && 'active',
						currentMode === 'stamp' && classes.active,
					)}
					aria-label="Штамп нот"
					title="Штамп (розмітка нот)"
					onClick={() => onSelectMode('stamp')}
				>
					<Stamp className="icon lg" />
				</UnstyledButton>
			)}

			{isVisible('ruler') && (
				<UnstyledButton
					id="btn-ruler"
					className={clsx(
						'tool',
						classes.tool,
						currentMode === 'ruler' && 'active',
						currentMode === 'ruler' && classes.active,
					)}
					aria-label="Лінійка"
					title="Лінійка (напрямні лінії)"
					onClick={() => onSelectMode('ruler')}
				>
					<Ruler className="icon lg" />
				</UnstyledButton>
			)}

			{isVisible('eraser') && (
				<UnstyledButton
					id="btn-eraser"
					className={clsx(
						'tool',
						classes.tool,
						currentMode === 'eraser' && 'active',
						currentMode === 'eraser' && classes.active,
					)}
					aria-label="Гумка"
					title="Гумка (стирання)"
					onClick={() => onSelectMode('eraser')}
				>
					<Eraser className="icon lg" />
				</UnstyledButton>
			)}
		</Box>
	);
}
