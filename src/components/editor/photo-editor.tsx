'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mantine/core';
import { AppPreloader } from '@/components/common/app-preloader';
import { ColorPaletteModal } from '@/components/modals/color-palette-modal';
import { CustomStampModal } from '@/components/modals/custom-stamp-modal';
import { ImageCropModal } from '@/components/modals/image-crop-modal';
import { ImageMenuModal } from '@/components/modals/image-menu-modal';
import { ProjectsHistoryModal } from '@/components/modals/projects-history-modal';
import { SettingsModal } from '@/components/modals/settings-modal';
import { BrushSettings } from '@/components/settings/brush-settings';
import { RulerSettings } from '@/components/settings/ruler-settings';
import { SelectCategoryBar } from '@/components/settings/select-category-bar';
import { SideSizeSlider } from '@/components/settings/side-size-slider';
import { StampCategory, StampSettings } from '@/components/settings/stamp-settings';
import { BottomToolbar } from '@/components/toolbar/bottom-toolbar';
import { ToolbarSkeleton } from '@/components/toolbar/toolbar-skeleton';
import { TopToolbar } from '@/components/toolbar/top-toolbar';
import {
	ACCIDENTALS,
	CHORD_ROOTS,
	COUNT_ITEMS,
	COUNT_PATTERN_STEP,
	DEFAULT_AUTO_COUNT_SEQUENCE,
	DEFAULT_COUNT_PATTERN,
	DEFAULT_VISIBLE_STAMP_CATEGORIES,
	DEFAULT_VISIBLE_TOOLS,
	MAX_COUNT_PATTERN_LENGTH,
	MIN_COUNT_PATTERN_LENGTH,
	NOTES,
} from '@/constants/editor';
import {
	AutoCountItem,
	SelectFilterCategory,
	SelectionMode,
	SelectionShape,
	ShapeType,
	StampItem,
	ToolMode,
} from '@/types/editor';
import { ProjectItem } from '@/types/storage';
import { getStampCategory } from '@/utils/canvas-renderer';
import {
	clearAllStorage,
	deleteProject,
	getProjectsList,
	loadCurrentSession,
	loadSettings,
	saveCurrentSession,
	saveProject,
	saveSettings,
} from '@/utils/storage';
import { CanvasStage, CanvasStageHandle } from './canvas-stage';

