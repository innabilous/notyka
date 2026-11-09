'use client';

import React from 'react';
import { Indicator } from '@mantine/core';
import { BoxSelect, LassoSelect, Trash2 } from 'lucide-react';
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
		<div id="select-settings" aria-label="Панель налаштувань виділення">
			{/* Перемикач режиму обведення (за замовчуванням вимкнений, працює тільки клік) */}
			<div className="select-setting-group">
				<button
					type="button"
					className={`select-setting-btn ${areaSelectEnabled ? 'active' : ''}`}
					onClick={onToggleAreaSelect}
					title={
						areaSelectEnabled
							? 'Вимкнути режим обведення (тільки виділення кліком)'
							: 'Увімкнути режим обведення (виділення області протягуванням)'
					}
					aria-label="Режим обведення"
				>
					{selectionShape === 'lasso' ? (
						<LassoSelect className="icon" />
					) : (
						<BoxSelect className="icon" />
					)}
					<span className="btn-label">Обведення</span>
				</button>
			</div>

			{/* Параметри форми та критерію обведення доступні коли режим увімкнено */}
			{areaSelectEnabled && (
				<>
					<div className="select-settings-divider" />

					{/* Форма виділення: Рамка (за замовчуванням) або Ласо */}
					<div className="select-setting-group">
						<button
							type="button"
							className={`select-setting-btn ${selectionShape === 'rect' ? 'active' : ''}`}
							onClick={() => onChangeShape('rect')}
							title="Рамка (прямокутне виділення)"
							aria-label="Прямокутна рамка"
						>
							<BoxSelect className="icon" />
							<span className="btn-label">Рамка</span>
						</button>
						<button
							type="button"
							className={`select-setting-btn ${selectionShape === 'lasso' ? 'active' : ''}`}
							onClick={() => onChangeShape('lasso')}
							title="Ласо (довільне виділення контуром)"
							aria-label="Вільне ласо"
						>
							<LassoSelect className="icon" />
							<span className="btn-label">Ласо</span>
						</button>
					</div>

					<div className="select-settings-divider" />

					{/* Критерій включення: Повністю або Перетин */}
					<div className="select-setting-group">
						<button
							type="button"
							className={`select-setting-btn ${selectionMode === 'inside' ? 'active' : ''}`}
							onClick={() => onChangeMode('inside')}
							title="Повністю (об'єкт має повністю увійти в область виділення)"
							aria-label="Повністю всередині"
						>
							<svg
								viewBox="0 0 24 24"
								width="15"
								height="15"
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
						</button>
						<button
							type="button"
							className={`select-setting-btn ${selectionMode === 'intersect' ? 'active' : ''}`}
							onClick={() => onChangeMode('intersect')}
							title="Перетин (достатньо перетнути або торкнутися об'єкта)"
							aria-label="Перетин з об'єктом"
						>
							<svg
								viewBox="0 0 24 24"
								width="15"
								height="15"
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
						</button>
					</div>
				</>
			)}

			{/* Якщо є виділені елементи — кнопка видалення з бейджем Indicator на іконці кошика */}
			{selectedCount > 0 && (
				<>
					<div className="select-settings-divider" />
					<button
						type="button"
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
							withBorder
						>
							<Trash2 className="icon" />
						</Indicator>
						<span className="btn-label">Видалити</span>
					</button>
				</>
			)}
		</div>
	);
};
