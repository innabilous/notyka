'use client';

import React, { useState } from 'react';
import {
	Button,
	Center,
	Divider,
	Group,
	Modal,
	Paper,
	ScrollArea,
	SegmentedControl,
	Stack,
	Switch,
	Text,
	UnstyledButton,
	useComputedColorScheme,
	useMantineColorScheme,
} from '@mantine/core';
import {
	Eraser,
	Layers,
	ListOrdered,
	Maximize2,
	Monitor,
	Moon,
	MousePointer,
	Music,
	Pencil,
	PenTool,
	Plus,
	RotateCcw,
	Ruler,
	Settings,
	Shapes,
	Stamp,
	Sun,
	Trash2,
	Type,
} from 'lucide-react';
import { useAppearance } from '@/theme/app-theme-provider';
import { ACCENT_SKIN_METADATA, ACCENT_SKIN_ORDER } from '@/theme/theme';
import {
	StampCategory,
	ToolMode,
	isAccentSkin,
	isDarkSurfaceTone,
	isLightSurfaceTone,
} from '@/types/editor.types';
import classes from './settings-modal.module.css';

function isColorSchemeMode(val: string): val is 'dark' | 'light' | 'auto' {
	return val === 'dark' || val === 'light' || val === 'auto';
}

interface SettingsModalProps {
	opened: boolean;
	visibleTools: Record<ToolMode, boolean>;
	visibleStampCategories: Record<StampCategory, boolean>;
	deleteBtnOn: boolean;
	resizeHandlesOn: boolean;
	compactRulers?: boolean;
	onToggleTool: (tool: ToolMode) => void;
	onToggleStampCategory: (category: StampCategory) => void;
	onToggleDeleteBtn: () => void;
	onToggleResizeHandles: () => void;
	onToggleCompactRulers?: () => void;
	onResetSettings: () => void;
	onClearAllData: () => void;
	onClose: () => void;
}

const TOOLS_CONFIG: {
	id: ToolMode;
	label: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
	{ id: 'select', label: 'Виділення', icon: MousePointer },
	{ id: 'pencil', label: 'Олівець', icon: Pencil },
	{ id: 'stamp', label: 'Штамп', icon: Stamp },
	{ id: 'ruler', label: 'Лінійка', icon: Ruler },
	{ id: 'eraser', label: 'Гумка', icon: Eraser },
];

const CATEGORIES_CONFIG: {
	id: StampCategory;
	label: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
	{ id: 'notes', label: 'Ноти', icon: Music },
	{ id: 'chords', label: 'Акорди', icon: Layers },
	{ id: 'count', label: 'Рахунок', icon: ListOrdered },
	{ id: 'custom', label: 'Власні', icon: Plus },
	{ id: 'text', label: 'Текст', icon: Type },
	{ id: 'draw', label: 'Малюнок', icon: PenTool },
	{ id: 'shapes', label: 'Фігури', icon: Shapes },
];

