'use client';

import React from 'react';
import { Box, Group, UnstyledButton } from '@mantine/core';
import { Menu, Redo2, Trash2, Undo2 } from 'lucide-react';
import { BrushSettings } from '@/components/settings/brush-settings';
import { RulerSettings } from '@/components/settings/ruler-settings';
import { SelectSettings } from '@/components/settings/select-settings';
import { SelectionMode, SelectionShape, StampCategory, ToolMode } from '@/types/editor';

interface TopToolbarProps {
	canUndo: boolean;
	canRedo: boolean;
	currentMode: ToolMode;
	stampCategory?: StampCategory;
	brushSize: number;
	sizeLocked: boolean;
	mainColor: string;
	strokeColor: string;
	isSideSliderOpen?: boolean;
	compactRulers?: boolean;
	areaSelectEnabled?: boolean;
	selectionShape?: SelectionShape;
	selectionMode?: SelectionMode;
	selectedCount?: number;
	rulersVisible?: boolean;
	rulersSnap?: boolean;
	rulersSnapItems?: boolean;
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
	onToggleSideSlider?: () => void;
	onToggleAreaSelect?: () => void;
	onChangeSelectionShape?: (shape: SelectionShape) => void;
	onChangeSelectionMode?: (mode: SelectionMode) => void;
	onDeleteSelected?: () => void;
	onClearSelection?: () => void;
	onToggleRulersVisible?: () => void;
	onToggleRulersSnap?: () => void;
	onToggleRulersSnapItems?: () => void;
	onToggleRulersAttachContent?: () => void;
	onToggleRulersShowDistance?: () => void;
	onToggleRulersLockEqualDistance?: () => void;
	onClearRulers?: () => void;
	onSyncCategorySizes?: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
	canUndo,
	canRedo,
	currentMode,
	stampCategory,
	brushSize,
	sizeLocked,
	mainColor,
	strokeColor,
	isSideSliderOpen,
	compactRulers = false,
	areaSelectEnabled = false,
	selectionShape = 'rect',
	selectionMode = 'inside',
	selectedCount = 0,
	rulersVisible = true,
	rulersSnap = true,
	rulersSnapItems = true,
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
	onToggleSideSlider,
	onToggleAreaSelect,
	onChangeSelectionShape,
	onChangeSelectionMode,
	onDeleteSelected,
	onClearSelection,
	onSyncCategorySizes,
	onToggleRulersVisible,
	onToggleRulersSnap,
	onToggleRulersSnapItems,
	onToggleRulersAttachContent,
	onToggleRulersShowDistance,
	onToggleRulersLockEqualDistance,
	onClearRulers,
}) => {
	return (
		<Box component="header" id="top-bar">
			{/* Лівий кут: Анду / Реду */}
			<Group gap={4} className="top-action-group">
				<UnstyledButton
					id="btn-undo"
					className="top-btn"
					disabled={!canUndo}
					aria-label="Скасувати дію"
					title="Скасувати (Ctrl+Z)"
					onClick={onUndo}
				>
					<Undo2 className="icon" />
				</UnstyledButton>
				<UnstyledButton
					id="btn-redo"
					className="top-btn"
					disabled={!canRedo}
					aria-label="Повернути дію"
					title="Повернути (Ctrl+Y)"
					onClick={onRedo}
				>
					<Redo2 className="icon" />
				</UnstyledButton>
			</Group>

			{/* Центр: Панель налаштувань інструменту */}
			<Box className="top-center-settings">
				{currentMode === 'ruler' ? (
					compactRulers ? (
						<RulerSettings
							compact
							visible={rulersVisible}
							snap={rulersSnap}
							snapItems={rulersSnapItems}
							attachContent={rulersAttachContent}
							showDistance={rulersShowDistance}
							lockEqualDistance={rulersLockEqualDistance}
							rulersCount={rulersCount}
							onToggleVisible={() => onToggleRulersVisible?.()}
							onToggleSnap={() => onToggleRulersSnap?.()}
							onToggleSnapItems={() => onToggleRulersSnapItems?.()}
							onToggleAttachContent={() => onToggleRulersAttachContent?.()}
							onToggleShowDistance={() => onToggleRulersShowDistance?.()}
							onToggleLockEqualDistance={() => onToggleRulersLockEqualDistance?.()}
							onClearRulers={onClearRulers}
						/>
					) : (
						<Box id="ruler-top-bar-action">
							<UnstyledButton
								className="btn-clear-rulers"
								onClick={onClearRulers}
								disabled={!rulersCount || rulersCount === 0}
								title="Очистити всі лінійки"
								aria-label="Очистити всі лінійки"
							>
								<Trash2 className="icon" />
								<span>Очистити всі лінійки{rulersCount && rulersCount > 0 ? ` (${rulersCount})` : ''}</span>
							</UnstyledButton>
						</Box>
					)
				) : currentMode === 'select' ? (
					<SelectSettings
						areaSelectEnabled={areaSelectEnabled}
						selectionShape={selectionShape}
						selectionMode={selectionMode}
						selectedCount={selectedCount}
						onToggleAreaSelect={() => onToggleAreaSelect?.()}
						onChangeShape={(s) => onChangeSelectionShape?.(s)}
						onChangeMode={(m) => onChangeSelectionMode?.(m)}
						onDeleteSelected={() => onDeleteSelected?.()}
						onClearSelection={() => onClearSelection?.()}
					/>
				) : (
					<BrushSettings
						currentMode={currentMode}
						stampCategory={stampCategory}
						brushSize={brushSize}
						sizeLocked={sizeLocked}
						mainColor={mainColor}
						strokeColor={strokeColor}
						isSideSliderOpen={isSideSliderOpen}
						onChangeSize={onChangeSize}
						onToggleLock={onToggleLock}
						onTogglePalette={onTogglePalette}
						onToggleSideSlider={onToggleSideSlider}
						onSyncCategorySizes={onSyncCategorySizes}
					/>
				)}
			</Box>

			{/* Правий кут: Кнопка Меню */}
			<Group gap={4} className="top-action-group">
				<UnstyledButton
					id="btn-toggle-menu"
					className="top-btn menu-btn"
					aria-label="Меню опцій та файлів"
					title="Меню"
					onClick={onToggleMenu}
				>
					<Menu className="icon" />
				</UnstyledButton>
			</Group>
		</Box>
	);
};
