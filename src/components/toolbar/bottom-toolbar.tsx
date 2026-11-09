'use client';

import React from 'react';
import { Box, UnstyledButton } from '@mantine/core';
import { Eraser, MousePointer, Pencil, Ruler, Stamp } from 'lucide-react';
import { ToolMode } from '@/types/editor';

interface BottomToolbarProps {
	currentMode: ToolMode;
	visibleTools?: Record<ToolMode, boolean>;
	onSelectMode: (mode: ToolMode) => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
	currentMode,
	visibleTools,
	onSelectMode,
}) => {
	const isVisible = (tool: ToolMode) => visibleTools?.[tool] ?? true;

	return (
		<Box id="toolbar">
			{isVisible('select') && (
				<UnstyledButton
					id="btn-select"
					className={`tool ${currentMode === 'select' ? 'active' : ''}`}
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
					className={`tool ${currentMode === 'pencil' ? 'active' : ''}`}
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
					className={`tool ${currentMode === 'stamp' ? 'active' : ''}`}
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
					className={`tool ${currentMode === 'ruler' ? 'active' : ''}`}
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
					className={`tool ${currentMode === 'eraser' ? 'active' : ''}`}
					aria-label="Гумка"
					title="Гумка (стирання)"
					onClick={() => onSelectMode('eraser')}
				>
					<Eraser className="icon lg" />
				</UnstyledButton>
			)}
		</Box>
	);
};
