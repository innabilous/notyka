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
import { DEFAULT_APPEARANCE_CONFIG } from '@/theme/theme';
import {
	AccentSkin,
	DarkSurfaceTone,
	LightSurfaceTone,
	StampCategory,
	ToolMode,
} from '@/types/editor';

const ACCENT_SKINS: { id: AccentSkin; label: string; hex: string }[] = [
	{ id: 'orange', label: 'Orange', hex: '#ff5500' },
	{ id: 'cobalt', label: 'Cobalt', hex: '#2563eb' },
	{ id: 'lime', label: 'Lime', hex: '#84cc16' },
	{ id: 'amber', label: 'Amber', hex: '#f59e0b' },
];

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

const TOOLS_CONFIG: { id: ToolMode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
	{ id: 'select', label: 'Виділення', icon: MousePointer },
	{ id: 'pencil', label: 'Олівець', icon: Pencil },
	{ id: 'stamp', label: 'Штамп', icon: Stamp },
	{ id: 'ruler', label: 'Лінійка', icon: Ruler },
	{ id: 'eraser', label: 'Гумка', icon: Eraser },
];

const CATEGORIES_CONFIG: {
	id: StampCategory;
	label: string;
	icon: React.ComponentType<{ size?: number }>;
}[] = [
	{ id: 'notes', label: 'Ноти', icon: Music },
	{ id: 'chords', label: 'Акорди', icon: Layers },
	{ id: 'count', label: 'Рахунок', icon: ListOrdered },
	{ id: 'custom', label: 'Власні', icon: Plus },
	{ id: 'text', label: 'Текст', icon: Type },
	{ id: 'draw', label: 'Малюнок', icon: PenTool },
	{ id: 'shapes', label: 'Фігури', icon: Shapes },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
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
}) => {
	const { colorScheme, setColorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme('dark');
	const { config, setAccentSkin, setDarkTone, setLightTone, setConfig } = useAppearance();
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
				<ScrollArea.Autosize mah="75vh" type="hover" scrollbarSize={5} offsetScrollbars>
					<Stack gap="md" py="xs" pr="xs">
					{/* Тема оформлення */}
					<Stack gap="xs">
						<Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">
							Тема оформлення
						</Text>
						<SegmentedControl
							fullWidth
							size="xs"
							value={colorScheme}
							onChange={(val) => setColorScheme(val as 'dark' | 'light' | 'auto')}
							data={[
								{
									value: 'dark',
									label: (
										<Center style={{ gap: 6 }}>
											<Moon size={14} />
											<span>Темна</span>
										</Center>
									),
								},
								{
									value: 'light',
									label: (
										<Center style={{ gap: 6 }}>
											<Sun size={14} />
											<span>Світла</span>
										</Center>
									),
								},
								{
									value: 'auto',
									label: (
										<Center style={{ gap: 6 }}>
											<Monitor size={14} />
											<span>Системна</span>
										</Center>
									),
								},
							]}
						/>

						{/* Тон поверхні */}
						<Stack gap={4} mt={4}>
							<Text size="xs" c="dimmed">
								Тон поверхні ({computedColorScheme === 'dark' ? 'темний' : 'світлий'})
							</Text>
							{computedColorScheme === 'dark' ? (
								<SegmentedControl
									fullWidth
									size="xs"
									value={config.darkTone}
									onChange={(val) => setDarkTone(val as DarkSurfaceTone)}
									data={[
										{ value: 'carbon', label: 'Matte Carbon' },
										{ value: 'obsidian', label: 'OLED Obsidian' },
									]}
								/>
							) : (
								<SegmentedControl
									fullWidth
									size="xs"
									value={config.lightTone}
									onChange={(val) => setLightTone(val as LightSurfaceTone)}
									data={[
										{ value: 'cotton', label: 'Warm Cotton' },
										{ value: 'anodized', label: 'Anodized Silver' },
									]}
								/>
							)}
						</Stack>

						{/* Акцентний скін */}
						<Stack gap={4} mt={4}>
							<Text size="xs" c="dimmed">
								Акцентний скін
							</Text>
							<Group gap="xs" grow>
								{ACCENT_SKINS.map((skin) => {
									const isSelected = config.accentSkin === skin.id;
									return (
										<UnstyledButton
											key={skin.id}
											onClick={() => setAccentSkin(skin.id)}
											aria-label={`Обрати скін ${skin.label}`}
											style={{
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												gap: 5,
												padding: '6px 4px',
												borderRadius: 6,
												border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--line)'}`,
												background: isSelected ? 'var(--accent-subtle)' : 'var(--keycap-bg)',
												cursor: 'pointer',
												transition: 'all 0.12s ease',
											}}
										>
											<div
												style={{
													width: 14,
													height: 14,
													borderRadius: '50%',
													background: skin.hex,
													border: isSelected ? '2px solid var(--accent-contrast)' : 'none',
													boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
												}}
											/>
											<Text
												size="11px"
												fw={isSelected ? 700 : 500}
												c={isSelected ? 'var(--text)' : 'dimmed'}
											>
												{skin.label}
											</Text>
										</UnstyledButton>
									);
								})}
							</Group>
						</Stack>
					</Stack>

					<Divider />

					{/* Група 1: Інструменти */}
					<Stack gap="xs">
						<Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">
							Інструменти
						</Text>
						<Stack gap="xs">
							{TOOLS_CONFIG.map(({ id, label, icon: Icon }) => {
								const isChecked = visibleTools[id] ?? true;
								return (
									<Paper key={id} withBorder p="xs" radius="sm">
										<UnstyledButton
											onClick={() => onToggleTool(id)}
											style={{ width: '100%' }}
											aria-label={`Перемкнути інструмент ${label}`}
										>
											<Group justify="space-between" wrap="nowrap">
												<Group gap="sm" wrap="nowrap">
													<Icon size={18} />
													<Text size="sm" fw={500}>
														{label}
													</Text>
												</Group>
												<Switch
													checked={isChecked}
													onChange={() => onToggleTool(id)}
													size="sm"
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

					{/* Група 2: Розділи штампу */}
					<Stack gap="xs">
						<Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">
							Розділи штампу
						</Text>
						<Stack gap="xs">
							{CATEGORIES_CONFIG.map(({ id, label, icon: Icon }) => {
								const isChecked = visibleStampCategories[id] ?? true;
								return (
									<Paper key={id} withBorder p="xs" radius="sm">
										<UnstyledButton
											onClick={() => onToggleStampCategory(id)}
											style={{ width: '100%' }}
											aria-label={`Перемкнути категорію ${label}`}
										>
											<Group justify="space-between" wrap="nowrap">
												<Group gap="sm" wrap="nowrap">
													<Icon size={18} />
													<Text size="sm" fw={500}>
														{label}
													</Text>
												</Group>
												<Switch
													checked={isChecked}
													onChange={() => onToggleStampCategory(id)}
													size="sm"
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

					{/* Група 3: Керування на полотні */}
					<Stack gap="xs">
						<Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">
							Штамп на полотні
						</Text>
						<Stack gap="xs">
							<Paper withBorder p="xs" radius="sm">
								<UnstyledButton
									onClick={onToggleDeleteBtn}
									style={{ width: '100%' }}
									aria-label="Кошик на штампі"
								>
									<Group justify="space-between" wrap="nowrap">
										<Group gap="sm" wrap="nowrap">
											<Trash2 size={18} />
											<Text size="sm" fw={500}>
												Кошик на штампі
											</Text>
										</Group>
										<Switch
											checked={deleteBtnOn}
											onChange={onToggleDeleteBtn}
											size="sm"
											aria-label="Кошик на штампі"
										/>
									</Group>
								</UnstyledButton>
							</Paper>

							<Paper withBorder p="xs" radius="sm">
								<UnstyledButton
									onClick={onToggleResizeHandles}
									style={{ width: '100%' }}
									aria-label="Хендли розміру на рамці"
								>
									<Group justify="space-between" wrap="nowrap">
										<Group gap="sm" wrap="nowrap">
											<Maximize2 size={18} />
											<Text size="sm" fw={500}>
												Хендли розміру на рамці
											</Text>
										</Group>
										<Switch
											checked={resizeHandlesOn}
											onChange={onToggleResizeHandles}
											size="sm"
											aria-label="Хендли розміру на рамці"
										/>
									</Group>
								</UnstyledButton>
							</Paper>
						</Stack>
					</Stack>

					<Divider />

					{/* Група 4: Панель лінійок */}
					<Stack gap="xs">
						<Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.05em">
							Панель лінійок
						</Text>
						<Paper withBorder p="xs" radius="sm">
							<UnstyledButton
								onClick={onToggleCompactRulers}
								style={{ width: '100%' }}
								aria-label="Компактний вигляд у топбарі"
							>
								<Group justify="space-between" wrap="nowrap">
									<Group gap="sm" wrap="nowrap">
										<Ruler size={18} />
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
										aria-label="Компактний вигляд у топбарі"
									/>
								</Group>
							</UnstyledButton>
						</Paper>
					</Stack>

					<Divider />

					{/* Група 5: Скидання */}
					<Stack gap="xs" pt="xs">
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
				</Stack>
				</ScrollArea.Autosize>
			</Modal>

			{/* Модальне вікно підтвердження */}
			<Modal
				opened={!!confirmModal}
				onClose={() => setConfirmModal(null)}
				title={
					<Text fw={600} size="md">
						{confirmModal === 'settings' ? 'Скинути налаштування?' : 'Очистити всі дані?'}
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
									setConfig(DEFAULT_APPEARANCE_CONFIG);
								} else {
									onClearAllData();
									setConfig(DEFAULT_APPEARANCE_CONFIG);
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
};