export function SettingsModal({
	opened,
	visibleTools,
	visibleStampCategories,
	deleteBtnOn,
	resizeHandlesOn,
	compactRulers = false,
	onToggleTool,
	onToggleStampCategory,
	onToggleDeleteBtn,
	onToggleResizeHandles,
	onToggleCompactRulers,
	onResetSettings,
	onClearAllData,
	onClose,
}: SettingsModalProps) {
	const { colorScheme, setColorScheme } = useMantineColorScheme({ keepTransitions: true });
	const computedColorScheme = useComputedColorScheme('dark');
	const { config, setAccentSkin, setDarkTone, setLightTone, resetAppearance } = useAppearance();
	const [confirmModal, setConfirmModal] = useState<'settings' | 'all' | null>(null);

	return (
		<>
			<Modal
				opened={opened}
				onClose={onClose}
				title={
					<Group gap="xs">
						<Settings size={20} />
						<Text fw={600} size="md">
							Налаштування
						</Text>
					</Group>
				}
				size="sm"
				centered
			>
				<ScrollArea.Autosize className={classes.scrollArea} type="hover" scrollbarSize={4}>
					<Stack gap="md" py="xs">
						{/* Appearance theme */}
						<Stack gap="xs">
							<Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">
								Тема оформлення
							</Text>
							<SegmentedControl
								fullWidth
								size="xs"
								value={colorScheme}
								onChange={(val) => {
									if (isColorSchemeMode(val)) setColorScheme(val);
								}}
								data={[
									{
										value: 'auto',
										label: (
											<Center className={classes.segmentLabelContent}>
												<Monitor size={14} />
												<span>Системна</span>
											</Center>
										),
									},
									{
										value: 'dark',
										label: (
											<Center className={classes.segmentLabelContent}>
												<Moon size={14} />
												<span>Темна</span>
											</Center>
										),
									},
									{
										value: 'light',
										label: (
											<Center className={classes.segmentLabelContent}>
												<Sun size={14} />
												<span>Світла</span>
											</Center>
										),
									},
								]}
							/>

							{/* Surface tone */}
							<Stack gap={4} mt={4}>
								<Text size="xs" c="dimmed">
									Тон поверхні (
									{computedColorScheme === 'dark' ? 'темний' : 'світлий'})
								</Text>
								{computedColorScheme === 'dark' ? (
									<SegmentedControl
										fullWidth
										size="xs"
										value={config.darkTone}
										onChange={(val) => {
											if (isDarkSurfaceTone(val)) setDarkTone(val);
										}}
										classNames={{
											root: classes.compactSegmentRoot,
											label: classes.compactSegmentLabel,
										}}
										data={[
											{ value: 'oled', label: 'Pure OLED' },
											{ value: 'obsidian', label: 'Obsidian' },
											{ value: 'carbon', label: 'Carbon' },
											{ value: 'tinted', label: 'Tinted' },
										]}
									/>
								) : (
									<SegmentedControl
										fullWidth
										size="xs"
										value={config.lightTone}
										onChange={(val) => {
											if (isLightSurfaceTone(val)) setLightTone(val);
										}}
										classNames={{
											root: classes.compactSegmentRoot,
											label: classes.compactSegmentLabel,
										}}
										data={[
											{ value: 'pure', label: 'Pure White' },
											{ value: 'anodized', label: 'Anodized' },
											{ value: 'cotton', label: 'Cotton' },
											{ value: 'tinted', label: 'Tinted' },
										]}
									/>
								)}
							</Stack>

							{/* Accent skin */}
							<Stack gap={4} mt={4}>
								<Text size="xs" c="dimmed">
									Акцентний скін
								</Text>
								<SegmentedControl
									fullWidth
									size="xs"
									value={config.accentSkin}
									onChange={(val) => {
										if (isAccentSkin(val)) setAccentSkin(val);
									}}
									classNames={{
										root: classes.compactSegmentRoot,
										label: classes.skinSegmentLabel,
									}}
									data={ACCENT_SKIN_ORDER.map((skinId) => {
										const meta = ACCENT_SKIN_METADATA[skinId];
										return {
											value: skinId,
											label: (
												<Stack
													gap={3}
													align="center"
													justify="center"
													className={classes.skinOptionStack}
												>
													<div
														className={classes.skinDot}
														data-skin={skinId}
													/>
													<span className={classes.skinLabelText}>
														{meta.shortLabel}
													</span>
												</Stack>
											),
										};
									})}
								/>
							</Stack>
						</Stack>

						<Divider />

						{/* Group 1: Tools */}
						<Stack gap="xs">
							<Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">
								Інструменти
							</Text>
							<Stack gap="xs">
								{TOOLS_CONFIG.map(({ id, label, icon: Icon }) => {
									const isChecked = visibleTools[id] ?? true;
									return (
										<Paper
											key={id}
											p="xs"
											radius="lg"
											className={classes.rowCard}
										>
											<UnstyledButton
												onClick={() => onToggleTool(id)}
												className={classes.rowButton}
												aria-label={`Перемкнути інструмент ${label}`}
											>
												<Group
													justify="space-between"
													align="center"
													wrap="nowrap"
													className={classes.rowGroup}
												>
													<Group gap="sm" align="center" wrap="nowrap">
														<Icon
															size={18}
															className={classes.rowIcon}
														/>
														<Text size="sm" fw={500}>
															{label}
														</Text>
													</Group>
													<Switch
														checked={isChecked}
														onChange={() => onToggleTool(id)}
														size="sm"
														className={classes.rowSwitch}
														aria-label={label}
													/>
												</Group>
											</UnstyledButton>
										</Paper>
									);
								})}
							</Stack>
						</Stack>

						<Divider />

						{/* Group 2: Stamp categories */}
						<Stack gap="xs">
							<Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">
								Розділи штампу
							</Text>
							<Stack gap="xs">
								{CATEGORIES_CONFIG.map(({ id, label, icon: Icon }) => {
									const isChecked = visibleStampCategories[id] ?? true;
									return (
										<Paper
											key={id}
											p="xs"
											radius="lg"
											className={classes.rowCard}
										>
											<UnstyledButton
												onClick={() => onToggleStampCategory(id)}
												className={classes.rowButton}
												aria-label={`Перемкнути категорію ${label}`}
											>
												<Group
													justify="space-between"
													align="center"
													wrap="nowrap"
													className={classes.rowGroup}
												>
													<Group gap="sm" align="center" wrap="nowrap">
														<Icon
															size={18}
															className={classes.rowIcon}
														/>
														<Text size="sm" fw={500}>
															{label}
														</Text>
													</Group>
													<Switch
														checked={isChecked}
														onChange={() => onToggleStampCategory(id)}
														size="sm"
														className={classes.rowSwitch}
														aria-label={label}
													/>
												</Group>
											</UnstyledButton>
										</Paper>
									);
								})}
							</Stack>
						</Stack>

						<Divider />

						{/* Group 3: Canvas stamp controls */}
						<Stack gap="xs">
							<Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">
								Штамп на полотні
							</Text>
							<Stack gap="xs">
								<Paper p="xs" radius="lg" className={classes.rowCard}>
									<UnstyledButton
										onClick={onToggleDeleteBtn}
										className={classes.rowButton}
										aria-label="Кошик на штампі"
									>
										<Group
											justify="space-between"
											align="center"
											wrap="nowrap"
											className={classes.rowGroup}
										>
											<Group gap="sm" align="center" wrap="nowrap">
												<Trash2 size={18} className={classes.rowIcon} />
												<Text size="sm" fw={500}>
													Кошик на штампі
												</Text>
											</Group>
											<Switch
												checked={deleteBtnOn}
												onChange={onToggleDeleteBtn}
												size="sm"
												className={classes.rowSwitch}
												aria-label="Кошик на штампі"
											/>
										</Group>
									</UnstyledButton>
								</Paper>

								<Paper p="xs" radius="lg" className={classes.rowCard}>
									<UnstyledButton
										onClick={onToggleResizeHandles}
										className={classes.rowButton}
										aria-label="Хендли розміру на рамці"
									>
										<Group
											justify="space-between"
											align="center"
											wrap="nowrap"
											className={classes.rowGroup}
										>
											<Group gap="sm" align="center" wrap="nowrap">
												<Maximize2 size={18} className={classes.rowIcon} />
												<Text size="sm" fw={500}>
													Хендли розміру на рамці
												</Text>
											</Group>
											<Switch
												checked={resizeHandlesOn}
												onChange={onToggleResizeHandles}
												size="sm"
												className={classes.rowSwitch}
												aria-label="Хендли розміру на рамці"
											/>
										</Group>
									</UnstyledButton>
								</Paper>
							</Stack>
						</Stack>

						<Divider />

						{/* Group 4: Ruler toolbar layout */}
						<Stack gap="xs">
							<Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">
								Панель лінійок
							</Text>
							<Paper p="xs" radius="lg" className={classes.rowCard}>
								<UnstyledButton
									onClick={onToggleCompactRulers}
									className={classes.rowButton}
									aria-label="Компактний вигляд у топбарі"
								>
									<Group
										justify="space-between"
										align="center"
										wrap="nowrap"
										className={classes.rowGroup}
									>
										<Group gap="sm" align="center" wrap="nowrap">
											<Ruler size={18} className={classes.rowIcon} />
											<Stack gap={2}>
												<Text size="sm" fw={500}>
													Компактний вигляд у топбарі
												</Text>
												<Text size="xs" c="dimmed">
													{compactRulers
														? 'Усі кнопки лінійок розташовані зверху в один рядок'
														: 'Основний вигляд: панель у 2 колонки над футером'}
												</Text>
											</Stack>
										</Group>
										<Switch
											checked={compactRulers}
											onChange={onToggleCompactRulers}
											size="sm"
											className={classes.rowSwitch}
											aria-label="Компактний вигляд у топбарі"
										/>
									</Group>
								</UnstyledButton>
							</Paper>
						</Stack>

						<Divider />

						{/* Group 5: Danger zone */}
						<Stack gap="xs" pt="xs">
							<Text size="xs" fw={700} c="red" tt="uppercase" lts="0.05em">
								Небезпечна зона
							</Text>
							<Paper p="xs" radius="lg" className={classes.dangerCard}>
								<Stack gap="xs">
									<Button
										variant="light"
										color="red"
										leftSection={<RotateCcw size={16} />}
										onClick={() => setConfirmModal('settings')}
										fullWidth
									>
										Скинути налаштування
									</Button>

									<Button
										variant="filled"
										color="red"
										leftSection={<Trash2 size={16} />}
										onClick={() => setConfirmModal('all')}
										fullWidth
									>
										Очистити всі дані
									</Button>
								</Stack>
							</Paper>
						</Stack>
					</Stack>
				</ScrollArea.Autosize>
			</Modal>

			{/* Confirmation dialog */}
			<Modal
				opened={!!confirmModal}
				onClose={() => setConfirmModal(null)}
				title={
					<Text fw={600} size="md">
						{confirmModal === 'settings'
							? 'Скинути налаштування?'
							: 'Очистити всі дані?'}
					</Text>
				}
				size="xs"
				centered
			>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						{confirmModal === 'settings'
							? 'Усі налаштування інструментів та штампів повернуться до початкових. Малюнок на полотні збережеться.'
							: 'Буде повністю видалено історію проектів, сесію та налаштування. Додаток повернеться до початкового стану.'}
					</Text>
					<Group justify="flex-end" gap="xs">
						<Button variant="default" size="xs" onClick={() => setConfirmModal(null)}>
							Відміна
						</Button>
						<Button
							color="red"
							size="xs"
							onClick={() => {
								const action = confirmModal;
								setConfirmModal(null);
								if (action === 'settings') {
									onResetSettings();
									resetAppearance();
									setColorScheme('auto');
								} else {
									onClearAllData();
									resetAppearance();
									setColorScheme('auto');
								}
							}}
						>
							Так
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
}
