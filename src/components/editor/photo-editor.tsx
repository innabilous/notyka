'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppPreloader } from '@/components/common/app-preloader';
import { ColorPaletteModal } from '@/components/modals/color-palette-modal';
import { CustomStampModal } from '@/components/modals/custom-stamp-modal';
import { ImageCropModal } from '@/components/modals/image-crop-modal';
import { ImageMenuModal } from '@/components/modals/image-menu-modal';
import { ProjectsHistoryModal } from '@/components/modals/projects-history-modal';
import { BrushSettings } from '@/components/settings/brush-settings';
import { StampCategory, StampSettings } from '@/components/settings/stamp-settings';
import { BottomToolbar } from '@/components/toolbar/bottom-toolbar';
import { ToolbarSkeleton } from '@/components/toolbar/toolbar-skeleton';
import { TopToolbar } from '@/components/toolbar/top-toolbar';
import { COUNT_ITEMS } from '@/constants/editor';
import { StampItem, ToolMode } from '@/types/editor';
import { ProjectItem } from '@/types/storage';
import {
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

	// Independent tool sizes
	const [toolSizes, setToolSizes] = useState<Record<ToolMode, number>>({
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
	const [customText, setCustomText] = useState<string>('Текст');
	const [customStampModalOpen, setCustomStampModalOpen] = useState<boolean>(false);
	const [sizeLocked, setSizeLocked] = useState<boolean>(true);
	const [noteSizes, setNoteSizes] = useState<Record<string, number>>({});

	const [deleteBtnOn, setDeleteBtnOn] = useState<boolean>(true);
	const [resizeHandlesOn, setResizeHandlesOn] = useState<boolean>(true);
	const [rulersVisible, setRulersVisible] = useState<boolean>(true);
	const [rulersAttachContent, setRulersAttachContent] = useState<boolean>(false);
	const [rulersShowDistance, setRulersShowDistance] = useState<boolean>(false);
	const [rulersLockEqualDistance, setRulersLockEqualDistance] = useState<boolean>(false);
	const [rulersCount, setRulersCount] = useState<number>(0);
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
			if (savedSettings.rulersVisible !== undefined)
				setRulersVisible(savedSettings.rulersVisible);
			if (savedSettings.rulersAttachContent !== undefined)
				setRulersAttachContent(savedSettings.rulersAttachContent);
			if (savedSettings.rulersShowDistance !== undefined)
				setRulersShowDistance(savedSettings.rulersShowDistance);
			if (savedSettings.rulersLockEqualDistance !== undefined)
				setRulersLockEqualDistance(savedSettings.rulersLockEqualDistance);
			if (savedSettings.customText) setCustomText(savedSettings.customText);
		}

		loadCurrentSession()
			.then((session) => {
				if (session && stageRef.current) {
					stageRef.current.loadProject(session);
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
			rulersVisible,
			rulersAttachContent,
			rulersShowDistance,
			rulersLockEqualDistance,
			customText,
		});
	}, [
		activeStampText,
		currentMode,
		customStamps,
		customText,
		deleteBtnOn,
		noteSizes,
		resizeHandlesOn,
		rulersAttachContent,
		rulersLockEqualDistance,
		rulersShowDistance,
		rulersVisible,
		selectedAccidental,
		selectedChordAccidental,
		selectedChordBassAccidental,
		selectedChordBassRoot,
		selectedChordModifier,
		selectedChordRoot,
		selectedChordSlash,
		selectedNote,
		sizeLocked,
		stampBadgeMode,
		stampCategory,
		toolColors,
		toolSizes,
	]);

	const currentSize = toolSizes[currentMode] ?? 24;
	const currentMainColor = toolColors[currentMode === 'stamp' ? 'stamp' : 'pencil'].main;
	const currentStrokeColor = toolColors[currentMode === 'stamp' ? 'stamp' : 'pencil'].stroke;

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
				await saveCurrentSession(project);
				await saveProject(project);
			}
		}, 800);
	}, []);

	const handleSelectMode = useCallback(
		(mode: ToolMode) => {
			stageRef.current?.commitActiveStamp();

			if (autoSaveTimerRef.current && stageRef.current) {
				clearTimeout(autoSaveTimerRef.current);
				stageRef.current.serializeProject().then((project) => {
					if (project) {
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
			toolSizes.stamp,
		],
	);

	//! Перемикання категорії штампів
	const handleChangeStampCategory = useCallback(
		(cat: StampCategory) => {
			setStampCategory(cat);
			let nextText = activeStampText;
			if (cat === 'notes') {
				nextText = `${selectedNote}${selectedAccidental}`;
			} else if (cat === 'chords') {
				nextText = buildChordText(
					selectedChordRoot,
					selectedChordAccidental,
					selectedChordModifier,
					selectedChordSlash,
					selectedChordBassRoot,
					selectedChordBassAccidental,
				);
			} else if (cat === 'count') {
				nextText = COUNT_ITEMS[0];
			} else if (cat === 'custom') {
				if (customStamps.length > 0) {
					nextText = customStamps[0];
				}
			} else if (cat === 'text') {
				nextText = customText || 'Текст';
			}
			setActiveStampText(nextText);
			stageRef.current?.updateActiveStampProps(
				toolSizes.stamp,
				nextText,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			activeStampText,
			buildChordText,
			currentMainColor,
			currentStrokeColor,
			customStamps,
			customText,
			selectedAccidental,
			selectedChordAccidental,
			selectedChordBassAccidental,
			selectedChordBassRoot,
			selectedChordModifier,
			selectedChordRoot,
			selectedChordSlash,
			selectedNote,
			toolSizes.stamp,
		],
	);

	//! Зміна користувацького тексту штампа
	const handleChangeCustomText = useCallback(
		(text: string) => {
			setCustomText(text);
			const effectiveText = text || 'Текст';
			setActiveStampText(effectiveText);
			stageRef.current?.updateActiveStampProps(
				toolSizes.stamp,
				effectiveText,
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
						handleSelectStampText(next[0]);
					} else {
						handleSelectStampText('до');
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
			setToolSizes((prev) => ({
				...prev,
				[currentMode]: sz,
			}));

			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental, activeStampText)]: sz,
				}));
			}

			if (currentMode === 'stamp') {
				stageRef.current?.updateActiveStampProps(
					sz,
					activeStampText || `${selectedNote}${selectedAccidental}`,
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
			sizeLocked,
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
			const modeKey = currentMode === 'stamp' ? 'stamp' : 'pencil';
			setToolColors((prev) => ({
				...prev,
				[modeKey]: {
					...prev[modeKey],
					main: color,
				},
			}));

			if (currentMode === 'stamp') {
				stageRef.current?.updateActiveStampProps(
					currentSize,
					activeStampText || `${selectedNote}${selectedAccidental}`,
					color,
					currentStrokeColor,
				);
			}
		},
		[
			activeStampText,
			currentMode,
			currentSize,
			currentStrokeColor,
			selectedAccidental,
			selectedNote,
		],
	);

	const handleChangeStrokeColor = useCallback(
		(color: string) => {
			setToolColors((prev) => ({
				...prev,
				stamp: {
					...prev.stamp,
					stroke: color,
				},
			}));

			if (color === 'transparent') {
				showToast('Обводку вимкнено');
			}

			stageRef.current?.updateActiveStampProps(
				currentSize,
				activeStampText || `${selectedNote}${selectedAccidental}`,
				currentMainColor,
				color,
				stampBadgeMode,
			);
		},
		[
			activeStampText,
			currentMainColor,
			currentSize,
			selectedAccidental,
			selectedNote,
			showToast,
			stampBadgeMode,
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

	const handleSelectStampFromCanvas = useCallback((stamp: StampItem) => {
		setToolSizes((prev) => ({
			...prev,
			stamp: stamp.size,
		}));
		setToolColors((prev) => ({
			...prev,
			stamp: { main: stamp.mainColor, stroke: stamp.strokeColor },
		}));

		setActiveStampText(stamp.text);

		const acc = stamp.text.match(/[♭♯]$/);
		const accidental = acc ? acc[0] : '';
		const note = stamp.text.replace(/[♭♯]$/, '');

		setSelectedNote(note);
		setSelectedAccidental(accidental);
	}, []);

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
		<div
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
				brushSize={currentSize}
				sizeLocked={sizeLocked}
				mainColor={currentMainColor}
				strokeColor={currentStrokeColor}
				rulersVisible={rulersVisible}
				rulersAttachContent={rulersAttachContent}
				rulersShowDistance={rulersShowDistance}
				rulersLockEqualDistance={rulersLockEqualDistance}
				rulersCount={rulersCount}
				onUndo={() => stageRef.current?.undo()}
				onRedo={() => stageRef.current?.redo()}
				onToggleMenu={handleToggleMenu}
				onChangeSize={handleChangeSize}
				onToggleLock={handleToggleLock}
				onTogglePalette={handleTogglePalette}
				onToggleRulersVisible={handleToggleRulersVisible}
				onToggleRulersAttachContent={handleToggleRulersAttachContent}
				onToggleRulersShowDistance={() => setRulersShowDistance((prev) => !prev)}
				onToggleRulersLockEqualDistance={() => setRulersLockEqualDistance((prev) => !prev)}
				onClearRulers={() => stageRef.current?.clearRulers()}
			/>

			<CanvasStage
				currentMode={currentMode}
				mainColor={currentMainColor}
				strokeColor={currentStrokeColor}
				currentSize={currentSize}
				selectedNote={selectedNote}
				selectedAccidental={selectedAccidental}
				activeStampText={activeStampText}
				stampBadgeMode={stampBadgeMode}
				deleteBtnOn={deleteBtnOn}
				resizeHandlesOn={resizeHandlesOn}
				rulersVisible={rulersVisible}
				rulersAttachContent={rulersAttachContent}
				rulersShowDistance={rulersShowDistance}
				rulersLockEqualDistance={rulersLockEqualDistance}
				hasCanvas={hasCanvas}
				onSelectStamp={handleSelectStampFromCanvas}
				onChangeSize={handleChangeSize}
				onHistoryChange={(undo, redo) => {
					setCanUndo(undo);
					setCanRedo(redo);
				}}
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
				deleteBtnOn={deleteBtnOn}
				resizeHandlesOn={resizeHandlesOn}
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
				onClear={() => {
					setIsMenuOpen(false);
					stageRef.current?.clear();
				}}
				onSave={handleSave}
				onShare={handleShare}
				onToggleDeleteBtn={handleToggleDeleteBtn}
				onToggleResizeHandles={handleToggleResizeHandles}
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
				<footer>
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
						/>
					)}

					<BottomToolbar currentMode={currentMode} onSelectMode={handleSelectMode} />
				</footer>
			)}

			<div id="toast" className={toastText ? 'show' : ''}>
				{toastText}
			</div>
		</div>
	);
};
