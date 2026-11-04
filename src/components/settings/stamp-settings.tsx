'use client';

import React from 'react';
import { SegmentedControl } from '@mantine/core';
import { ACCIDENTALS, COUNT_ITEMS, NOTES } from '@/constants/editor';

export type StampCategory = 'notes' | 'count';

interface StampSettingsProps {
	selectedNote: string;
	selectedAccidental: string;
	activeStampText: string;
	category: StampCategory;
	onChangeCategory: (cat: StampCategory) => void;
	onSelectNote: (note: string) => void;
	onSelectAccidental: (acc: string) => void;
	onSelectStampText: (text: string) => void;
}

export const StampSettings: React.FC<StampSettingsProps> = ({
	selectedNote,
	selectedAccidental,
	activeStampText,
	category,
	onChangeCategory,
	onSelectNote,
	onSelectAccidental,
	onSelectStampText,
}) => {
	return (
		<div id="stamp-settings">
			{/* Рівень 1: Mantine SegmentedControl для категорій */}
			<div className="stamp-category-tabs">
				<SegmentedControl
					fullWidth
					size="xs"
					radius="xl"
					value={category}
					onChange={(val) => onChangeCategory(val as StampCategory)}
					data={[
						{ label: 'Ноти', value: 'notes' },
						{ label: 'Лік', value: 'count' },
					]}
					classNames={{
						root: 'stamp-segmented-root',
						indicator: 'stamp-segmented-indicator',
						label: 'stamp-segmented-label',
					}}
				/>
			</div>

			{/* Рівень 2: Чипи, які точно вміщуються по ширині без потреби скролити */}
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
			</div>
		</div>
	);
};
