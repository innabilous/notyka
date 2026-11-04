'use client';

import React, { useState } from 'react';
import { SegmentedControl, Textarea } from '@mantine/core';
import { Plus, Trash2, X } from 'lucide-react';
import {
	ACCIDENTALS,
	CHORD_ACCIDENTALS,
	CHORD_EXTENSIONS,
	CHORD_QUALITIES,
	CHORD_ROOTS,
	COUNT_ITEMS,
	NOTES,
} from '@/constants/editor';

export type StampCategory = 'notes' | 'chords' | 'count' | 'custom' | 'text';

interface StampSettingsProps {
	selectedNote: string;
	selectedAccidental: string;
	selectedChordRoot: string;
	selectedChordAccidental: string;
	selectedChordModifier: string;
	selectedChordSlash: boolean;
	selectedChordBassRoot: string;
	selectedChordBassAccidental: string;
	activeStampText: string;
	category: StampCategory;
	customStamps: string[];
	customText?: string;
	onChangeCategory: (cat: StampCategory) => void;
	onSelectNote: (note: string) => void;
	onSelectAccidental: (acc: string) => void;
	onSelectChordRoot: (root: string) => void;
	onSelectChordAccidental: (acc: string) => void;
	onSelectChordModifier: (modifier: string) => void;
	onToggleChordSlash: () => void;
	onSelectChordBassRoot: (root: string) => void;
	onSelectChordBassAccidental: (acc: string) => void;
	onSelectStampText: (text: string) => void;
	onOpenAddCustomModal: () => void;
	onDeleteCustomStamp: (text: string) => void;
	onChangeCustomText?: (text: string) => void;
}