export const PhotoEditor: React.FC = () => {
	const stageRef = useRef<CanvasStageHandle | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const isMountedRef = useRef<boolean>(false);
	const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [hasCanvas, setHasCanvas] = useState<boolean>(false);
	const [currentMode, setCurrentMode] = useState<ToolMode>('pencil');
	const [canUndo, setCanUndo] = useState<boolean>(false);
	const [canRedo, setCanRedo] = useState<boolean>(false);

	// Tool colors memory
	const [toolColors, setToolColors] = useState<
		Record<'pencil' | 'stamp', { main: string; stroke: string }>
	>({
		pencil: { main: '#ed1c24', stroke: '#000000' },
		stamp: { main: '#ed1c24', stroke: 'transparent' },
	});

	// Independent color memory per stamp category
	const [categoryColors, setCategoryColors] = useState<
		Record<StampCategory, { main: string; stroke: string }>
	>({
		notes: { main: '#ed1c24', stroke: 'transparent' },
		chords: { main: '#ed1c24', stroke: 'transparent' },
		count: { main: '#ed1c24', stroke: 'transparent' },
		custom: { main: '#ed1c24', stroke: 'transparent' },
		text: { main: '#ed1c24', stroke: 'transparent' },
		draw: { main: '#ed1c24', stroke: 'transparent' },
		shapes: { main: 'transparent', stroke: '#ed1c24' },
	});

	// Selected shape type and independent sizes for shapes stamp category
	const [selectedShape, setSelectedShape] = useState<ShapeType>('rect');
	const [shapeSizes, setShapeSizes] = useState<Record<ShapeType, number>>({
		rect: 2,
		circle: 2,
		arrow: 2,
	});

	// Independent tool sizes
	const [toolSizes, setToolSizes] = useState<Record<ToolMode, number>>({
		select: 8,
		pencil: 2,
		stamp: 8,
		eraser: 24,
		ruler: 24,
	});

	const [selectedNote, setSelectedNote] = useState<string>('До');
	const [selectedAccidental, setSelectedAccidental] = useState<string>('');
	const [selectedChordRoot, setSelectedChordRoot] = useState<string>('C');
	const [selectedChordAccidental, setSelectedChordAccidental] = useState<string>('');
	const [selectedChordModifier, setSelectedChordModifier] = useState<string>('');
	const [selectedChordSlash, setSelectedChordSlash] = useState<boolean>(false);
	const [selectedChordBassRoot, setSelectedChordBassRoot] = useState<string>('');
	const [selectedChordBassAccidental, setSelectedChordBassAccidental] = useState<string>('');
	const [stampBadgeMode, setStampBadgeMode] = useState<boolean>(false);
	const [activeStampText, setActiveStampText] = useState<string>('До');
	const [stampCategory, setStampCategory] = useState<StampCategory>('notes');
	const [customStamps, setCustomStamps] = useState<string[]>([]);
	const [selectedCount, setSelectedCount] = useState<string>('1');
	const [isAutoCountMode, setIsAutoCountMode] = useState<boolean>(false);
	const [countPattern, setCountPattern] =
		useState<readonly string[]>(DEFAULT_COUNT_PATTERN);
	const countPatternRef = useRef<readonly string[]>(countPattern);
	useEffect(() => {
		countPatternRef.current = countPattern;
	}, [countPattern]);
	const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
	const [autoCountSequence, setAutoCountSequence] =
		useState<AutoCountItem[]>(DEFAULT_AUTO_COUNT_SEQUENCE);
	const [autoCountIndex, setAutoCountIndex] = useState<number>(0);
	const [selectedCustom, setSelectedCustom] = useState<string>('');
	const [customText, setCustomText] = useState<string>('Текст');
	const [customStampModalOpen, setCustomStampModalOpen] = useState<boolean>(false);
	const [drawDuplicateMode, setDrawDuplicateMode] = useState<boolean>(false);
	const [sizeLocked, setSizeLocked] = useState<boolean>(true);
	const [noteSizes, setNoteSizes] = useState<Record<string, number>>({});

	const [deleteBtnOn, setDeleteBtnOn] = useState<boolean>(true);
	const [resizeHandlesOn, setResizeHandlesOn] = useState<boolean>(true);
	const [isSideSliderOpen, setIsSideSliderOpen] = useState<boolean>(false);
	const [canvasScale, setCanvasScale] = useState<number>(1);
	const [rulersVisible, setRulersVisible] = useState<boolean>(true);
	const [rulersSnap, setRulersSnap] = useState<boolean>(true);
	const [rulersSnapItems, setRulersSnapItems] = useState<boolean>(true); //! За замовчуванням увімкнено прив'язку до нот на інших лінійках
	const [rulersAttachContent, setRulersAttachContent] = useState<boolean>(true); //! За замовчуванням увімкнено спільний рух
	const [rulersShowDistance, setRulersShowDistance] = useState<boolean>(false);
	const [rulersLockEqualDistance, setRulersLockEqualDistance] = useState<boolean>(false);
	const [areaSelectEnabled, setAreaSelectEnabled] = useState<boolean>(false);
	const [selectionShape, setSelectionShape] = useState<SelectionShape>('rect');
	const [selectionMode, setSelectionMode] = useState<SelectionMode>('inside');
	const [selectFilterCategory, setSelectFilterCategory] = useState<SelectFilterCategory>('all');
	const [availableStampCategories, setAvailableStampCategories] = useState<StampCategory[]>([]);
	const [selectedStampsCount, setSelectedStampsCount] = useState<number>(0);
	const [rulersCount, setRulersCount] = useState<number>(0);
	const [compactRulers, setCompactRulers] = useState<boolean>(false); //! Опція компактного вигляду лінійок у топбарі
	const [visibleTools, setVisibleTools] =
		useState<Record<ToolMode, boolean>>(DEFAULT_VISIBLE_TOOLS);
	const [visibleStampCategories, setVisibleStampCategories] =
		useState<Record<StampCategory, boolean>>(DEFAULT_VISIBLE_STAMP_CATEGORIES);
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
	const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
	const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);

	// Image crop & edit modal state
	const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
	const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
	const [cropFileName, setCropFileName] = useState<string>('');

	// Custom toast state matching #toast from original code
	const [toastText, setToastText] = useState<string>('');
	const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

	const showToast = useCallback((message: string) => {
		setToastText(message);
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		toastTimerRef.current = setTimeout(() => {
			setToastText('');
		}, 1800);
	}, []);

	//! Якщо обрана категорія зникла з полотна — скидаємо фільтр на 'all'
	useEffect(() => {
		if (
			selectFilterCategory !== 'all' &&
			!availableStampCategories.includes(selectFilterCategory as StampCategory)
		) {
			setSelectFilterCategory('all');
		}
	}, [availableStampCategories, selectFilterCategory]);

	// Outside click listener for popups
	useEffect(() => {
		const handleDocClick = (e: MouseEvent) => {
			const path = e.composedPath();
			const isInsideMenu = path.some((el) => {
				const htmlEl = el as HTMLElement;
				return htmlEl?.id === 'image-menu' || htmlEl?.id === 'btn-toggle-menu';
			});
			if (!isInsideMenu) {
				setIsMenuOpen(false);
			}

			const isInsidePalette = path.some((el) => {
				const htmlEl = el as HTMLElement;
				return htmlEl?.id === 'color-palette-popup' || htmlEl?.id === 'btn-toggle-palette';
			});
			if (!isInsidePalette) {
				setIsPaletteOpen(false);
			}
		};

		const handleBeforeUnload = () => {
			if (autoSaveTimerRef.current && stageRef.current) {
				clearTimeout(autoSaveTimerRef.current);
				stageRef.current.serializeProject().then((project) => {
					if (project) {
						project.countPattern = [...countPatternRef.current];
						saveCurrentSession(project);
						saveProject(project);
					}
				});
			}
		};

		document.addEventListener('click', handleDocClick);
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			document.removeEventListener('click', handleDocClick);
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	// Initial restore from localStorage & IndexedDB
	useEffect(() => {
		const savedSettings = loadSettings();
		if (savedSettings) {
			if (savedSettings.currentMode) setCurrentMode(savedSettings.currentMode);
			if (savedSettings.toolSizes)
				setToolSizes((prev) => ({ ...prev, ...savedSettings.toolSizes }));
			if (savedSettings.toolColors) setToolColors(savedSettings.toolColors);
			if (savedSettings.categoryColors)
				setCategoryColors((prev) => ({ ...prev, ...savedSettings.categoryColors }));
			if (savedSettings.selectedNote) setSelectedNote(savedSettings.selectedNote);
			if (savedSettings.selectedAccidental !== undefined)
				setSelectedAccidental(savedSettings.selectedAccidental);
			if (savedSettings.selectedChordRoot)
				setSelectedChordRoot(savedSettings.selectedChordRoot);
			if (savedSettings.selectedChordAccidental !== undefined)
				setSelectedChordAccidental(savedSettings.selectedChordAccidental);
			if (savedSettings.selectedChordModifier !== undefined)
				setSelectedChordModifier(savedSettings.selectedChordModifier);
			if (savedSettings.selectedChordSlash !== undefined)
				setSelectedChordSlash(savedSettings.selectedChordSlash);
			if (savedSettings.selectedChordBassRoot !== undefined)
				setSelectedChordBassRoot(savedSettings.selectedChordBassRoot);
			if (savedSettings.selectedChordBassAccidental !== undefined)
				setSelectedChordBassAccidental(savedSettings.selectedChordBassAccidental);
			if (savedSettings.stampBadgeMode !== undefined)
				setStampBadgeMode(savedSettings.stampBadgeMode);
			if (savedSettings.activeStampText) setActiveStampText(savedSettings.activeStampText);
			if (savedSettings.stampCategory)
				setStampCategory(savedSettings.stampCategory as StampCategory);
			if (savedSettings.customStamps) setCustomStamps(savedSettings.customStamps);
			if (savedSettings.sizeLocked !== undefined) setSizeLocked(savedSettings.sizeLocked);
			if (savedSettings.noteSizes) setNoteSizes(savedSettings.noteSizes);
			if (savedSettings.deleteBtnOn !== undefined) setDeleteBtnOn(savedSettings.deleteBtnOn);
			if (savedSettings.resizeHandlesOn !== undefined)
				setResizeHandlesOn(savedSettings.resizeHandlesOn);
			if (savedSettings.visibleTools)
				setVisibleTools((prev) => ({ ...prev, ...savedSettings.visibleTools }));
			if (savedSettings.visibleStampCategories)
				setVisibleStampCategories((prev) => ({ ...prev, ...savedSettings.visibleStampCategories }));
			if (savedSettings.rulersVisible !== undefined)
				setRulersVisible(savedSettings.rulersVisible);
			if (savedSettings.rulersSnap !== undefined)
				setRulersSnap(savedSettings.rulersSnap);
			if (savedSettings.rulersSnapItems !== undefined)
				setRulersSnapItems(savedSettings.rulersSnapItems);
			if (savedSettings.rulersAttachContent !== undefined)
				setRulersAttachContent(savedSettings.rulersAttachContent);
			if (savedSettings.rulersShowDistance !== undefined)
				setRulersShowDistance(savedSettings.rulersShowDistance);
			if (savedSettings.rulersLockEqualDistance !== undefined)
				setRulersLockEqualDistance(savedSettings.rulersLockEqualDistance);
			if (savedSettings.compactRulers !== undefined)
				setCompactRulers(savedSettings.compactRulers);
			if (savedSettings.areaSelectEnabled !== undefined)
				setAreaSelectEnabled(savedSettings.areaSelectEnabled);
			if (savedSettings.selectionShape) setSelectionShape(savedSettings.selectionShape);
			if (savedSettings.selectionMode) setSelectionMode(savedSettings.selectionMode);
			if (savedSettings.customText) setCustomText(savedSettings.customText);
			if (savedSettings.isAutoCountMode !== undefined)
				setIsAutoCountMode(savedSettings.isAutoCountMode);
			if (savedSettings.countPattern && Array.isArray(savedSettings.countPattern)) {
				const pattern = [...savedSettings.countPattern];
				while (pattern.length < MIN_COUNT_PATTERN_LENGTH) pattern.push('');
				setCountPattern(pattern.slice(0, MAX_COUNT_PATTERN_LENGTH));
			} else if (savedSettings.autoCountSequence && Array.isArray(savedSettings.autoCountSequence)) {
				const pattern = savedSettings.autoCountSequence.map((it) => it.text);
				while (pattern.length < MIN_COUNT_PATTERN_LENGTH) pattern.push('');
				setCountPattern(pattern.slice(0, MAX_COUNT_PATTERN_LENGTH));
			}
		}

		loadCurrentSession()
			.then((session) => {
				if (session && stageRef.current) {
					stageRef.current.loadProject(session);
					if (
						session.countPattern &&
						Array.isArray(session.countPattern) &&
						session.countPattern.length >= MIN_COUNT_PATTERN_LENGTH
					) {
						setCountPattern(session.countPattern.slice(0, MAX_COUNT_PATTERN_LENGTH));
					}
					setHasCanvas(true);
				}
			})
			.finally(() => {
				setTimeout(() => {
					setIsLoading(false);
				}, 250);
			});

		isMountedRef.current = true;
	}, []);

	// Persist settings changes to localStorage
	useEffect(() => {
		if (!isMountedRef.current) return;
		saveSettings({
			currentMode,
			toolSizes,
			toolColors,
			categoryColors,
			selectedNote,
			selectedAccidental,
			selectedChordRoot,
			selectedChordAccidental,
			selectedChordModifier,
			selectedChordSlash,
			selectedChordBassRoot,
			selectedChordBassAccidental,
			stampBadgeMode,
			activeStampText,
			stampCategory,
			customStamps,
			sizeLocked,
			noteSizes,
			deleteBtnOn,
			resizeHandlesOn,
			visibleTools,
			visibleStampCategories,
			rulersVisible,
			rulersSnap,
			rulersSnapItems,
			rulersAttachContent,
			rulersShowDistance,
			rulersLockEqualDistance,
			compactRulers,
			areaSelectEnabled,
			selectionShape,
			selectionMode,
			customText,
			isAutoCountMode,
			countPattern: [...countPattern],
			autoCountSequence,
		});
	}, [
		activeStampText,
		areaSelectEnabled,
		autoCountSequence,
		categoryColors,
		compactRulers,
		countPattern,
		currentMode,
		customStamps,
		customText,
		deleteBtnOn,
		isAutoCountMode,
		noteSizes,
		resizeHandlesOn,
		rulersAttachContent,
		rulersLockEqualDistance,
		rulersShowDistance,
		rulersSnap,
		rulersSnapItems,
		rulersVisible,
		selectedAccidental,
		selectedChordAccidental,
		selectedChordBassAccidental,
		selectedChordBassRoot,
		selectedChordModifier,
		selectedChordRoot,
		selectedChordSlash,
		selectedNote,
		selectionMode,
		selectionShape,
		sizeLocked,
		stampBadgeMode,
		stampCategory,
		toolColors,
		toolSizes,
		visibleStampCategories,
		visibleTools,
	]);

	const currentSize = useMemo(() => {
		if ((currentMode === 'stamp' || currentMode === 'select') && stampCategory === 'shapes') {
			return shapeSizes[selectedShape] ?? 2;
		}
		if (currentMode === 'select') {
			return toolSizes.stamp ?? 24;
		}
		return toolSizes[currentMode] ?? 24;
	}, [currentMode, selectedShape, shapeSizes, stampCategory, toolSizes]);

	const currentMainColor = useMemo(() => {
		if (currentMode !== 'stamp' && currentMode !== 'select') return toolColors.pencil.main;
		if (stampCategory === 'shapes') {
			if (selectedShape === 'arrow') {
				const arrowColor =
					categoryColors.shapes?.stroke && categoryColors.shapes.stroke !== 'transparent'
						? categoryColors.shapes.stroke
						: categoryColors.shapes?.main && categoryColors.shapes.main !== 'transparent'
							? categoryColors.shapes.main
							: '#ed1c24';
				return arrowColor;
			}
			return categoryColors.shapes?.main ?? 'transparent';
		}
		return categoryColors[stampCategory]?.main ?? '#ed1c24';
	}, [
		categoryColors,
		currentMode,
		selectedShape,
		stampCategory,
		toolColors.pencil.main,
	]);

	const currentStrokeColor = useMemo(() => {
		if (currentMode !== 'stamp' && currentMode !== 'select') return toolColors.pencil.stroke;
		if (stampCategory === 'shapes') {
			if (selectedShape === 'arrow') {
				const arrowColor =
					categoryColors.shapes?.stroke && categoryColors.shapes.stroke !== 'transparent'
						? categoryColors.shapes.stroke
						: categoryColors.shapes?.main && categoryColors.shapes.main !== 'transparent'
							? categoryColors.shapes.main
							: '#ed1c24';
				return arrowColor;
			}
			return categoryColors.shapes?.stroke ?? '#ed1c24';
		}
		return categoryColors[stampCategory]?.stroke ?? 'transparent';
	}, [
		categoryColors,
		currentMode,
		selectedShape,
		stampCategory,
		toolColors.pencil.stroke,
	]);

	const getStampKey = useCallback(
		(note: string, acc: string, customText?: string) => customText || `${note}${acc}`,
		[],
	);

	const handleContentChange = useCallback(() => {
		if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
		autoSaveTimerRef.current = setTimeout(async () => {
			if (!stageRef.current) return;
			const project = await stageRef.current.serializeProject();
			if (project) {
				project.countPattern = [...countPatternRef.current];
				await saveCurrentSession(project);
				await saveProject(project);
			}
		}, 800);
	}, []);

	const handleSelectMode = useCallback(
		(mode: ToolMode) => {
			if (mode !== 'stamp' && mode !== 'select') {
				stageRef.current?.commitActiveStamp();
			}

			if (autoSaveTimerRef.current && stageRef.current) {
				clearTimeout(autoSaveTimerRef.current);
				stageRef.current.serializeProject().then((project) => {
					if (project) {
						project.countPattern = [...countPatternRef.current];
						saveCurrentSession(project);
						saveProject(project);
					}
				});
			}

			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
				}));
			}

			if (currentMode === 'select' && mode !== 'select') {
				stageRef.current?.clearSelection();
				setSelectedStampsCount(0);
			}

			setCurrentMode(mode);
			setIsPaletteOpen(false);

			if (!sizeLocked && mode === 'stamp') {
				const key = getStampKey(selectedNote, selectedAccidental, activeStampText);
				if (noteSizes[key] != null) {
					setToolSizes((prev) => ({
						...prev,
						stamp: noteSizes[key],
					}));
				}
			}
		},
		[
			activeStampText,
			currentMode,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedNote,
			sizeLocked,
			stampCategory,
			toolSizes.stamp,
		],
	);

	const handleSelectNote = useCallback(
		(note: string) => {
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
				}));
			}

			setSelectedNote(note);
			const fullNoteText = `${note}${selectedAccidental}`;
			setActiveStampText(fullNoteText);

			const key = getStampKey(note, selectedAccidental, fullNoteText);
			const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : toolSizes.stamp;
			if (!sizeLocked && noteSizes[key] != null) {
				setToolSizes((prev) => ({
					...prev,
					stamp: newSize,
				}));
			}

			stageRef.current?.updateActiveStampProps(
				newSize,
				fullNoteText,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			activeStampText,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedNote,
			sizeLocked,
			stampCategory,
			toolSizes.stamp,
		],
	);

	const handleSelectAccidental = useCallback(
		(acc: string) => {
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
				}));
			}

			const nextAcc = selectedAccidental === acc ? '' : acc;
			setSelectedAccidental(nextAcc);
			const fullNoteText = `${selectedNote}${nextAcc}`;
			setActiveStampText(fullNoteText);

			const key = getStampKey(selectedNote, nextAcc, fullNoteText);
			const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : toolSizes.stamp;
			if (!sizeLocked && noteSizes[key] != null) {
				setToolSizes((prev) => ({
					...prev,
					stamp: newSize,
				}));
			}

			stageRef.current?.updateActiveStampProps(
				newSize,
				fullNoteText,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			activeStampText,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedNote,
			sizeLocked,
			stampCategory,
			toolSizes.stamp,
		],
	);

	const handleSelectStampText = useCallback(
		(text: string) => {
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
				}));
			}

			setActiveStampText(text);

			if (stampCategory === 'count') {
				setSelectedCount(text);
			} else if (stampCategory === 'custom') {
				setSelectedCustom(text);
			}

			const key = text;
			const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : toolSizes.stamp;
			if (!sizeLocked && noteSizes[key] != null) {
				setToolSizes((prev) => ({
					...prev,
					stamp: newSize,
				}));
			}

			stageRef.current?.updateActiveStampProps(
				newSize,
				text,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			activeStampText,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedNote,
			sizeLocked,
			stampCategory,
			toolSizes.stamp,
		],
	);

	//! Побудова тексту акорду з опційним слеш-басом (наприклад, G/B, Dm/F#)
	const buildChordText = useCallback(
		(
			root: string,
			acc: string,
			mod: string,
			hasSlash: boolean,
			bassRoot: string,
			bassAcc: string,
		): string => {
			const main = `${root}${acc}${mod}` || root || 'C';
			if (hasSlash && bassRoot) {
				return `${main}/${bassRoot}${bassAcc}`;
			}
			if (hasSlash && !bassRoot) {
				return `${main}/`;
			}
			return main;
		},
		[],
	);

	//! Вибір тоніки акорду (A B C D E F G)
	const handleSelectChordRoot = useCallback(
		(root: string) => {
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
				}));
			}

			const nextRoot = selectedChordRoot === root && selectedChordModifier !== '' ? '' : root;
			setSelectedChordRoot(nextRoot);

			const fullChord = buildChordText(
				nextRoot,
				selectedChordAccidental,
				selectedChordModifier,
				selectedChordSlash,
				selectedChordBassRoot,
				selectedChordBassAccidental,
			);
			setActiveStampText(fullChord);

			const key = fullChord;
			const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : toolSizes.stamp;
			if (!sizeLocked && noteSizes[key] != null) {
				setToolSizes((prev) => ({
					...prev,
					stamp: newSize,
				}));
			}

			stageRef.current?.updateActiveStampProps(
				newSize,
				fullChord,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			activeStampText,
			buildChordText,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedChordAccidental,
			selectedChordBassAccidental,
			selectedChordBassRoot,
			selectedChordModifier,
			selectedChordRoot,
			selectedChordSlash,
			selectedNote,
			sizeLocked,
			stampCategory,
			toolSizes.stamp,
		],
	);

	//! Вибір знаку альтерації акорду (#, b)
	const handleSelectChordAccidental = useCallback(
		(acc: string) => {
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
				}));
			}

			const nextAcc = selectedChordAccidental === acc ? '' : acc;
			setSelectedChordAccidental(nextAcc);

			const fullChord = buildChordText(
				selectedChordRoot,
				nextAcc,
				selectedChordModifier,
				selectedChordSlash,
				selectedChordBassRoot,
				selectedChordBassAccidental,
			);
			setActiveStampText(fullChord);

			const key = fullChord;
			const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : toolSizes.stamp;
			if (!sizeLocked && noteSizes[key] != null) {
				setToolSizes((prev) => ({
					...prev,
					stamp: newSize,
				}));
			}

			stageRef.current?.updateActiveStampProps(
				newSize,
				fullChord,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			activeStampText,
			buildChordText,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedChordAccidental,
			selectedChordBassAccidental,
			selectedChordBassRoot,
			selectedChordModifier,
			selectedChordRoot,
			selectedChordSlash,
			selectedNote,
			sizeLocked,
			stampCategory,
			toolSizes.stamp,
		],
	);

	//! Вибір позначення/розширення акорду (m, 7, maj7, sus4 тощо)
	const handleSelectChordModifier = useCallback(
		(modifier: string) => {
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
				}));
			}

			const nextMod = selectedChordModifier === modifier ? '' : modifier;
			setSelectedChordModifier(nextMod);

			const fullChord = buildChordText(
				selectedChordRoot,
				selectedChordAccidental,
				nextMod,
				selectedChordSlash,
				selectedChordBassRoot,
				selectedChordBassAccidental,
			);
			setActiveStampText(fullChord);

			const key = fullChord;
			const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : toolSizes.stamp;
			if (!sizeLocked && noteSizes[key] != null) {
				setToolSizes((prev) => ({
					...prev,
					stamp: newSize,
				}));
			}

			stageRef.current?.updateActiveStampProps(
				newSize,
				fullChord,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			activeStampText,
			buildChordText,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedChordAccidental,
			selectedChordBassAccidental,
			selectedChordBassRoot,
			selectedChordModifier,
			selectedChordRoot,
			selectedChordSlash,
			selectedNote,
			sizeLocked,
			stampCategory,
			toolSizes.stamp,
		],
	);

	//! Перемикання режиму слеш-акорду (басова нота)
	const handleToggleChordSlash = useCallback(() => {
		if (!sizeLocked && currentMode === 'stamp') {
			setNoteSizes((prev) => ({
				...prev,
				[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
			}));
		}

		const nextSlash = !selectedChordSlash;
		setSelectedChordSlash(nextSlash);

		const fullChord = buildChordText(
			selectedChordRoot,
			selectedChordAccidental,
			selectedChordModifier,
			nextSlash,
			selectedChordBassRoot,
			selectedChordBassAccidental,
		);
		setActiveStampText(fullChord);

		const key = fullChord;
		const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : toolSizes.stamp;
		if (!sizeLocked && noteSizes[key] != null) {
			setToolSizes((prev) => ({
				...prev,
				stamp: newSize,
			}));
		}

		stageRef.current?.updateActiveStampProps(
			newSize,
			fullChord,
			currentMainColor,
			currentStrokeColor,
		);
	}, [
		activeStampText,
		buildChordText,
		currentMainColor,
		currentMode,
		currentStrokeColor,
		getStampKey,
		noteSizes,
		selectedAccidental,
		selectedChordAccidental,
		selectedChordBassAccidental,
		selectedChordBassRoot,
		selectedChordModifier,
		selectedChordRoot,
		selectedChordSlash,
		selectedNote,
		selectionMode,
		selectionShape,
		sizeLocked,
		toolSizes.stamp,
	]);

	//! Вибір тоніки басу для слеш-акорду (/B, /F тощо)
	const handleSelectChordBassRoot = useCallback(
		(root: string) => {
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
				}));
			}

			const nextBassRoot = selectedChordBassRoot === root ? '' : root;
			setSelectedChordBassRoot(nextBassRoot);

			const fullChord = buildChordText(
				selectedChordRoot,
				selectedChordAccidental,
				selectedChordModifier,
				true,
				nextBassRoot,
				selectedChordBassAccidental,
			);
			setActiveStampText(fullChord);

			const key = fullChord;
			const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : toolSizes.stamp;
			if (!sizeLocked && noteSizes[key] != null) {
				setToolSizes((prev) => ({
					...prev,
					stamp: newSize,
				}));
			}

			stageRef.current?.updateActiveStampProps(
				newSize,
				fullChord,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			activeStampText,
			buildChordText,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedChordAccidental,
			selectedChordBassAccidental,
			selectedChordBassRoot,
			selectedChordModifier,
			selectedChordRoot,
			selectedNote,
			sizeLocked,
			stampCategory,
			toolSizes.stamp,
		],
	);

	//! Вибір знаку альтерації басу (#, b)
	const handleSelectChordBassAccidental = useCallback(
		(acc: string) => {
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
				}));
			}

			const nextBassAcc = selectedChordBassAccidental === acc ? '' : acc;
			setSelectedChordBassAccidental(nextBassAcc);

			const fullChord = buildChordText(
				selectedChordRoot,
				selectedChordAccidental,
				selectedChordModifier,
				true,
				selectedChordBassRoot,
				nextBassAcc,
			);
			setActiveStampText(fullChord);

			const key = fullChord;
			const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : toolSizes.stamp;
			if (!sizeLocked && noteSizes[key] != null) {
				setToolSizes((prev) => ({
					...prev,
					stamp: newSize,
				}));
			}

			stageRef.current?.updateActiveStampProps(
				newSize,
				fullChord,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			activeStampText,
			buildChordText,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedChordAccidental,
			selectedChordBassAccidental,
			selectedChordBassRoot,
			selectedChordModifier,
			selectedChordRoot,
			selectedNote,
			sizeLocked,
			stampCategory,
			toolSizes.stamp,
		],
	);

	const handleToggleAutoCount = useCallback(() => {
		setIsAutoCountMode((prev) => {
			const next = !prev;
			if (next) {
				const len = countPattern.length;
				let found = -1;
				for (let i = 0; i < len; i++) {
					const idx = (autoCountIndex + i) % len;
					if (countPattern[idx] && countPattern[idx].trim()) {
						found = idx;
						break;
					}
				}
				if (found !== -1) {
					setAutoCountIndex(found);
					setSelectedStepIndex(found);
					setActiveStampText(countPattern[found]);
					showToast(`Авторахунок: крок ${found + 1} «${countPattern[found]}»`);
				} else {
					showToast('Авторахунок увімкнено (патерн порожній)');
				}
			} else {
				const countItem = (COUNT_ITEMS as readonly string[]).includes(selectedCount)
					? selectedCount
					: COUNT_ITEMS[0];
				setActiveStampText(countItem);
				showToast('Звичайний режим рахунку');
			}
			return next;
		});
	}, [autoCountIndex, countPattern, selectedCount, showToast]);

	const handleSelectStep = useCallback(
		(index: number) => {
			setSelectedStepIndex(index);
			setAutoCountIndex(index);
			if (countPattern[index] && countPattern[index].trim()) {
				setActiveStampText(countPattern[index]);
			}
		},
		[countPattern],
	);

	const handleAssignTokenToStep = useCallback(
		(token: string) => {
			setCountPattern((prev) => {
				const next = [...prev];
				next[selectedStepIndex] = token;
				return next;
			});
			if (selectedStepIndex === autoCountIndex) {
				setActiveStampText(token);
			}
			const nextIdx = (selectedStepIndex + 1) % countPattern.length;
			setSelectedStepIndex(nextIdx);
			setAutoCountIndex(nextIdx);
		},
		[autoCountIndex, countPattern.length, selectedStepIndex],
	);

	const handleClearCurrentStep = useCallback(() => {
		setCountPattern((prev) => {
			const next = [...prev];
			next[selectedStepIndex] = '';
			return next;
		});
		const nextIdx = (selectedStepIndex + 1) % countPattern.length;
		setSelectedStepIndex(nextIdx);
		setAutoCountIndex(nextIdx);
	}, [countPattern.length, selectedStepIndex]);

	const handleResetCountPattern = useCallback(() => {
		setCountPattern([...DEFAULT_COUNT_PATTERN]);
		setSelectedStepIndex(0);
		setAutoCountIndex(0);
		setActiveStampText(DEFAULT_COUNT_PATTERN[0]);
		showToast('Патерн скинуто до стандартного (16 кроків)');
	}, [showToast]);

	const handleAddSteps = useCallback(() => {
		setCountPattern((prev) => {
			if (prev.length >= MAX_COUNT_PATTERN_LENGTH) return prev;
			const next = [...prev, ...Array(COUNT_PATTERN_STEP).fill('')];
			return next;
		});
		showToast(`Патерн розширено (+16 кроків)`);
	}, [showToast]);

	const handleRemoveSteps = useCallback(() => {
		setCountPattern((prev) => {
			if (prev.length <= MIN_COUNT_PATTERN_LENGTH) return prev;
			const newLen = prev.length - COUNT_PATTERN_STEP;
			return prev.slice(0, newLen);
		});
		setSelectedStepIndex((prev) => {
			const maxIdx = Math.max(0, countPattern.length - COUNT_PATTERN_STEP - 1);
			return prev > maxIdx ? maxIdx : prev;
		});
		setAutoCountIndex((prev) => {
			const maxIdx = Math.max(0, countPattern.length - COUNT_PATTERN_STEP - 1);
			return prev > maxIdx ? 0 : prev;
		});
		showToast(`Патерн скорочено (-16 кроків)`);
	}, [countPattern.length, showToast]);

	const handleAdvanceAutoCount = useCallback(() => {
		setAutoCountIndex((prevIdx) => {
			const len = countPattern.length;
			if (len === 0) return prevIdx;
			let nextIdx = prevIdx;
			for (let i = 1; i <= len; i++) {
				const candidate = (prevIdx + i) % len;
				if (countPattern[candidate] && countPattern[candidate].trim()) {
					nextIdx = candidate;
					break;
				}
			}
			const nextText = countPattern[nextIdx] || '';
			if (nextText) {
				setActiveStampText(nextText);
			}
			setSelectedStepIndex(prevIdx); //! Щойно поставлений на полотні штамп стає поточним (isCurrent)
			return nextIdx;
		});
	}, [countPattern]);

	//! Перемикання категорії штампів
	const handleChangeStampCategory = useCallback(
		(cat: StampCategory) => {
			stageRef.current?.commitActiveStamp();
			setStampCategory(cat);
			let nextText = '';
			if (cat === 'notes') {
				const note = (NOTES as readonly string[]).includes(selectedNote) ? selectedNote : NOTES[0];
				if (note !== selectedNote) {
					setSelectedNote(note);
				}
				nextText = `${note}${selectedAccidental}`;
			} else if (cat === 'chords') {
				const root = (CHORD_ROOTS as readonly string[]).includes(selectedChordRoot)
					? selectedChordRoot
					: CHORD_ROOTS[0];
				if (root !== selectedChordRoot) {
					setSelectedChordRoot(root);
				}
				nextText = buildChordText(
					root,
					selectedChordAccidental,
					selectedChordModifier,
					selectedChordSlash,
					selectedChordBassRoot,
					selectedChordBassAccidental,
				);
			} else if (cat === 'count') {
				if (isAutoCountMode) {
					const currentText = countPattern[autoCountIndex];
					if (currentText && currentText.trim()) {
						nextText = currentText;
					} else {
						const len = countPattern.length;
						let found = -1;
						for (let i = 0; i < len; i++) {
							if (countPattern[i] && countPattern[i].trim()) {
								found = i;
								break;
							}
						}
						if (found !== -1) {
							nextText = countPattern[found];
							setAutoCountIndex(found);
							setSelectedStepIndex(found);
						} else {
							nextText = COUNT_ITEMS[0];
						}
					}
				} else {
					const countItem = (COUNT_ITEMS as readonly string[]).includes(selectedCount)
						? selectedCount
						: COUNT_ITEMS[0];
					if (countItem !== selectedCount) {
						setSelectedCount(countItem);
					}
					nextText = countItem;
				}
			} else if (cat === 'custom') {
				if (customStamps.length > 0) {
					const customItem = customStamps.includes(selectedCustom)
						? selectedCustom
						: customStamps[0];
					if (customItem !== selectedCustom) {
						setSelectedCustom(customItem);
					}
					nextText = customItem;
				} else {
					nextText = '';
				}
			} else if (cat === 'text') {
				nextText = customText;
			} else if (cat === 'draw') {
				nextText = '';
			} else if (cat === 'shapes') {
				nextText = selectedShape;
				const sz = shapeSizes[selectedShape] ?? 2;
				setToolSizes((prev) => ({
					...prev,
					stamp: sz,
				}));
			}
			setActiveStampText(nextText);
		},
		[
			autoCountIndex,
			buildChordText,
			countPattern,
			customStamps,
			customText,
			isAutoCountMode,
			selectedAccidental,
			selectedChordAccidental,
			selectedChordBassAccidental,
			selectedChordBassRoot,
			selectedChordModifier,
			selectedChordRoot,
			selectedChordSlash,
			selectedCount,
			selectedCustom,
			selectedNote,
			selectedShape,
			shapeSizes,
		],
	);

	//! Вибір типу фігури
	const handleSelectShape = useCallback(
		(shape: ShapeType) => {
			stageRef.current?.commitActiveStamp();
			setSelectedShape(shape);
			setActiveStampText(shape);
			const sz = shapeSizes[shape] ?? 2;
			setToolSizes((prev) => ({
				...prev,
				stamp: sz,
			}));
		},
		[shapeSizes],
	);

	//! Зміна користувацького тексту штампа
	const handleChangeCustomText = useCallback(
		(text: string) => {
			setCustomText(text);
			setActiveStampText(text);
			stageRef.current?.updateActiveStampProps(
				toolSizes.stamp,
				text,
				currentMainColor,
				currentStrokeColor,
				stampBadgeMode,
			);
		},
		[currentMainColor, currentStrokeColor, stampBadgeMode, toolSizes.stamp],
	);

	const handleAddCustomStamp = useCallback(
		(text: string) => {
			setCustomStamps((prev) => [text, ...prev.filter((item) => item !== text)].slice(0, 30));
			setSelectedCustom(text);
			handleSelectStampText(text);
			showToast(`Додано штамп «${text}»`);
		},
		[handleSelectStampText, showToast],
	);

	const handleDeleteCustomStamp = useCallback(
		(text: string) => {
			setCustomStamps((prev) => {
				const next = prev.filter((item) => item !== text);
				if (activeStampText === text) {
					if (next.length > 0) {
						setSelectedCustom(next[0]);
						handleSelectStampText(next[0]);
					} else {
						setSelectedCustom('');
						setActiveStampText('');
					}
				}
				return next;
			});
			showToast(`Видалено штамп «${text}»`);
		},
		[activeStampText, handleSelectStampText, showToast],
	);

	const handleChangeSize = useCallback(
		(sz: number) => {
			if ((currentMode === 'stamp' || currentMode === 'select') && stampCategory === 'shapes') {
				setShapeSizes((prev) => ({
					...prev,
					[selectedShape]: sz,
				}));
			}

			setToolSizes((prev) => ({
				...prev,
				[currentMode]: sz,
				...(currentMode === 'select' ? { stamp: sz } : {}),
			}));

			if (
				!sizeLocked &&
				(currentMode === 'stamp' || currentMode === 'select') &&
				stampCategory !== 'shapes'
			) {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: sz,
				}));
			}

			if (currentMode === 'stamp' || currentMode === 'select') {
				stageRef.current?.updateActiveStampProps(
					sz,
					activeStampText ||
						(stampCategory === 'shapes'
							? selectedShape
							: `${selectedNote}${selectedAccidental}`),
					currentMainColor,
					currentStrokeColor,
				);
			}
		},
		[
			activeStampText,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			selectedAccidental,
			selectedNote,
			selectedShape,
			sizeLocked,
			stampCategory,
		],
	);

	const handleToggleLock = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			setSizeLocked((prev) => {
				const next = !prev;
				if (!next) {
					setNoteSizes((s) => ({
						...s,
						[getStampKey(selectedNote, selectedAccidental, activeStampText)]: toolSizes.stamp,
					}));
				}
				showToast(next ? 'Розмір спільний для всіх нот' : 'Кожна нота має власний розмір');
				return next;
			});
		},
		[activeStampText, getStampKey, selectedAccidental, selectedNote, showToast, toolSizes.stamp],
	);

	const handleChangeMainColor = useCallback(
		(color: string) => {
			if (currentMode === 'stamp' || currentMode === 'select') {
				if (stampCategory === 'shapes' && selectedShape === 'arrow') {
					setCategoryColors((prev) => ({
						...prev,
						shapes: { main: color, stroke: color },
					}));
					stageRef.current?.updateActiveStampProps(
						currentSize,
						activeStampText || selectedShape,
						color,
						color,
					);
					return;
				}
				setCategoryColors((prev) => ({
					...prev,
					[stampCategory]: {
						...prev[stampCategory],
						main: color,
					},
				}));
				stageRef.current?.updateActiveStampProps(
					currentSize,
					activeStampText ||
						(stampCategory === 'shapes'
							? selectedShape
							: `${selectedNote}${selectedAccidental}`),
					color,
					currentStrokeColor,
				);
			} else {
				setToolColors((prev) => ({
					...prev,
					pencil: {
						...prev.pencil,
						main: color,
					},
				}));
			}
		},
		[
			activeStampText,
			currentMode,
			currentSize,
			currentStrokeColor,
			selectedAccidental,
			selectedNote,
			selectedShape,
			stampCategory,
		],
	);

	const handleChangeStrokeColor = useCallback(
		(color: string) => {
			if (currentMode === 'stamp' || currentMode === 'select') {
				if (stampCategory === 'shapes' && selectedShape === 'arrow') {
					setCategoryColors((prev) => ({
						...prev,
						shapes: { main: color, stroke: color },
					}));
					stageRef.current?.updateActiveStampProps(
						currentSize,
						activeStampText || selectedShape,
						color,
						color,
					);
					return;
				}
				setCategoryColors((prev) => ({
					...prev,
					[stampCategory]: {
						...prev[stampCategory],
						stroke: color,
					},
				}));

				if (color === 'transparent') {
					showToast('Обводку вимкнено');
				}

				stageRef.current?.updateActiveStampProps(
					currentSize,
					activeStampText ||
						(stampCategory === 'shapes'
							? selectedShape
							: `${selectedNote}${selectedAccidental}`),
					currentMainColor,
					color,
					stampBadgeMode,
				);
			} else {
				setToolColors((prev) => ({
					...prev,
					pencil: {
						...prev.pencil,
						stroke: color,
					},
				}));
			}
		},
		[
			activeStampText,
			currentMainColor,
			currentMode,
			currentSize,
			selectedAccidental,
			selectedNote,
			selectedShape,
			showToast,
			stampBadgeMode,
			stampCategory,
		],
	);

	//! Перемикання стилю обводки / плашки штампа
	const handleToggleBadgeMode = useCallback(
		(isBadge: boolean) => {
			setStampBadgeMode(isBadge);
			stageRef.current?.updateActiveStampProps(
				currentSize,
				activeStampText || `${selectedNote}${selectedAccidental}`,
				currentMainColor,
				currentStrokeColor,
				isBadge,
			);
			showToast(isBadge ? 'Увімкнено суцільну плашку' : 'Увімкнено контурну обводку');
		},
		[
			activeStampText,
			currentMainColor,
			currentSize,
			currentStrokeColor,
			selectedAccidental,
			selectedNote,
			showToast,
		],
	);

	const handleToggleRulersVisible = useCallback(() => {
		setRulersVisible((prev) => {
			const next = !prev;
			showToast(next ? 'Лінійки відображено' : 'Лінійки приховано');
			return next;
		});
	}, [showToast]);

	const handleToggleRulersSnap = useCallback(() => {
		setRulersSnap((prev) => {
			const next = !prev;
			showToast(
				next
					? "Прив'язку до лінійок увімкнено"
					: "Прив'язку до лінійок вимкнено",
			);
			return next;
		});
	}, [showToast]);

	const handleToggleRulersSnapItems = useCallback(() => {
		setRulersSnapItems((prev) => {
			const next = !prev;
			showToast(
				next
					? 'Снеп нот між лінійками увімкнено'
					: 'Снеп нот між лінійками вимкнено',
			);
			return next;
		});
	}, [showToast]);

	const handleToggleRulersAttachContent = useCallback(() => {
		setRulersAttachContent((prev) => {
			const next = !prev;
			showToast(
				next
					? 'Увімкнено спільний рух нот з лінійкою'
					: 'Вимкнено спільний рух (рухається тільки лінійка)',
			);
			return next;
		});
	}, [showToast]);

	const handleToggleRulersShowDistance = useCallback(() => {
		setRulersShowDistance((prev) => {
			const next = !prev;
			showToast(
				next
					? 'Відображення відстані між лінійками увімкнено'
					: 'Відображення відстаней приховано',
			);
			return next;
		});
	}, [showToast]);

	const handleToggleRulersLockEqualDistance = useCallback(() => {
		setRulersLockEqualDistance((prev) => {
			const next = !prev;
			showToast(
				next
					? 'Рівновіддаленість лінійок зафіксовано'
					: 'Фіксацію рівної відстані вимкнено',
			);
			return next;
		});
	}, [showToast]);

	const handleClearRulers = useCallback(() => {
		if (rulersCount > 0) {
			stageRef.current?.clearRulers();
			showToast('Усі лінійки очищено');
		} else {
			showToast('Немає лінійок для очищення');
		}
	}, [rulersCount, showToast]);

	const handleDeleteSelected = useCallback(() => {
		stageRef.current?.deleteSelectedStamps();
	}, []);

	const handleClearSelection = useCallback(() => {
		stageRef.current?.clearSelection();
	}, []);

	const handleToggleCompactRulers = useCallback(() => {
		setCompactRulers((prev) => {
			const next = !prev;
			showToast(
				next
					? 'Увімкнено компактний вигляд лінійок у топбарі'
					: 'Увімкнено основний вигляд лінійок знизу',
			);
			return next;
		});
	}, [showToast]);

	//! Синхронізація розмірів усіх штампів вибраного розділу
	const handleSyncCategorySizes = useCallback(() => {
		if (currentMode !== 'stamp' && currentMode !== 'select') return;
		stageRef.current?.syncCategorySizes(stampCategory, currentSize);

		if (stampCategory === 'notes') {
			const updated: Record<string, number> = { ...noteSizes };
			NOTES.forEach((note) => {
				ACCIDENTALS.forEach((acc) => {
					updated[`${note}${acc}`] = currentSize;
				});
				updated[note] = currentSize;
			});
			setNoteSizes(updated);
		} else if (stampCategory === 'shapes') {
			setShapeSizes({
				rect: currentSize,
				circle: currentSize,
				arrow: currentSize,
			});
		}
	}, [currentMode, currentSize, noteSizes, stampCategory]);

	const handleSelectStampFromCanvas = useCallback((stamp: StampItem) => {
		setToolSizes((prev) => ({
			...prev,
			stamp: stamp.size,
		}));
		setToolColors((prev) => ({
			...prev,
			stamp: { main: stamp.mainColor, stroke: stamp.strokeColor },
		}));
		const cat = getStampCategory(stamp);
		setStampCategory(cat);
		setCategoryColors((prev) => ({
			...prev,
			[cat]: { main: stamp.mainColor, stroke: stamp.strokeColor },
		}));

		setActiveStampText(stamp.text);

		if (cat === 'notes') {
			const acc = stamp.text.match(/[♭♯]$/);
			const accidental = acc ? acc[0] : '';
			const note = stamp.text.replace(/[♭♯]$/, '');
			if ((NOTES as readonly string[]).includes(note)) {
				setSelectedNote(note);
				setSelectedAccidental(accidental);
			}
		} else if (cat === 'count') {
			if ((COUNT_ITEMS as readonly string[]).includes(stamp.text)) {
				setSelectedCount(stamp.text);
			}
		} else if (cat === 'custom') {
			setSelectedCustom(stamp.text);
		} else if (cat === 'text') {
			setCustomText(stamp.text);
		} else if (cat === 'chords') {
			const root = (CHORD_ROOTS as readonly string[]).find((r) => stamp.text.startsWith(r));
			if (root) {
				setSelectedChordRoot(root);
			}
		} else if (cat === 'shapes') {
			if (stamp.shapeType) {
				setSelectedShape(stamp.shapeType);
				const shapeSz = stamp.strokeWidth || stamp.size || 2;
				setShapeSizes((prev) => ({
					...prev,
					[stamp.shapeType as ShapeType]: shapeSz,
				}));
			}
		}

		if (stamp.isAutoCount) {
			setStampCategory('count');
			setIsAutoCountMode(true);
			const len = countPattern.length;
			let nextIdx = stamp.autoCountIndex !== undefined ? stamp.autoCountIndex : 0;
			for (let i = 1; i <= len; i++) {
				const candidate = (nextIdx + i) % len;
				if (countPattern[candidate] && countPattern[candidate].trim()) {
					nextIdx = candidate;
					break;
				}
			}
			setAutoCountIndex(nextIdx);
			if (stamp.autoCountIndex !== undefined) {
				setSelectedStepIndex(stamp.autoCountIndex);
			}
			const nextText = countPattern[nextIdx];
			if (nextText) {
				setActiveStampText(nextText);
			}
		}
	}, [countPattern]);

	const handleToggleDeleteBtn = useCallback(() => {
		setDeleteBtnOn((prev) => {
			const next = !prev;
			showToast(next ? 'Кошик на штампі увімкнено' : 'Кошик на штампі вимкнено');
			return next;
		});
	}, [showToast]);

	const handleToggleResizeHandles = useCallback(() => {
		setResizeHandlesOn((prev) => {
			const next = !prev;
			showToast(next ? 'Хендли зміни розміру увімкнено' : 'Хендли зміни розміру вимкнено');
			return next;
		});
	}, [showToast]);

	const handleToggleTool = useCallback(
		(tool: ToolMode) => {
			setVisibleTools((prev) => {
				const isCurrentlyEnabled = prev[tool] ?? true;
				const currentlyEnabledCount = Object.values(prev).filter(Boolean).length;
				if (isCurrentlyEnabled && currentlyEnabledCount <= 1) {
					showToast('Щонайменше один інструмент має бути активним');
					return prev;
				}
				const next = { ...prev, [tool]: !isCurrentlyEnabled };
				if (!next[currentMode]) {
					const firstAvailable = (['select', 'pencil', 'stamp', 'ruler', 'eraser'] as ToolMode[]).find(
						(t) => next[t],
					);
					if (firstAvailable) {
						handleSelectMode(firstAvailable);
					}
				}
				return next;
			});
		},
		[currentMode, handleSelectMode, showToast],
	);

	const handleToggleStampCategory = useCallback(
		(category: StampCategory) => {
			setVisibleStampCategories((prev) => {
				const isCurrentlyEnabled = prev[category] ?? true;
				const currentlyEnabledCount = Object.values(prev).filter(Boolean).length;
				if (isCurrentlyEnabled && currentlyEnabledCount <= 1) {
					showToast('Щонайменше один розділ має бути активним');
					return prev;
				}
				const next = { ...prev, [category]: !isCurrentlyEnabled };
				if (!next[stampCategory]) {
					const firstAvailable = (
						['notes', 'chords', 'count', 'custom', 'text', 'draw', 'shapes'] as StampCategory[]
					).find((c) => next[c]);
					if (firstAvailable) {
						handleChangeStampCategory(firstAvailable);
					}
				}
				return next;
			});
		},
		[handleChangeStampCategory, showToast, stampCategory],
	);

	//! Скидання тільки налаштувань (без видалення проектів чи очищення полотна)
	const handleResetSettingsOnly = useCallback(() => {
		setVisibleTools({ ...DEFAULT_VISIBLE_TOOLS });
		setVisibleStampCategories({ ...DEFAULT_VISIBLE_STAMP_CATEGORIES });
		setDeleteBtnOn(true);
		setResizeHandlesOn(true);
		setIsSideSliderOpen(false);
		setCurrentMode('pencil');
		setToolSizes({
			select: 8,
			pencil: 2,
			stamp: 8,
			eraser: 24,
			ruler: 24,
		});
		setToolColors({
			pencil: { main: '#ed1c24', stroke: '#000000' },
			stamp: { main: '#ed1c24', stroke: 'transparent' },
		});
		setCategoryColors({
			notes: { main: '#ed1c24', stroke: 'transparent' },
			chords: { main: '#ed1c24', stroke: 'transparent' },
			count: { main: '#ed1c24', stroke: 'transparent' },
			custom: { main: '#ed1c24', stroke: 'transparent' },
			text: { main: '#ed1c24', stroke: 'transparent' },
			draw: { main: '#ed1c24', stroke: 'transparent' },
			shapes: { main: 'transparent', stroke: '#ed1c24' },
		});
		setSelectedShape('rect');
		setShapeSizes({ rect: 2, circle: 2, arrow: 2 });
		setSelectedNote('До');
		setSelectedAccidental('');
		setSelectedChordRoot('C');
		setSelectedChordAccidental('');
		setSelectedChordModifier('');
		setSelectedChordSlash(false);
		setSelectedChordBassRoot('');
		setSelectedChordBassAccidental('');
		setStampBadgeMode(false);
		setActiveStampText('До');
		setStampCategory('notes');
		setSizeLocked(true);
		setNoteSizes({});
		setRulersVisible(true);
		setRulersSnap(true);
		setRulersSnapItems(true);
		setRulersAttachContent(true);
		setRulersShowDistance(false);
		setRulersLockEqualDistance(false);
		setAreaSelectEnabled(false);
		setSelectionShape('rect');
		setSelectionMode('inside');
		setSelectedStampsCount(0);
		setCompactRulers(false);
		setCustomText('Текст');
		setIsAutoCountMode(false);
		setCountPattern(DEFAULT_COUNT_PATTERN);
		setAutoCountSequence(DEFAULT_AUTO_COUNT_SEQUENCE);
		try {
			localStorage.removeItem('notyka_editor_settings');
		} catch {
			// Ignore
		}
		showToast('Налаштування скинуто до початкових');
		setIsSettingsOpen(false);
	}, [showToast]);

	//! Повне очищення всіх даних (база проектів, активна сесія, налаштування та полотно)
	const handleClearAllData = useCallback(async () => {
		await clearAllStorage();
		setProjectsList([]);
		handleResetSettingsOnly();
		stageRef.current?.clear();
		setHasCanvas(false);
		showToast('Всі дані додатку очищено');
		setIsSettingsOpen(false);
	}, [handleResetSettingsOnly, showToast]);

	// Save / Share logic
	const downloadBlob = useCallback((blob: Blob) => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'photo-edited.png';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setTimeout(() => URL.revokeObjectURL(url), 15000);
	}, []);

	const shareBlob = useCallback(async (blob: Blob): Promise<boolean> => {
		const file = new File([blob], 'photo-edited.png', { type: 'image/png' });
		if (navigator.canShare && navigator.canShare({ files: [file] })) {
			try {
				await navigator.share({ files: [file] });
				return true;
			} catch (err: unknown) {
				if (err instanceof Error && err.name === 'AbortError') return true;
			}
		}
		return false;
	}, []);

	const handleSave = useCallback(async () => {
		setIsMenuOpen(false);
		if (!hasCanvas || !stageRef.current) {
			showToast('Немає зображення для збереження');
			return;
		}

		// Also persist project to history in IndexedDB
		const project = await stageRef.current.serializeProject();
		if (project) {
			await saveProject(project);
		}

		const blob = await stageRef.current.getExportBlob();
		if (!blob) {
			showToast('Помилка створення файлу');
			return;
		}

		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

		if (isIOS && (await shareBlob(blob))) return;

		downloadBlob(blob);
		showToast('Зображення збережено!');
	}, [downloadBlob, hasCanvas, shareBlob, showToast]);

	const handleShare = useCallback(async () => {
		setIsMenuOpen(false);
		if (!hasCanvas || !stageRef.current) {
			showToast('Немає зображення');
			return;
		}

		const blob = await stageRef.current.getExportBlob();
		if (!blob) {
			showToast('Помилка створення файлу');
			return;
		}

		if (await shareBlob(blob)) return;

		if (!window.isSecureContext) {
			showToast('Поділитися працює лише через HTTPS — файл завантажено');
		} else {
			showToast('Поділитися недоступне — файл завантажено');
		}
		downloadBlob(blob);
	}, [downloadBlob, hasCanvas, shareBlob, showToast]);

	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const cleanName = file.name.replace(/\.[^/.]+$/, '').trim();
			setCropFileName(cleanName);
			const reader = new FileReader();
			reader.onload = (ev) => {
				const src = ev.target?.result;
				if (typeof src !== 'string') return;
				setCropImageSrc(src);
				setCropModalOpen(true);
			};
			reader.readAsDataURL(file);
			e.target.value = '';
		}
	}, []);

	const handleApplyCrop = useCallback(
		(processedDataUrl: string, title?: string) => {
			setCropModalOpen(false);
			setCropImageSrc(null);
			stageRef.current?.loadImage(processedDataUrl, title || cropFileName);
			setHasCanvas(true);
		},
		[cropFileName],
	);

	const handleCancelCrop = useCallback(() => {
		setCropModalOpen(false);
		setCropImageSrc(null);
	}, []);

	const handleToggleMenu = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		setIsMenuOpen((prev) => {
			const next = !prev;
			if (next) {
				setIsPaletteOpen(false);
				stageRef.current?.prepareExport();
			}
			return next;
		});
	}, []);

	const handleTogglePalette = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		setIsPaletteOpen((prev) => {
			const next = !prev;
			if (next) {
				setIsMenuOpen(false);
			}
			return next;
		});
	}, []);

	const handleOpenHistory = useCallback(async () => {
		setIsMenuOpen(false);
		if (hasCanvas && stageRef.current) {
			const current = await stageRef.current.serializeProject();
			if (current) {
				current.countPattern = [...countPatternRef.current];
				await saveProject(current);
			}
		}
		const list = await getProjectsList();
		setProjectsList(list);
		setIsHistoryOpen(true);
	}, [hasCanvas]);

	const handleSelectProject = useCallback(
		async (project: ProjectItem) => {
			setIsHistoryOpen(false);
			if (stageRef.current) {
				await stageRef.current.loadProject(project);
				if (
					project.countPattern &&
					Array.isArray(project.countPattern) &&
					project.countPattern.length >= MIN_COUNT_PATTERN_LENGTH
				) {
					setCountPattern(project.countPattern.slice(0, MAX_COUNT_PATTERN_LENGTH));
				}
				setHasCanvas(true);
				await saveCurrentSession(project);
				showToast('Проект відкрито');
			}
		},
		[showToast],
	);

	const handleDeleteProject = useCallback(
		async (id: string, e: React.MouseEvent) => {
			e.stopPropagation();
			await deleteProject(id);
			setProjectsList((prev) => prev.filter((p) => p.id !== id));
			showToast('Проект видалено');
		},
		[showToast],
	);

	return (
		<Box
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			<AppPreloader isLoading={isLoading} />

			<TopToolbar
				canUndo={canUndo}
				canRedo={canRedo}
				currentMode={currentMode}
				stampCategory={stampCategory}
				brushSize={currentSize}
				sizeLocked={sizeLocked}
				mainColor={currentMainColor}
				strokeColor={currentStrokeColor}
				isSideSliderOpen={isSideSliderOpen}
				compactRulers={compactRulers}
				rulersVisible={rulersVisible}
				rulersSnap={rulersSnap}
				rulersSnapItems={rulersSnapItems}
				rulersAttachContent={rulersAttachContent}
				rulersShowDistance={rulersShowDistance}
				rulersLockEqualDistance={rulersLockEqualDistance}
				rulersCount={rulersCount}
				areaSelectEnabled={areaSelectEnabled}
				selectionShape={selectionShape}
				selectionMode={selectionMode}
				selectedCount={selectedStampsCount}
				onToggleAreaSelect={() => setAreaSelectEnabled((prev) => !prev)}
				onChangeSelectionShape={setSelectionShape}
				onChangeSelectionMode={setSelectionMode}
				onDeleteSelected={handleDeleteSelected}
				onClearSelection={handleClearSelection}
				onUndo={() => stageRef.current?.undo()}
				onRedo={() => stageRef.current?.redo()}
				onToggleMenu={handleToggleMenu}
				onChangeSize={handleChangeSize}
				onToggleLock={handleToggleLock}
				onTogglePalette={handleTogglePalette}
				onToggleSideSlider={() => setIsSideSliderOpen((prev) => !prev)}
				onSyncCategorySizes={handleSyncCategorySizes}
				onToggleRulersVisible={handleToggleRulersVisible}
				onToggleRulersSnap={handleToggleRulersSnap}
				onToggleRulersSnapItems={handleToggleRulersSnapItems}
				onToggleRulersAttachContent={handleToggleRulersAttachContent}
				onToggleRulersShowDistance={handleToggleRulersShowDistance}
				onToggleRulersLockEqualDistance={handleToggleRulersLockEqualDistance}
				onClearRulers={handleClearRulers}
			/>

			<CanvasStage
				currentMode={currentMode}
				mainColor={currentMainColor}
				strokeColor={currentStrokeColor}
				currentSize={currentSize}
				selectedNote={selectedNote}
				selectedAccidental={selectedAccidental}
				selectedShape={selectedShape}
				activeStampText={activeStampText}
				stampBadgeMode={stampBadgeMode}
				stampCategory={stampCategory}
				drawDuplicateMode={drawDuplicateMode}
				isAutoCountMode={isAutoCountMode}
				currentAutoCountIndex={autoCountIndex}
				currentAutoCountSeqId={`step_${autoCountIndex}`}
				onAdvanceAutoCount={handleAdvanceAutoCount}
				deleteBtnOn={deleteBtnOn}
				resizeHandlesOn={resizeHandlesOn}
				rulersVisible={rulersVisible}
				rulersSnap={rulersSnap}
				rulersSnapItems={rulersSnapItems}
				rulersAttachContent={rulersAttachContent}
				rulersShowDistance={rulersShowDistance}
				rulersLockEqualDistance={rulersLockEqualDistance}
				areaSelectEnabled={areaSelectEnabled}
				selectionShape={selectionShape}
				selectionMode={selectionMode}
				selectFilterCategory={selectFilterCategory}
				onSelectedCountChange={setSelectedStampsCount}
				onAvailableStampCategoriesChange={setAvailableStampCategories}
				hasCanvas={hasCanvas}
				onSelectStamp={handleSelectStampFromCanvas}
				onChangeSize={handleChangeSize}
				onHistoryChange={(undo, redo) => {
					setCanUndo(undo);
					setCanRedo(redo);
				}}
				onScaleChange={setCanvasScale}
				onRulersCountChange={setRulersCount}
				onNotify={showToast}
				onInitBlank={() => setHasCanvas(true)}
				onResetCanvas={() => setHasCanvas(false)}
				onContentChange={handleContentChange}
				stageRef={stageRef}
			/>

			<input
				ref={fileInputRef}
				type="file"
				id="image-loader"
				accept="image/*"
				className="hidden"
				onChange={handleFileChange}
			/>

			<ImageMenuModal
				opened={isMenuOpen}
				onClose={() => setIsMenuOpen(false)}
				onUploadClick={() => {
					setIsMenuOpen(false);
					fileInputRef.current?.click();
				}}
				onNewBlank={() => {
					setIsMenuOpen(false);
					stageRef.current?.createBlank();
					setHasCanvas(true);
				}}
				onOpenHistory={handleOpenHistory}
				onOpenSettings={() => {
					setIsMenuOpen(false);
					setIsSettingsOpen(true);
				}}
				onClear={() => {
					setIsMenuOpen(false);
					stageRef.current?.clear();
				}}
				onSave={handleSave}
				onShare={handleShare}
			/>

			<SettingsModal
				opened={isSettingsOpen}
				visibleTools={visibleTools}
				visibleStampCategories={visibleStampCategories}
				deleteBtnOn={deleteBtnOn}
				resizeHandlesOn={resizeHandlesOn}
				compactRulers={compactRulers}
				onToggleTool={handleToggleTool}
				onToggleStampCategory={handleToggleStampCategory}
				onToggleDeleteBtn={handleToggleDeleteBtn}
				onToggleResizeHandles={handleToggleResizeHandles}
				onToggleCompactRulers={handleToggleCompactRulers}
				onResetSettings={handleResetSettingsOnly}
				onClearAllData={handleClearAllData}
				onClose={() => setIsSettingsOpen(false)}
			/>

			<SideSizeSlider
				value={currentSize}
				onChange={handleChangeSize}
				opened={isSideSliderOpen}
				onClose={() => setIsSideSliderOpen(false)}
				currentMode={currentMode}
				stampCategory={stampCategory}
				canvasScale={canvasScale}
				mainColor={currentMainColor}
				strokeColor={currentStrokeColor}
			/>

			<ImageCropModal
				opened={cropModalOpen}
				imageSrc={cropImageSrc}
				fileName={cropFileName}
				onApply={handleApplyCrop}
				onCancel={handleCancelCrop}
			/>

			<ProjectsHistoryModal
				opened={isHistoryOpen}
				projects={projectsList}
				onSelectProject={handleSelectProject}
				onDeleteProject={handleDeleteProject}
				onClose={() => setIsHistoryOpen(false)}
			/>

			<ColorPaletteModal
				opened={isPaletteOpen}
				currentMode={currentMode}
				stampCategory={stampCategory}
				selectedShape={selectedShape}
				mainColor={currentMainColor}
				strokeColor={currentStrokeColor}
				stampBadgeMode={stampBadgeMode}
				onChangeMainColor={handleChangeMainColor}
				onChangeStrokeColor={handleChangeStrokeColor}
				onToggleBadgeMode={handleToggleBadgeMode}
			/>

			<CustomStampModal
				opened={customStampModalOpen}
				onClose={() => setCustomStampModalOpen(false)}
				onAddStamp={handleAddCustomStamp}
			/>

			{isLoading ? (
				<ToolbarSkeleton />
			) : (
				<Box component="footer">
					{currentMode === 'stamp' && (
						<StampSettings
							selectedNote={selectedNote}
							selectedAccidental={selectedAccidental}
							selectedChordRoot={selectedChordRoot}
							selectedChordAccidental={selectedChordAccidental}
							selectedChordModifier={selectedChordModifier}
							selectedChordSlash={selectedChordSlash}
							selectedChordBassRoot={selectedChordBassRoot}
							selectedChordBassAccidental={selectedChordBassAccidental}
							activeStampText={activeStampText}
							category={stampCategory}
							visibleCategories={visibleStampCategories}
							customStamps={customStamps}
							customText={customText}
							onChangeCategory={handleChangeStampCategory}
							onSelectNote={handleSelectNote}
							onSelectAccidental={handleSelectAccidental}
							onSelectChordRoot={handleSelectChordRoot}
							onSelectChordAccidental={handleSelectChordAccidental}
							onSelectChordModifier={handleSelectChordModifier}
							onToggleChordSlash={handleToggleChordSlash}
							onSelectChordBassRoot={handleSelectChordBassRoot}
							onSelectChordBassAccidental={handleSelectChordBassAccidental}
							onSelectStampText={handleSelectStampText}
							onOpenAddCustomModal={() => setCustomStampModalOpen(true)}
							onDeleteCustomStamp={handleDeleteCustomStamp}
							onChangeCustomText={handleChangeCustomText}
							isDrawDuplicateMode={drawDuplicateMode}
							onToggleDrawDuplicateMode={() => setDrawDuplicateMode((prev) => !prev)}
							selectedShape={selectedShape}
							onSelectShape={handleSelectShape}
							isAutoCountMode={isAutoCountMode}
							countPattern={countPattern}
							currentAutoCountIndex={autoCountIndex}
							selectedStepIndex={selectedStepIndex}
							onSelectStep={handleSelectStep}
							onAssignTokenToStep={handleAssignTokenToStep}
							onClearCurrentStep={handleClearCurrentStep}
							onResetCountPattern={handleResetCountPattern}
							onAddSteps={handleAddSteps}
							onRemoveSteps={handleRemoveSteps}
							onToggleAutoCount={handleToggleAutoCount}
						/>
					)}

					{currentMode === 'select' && (
						<SelectCategoryBar
							category={selectFilterCategory}
							availableCategories={availableStampCategories}
							onChangeCategory={setSelectFilterCategory}
						/>
					)}

					{currentMode === 'ruler' && !compactRulers && (
						<RulerSettings
							visible={rulersVisible}
							snap={rulersSnap}
							snapItems={rulersSnapItems}
							attachContent={rulersAttachContent}
							showDistance={rulersShowDistance}
							lockEqualDistance={rulersLockEqualDistance}
							rulersCount={rulersCount}
							onToggleVisible={handleToggleRulersVisible}
							onToggleSnap={handleToggleRulersSnap}
							onToggleSnapItems={handleToggleRulersSnapItems}
							onToggleAttachContent={handleToggleRulersAttachContent}
							onToggleShowDistance={handleToggleRulersShowDistance}
							onToggleLockEqualDistance={handleToggleRulersLockEqualDistance}
						/>
					)}

					<BottomToolbar
						currentMode={currentMode}
						visibleTools={visibleTools}
						onSelectMode={handleSelectMode}
					/>
				</Box>
			)}

			<Box id="toast" className={toastText ? 'show' : ''}>
				{toastText}
			</Box>
		</Box>
	);
};
