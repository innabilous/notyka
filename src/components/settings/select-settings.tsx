'use client';

import React from 'react';
import { Box, Center, Indicator, SegmentedControl, UnstyledButton } from '@mantine/core';
import { BoxSelect, LassoSelect, MousePointerSquareDashed, Trash2 } from 'lucide-react';
import { SelectionMode, SelectionShape } from '@/types/editor';

interface SelectSettingsProps {
	areaSelectEnabled: boolean;
	selectionShape: SelectionShape;
	selectionMode: SelectionMode;
	selectedCount: number;
	onToggleAreaSelect: () => void;
	onChangeShape: (shape: SelectionShape) => void;
	onChangeMode: (mode: SelectionMode) => void;
	onDeleteSelected: () => void;
	onClearSelection?: () => void;
}

export const SelectSettings: React.FC<SelectSettingsProps> = ({
	areaSelectEnabled,
	selectionShape,
	selectionMode,
	selectedCount,
	onToggleAreaSelect,
	onChangeShape,
	onChangeMode,
	onDeleteSelected,
}) => {
	return (
		<Box id="select-settings" aria-label="Панель налаштувань виділення">
			{/* Перемикач режиму обведення (за замовчуванням вимкнений, працює тільки клік) */}
			<UnstyledButton
				className={`select-setting-btn standalone ${areaSelectEnabled ? 'active' : ''}`}
				onClick={onToggleAreaSelect}
				title={
					areaSelectEnabled
						? 'Вимкнути режим обведення (тільки виділення кліком)'
						: 'Увімкнути режим обведення (виділення області протягуванням)'
				}
				aria-label="Режим обведення"
			>
				<MousePointerSquareDashed className="icon" />
				<span className="btn-label">Обведення</span>
			</UnstyledButton>

			{/* Параметри форми та критерію обведення у вигляді SegmentedControl */}
			{areaSelectEnabled && (
				<>
					<Box className="select-settings-divider" />

					{/* Форма виділення: Рамка (за замовчуванням) або Ласо */}
					<SegmentedControl
						size="xs"
						withItemsBorders={false}
						value={selectionShape}
						onChange={(val) => onChangeShape(val as SelectionShape)}
						aria-label="Форма виділення"
						data={[
							{
								value: 'rect',
								label: (
									<Center style={{ gap: 4 }}>
										<BoxSelect size={14} className="icon" />
										<span className="btn-label">Рамка</span>
									</Center>
								),
							},
							{
								value: 'lasso',
								label: (
									<Center style={{ gap: 4 }}>
										<LassoSelect size={14} className="icon" />
										<span className="btn-label">Ласо</span>
									</Center>
								),
							},
						]}
					/>

					<Box className="select-settings-divider" />

					{/* Критерій включення: Повністю або Перетин */}
					<SegmentedControl
						size="xs"
						withItemsBorders={false}
						value={selectionMode}
						onChange={(val) => onChangeMode(val as SelectionMode)}
						aria-label="Критерій включення у виділення"
						data={[
							{
								value: 'inside',
								label: (
									<Center style={{ gap: 4 }}>
										<svg
											viewBox="0 0 24 24"
											width="14"
											height="14"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="icon"
											aria-hidden="true"
										>
											<rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
											<rect x="8" y="8" width="8" height="8" rx="1.5" fill="currentColor" stroke="none" />
										</svg>
										<span className="btn-label">Повністю</span>
									</Center>
								),
							},
							{
								value: 'intersect',
								label: (
									<Center style={{ gap: 4 }}>
										<svg
											viewBox="0 0 24 24"
											width="14"
											height="14"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="icon"
											aria-hidden="true"
										>
											<rect x="3" y="3" width="13" height="13" rx="2" strokeDasharray="3 3" />
											<rect
												x="9"
												y="9"
												width="12"
												height="12"
												rx="1.5"
												fill="currentColor"
												stroke="none"
												opacity="0.9"
											/>
										</svg>
										<span className="btn-label">Перетин</span>
									</Center>
								),
							},
						]}
					/>
				</>
			)}

			{/* Якщо є виділені елементи — кнопка видалення з бейджем Indicator на іконці кошика */}
			{selectedCount > 0 && (
				<>
					<Box className="select-settings-divider" />
					<UnstyledButton
						className="select-setting-btn danger"
						onClick={onDeleteSelected}
						title={`Видалити виділені елементи (${selectedCount})`}
						aria-label={`Видалити виділені елементи (${selectedCount})`}
					>
						<Indicator
							inline
							label={selectedCount}
							size={16}
							color="#ef4444"
							offset={-2}
						>
							<Trash2 className="icon" />
						</Indicator>
						<span className="btn-label">Видалити</span>
					</UnstyledButton>
				</>
			)}
		</Box>
	);
};
