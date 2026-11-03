'use client';

import React from 'react';
import { Menu, Redo2, Undo2 } from 'lucide-react';

interface TopToolbarProps {
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onToggleMenu: (e: React.MouseEvent) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
	canUndo,
	canRedo,
	onUndo,
	onRedo,
	onToggleMenu,
}) => {
	return (
		<header id="top-bar">
			{/* Лівий кут: Анду / Реду */}
			<div className="top-action-group">
				<button
					id="btn-undo"
					type="button"
					className="top-btn"
					disabled={!canUndo}
					aria-label="Скасувати дію"
					title="Скасувати (Ctrl+Z)"
					onClick={onUndo}
				>
					<Undo2 className="icon" />
				</button>
				<button
					id="btn-redo"
					type="button"
					className="top-btn"
					disabled={!canRedo}
					aria-label="Повернути дію"
					title="Повернути (Ctrl+Y)"
					onClick={onRedo}
				>
					<Redo2 className="icon" />
				</button>
			</div>

			{/* Правий кут: Кнопка Меню */}
			<div className="top-action-group">
				<button
					id="btn-toggle-menu"
					type="button"
					className="top-btn menu-btn"
					aria-label="Меню опцій та файлів"
					title="Меню"
					onClick={onToggleMenu}
				>
					<Menu className="icon" />
				</button>
			</div>
		</header>
	);
};
