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

interface ProjectsHistoryModalProps {
	opened: boolean;
	projects: ProjectItem[];
	onSelectProject: (project: ProjectItem) => void;
	onDeleteProject: (id: string, e: React.MouseEvent) => void;
	onClose: () => void;
}

export const ProjectsHistoryModal: React.FC<ProjectsHistoryModalProps> = ({
	opened,
	projects,
	onSelectProject,
	onDeleteProject,
	onClose,
}) => {
	const formatDate = (timestamp: number) => {
		const d = new Date(timestamp);
		return d.toLocaleString('uk-UA', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

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
					<Badge size="xs" variant="light">
						{projects.length}/50
					</Badge>
				</Group>
			}
			size="sm"
			centered
		>
			<ScrollArea.Autosize mah="65vh" type="hover" scrollbarSize={5} offsetScrollbars>
				{projects.length === 0 ? (
					<Text c="dimmed" size="sm" ta="center" py="xl">
						Немає збережених проектів
					</Text>
				) : (
					<Stack gap="xs">
						{projects.map((item) => (
							<Paper key={item.id} withBorder p="xs" radius="sm">
								<Group justify="space-between" wrap="nowrap">
									<UnstyledButton
										onClick={() => onSelectProject(item)}
										style={{ flex: 1, minWidth: 0 }}
										aria-label={`Відкрити проект ${item.title}`}
									>
										<Group gap="sm" wrap="nowrap">
											<Box
												w={46}
												h={46}
												style={{
													background: 'var(--panel-3)',
													border: '1px solid var(--line)',
													borderRadius: 4,
													overflow: 'hidden',
													flexShrink: 0,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												{item.thumbnail ? (
													<Image
														src={item.thumbnail}
														alt={item.title}
														fit="contain"
														w="100%"
														h="100%"
													/>
												) : (
													<Box w="100%" h="100%" style={{ background: 'var(--panel-3)' }} />
												)}
											</Box>

											<Stack gap={2} style={{ minWidth: 0, overflow: 'hidden' }}>
												<Text size="sm" fw={600} truncate>
													{item.title}
												</Text>
												<Text size="xs" c="dimmed">
													{formatDate(item.updatedAt)} • {item.stamps.length} нот
												</Text>
											</Stack>
										</Group>
									</UnstyledButton>

									<ActionIcon
										color="red"
										variant="subtle"
										size="md"
										onClick={(e) => onDeleteProject(item.id, e)}
										aria-label="Видалити проект"
										title="Видалити проект"
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
};