export const StampSettings: React.FC<StampSettingsProps> = ({
	selectedNote,
	selectedAccidental,
	selectedChordRoot,
	selectedChordAccidental,
	selectedChordModifier,
	selectedChordSlash,
	selectedChordBassRoot,
	selectedChordBassAccidental,
	activeStampText,
	category,
	customStamps,
	customText = '',
	onChangeCategory,
	onSelectNote,
	onSelectAccidental,
	onSelectChordRoot,
	onSelectChordAccidental,
	onSelectChordModifier,
	onToggleChordSlash,
	onSelectChordBassRoot,
	onSelectChordBassAccidental,
	onSelectStampText,
	onOpenAddCustomModal,
	onDeleteCustomStamp,
	onChangeCustomText,
}) => {
	const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);

	return (
		<div id="stamp-settings">
			{/* Рівень 1: Mantine SegmentedControl для категорій */}
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
						{ label: 'Акорди', value: 'chords' },
						{ label: 'Лік', value: 'count' },
						{ label: 'Власні', value: 'custom' },
						{ label: 'Текст', value: 'text' },
					]}
					classNames={{
						root: 'stamp-segmented-root',
						indicator: 'stamp-segmented-indicator',
						label: 'stamp-segmented-label',
					}}
				/>
			</div>

			{/* Рівень 2: Чипи відповідно до категорії */}
			<div
				className={`stamp-chips-scroll ${category === 'chords' || category === 'text' ? 'multi-row' : ''}`}
			>
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

				{/* 2. Акорди: тоніки, слеш-бас та структуровані позначення без скролу */}
				{category === 'chords' && (
					<div className="stamp-chords-container">
						{/* Ряд 1: Літери тонік (A B C D E F G), альтерації (#, b) та слеш-опція (/) */}
						<div className="stamp-chips-row fit-width">
							{CHORD_ROOTS.map((root) => {
								const isRootActive = selectedChordRoot === root;
								return (
									<button
										key={root}
										type="button"
										className={`chip chord-root-btn ${isRootActive ? 'active' : ''}`}
										onClick={() => onSelectChordRoot(root)}
									>
										{root}
									</button>
								);
							})}
							<div className="sep" />
							{CHORD_ACCIDENTALS.map((acc) => {
								const isAccActive = selectedChordAccidental === acc;
								return (
									<button
										key={acc}
										type="button"
										className={`chip accidental-btn ${isAccActive ? 'active' : ''}`}
										onClick={() => onSelectChordAccidental(acc)}
									>
										{acc}
									</button>
								);
							})}
							<div className="sep" />
							<button
								type="button"
								className={`chip chord-slash-btn ${selectedChordSlash ? 'active' : ''}`}
								title="Слеш-акорд (басова нота)"
								aria-label="Слеш-акорд (басова нота)"
								onClick={onToggleChordSlash}
							>
								{selectedChordSlash && selectedChordBassRoot
									? `/${selectedChordBassRoot}${selectedChordBassAccidental}`
									: '/'}
							</button>
						</div>

						{/* Ряд Басу (з'являється при увімкненні /) */}
						{selectedChordSlash && (
							<div className="stamp-chips-row fit-width stamp-chord-bass-row">
								<span className="stamp-chord-bass-lbl">/</span>
								{CHORD_ROOTS.map((root) => {
									const isBassActive = selectedChordBassRoot === root;
									return (
										<button
											key={root}
											type="button"
											className={`chip chord-root-btn ${isBassActive ? 'active' : ''}`}
											onClick={() => onSelectChordBassRoot(root)}
										>
											{root}
										</button>
									);
								})}
								<div className="sep" />
								{CHORD_ACCIDENTALS.map((acc) => {
									const isAccActive = selectedChordBassAccidental === acc;
									return (
										<button
											key={acc}
											type="button"
											className={`chip accidental-btn ${isAccActive ? 'active' : ''}`}
											onClick={() => onSelectChordBassAccidental(acc)}
										>
											{acc}
										</button>
									);
								})}
							</div>
						)}

						{/* Ряд 2: Базові позначення (m, 7, maj7, m7, sus4, sus2, dim, aug) - рівномірно на всю ширину */}
						<div className="stamp-chips-row fit-width">
							{CHORD_QUALITIES.map((qual) => {
								const isQualActive = selectedChordModifier === qual;
								return (
									<button
										key={qual}
										type="button"
										className={`chip chord-chip ${isQualActive ? 'active' : ''}`}
										onClick={() => onSelectChordModifier(qual)}
									>
										{qual}
									</button>
								);
							})}
						</div>

						{/* Ряд 3: Розширення (6, m6, 9, maj9, m9, add9, m7b5, 5) - рівномірно на всю ширину */}
						<div className="stamp-chips-row fit-width">
							{CHORD_EXTENSIONS.map((ext) => {
								const isExtActive = selectedChordModifier === ext;
								return (
									<button
										key={ext}
										type="button"
										className={`chip chord-chip ${isExtActive ? 'active' : ''}`}
										onClick={() => onSelectChordModifier(ext)}
									>
										{ext}
									</button>
								);
							})}
						</div>
					</div>
				)}

				{/* 3. Рахунок / Лік: «1 2 3 4 і та на» */}
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

				{/* 4. Власні елементи */}
				{category === 'custom' && (
					customStamps.length === 0 ? (
						//! Якщо власних елементів ще немає — плюс по центру
						<div className="stamp-custom-empty-row">
							<button
								type="button"
								className="stamp-custom-btn-add"
								aria-label="Додати власний штамп"
								title="Додати власний штамп"
								onClick={onOpenAddCustomModal}
							>
								<Plus className="icon" />
							</button>
						</div>
					) : (
						//! Якщо є елементи — список скролиться зліва, а плюс і кошик закріплені справа
						<div className="stamp-custom-container">
							<div className="stamp-custom-chips-scroll">
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
							</div>

							<div className="stamp-custom-actions">
								<button
									type="button"
									className="stamp-custom-btn-add"
									aria-label="Додати власний штамп"
									title="Додати власний штамп"
									onClick={onOpenAddCustomModal}
								>
									<Plus className="icon" />
								</button>

								<button
									type="button"
									className={`stamp-custom-btn-trash-toggle ${isDeleteMode ? 'active' : ''}`}
									aria-label={isDeleteMode ? 'Завершити видалення' : 'Режим видалення'}
									title={isDeleteMode ? 'Завершити видалення' : 'Видалити власні штампи'}
									onClick={() => setIsDeleteMode((prev) => !prev)}
								>
									<Trash2 className="icon" />
								</button>
							</div>
						</div>
					)
				)}

				{/* 5. Довільний текст */}
				{category === 'text' && (
					<div className="stamp-text-input-wrap">
						<Textarea
							autosize
							minRows={1}
							maxRows={3}
							placeholder="Введіть текст штампа..."
							value={customText}
							onChange={(e) => onChangeCustomText?.(e.currentTarget.value)}
							classNames={{
								root: 'stamp-textarea-root',
								input: 'stamp-textarea-input',
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
