'use client';

import React from 'react';
import { Menu, Redo2, Undo2 } from 'lucide-react';
import { BrushSettings } from '@/components/settings/brush-settings';
import { RulerSettings } from '@/components/settings/ruler-settings';
import { ToolMode } from '@/types/editor';

interface TopToolbarProps {
	canUndo: boolean;
	canRedo: boolean;
	currentMode: ToolMode;
	brushSize: number;
	sizeLocked: boolean;
	mainColor: string;
	strokeColor: string;
	rulersVisible?: boolean;
	rulersAttachContent?: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onToggleMenu: (e: React.MouseEvent) => void;
	onChangeSize: (size: number) => void;
	onToggleLock: (e: React.MouseEvent) => void;
	onTogglePalette: (e: React.MouseEvent) => void;
	onToggleRulersVisible?: () => void;
	onToggleRulersAttachContent?: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
	canUndo,
	canRedo,
	currentMode,
	brushSize,
	sizeLocked,
	mainColor,
	strokeColor,
	rulersVisible = true,
	rulersAttachContent = false,
	onUndo,
	onRedo,
	onToggleMenu,
	onChangeSize,
	onToggleLock,
	onTogglePalette,
	onToggleRulersVisible,
	onToggleRulersAttachContent,
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

			{/* Центр: Панель налаштувань інструменту */}
			<div className="top-center-settings">
				{currentMode === 'ruler' ? (
					<RulerSettings
						visible={rulersVisible}
						attachContent={rulersAttachContent}
						onToggleVisible={() => onToggleRulersVisible?.()}
						onToggleAttachContent={() => onToggleRulersAttachContent?.()}
					/>
				) : (
					<BrushSettings
						currentMode={currentMode}
						brushSize={brushSize}
						sizeLocked={sizeLocked}
						mainColor={mainColor}
						strokeColor={strokeColor}
						onChangeSize={onChangeSize}
						onToggleLock={onToggleLock}
						onTogglePalette={onTogglePalette}
					/>
				)}
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
