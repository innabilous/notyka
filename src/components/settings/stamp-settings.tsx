'use client';

import React, { useState } from 'react';
import { Box, Group, SegmentedControl, Switch, Text, Textarea, UnstyledButton } from '@mantine/core';
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
import { AutoCountItem, ShapeType, StampCategory } from '@/types/editor';

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

	const availableCategories = visibleCategories
		? ALL_STAMP_CATEGORIES_DATA.filter((c) => visibleCategories[c.value as StampCategory] ?? true)
		: ALL_STAMP_CATEGORIES_DATA;
	const displayedCategories =
		availableCategories.length > 0 ? availableCategories : ALL_STAMP_CATEGORIES_DATA;

	return (
		<Box id="stamp-settings">
			{/* Рівень 1: Mantine SegmentedControl для категорій */}
			<Box className="stamp-category-tabs">
				<SegmentedControl
					fullWidth
					size="xs"
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
			</Box>

			{/* Рівень 2: Чипи відповідно до категорії */}
			<Box
				className={`stamp-chips-scroll ${category === 'chords' || category === 'text' || (category === 'count' && isAutoCountMode) ? 'multi-row' : ''}`}
			>
				{/* 1. Ноти та знаки альтерації */}
				{category === 'notes' && (
					<Box className="stamp-chips-row fit-width">
						{NOTES.map((note) => {
							const isNoteActive = selectedNote === note;
							return (
								<UnstyledButton
									key={note}
									className={`chip note-btn ${isNoteActive ? 'active' : ''}`}
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
									className={`chip accidental-btn ${isAccActive ? 'active' : ''}`}
									onClick={() => onSelectAccidental(acc)}
								>
									{acc}
								</UnstyledButton>
							);
						})}
					</Box>
				)}

				{/* 2. Акорди: тоніки, слеш-бас та структуровані позначення без скролу */}
				{category === 'chords' && (
					<Box className="stamp-chords-container">
						{/* Ряд 1: Літери тонік (A B C D E F G), альтерації (#, b) та слеш-опція (/) */}
						<Box className="stamp-chips-row fit-width">
							{CHORD_ROOTS.map((root) => {
								const isRootActive = selectedChordRoot === root;
								return (
									<UnstyledButton
										key={root}
										className={`chip chord-root-btn ${isRootActive ? 'active' : ''}`}
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
										className={`chip accidental-btn ${isAccActive ? 'active' : ''}`}
										onClick={() => onSelectChordAccidental(acc)}
									>
										{acc}
									</UnstyledButton>
								);
							})}
							<Box className="sep" />
							<UnstyledButton
								className={`chip chord-slash-btn ${selectedChordSlash ? 'active' : ''}`}
								title="Слеш-акорд (басова нота)"
								aria-label="Слеш-акорд (басова нота)"
								onClick={onToggleChordSlash}
							>
								{selectedChordSlash && selectedChordBassRoot
									? `/${selectedChordBassRoot}${selectedChordBassAccidental}`
									: '/'}
							</UnstyledButton>
						</Box>

						{/* Ряд Басу (з'являється при увімкненні /) */}
						{selectedChordSlash && (
							<Box className="stamp-chips-row fit-width stamp-chord-bass-row">
								<Text component="span" className="stamp-chord-bass-lbl">/</Text>
								{CHORD_ROOTS.map((root) => {
									const isBassActive = selectedChordBassRoot === root;
									return (
										<UnstyledButton
											key={root}
											className={`chip chord-root-btn ${isBassActive ? 'active' : ''}`}
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
											className={`chip accidental-btn ${isAccActive ? 'active' : ''}`}
											onClick={() => onSelectChordBassAccidental(acc)}
										>
											{acc}
										</UnstyledButton>
									);
								})}
							</Box>
						)}

						{/* Ряд 2: Базові позначення (m, 7, maj7, m7, sus4, sus2, dim, aug) - рівномірно на всю ширину */}
						<Box className="stamp-chips-row fit-width">
							{CHORD_QUALITIES.map((qual) => {
								const isQualActive = selectedChordModifier === qual;
								return (
									<UnstyledButton
										key={qual}
										className={`chip chord-chip ${isQualActive ? 'active' : ''}`}
										onClick={() => onSelectChordModifier(qual)}
									>
										{qual}
									</UnstyledButton>
								);
							})}
						</Box>

						{/* Ряд 3: Розширення (6, m6, 9, maj9, m9, add9, m7b5, 5) - рівномірно на всю ширину */}
						<Box className="stamp-chips-row fit-width">
							{CHORD_EXTENSIONS.map((ext) => {
								const isExtActive = selectedChordModifier === ext;
								return (
									<UnstyledButton
										key={ext}
										className={`chip chord-chip ${isExtActive ? 'active' : ''}`}
										onClick={() => onSelectChordModifier(ext)}
									>
										{ext}
									</UnstyledButton>
								);
							})}
						</Box>
					</Box>
				)}

				{/* 3. Рахунок: Чипи + 32-кроковий секвенсор для Авторахунку */}
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
													className={`step-cube ${isFilled ? 'filled' : 'empty'} ${isNext ? 'is-next' : ''} ${isCurrent ? 'is-current' : ''}`}
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

							{/* Кнопка перемикання авторахунку справа */}
							<Box className="stamp-custom-actions">
								<UnstyledButton
									className={`chip custom-chip auto-count-toggle-btn ${isAutoCountMode ? 'active' : ''}`}
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

				{/* 4. Власні елементи */}
				{category === 'custom' && (
					customStamps.length === 0 ? (
						//! Якщо власних елементів ще немає — плюс по центру
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
						//! Якщо є елементи — список скролиться зліва, а плюс і кошик закріплені справа
						<Box className="stamp-custom-container">
							<Box className="stamp-custom-chips-scroll">
								{customStamps.map((text) => {
									const isCustomActive = activeStampText === text;
									return (
										<Box key={text} className="stamp-custom-chip-wrap">
											<UnstyledButton
												className={`chip custom-chip ${isCustomActive ? 'active' : ''}`}
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
									className={`stamp-custom-btn-trash-toggle ${isDeleteMode ? 'active' : ''}`}
									aria-label={isDeleteMode ? 'Завершити видалення' : 'Режим видалення'}
									title={isDeleteMode ? 'Завершити видалення' : 'Видалити власні штампи'}
									onClick={() => setIsDeleteMode((prev) => !prev)}
								>
									<Trash2 className="icon" />
								</UnstyledButton>
							</Box>
						</Box>
					)
				)}

				{/* 5. Довільний текст */}
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

				{/* 6. Режим довільного малювання */}
				{category === 'draw' && (
					<Box
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
						<Text
							component="span"
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
						</Text>
						{onToggleDrawDuplicateMode && (
							<Group
								gap="xs"
								align="center"
								style={{ flexShrink: 0, cursor: 'pointer' }}
								onClick={onToggleDrawDuplicateMode}
							>
								<Text
									component="label"
									htmlFor="draw-duplicate-switch"
									style={{
										fontSize: '0.75rem',
										fontWeight: 500,
										color: isDrawDuplicateMode ? 'var(--text)' : 'var(--muted)',
										cursor: 'pointer',
										userSelect: 'none',
										whiteSpace: 'nowrap',
									}}
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
				{/* 7. Фігури (прямокутник, коло, стрілка) */}
				{category === 'shapes' && (
					<Box
						className="stamp-chips-row fit-width"
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '0.45rem',
							width: '100%',
							justifyContent: 'center',
						}}
					>
						<UnstyledButton
							className={`chip shape-chip ${selectedShape === 'rect' ? 'active' : ''}`}
							onClick={() => onSelectShape?.('rect')}
							title="Прямокутник"
							aria-label="Прямокутник"
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '0.4rem 0.85rem',
							}}
						>
							<Square className="icon" style={{ width: '1rem', height: '1rem' }} />
						</UnstyledButton>

						<UnstyledButton
							className={`chip shape-chip ${selectedShape === 'circle' ? 'active' : ''}`}
							onClick={() => onSelectShape?.('circle')}
							title="Коло / Овал"
							aria-label="Коло / Овал"
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '0.4rem 0.85rem',
							}}
						>
							<Circle className="icon" style={{ width: '1rem', height: '1rem' }} />
						</UnstyledButton>

						<UnstyledButton
							className={`chip shape-chip ${selectedShape === 'arrow' ? 'active' : ''}`}
							onClick={() => onSelectShape?.('arrow')}
							title="Стрілка"
							aria-label="Стрілка"
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '0.4rem 0.85rem',
							}}
						>
							<MoveRight className="icon" style={{ width: '1rem', height: '1rem' }} />
						</UnstyledButton>
					</Box>
				)}
			</Box>
		</Box>
	);
};
