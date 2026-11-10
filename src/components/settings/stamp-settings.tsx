'use client';

import React, { useState } from 'react';
import { Box, Group, SegmentedControl, Switch, Text, Textarea, UnstyledButton } from '@mantine/core';
import clsx from 'clsx';
import {
	Circle,
	Eraser,
	ListOrdered,
	MoveRight,
	Plus,
	RotateCcw,
	Square,
	Trash2,
	X,
} from 'lucide-react';
import {
	ACCIDENTALS,
	CHORD_ACCIDENTALS,
	CHORD_EXTENSIONS,
	CHORD_QUALITIES,
	CHORD_ROOTS,
	COUNT_ITEMS,
	NOTES,
	STAMP_CATEGORIES,
} from '@/constants/editor';
import { AutoCountItem, ShapeType, StampCategory, isStampCategory } from '@/types/editor';
import classes from './stamp-settings.module.css';

export type { StampCategory };

const ALL_STAMP_CATEGORIES_DATA = STAMP_CATEGORIES.map((c) => ({
	label: c.label,
	value: c.id,
}));

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
	selectedShape?: ShapeType;
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
	onSelectShape?: (shape: ShapeType) => void;
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

export function StampSettings({
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
	selectedShape = 'rect',
	customStamps,
	customText = '',
	visibleCategories,
	onChangeCategory,
	onSelectShape,
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
	onToggleAutoCount,
}: StampSettingsProps) {
	const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);

	const availableCategories = visibleCategories
		? ALL_STAMP_CATEGORIES_DATA.filter((c) => visibleCategories[c.value] ?? true)
		: ALL_STAMP_CATEGORIES_DATA;
	const displayedCategories =
		availableCategories.length > 0 ? availableCategories : ALL_STAMP_CATEGORIES_DATA;

	return (
		<Box id="stamp-settings">
			{/* Level 1: Category selector */}
			<Box className="stamp-category-tabs">
				<SegmentedControl
					fullWidth
					size="xs"
					withItemsBorders={false}
					value={category}
					onChange={(val) => {
						if (isStampCategory(val)) {
							onChangeCategory(val);
							if (val !== 'custom') {
								setIsDeleteMode(false);
							}
						}
					}}
					data={displayedCategories}
					classNames={{
						root: 'stamp-segmented-root',
						indicator: 'stamp-segmented-indicator',
						label: 'stamp-segmented-label',
					}}
				/>
			</Box>

			{/* Level 2: Category-specific controls */}
			<Box
				className={clsx(
					'stamp-chips-scroll',
					(category === 'chords' ||
						category === 'text' ||
						(category === 'count' && isAutoCountMode)) &&
						'multi-row',
				)}
			>
				{/* 1. Musical notes and accidentals */}
				{category === 'notes' && (
					<Box className="stamp-chips-row fit-width">
						{NOTES.map((note) => {
							const isNoteActive = selectedNote === note;
							return (
								<UnstyledButton
									key={note}
									className={clsx('chip', 'note-btn', isNoteActive && 'active')}
									onClick={() => onSelectNote(note)}
								>
									{note}
								</UnstyledButton>
							);
						})}
						<Box className="sep" />
						{ACCIDENTALS.map((acc) => {
							const isAccActive = selectedAccidental === acc;
							return (
								<UnstyledButton
									key={acc}
									className={clsx('chip', 'accidental-btn', isAccActive && 'active')}
									onClick={() => onSelectAccidental(acc)}
								>
									{acc}
								</UnstyledButton>
							);
						})}
					</Box>
				)}

				{/* 2. Chords: roots, slash bass, and chord qualities/extensions */}
				{category === 'chords' && (
					<Box className="stamp-chords-container">
						{/* Row 1: Root notes (A B C D E F G), accidentals (#, b), and slash bass toggle (/) */}
						<Box className="stamp-chips-row fit-width">
							{CHORD_ROOTS.map((root) => {
								const isRootActive = selectedChordRoot === root;
								return (
									<UnstyledButton
										key={root}
										className={clsx('chip', 'chord-root-btn', isRootActive && 'active')}
										onClick={() => onSelectChordRoot(root)}
									>
										{root}
									</UnstyledButton>
								);
							})}
							<Box className="sep" />
							{CHORD_ACCIDENTALS.map((acc) => {
								const isAccActive = selectedChordAccidental === acc;
								return (
									<UnstyledButton
										key={acc}
										className={clsx('chip', 'accidental-btn', isAccActive && 'active')}
										onClick={() => onSelectChordAccidental(acc)}
									>
										{acc}
									</UnstyledButton>
								);
							})}
							<Box className="sep" />
							<UnstyledButton
								className={clsx('chip', 'chord-slash-btn', selectedChordSlash && 'active')}
								title="Слеш-акорд (басова нота)"
								aria-label="Слеш-акорд (басова нота)"
								onClick={onToggleChordSlash}
							>
								{selectedChordSlash && selectedChordBassRoot
									? `/${selectedChordBassRoot}${selectedChordBassAccidental}`
									: '/'}
							</UnstyledButton>
						</Box>

						{/* Slash Bass Row */}
						{selectedChordSlash && (
							<Box className="stamp-chips-row fit-width stamp-chord-bass-row">
								<Text component="span" className="stamp-chord-bass-lbl">
									/
								</Text>
								{CHORD_ROOTS.map((root) => {
									const isBassActive = selectedChordBassRoot === root;
									return (
										<UnstyledButton
											key={root}
											className={clsx('chip', 'chord-root-btn', isBassActive && 'active')}
											onClick={() => onSelectChordBassRoot(root)}
										>
											{root}
										</UnstyledButton>
									);
								})}
								<Box className="sep" />
								{CHORD_ACCIDENTALS.map((acc) => {
									const isAccActive = selectedChordBassAccidental === acc;
									return (
										<UnstyledButton
											key={acc}
											className={clsx('chip', 'accidental-btn', isAccActive && 'active')}
											onClick={() => onSelectChordBassAccidental(acc)}
										>
											{acc}
										</UnstyledButton>
									);
								})}
							</Box>
						)}

						{/* Row 2: Chord qualities (m, 7, maj7, m7, sus4, sus2, dim, aug) */}
						<Box className="stamp-chips-row fit-width">
							{CHORD_QUALITIES.map((qual) => {
								const isQualActive = selectedChordModifier === qual;
								return (
									<UnstyledButton
										key={qual}
										className={clsx('chip', 'chord-chip', isQualActive && 'active')}
										onClick={() => onSelectChordModifier(qual)}
									>
										{qual}
									</UnstyledButton>
								);
							})}
						</Box>

						{/* Row 3: Chord extensions (6, m6, 9, maj9, m9, add9, 11, 5) */}
						<Box className="stamp-chips-row fit-width">
							{CHORD_EXTENSIONS.map((ext) => {
								const isExtActive = selectedChordModifier === ext;
								return (
									<UnstyledButton
										key={ext}
										className={clsx('chip', 'chord-chip', isExtActive && 'active')}
										onClick={() => onSelectChordModifier(ext)}
									>
										{ext}
									</UnstyledButton>
								);
							})}
						</Box>
					</Box>
				)}

				{/* 3. Rhythm count chips and step sequencer */}
				{category === 'count' && (
					<Box className="stamp-count-container">
						{isAutoCountMode && (
							<Box className="step-sequencer-wrapper">
								<Box className="step-sequencer-header">
									<Text component="span" className="step-sequencer-title">
										Патерн ({countPattern.length} кр.):
									</Text>
									<Box className="step-sequencer-header-actions">
										{countPattern.length > 16 && (
											<UnstyledButton
												className="step-action-mini-btn"
												title="Прибрати 16 кроків"
												onClick={onRemoveSteps}
											>
												<span>-16</span>
											</UnstyledButton>
										)}
										{countPattern.length < 64 && (
											<UnstyledButton
												className="step-action-mini-btn"
												title="Додати 16 кроків (макс. 64)"
												onClick={onAddSteps}
											>
												<span>+16</span>
											</UnstyledButton>
										)}
										<UnstyledButton
											className="step-action-mini-btn"
											title="Скинути до стандартного (16 кроків)"
											onClick={onResetCountPattern}
										>
											<RotateCcw className="icon" />
											<span>Скинути</span>
										</UnstyledButton>
									</Box>
								</Box>
								<Box className="step-cubes-scroll">
									<Box className="step-cubes-grid">
										{countPattern.map((token, idx) => {
											const isCurrent = idx === selectedStepIndex;
											const isNext = idx === currentAutoCountIndex;
											const isFilled = Boolean(token && token.trim());

											let statusTitle = '';
											if (isCurrent && isNext) {
												statusTitle = ' — активний і наступний';
											} else if (isCurrent) {
												statusTitle = ' — активний на полотні';
											} else if (isNext) {
												statusTitle = ' — наступний для штампування (пунктир)';
											}

											return (
												<UnstyledButton
													key={idx}
													className={clsx(
														'step-cube',
														isFilled ? 'filled' : 'empty',
														isNext && 'is-next',
														isCurrent && 'is-current',
													)}
													onClick={() => onSelectStep?.(idx)}
													title={`Крок ${idx + 1}: «${token || 'порожньо'}»${statusTitle}`}
												>
													<span className="step-cube-num">{idx + 1}</span>
													<span className="step-cube-val">{token || '·'}</span>
												</UnstyledButton>
											);
										})}
									</Box>
								</Box>
							</Box>
						)}

						<Box className="stamp-custom-container">
							<Box className="stamp-custom-chips-scroll">
								{COUNT_ITEMS.map((item) => {
									const isActive = !isAutoCountMode && activeStampText === item;
									return (
										<UnstyledButton
											key={item}
											className={clsx('chip', 'count-btn', isActive && 'active')}
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
										</UnstyledButton>
									);
								})}

								{isAutoCountMode && (
									<UnstyledButton
										className="chip count-btn clear-step-btn"
										onClick={onClearCurrentStep}
										title={`Очистити клітинку ${(selectedStepIndex ?? 0) + 1}`}
									>
										<Eraser className="icon" />
									</UnstyledButton>
								)}
							</Box>

							{/* Auto-count mode toggle */}
							<Box className="stamp-custom-actions">
								<UnstyledButton
									className={clsx(
										'chip',
										'custom-chip',
										'auto-count-toggle-btn',
										isAutoCountMode && 'active',
									)}
									title={isAutoCountMode ? 'Вимкнути авторахунок' : 'Увімкнути авторахунок'}
									aria-label="Авторахунок"
									onClick={onToggleAutoCount}
								>
									<ListOrdered className="icon" />
								</UnstyledButton>
							</Box>
						</Box>
					</Box>
				)}

				{/* 4. Custom user stamps */}
				{category === 'custom' &&
					(customStamps.length === 0 ? (
						// Empty state: centered add button
						<Box className="stamp-custom-empty-row">
							<UnstyledButton
								className="stamp-custom-btn-add"
								aria-label="Додати власний штамп"
								title="Додати власний штамп"
								onClick={onOpenAddCustomModal}
							>
								<Plus className="icon" />
							</UnstyledButton>
						</Box>
					) : (
						// Non-empty state: scrollable chip list with pinned add/delete buttons on the right
						<Box className="stamp-custom-container">
							<Box className="stamp-custom-chips-scroll">
								{customStamps.map((text) => {
									const isCustomActive = activeStampText === text;
									return (
										<Box key={text} className="stamp-custom-chip-wrap">
											<UnstyledButton
												className={clsx('chip', 'custom-chip', isCustomActive && 'active')}
												onClick={() => onSelectStampText(text)}
											>
												{text}
											</UnstyledButton>

											{isDeleteMode && (
												<UnstyledButton
													className="stamp-custom-item-delete-btn"
													aria-label={`Видалити штамп ${text}`}
													title="Видалити"
													onClick={(e) => {
														e.stopPropagation();
														onDeleteCustomStamp(text);
													}}
												>
													<X className="icon" />
												</UnstyledButton>
											)}
										</Box>
									);
								})}
							</Box>

							<Box className="stamp-custom-actions">
								<UnstyledButton
									className="stamp-custom-btn-add"
									aria-label="Додати власний штамп"
									title="Додати власний штамп"
									onClick={onOpenAddCustomModal}
								>
									<Plus className="icon" />
								</UnstyledButton>

								<UnstyledButton
									className={clsx(
										'stamp-custom-btn-trash-toggle',
										isDeleteMode && 'active',
									)}
									aria-label={isDeleteMode ? 'Завершити видалення' : 'Режим видалення'}
									title={isDeleteMode ? 'Завершити видалення' : 'Видалити власні штампи'}
									onClick={() => setIsDeleteMode((prev) => !prev)}
								>
									<Trash2 className="icon" />
								</UnstyledButton>
							</Box>
						</Box>
					))}

				{/* 5. Freeform text input */}
				{category === 'text' && (
					<Box className="stamp-text-input-wrap">
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
					</Box>
				)}

				{/* 6. Freehand stamp drawing mode */}
				{category === 'draw' && (
					<Box className={clsx('stamp-draw-actions', classes.drawActions)}>
						<Text
							component="span"
							title="Малюйте штрихи, вони автоматично об'єднаються у штамп через 1 секунду"
							className={classes.drawHint}
						>
							Об&apos;єднується через 1 секунду
						</Text>
						{onToggleDrawDuplicateMode && (
							<Group
								gap="xs"
								align="center"
								className={classes.duplicateGroup}
								onClick={onToggleDrawDuplicateMode}
							>
								<Text
									component="label"
									htmlFor="draw-duplicate-switch"
									className={clsx(
										classes.duplicateLabel,
										isDrawDuplicateMode && classes.duplicateLabelActive,
									)}
								>
									Дублювання
								</Text>
								<Switch
									id="draw-duplicate-switch"
									size="xs"
									checked={isDrawDuplicateMode}
									onChange={(e) => {
										e.stopPropagation();
										onToggleDrawDuplicateMode();
									}}
									aria-label="Режим дублювання малюнка"
									title={
										isDrawDuplicateMode
											? 'Дублювання: увімкнено (клік по полотну ставить копію малюнка)'
											: 'Дублювання: вимкнено (клік починає новий малюнок)'
									}
								/>
							</Group>
						)}
					</Box>
				)}

				{/* 7. Geometric shapes (rectangle, circle, arrow) */}
				{category === 'shapes' && (
					<Box className={clsx('stamp-chips-row fit-width', classes.shapesRow)}>
						<UnstyledButton
							className={clsx(
								'chip',
								'shape-chip',
								classes.shapeChip,
								selectedShape === 'rect' && 'active',
							)}
							onClick={() => onSelectShape?.('rect')}
							title="Прямокутник"
							aria-label="Прямокутник"
						>
							<Square className={clsx('icon', classes.shapeIcon)} />
						</UnstyledButton>

						<UnstyledButton
							className={clsx(
								'chip',
								'shape-chip',
								classes.shapeChip,
								selectedShape === 'circle' && 'active',
							)}
							onClick={() => onSelectShape?.('circle')}
							title="Коло / Овал"
							aria-label="Коло / Овал"
						>
							<Circle className={clsx('icon', classes.shapeIcon)} />
						</UnstyledButton>

						<UnstyledButton
							className={clsx(
								'chip',
								'shape-chip',
								classes.shapeChip,
								selectedShape === 'arrow' && 'active',
							)}
							onClick={() => onSelectShape?.('arrow')}
							title="Стрілка"
							aria-label="Стрілка"
						>
							<MoveRight className={clsx('icon', classes.shapeIcon)} />
						</UnstyledButton>
					</Box>
				)}
			</Box>
		</Box>
	);
}
