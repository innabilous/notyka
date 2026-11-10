'use client';

import React from 'react';
import { Box, Divider, NavLink, Paper, ScrollArea, Stack } from '@mantine/core';
import clsx from 'clsx';
import {
	Clock,
	Download,
	FilePlus,
	ImagePlus,
	RotateCcw,
	Settings,
	Share2,
} from 'lucide-react';
import classes from './image-menu-modal.module.css';

interface ImageMenuModalProps {
	opened: boolean;
	onClose?: () => void;
	onUploadClick: () => void;
	onNewBlank: () => void;
	onOpenHistory: () => void;
	onOpenSettings: () => void;
	onClear: () => void;
	onSave: () => void;
	onShare: () => void;
}

export function ImageMenuModal({
	opened,
	onClose,
	onUploadClick,
	onNewBlank,
	onOpenHistory,
	onOpenSettings,
	onClear,
	onSave,
	onShare,
}: ImageMenuModalProps) {
	if (!opened) return null;

	function handleBackdropClick(e: React.MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		onClose?.();
	}

	return (
		<>
			{/* Backdrop blocking canvas/stamp pointer events and closing menu on outside click */}
			<Box
				className="menu-backdrop"
				onClick={handleBackdropClick}
				onMouseDown={(e) => e.stopPropagation()}
				onPointerDown={(e) => e.stopPropagation()}
			/>

			<Paper
				id="image-menu"
				className={clsx('popup', classes.menuPaper)}
				shadow="none"
				radius="lg"
				onClick={(e) => e.stopPropagation()}
				onMouseDown={(e) => e.stopPropagation()}
			>
				<ScrollArea.Autosize
					className={classes.scrollArea}
					type="hover"
					scrollbars="y"
					scrollbarSize={5}
					offsetScrollbars
				>
					<Stack gap={2}>
						{/* Group 1: Canvas actions */}
						<NavLink
							leftSection={<ImagePlus size={16} />}
							label="Відкрити фото"
							onClick={onUploadClick}
						/>

						<NavLink
							leftSection={<FilePlus size={16} />}
							label="Новий білий аркуш"
							onClick={onNewBlank}
						/>

						<NavLink
							leftSection={<Clock size={16} />}
							label="Історія проектів"
							onClick={onOpenHistory}
						/>

						<Divider my={4} />

						{/* Group 2: Export */}
						<NavLink
							leftSection={<Download size={16} />}
							label="Зберегти фото"
							onClick={onSave}
						/>

						<NavLink
							leftSection={<Share2 size={16} />}
							label="Поділитися"
							onClick={onShare}
						/>

						<Divider my={4} />

						{/* Group 3: Settings & Clear */}
						<NavLink
							leftSection={<Settings size={16} />}
							label="Налаштування"
							onClick={(e) => {
								e.stopPropagation();
								onOpenSettings();
							}}
						/>

						<NavLink
							leftSection={<RotateCcw size={16} />}
							label="Очистити аркуш"
							color="red"
							onClick={onClear}
						/>
					</Stack>
				</ScrollArea.Autosize>
			</Paper>
		</>
	);
}
