'use client';

import React from 'react';
import { Button, Group, Paper, Stack, Switch, Text } from '@mantine/core';
import { FilePlus, FolderOpen, Save, Share2, Trash2 } from 'lucide-react';

interface ImageMenuModalProps {
	opened: boolean;
	deleteBtnOn: boolean;
	onUploadClick: () => void;
	onNewBlank: () => void;
	onClear: () => void;
	onSave: () => void;
	onShare: () => void;
	onToggleDeleteBtn: () => void;
	onClose: () => void;
}

export const ImageMenuModal: React.FC<ImageMenuModalProps> = ({
	opened,
	deleteBtnOn,
	onUploadClick,
	onNewBlank,
	onClear,
	onSave,
	onShare,
	onToggleDeleteBtn,
}) => {
	if (!opened) return null;

	return (
		<Paper
			shadow="xl"
			p="xs"
			radius="lg"
			style={{
				position: 'absolute',
				bottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))',
				left: '1rem',
				backgroundColor: 'rgba(31, 41, 55, 0.95)',
				backdropFilter: 'blur(12px)',
				border: '1px solid rgba(75, 85, 99, 0.6)',
				minWidth: 220,
				zIndex: 50,
			}}
		>
			<Stack gap={2}>
				<Button
					variant="subtle"
					color="indigo.3"
					justify="flex-start"
					leftSection={<FolderOpen size={18} color="#818cf8" />}
					onClick={onUploadClick}
					styles={{ label: { color: '#ffffff', fontWeight: 500 } }}
				>
					Завантажити
				</Button>

				<Button
					variant="subtle"
					color="indigo.3"
					justify="flex-start"
					leftSection={<FilePlus size={18} color="#a5b4fc" />}
					onClick={onNewBlank}
					styles={{ label: { color: '#ffffff', fontWeight: 500 } }}
				>
					Новий білий аркуш
				</Button>

				<Button
					variant="subtle"
					color="red.4"
					justify="flex-start"
					leftSection={<Trash2 size={18} color="#f87171" />}
					onClick={onClear}
					styles={{ label: { color: '#ffffff', fontWeight: 500 } }}
				>
					Очистити
				</Button>

				<Button
					variant="subtle"
					color="green.4"
					justify="flex-start"
					leftSection={<Save size={18} color="#4ade80" />}
					onClick={onSave}
					styles={{ label: { color: '#ffffff', fontWeight: 500 } }}
				>
					Зберегти
				</Button>

				<Button
					variant="subtle"
					color="cyan.4"
					justify="flex-start"
					leftSection={<Share2 size={18} color="#38bdf8" />}
					onClick={onShare}
					styles={{ label: { color: '#ffffff', fontWeight: 500 } }}
				>
					Поділитися
				</Button>

				<div style={{ height: 1, backgroundColor: 'rgba(55, 65, 81, 0.6)', margin: '4px 0' }} />

				<Group
					justify="space-between"
					px="sm"
					py={6}
					style={{ cursor: 'pointer' }}
					onClick={onToggleDeleteBtn}
				>
					<Group gap="xs">
						<Trash2 size={18} color="#f87171" />
						<Text size="sm" fw={500} c="white">
							Кошик на штампі
						</Text>
					</Group>
					<Switch
						checked={deleteBtnOn}
						onChange={onToggleDeleteBtn}
						color="indigo"
						size="sm"
						styles={{ track: { cursor: 'pointer' } }}
					/>
				</Group>
			</Stack>
		</Paper>
	);
};
