'use client';

import React, { useState } from 'react';
import { SegmentedControl } from '@mantine/core';
import { Plus, Trash2, X } from 'lucide-react';
import { ACCIDENTALS, COUNT_ITEMS, NOTES } from '@/constants/editor';

export type StampCategory = 'notes' | 'count' | 'custom';

interface StampSettingsProps {
	selectedNote: string;
	selectedAccidental: string;
	activeStampText: string;
	category: StampCategory;
	customStamps: string[];
	onChangeCategory: (cat: StampCategory) => void;
	onSelectNote: (note: string) => void;
	onSelectAccidental: (acc: string) => void;
	onSelectStampText: (text: string) => void;
	onOpenAddCustomModal: () => void;
	onDeleteCustomStamp: (text: string) => void;
}

export const StampSettings: React.FC<StampSettingsProps> = ({
	selectedNote,
	selectedAccidental,
	activeStampText,
	category,
	customStamps,
	onChangeCategory,
	onSelectNote,
	onSelectAccidental,
	onSelectStampText,
	onOpenAddCustomModal,
	onDeleteCustomStamp,
}) => {
	const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);

	return (
		<div id="stamp-settings">
			{/* Рівень 1: Mantine SegmentedControl для трьох категорій */}
			<div className="stamp-category-tabs">
				<SegmentedControl
					fullWidth
					size="xs"
					radius="xl"
					withItemsBorders={false}
					value={category}
					onChange={(val) => {
						onChangeCategory(val as StampCategory);
						if (val !== 'custom') {
							setIsDeleteMode(false);
						}
					}}
					data={[
						{ label: 'Ноти', value: 'notes' },
						{ label: 'Лік', value: 'count' },
						{ label: 'Власні', value: 'custom' },
					]}
					classNames={{
						root: 'stamp-segmented-root',
						indicator: 'stamp-segmented-indicator',
						label: 'stamp-segmented-label',
					}}
				/>
			</div>

			{/* Рівень 2: Чипи відповідно до категорії */}
			<div className="stamp-chips-scroll">
				{/* 1. Ноти та знаки альтерації */}
				{category === 'notes' && (
					<div className="stamp-chips-row fit-width">
						{NOTES.map((note) => {
							const isNoteActive = selectedNote === note;
							return (
								<button
									key={note}
									type="button"
									className={`chip note-btn ${isNoteActive ? 'active' : ''}`}
									onClick={() => onSelectNote(note)}
								>
									{note}
								</button>
							);
						})}
						<div className="sep" />
						{ACCIDENTALS.map((acc) => {
							const isAccActive = selectedAccidental === acc;
							return (
								<button
									key={acc}
									type="button"
									className={`chip accidental-btn ${isAccActive ? 'active' : ''}`}
									onClick={() => onSelectAccidental(acc)}
								>
									{acc}
								</button>
							);
						})}
					</div>
				)}

				{/* 2. Рахунок / Лік: «1 2 3 4 і та на» */}
				{category === 'count' && (
					<div className="stamp-chips-row fit-width">
						{COUNT_ITEMS.map((item) => {
							const isCountActive = activeStampText === item;
							return (
								<button
									key={item}
									type="button"
									className={`chip count-btn ${isCountActive ? 'active' : ''}`}
									onClick={() => onSelectStampText(item)}
								>
									{item}
								</button>
							);
						})}
					</div>
				)}

				{/* 3. Власні елементи */}
				{category === 'custom' && (
					<div className="stamp-custom-chips-row">
						{/* Список збережених власних штампів (ліворуч) */}
						{customStamps.map((text) => {
							const isCustomActive = activeStampText === text;
							return (
								<div key={text} className="stamp-custom-chip-wrap">
									<button
										type="button"
										className={`chip custom-chip ${isCustomActive ? 'active' : ''}`}
										onClick={() => onSelectStampText(text)}
									>
										{text}
									</button>

									{isDeleteMode && (
										<button
											type="button"
											className="stamp-custom-item-delete-btn"
											aria-label={`Видалити штамп ${text}`}
											title="Видалити"
											onClick={(e) => {
												e.stopPropagation();
												onDeleteCustomStamp(text);
											}}
										>
											<X className="icon" />
										</button>
									)}
								</div>
							);
						})}

						{customStamps.length > 0 && <div className="sep" />}

						{/* Кнопка додавання (+) праворуч */}
						<button
							type="button"
							className="stamp-custom-btn-add"
							aria-label="Додати власний штамп"
							title="Додати власний штамп"
							onClick={onOpenAddCustomModal}
						>
							<Plus className="icon" />
						</button>

						{/* Кнопка кошика праворуч від плюсика (відображається, якщо є хоч 1 елемент) */}
						{customStamps.length > 0 && (
							<button
								type="button"
								className={`stamp-custom-btn-trash-toggle ${isDeleteMode ? 'active' : ''}`}
								aria-label={isDeleteMode ? 'Завершити видалення' : 'Режим видалення'}
								title={isDeleteMode ? 'Завершити видалення' : 'Видалити власні штампи'}
								onClick={() => setIsDeleteMode((prev) => !prev)}
							>
								<Trash2 className="icon" />
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
