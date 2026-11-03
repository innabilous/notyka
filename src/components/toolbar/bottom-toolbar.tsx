'use client';

import React from 'react';
import { ActionIcon, Group } from '@mantine/core';
import { Eraser, Menu, Pencil, Redo2, Stamp, Undo2 } from 'lucide-react';
import { ToolMode } from '@/types/editor';

interface BottomToolbarProps {
	currentMode: ToolMode;
	canUndo: boolean;
	canRedo: boolean;
	onSelectMode: (mode: ToolMode) => void;
	onUndo: () => void;
	onRedo: () => void;
	onToggleMenu: () => void;
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
		<Group justify="space-between" gap="xs" wrap="nowrap" style={{ width: '100%' }}>
			<ActionIcon
				variant="filled"
				color="dark.5"
				size={46}
				radius="md"
				onClick={onToggleMenu}
				aria-label="Меню"
				style={{ flex: 1, height: 46 }}
			>
				<Menu size={22} />
			</ActionIcon>

			<div
				style={{
					width: 1,
					height: 28,
					backgroundColor: 'rgba(55, 65, 81, 0.8)',
					flexShrink: 0,
				}}
			/>

			<Group gap={6} style={{ flex: 2 }} wrap="nowrap">
				<ActionIcon
					variant="filled"
					color="dark.5"
					size={46}
					radius="md"
					disabled={!canUndo}
					onClick={onUndo}
					aria-label="Скасувати"
					style={{ flex: 1, height: 46, opacity: canUndo ? 1 : 0.3 }}
				>
					<Undo2 size={22} />
				</ActionIcon>
				<ActionIcon
					variant="filled"
					color="dark.5"
					size={46}
					radius="md"
					disabled={!canRedo}
					onClick={onRedo}
					aria-label="Повернути"
					style={{ flex: 1, height: 46, opacity: canRedo ? 1 : 0.3 }}
				>
					<Redo2 size={22} />
				</ActionIcon>
			</Group>

			<div
				style={{
					width: 1,
					height: 28,
					backgroundColor: 'rgba(55, 65, 81, 0.8)',
					flexShrink: 0,
				}}
			/>

			<ActionIcon
				variant="filled"
				color={currentMode === 'pencil' ? 'indigo.6' : 'dark.5'}
				size={46}
				radius="md"
				onClick={() => onSelectMode('pencil')}
				aria-label="Олівець"
				style={{ flex: 1, height: 46 }}
			>
				<Pencil size={22} />
			</ActionIcon>

			<ActionIcon
				variant="filled"
				color={currentMode === 'stamp' ? 'indigo.6' : 'dark.5'}
				size={46}
				radius="md"
				onClick={() => onSelectMode('stamp')}
				aria-label="Штамп"
				style={{ flex: 1, height: 46 }}
			>
				<Stamp size={22} />
			</ActionIcon>

			<ActionIcon
				variant="filled"
				color={currentMode === 'eraser' ? 'indigo.6' : 'dark.5'}
				size={46}
				radius="md"
				onClick={() => onSelectMode('eraser')}
				aria-label="Гумка"
				style={{ flex: 1, height: 46 }}
			>
				<Eraser size={22} />
			</ActionIcon>
		</Group>
	);
};
