'use client';

import React from 'react';
import { Box, Divider, NavLink, Paper, ScrollArea, Stack } from '@mantine/core';
import {
	Clock,
	Download,
	FilePlus,
	ImagePlus,
	RotateCcw,
	Settings,
	Share2,
} from 'lucide-react';

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

export const ImageMenuModal: React.FC<ImageMenuModalProps> = ({
	opened,
	onClose,
	onUploadClick,
	onNewBlank,
	onOpenHistory,
	onOpenSettings,
	onClear,
	onSave,
	onShare,
}) => {
	if (!opened) return null;

	const handleBackdropClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onClose?.();
	};

	return (
		<>
			{/* Бекдроп для блокування взаємодії з полотном/штампами та закриття меню при кліку повз */}
			<Box
				className="menu-backdrop"
				onClick={handleBackdropClick}
				onMouseDown={(e) => e.stopPropagation()}
				onPointerDown={(e) => e.stopPropagation()}
			/>

			<Paper
				id="image-menu"
				className="popup"
				p={6}
				shadow="xl"
				radius="lg"
				onClick={(e) => e.stopPropagation()}
				onMouseDown={(e) => e.stopPropagation()}
			>
				<ScrollArea.Autosize mah="calc(100dvh - 5rem)" type="hover" scrollbars="y" scrollbarSize={5} offsetScrollbars>
					<Stack gap={2}>
						{/* Група 1: Робота з полотном */}
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

						{/* Група 2: Експорт */}
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

						{/* Група 3: Опції та очищення */}
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
};
