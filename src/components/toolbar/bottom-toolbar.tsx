'use client';

import React from 'react';
import { Eraser, Pencil, Ruler, Stamp } from 'lucide-react';
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
		<div id="toolbar">
			{isVisible('pencil') && (
				<button
					id="btn-pencil"
					type="button"
					className={`tool ${currentMode === 'pencil' ? 'active' : ''}`}
					aria-label="Олівець"
					title="Олівець (малювання)"
					onClick={() => onSelectMode('pencil')}
				>
					<Pencil className="icon lg" />
				</button>
			)}

			{isVisible('stamp') && (
				<button
					id="btn-stamp"
					type="button"
					className={`tool ${currentMode === 'stamp' ? 'active' : ''}`}
					aria-label="Штамп нот"
					title="Штамп (розмітка нот)"
					onClick={() => onSelectMode('stamp')}
				>
					<Stamp className="icon lg" />
				</button>
			)}

			{isVisible('ruler') && (
				<button
					id="btn-ruler"
					type="button"
					className={`tool ${currentMode === 'ruler' ? 'active' : ''}`}
					aria-label="Лінійка"
					title="Лінійка (напрямні лінії)"
					onClick={() => onSelectMode('ruler')}
				>
					<Ruler className="icon lg" />
				</button>
			)}

			{isVisible('eraser') && (
				<button
					id="btn-eraser"
					type="button"
					className={`tool ${currentMode === 'eraser' ? 'active' : ''}`}
					aria-label="Гумка"
					title="Гумка (стирання)"
					onClick={() => onSelectMode('eraser')}
				>
					<Eraser className="icon lg" />
				</button>
			)}
		</div>
	);
};
