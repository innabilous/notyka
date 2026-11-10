'use client';

import React from 'react';
import {
	ActionIcon,
	Badge,
	Box,
	Group,
	Image,
	Modal,
	Paper,
	ScrollArea,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { Clock, Trash2 } from 'lucide-react';
import { ProjectItem } from '@/types/storage';
import classes from './projects-history-modal.module.css';

interface ProjectsHistoryModalProps {
	opened: boolean;
	projects: ProjectItem[];
	onSelectProject: (project: ProjectItem) => void;
	onDeleteProject: (id: string, e: React.MouseEvent) => void;
	onClose: () => void;
}

export function formatDate(timestamp: number): string {
	const d = new Date(timestamp);
	return d.toLocaleString('uk-UA', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function formatElementsCount(count: number): string {
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod100 >= 11 && mod100 <= 14) return `${count} елементів`;
	if (mod10 === 1) return `${count} елемент`;
	if (mod10 >= 2 && mod10 <= 4) return `${count} елементи`;
	return `${count} елементів`;
}

export function ProjectsHistoryModal({
	opened,
	projects,
	onSelectProject,
	onDeleteProject,
	onClose,
}: ProjectsHistoryModalProps) {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap="xs">
					<Clock size={18} />
					<Text fw={600} size="sm">
						Історія проектів
					</Text>
					<Badge size="xs" className={classes.countBadge}>
						{projects.length}/50
					</Badge>
				</Group>
			}
			size="sm"
			centered
		>
			<ScrollArea.Autosize
				className={classes.scrollList}
				type="hover"
				scrollbarSize={5}
				offsetScrollbars
			>
				{projects.length === 0 ? (
					<Text c="dimmed" size="sm" ta="center" py="xl">
						Немає збережених проектів
					</Text>
				) : (
					<Stack gap="xs">
						{projects.map((item) => (
							<Paper key={item.id} p="xs" radius="lg" className={classes.projectCard}>
								<Group justify="space-between" wrap="nowrap">
									<UnstyledButton
										onClick={() => onSelectProject(item)}
										className={classes.cardButton}
										aria-label={`Відкрити проект ${item.title}`}
									>
										<Group gap="sm" wrap="nowrap">
											<Box w={46} h={46} className={classes.thumbnailBox}>
												{item.thumbnail ? (
													<Image
														src={item.thumbnail}
														alt={item.title}
														fit="contain"
														w="100%"
														h="100%"
													/>
												) : (
													<Box
														w="100%"
														h="100%"
														className={classes.thumbnailFallback}
													/>
												)}
											</Box>

											<Stack gap={2} className={classes.cardContent}>
												<Text size="sm" fw={600} truncate>
													{item.title}
												</Text>
												<Text size="xs" c="dimmed">
													{formatDate(item.updatedAt)} •{' '}
													{formatElementsCount(item.stamps.length)}
												</Text>
											</Stack>
										</Group>
									</UnstyledButton>

									<ActionIcon
										variant="subtle"
										size="md"
										onClick={(e) => onDeleteProject(item.id, e)}
										aria-label="Видалити проект"
										title="Видалити проект"
										className={classes.deleteBtn}
									>
										<Trash2 size={16} />
									</ActionIcon>
								</Group>
							</Paper>
						))}
					</Stack>
				)}
			</ScrollArea.Autosize>
		</Modal>
	);
}
