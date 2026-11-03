'use client';

import React from 'react';
import { Eraser, Menu, Pencil, Redo2, Stamp, Undo2 } from 'lucide-react';
import { ToolMode } from '@/types/editor';

interface BottomToolbarProps {
	currentMode: ToolMode;
	canUndo: boolean;
	canRedo: boolean;
	onSelectMode: (mode: ToolMode) => void;
	onUndo: () => void;
	onRedo: () => void;
	onToggleMenu: (e: React.MouseEvent) => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
	currentMode,
	canUndo,
	canRedo,
	onSelectMode,
	onUndo,
	onRedo,
	onToggleMenu,
}) => {
	return (
		<div id="toolbar">
			<button
				id="btn-toggle-menu"
				type="button"
				className="tool"
				aria-label="Меню"
				onClick={onToggleMenu}
			>
				<Menu className="icon lg" />
			</button>
			<div className="vsep" />
			<div className="pair">
				<button
					id="btn-undo"
					type="button"
					className="tool"
					disabled={!canUndo}
					aria-label="Скасувати"
					onClick={onUndo}
				>
					<Undo2 className="icon lg" />
				</button>
				<button
					id="btn-redo"
					type="button"
					className="tool"
					disabled={!canRedo}
					aria-label="Повернути"
					onClick={onRedo}
				>
					<Redo2 className="icon lg" />
				</button>
			</div>
			<div className="vsep" />
			<button
				id="btn-pencil"
				type="button"
				className={`tool ${currentMode === 'pencil' ? 'active' : ''}`}
				aria-label="Олівець"
				onClick={() => onSelectMode('pencil')}
			>
				<Pencil className="icon lg" />
			</button>
			<button
				id="btn-stamp"
				type="button"
				className={`tool ${currentMode === 'stamp' ? 'active' : ''}`}
				aria-label="Штамп"
				onClick={() => onSelectMode('stamp')}
			>
				<Stamp className="icon lg" />
			</button>
			<button
				id="btn-eraser"
				type="button"
				className={`tool ${currentMode === 'eraser' ? 'active' : ''}`}
				aria-label="Гумка"
				onClick={() => onSelectMode('eraser')}
			>
				<Eraser className="icon lg" />
			</button>
		</div>
	);
};
