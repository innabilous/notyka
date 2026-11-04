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
	rulersSnap?: boolean;
	rulersAttachContent?: boolean;
	rulersShowDistance?: boolean;
	rulersLockEqualDistance?: boolean;
	rulersCount?: number;
	onUndo: () => void;
	onRedo: () => void;
	onToggleMenu: (e: React.MouseEvent) => void;
	onChangeSize: (size: number) => void;
	onToggleLock: (e: React.MouseEvent) => void;
	onTogglePalette: (e: React.MouseEvent) => void;
	onToggleRulersVisible?: () => void;
	onToggleRulersSnap?: () => void;
	onToggleRulersAttachContent?: () => void;
	onToggleShowDistance?: () => void;
	onToggleRulersShowDistance?: () => void;
	onToggleRulersLockEqualDistance?: () => void;
	onClearRulers?: () => void;
	onSyncCategorySizes?: () => void;
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
	rulersSnap = true,
	rulersAttachContent = false,
	rulersShowDistance = false,
	rulersLockEqualDistance = false,
	rulersCount = 0,
	onUndo,
	onRedo,
	onToggleMenu,
	onChangeSize,
	onToggleLock,
	onTogglePalette,
	onSyncCategorySizes,
	onToggleRulersVisible,
	onToggleRulersSnap,
	onToggleRulersAttachContent,
	onToggleRulersShowDistance,
	onToggleRulersLockEqualDistance,
	onClearRulers,
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
						snap={rulersSnap}
						attachContent={rulersAttachContent}
						showDistance={rulersShowDistance}
						lockEqualDistance={rulersLockEqualDistance}
						rulersCount={rulersCount}
						onToggleVisible={() => onToggleRulersVisible?.()}
						onToggleSnap={() => onToggleRulersSnap?.()}
						onToggleAttachContent={() => onToggleRulersAttachContent?.()}
						onToggleShowDistance={() => onToggleRulersShowDistance?.()}
						onToggleLockEqualDistance={() => onToggleRulersLockEqualDistance?.()}
						onClearRulers={() => onClearRulers?.()}
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
						onSyncCategorySizes={onSyncCategorySizes}
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
