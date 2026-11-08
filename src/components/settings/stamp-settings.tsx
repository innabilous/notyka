'use client';

import React, { useState } from 'react';
import { SegmentedControl, Textarea } from '@mantine/core';
import { Copy, Eraser, ListOrdered, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import {
	ACCIDENTALS,
	CHORD_ACCIDENTALS,
	CHORD_EXTENSIONS,
	CHORD_QUALITIES,
	CHORD_ROOTS,
	COUNT_ITEMS,
	NOTES,
} from '@/constants/editor';
import { AutoCountItem, StampCategory } from '@/types/editor';

export type { StampCategory };

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
	visibleCategories?: Record<StampCategory, boolean>;
	isAutoCountMode?: boolean;
	countPattern?: readonly string[];
	currentAutoCountIndex?: number;
	selectedStepIndex?: number;
	autoCountSequence?: AutoCountItem[];
	currentAutoCountItemId?: string;
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
	isDrawDuplicateMode?: boolean;
	onToggleDrawDuplicateMode?: () => void;
	onToggleAutoCount?: () => void;
	onResetAutoCount?: () => void;
	onSelectStep?: (index: number) => void;
	onAssignTokenToStep?: (token: string) => void;
	onClearCurrentStep?: () => void;
	onResetCountPattern?: () => void;
	onAddSteps?: () => void;
	onRemoveSteps?: () => void;
	onReorderAutoCount?: (fromIndex: number, toIndex: number) => void;
	onToggleAutoCountItem?: (id: string) => void;
	onDuplicateAutoCountItem?: (id: string) => void;
	onDeleteAutoCountItem?: (id: string) => void;
	onSelectAutoCountItem?: (id: string) => void;
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
	visibleCategories,
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
	isDrawDuplicateMode = false,
	onToggleDrawDuplicateMode,
	isAutoCountMode = false,
	countPattern = [],
	currentAutoCountIndex = 0,
	selectedStepIndex = 0,
	onSelectStep,
	onAssignTokenToStep,
	onClearCurrentStep,
	onResetCountPattern,
	onAddSteps,
	onRemoveSteps,
	autoCountSequence = [],
	currentAutoCountItemId,
	onToggleAutoCount,
	onResetAutoCount,
	onReorderAutoCount,
	onToggleAutoCountItem,
	onDuplicateAutoCountItem,
	onDeleteAutoCountItem,
	onSelectAutoCountItem,
}) => {
	const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);

	const allCategories = [
		{ label: 'Ноти', value: 'notes' },
		{ label: 'Акорди', value: 'chords' },
		{ label: 'Рахунок', value: 'count' },
		{ label: 'Власні', value: 'custom' },
		{ label: 'Текст', value: 'text' },
		{ label: 'Малюнок', value: 'draw' },
	];

	const availableCategories = allCategories.filter(
		(c) => visibleCategories?.[c.value as StampCategory] ?? true,
	);
	const displayedCategories = availableCategories.length > 0 ? availableCategories : allCategories;

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
					data={displayedCategories}
					classNames={{
						root: 'stamp-segmented-root',
						indicator: 'stamp-segmented-indicator',
						label: 'stamp-segmented-label',
					}}
				/>
			</div>

			{/* Рівень 2: Чипи відповідно до категорії */}
			<div
				className={`stamp-chips-scroll ${category === 'chords' || category === 'text' || (category === 'count' && isAutoCountMode) ? 'multi-row' : ''}`}
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

				{/* 3. Рахунок: Чипи + 32-кроковий секвенсор для Авторахунку */}
				{category === 'count' && (
					<div className="stamp-count-container">
						{isAutoCountMode && (
							<div className="step-sequencer-wrapper">
								<div className="step-sequencer-header">
									<span className="step-sequencer-title">
										Патерн ({countPattern.length} кр.):
									</span>
									<div className="step-sequencer-header-actions">
										{countPattern.length > 16 && (
											<button
												type="button"
												className="step-action-mini-btn"
												title="Прибрати 16 кроків"
												onClick={onRemoveSteps}
											>
												<span>-16</span>
											</button>
										)}
										{countPattern.length < 64 && (
											<button
												type="button"
												className="step-action-mini-btn"
												title="Додати 16 кроків (макс. 64)"
												onClick={onAddSteps}
											>
												<span>+16</span>
											</button>
										)}
										<button
											type="button"
											className="step-action-mini-btn"
											title="Скинути до стандартного (16 кроків)"
											onClick={onResetCountPattern}
										>
											<RotateCcw className="icon" />
											<span>Скинути</span>
										</button>
									</div>
								</div>
								<div className="step-cubes-scroll">
									<div className="step-cubes-grid">
										{countPattern.map((token, idx) => {
											const isCurrent = idx === selectedStepIndex;
											const isNext = idx === currentAutoCountIndex;
											const isFilled = Boolean(token && token.trim());
											const isBeatStart = idx % 4 === 0;

											let statusTitle = '';
											if (isCurrent && isNext) {
												statusTitle = ' — активний і наступний';
											} else if (isCurrent) {
												statusTitle = ' — активний на полотні';
											} else if (isNext) {
												statusTitle = ' — наступний для штампування (пунктир)';
											}

											return (
												<button
													key={idx}
													type="button"
													className={`step-cube ${isFilled ? 'filled' : 'empty'} ${isNext ? 'is-next' : ''} ${isCurrent ? 'is-current' : ''} ${isBeatStart ? 'beat-start' : ''}`}
													onClick={() => onSelectStep?.(idx)}
													title={`Крок ${idx + 1}: «${token || 'порожньо'}»${statusTitle}`}
												>
													<span className="step-cube-num">{idx + 1}</span>
													<span className="step-cube-val">{token || '·'}</span>
												</button>
											);
										})}
									</div>
								</div>
							</div>
						)}

						<div className="stamp-custom-container">
							<div className="stamp-custom-chips-scroll">
								{COUNT_ITEMS.map((item) => {
									const isActive = !isAutoCountMode && activeStampText === item;
									return (
										<button
											key={item}
											type="button"
											className={`chip count-btn ${isActive ? 'active' : ''}`}
											onClick={() => {
												if (isAutoCountMode) {
													onAssignTokenToStep?.(item);
												} else {
													onSelectStampText(item);
												}
											}}
											title={
												isAutoCountMode
													? `Записати «${item}» у клітинку ${(selectedStepIndex ?? 0) + 1}`
													: item
											}
										>
											{item}
										</button>
									);
								})}

								{isAutoCountMode && (
									<button
										type="button"
										className="chip count-btn clear-step-btn"
										onClick={onClearCurrentStep}
										title={`Очистити клітинку ${(selectedStepIndex ?? 0) + 1}`}
									>
										<Eraser className="icon" />
									</button>
								)}
							</div>

							{/* Кнопка перемикання авторахунку справа */}
							<div className="stamp-custom-actions">
								<button
									type="button"
									className={`chip custom-chip auto-count-toggle-btn ${isAutoCountMode ? 'active' : ''}`}
									title={isAutoCountMode ? 'Вимкнути авторахунок' : 'Увімкнути авторахунок'}
									aria-label="Авторахунок"
									onClick={onToggleAutoCount}
								>
									<ListOrdered className="icon" />
								</button>
							</div>
						</div>
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

				{/* 6. Режим довільного малювання */}
				{category === 'draw' && (
					<div
						className="stamp-draw-actions"
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: '0.5rem',
							width: '100%',
							padding: '0.15rem 0.5rem',
							boxSizing: 'border-box',
						}}
					>
						<span
							title="Малюйте штрихи, вони автоматично об'єднаються у штамп через 1 секунду"
							style={{
								fontSize: '0.75rem',
								color: 'var(--mantine-color-dimmed)',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								flex: 1,
								minWidth: 0,
							}}
						>
							Об&apos;єднується через 1 секунду
						</span>
						{onToggleDrawDuplicateMode && (
							<button
								type="button"
								className={`chip custom-chip ${isDrawDuplicateMode ? 'active' : ''}`}
								onClick={onToggleDrawDuplicateMode}
								title={
									isDrawDuplicateMode
										? 'Дублювання: увімкнено (клік по полотну клонує малюнок)'
										: 'Дублювання: вимкнено (клік починає новий малюнок)'
								}
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '0.35rem',
									flexShrink: 0,
									padding: '0.3rem 0.65rem',
								}}
							>
								<Copy className="icon" style={{ width: '0.85rem', height: '0.85rem' }} />
								<span>Дублювати</span>
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
