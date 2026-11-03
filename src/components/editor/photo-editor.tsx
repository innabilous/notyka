'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ImageMenuModal } from '@/components/modals/image-menu-modal';
import { ColorPaletteModal } from '@/components/modals/color-palette-modal';
import { BrushSettings } from '@/components/settings/brush-settings';
import { StampSettings } from '@/components/settings/stamp-settings';
import { BottomToolbar } from '@/components/toolbar/bottom-toolbar';
import { StampItem, ToolMode } from '@/types/editor';
import { CanvasStage, CanvasStageHandle } from './canvas-stage';

export const PhotoEditor: React.FC = () => {
	const stageRef = useRef<CanvasStageHandle | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [hasCanvas, setHasCanvas] = useState<boolean>(false);
	const [currentMode, setCurrentMode] = useState<ToolMode>('pencil');
	const [canUndo, setCanUndo] = useState<boolean>(false);
	const [canRedo, setCanRedo] = useState<boolean>(false);

	// Tool colors memory
	const [toolColors, setToolColors] = useState<
		Record<'pencil' | 'stamp', { main: string; stroke: string }>
	>({
		pencil: { main: '#ff0055', stroke: '#000000' },
		stamp: { main: '#ff0055', stroke: '#000000' },
	});

	const [brushSize, setBrushSize] = useState<number>(24);
	const [selectedNote, setSelectedNote] = useState<string>('до');
	const [selectedAccidental, setSelectedAccidental] = useState<string>('');
	const [sizeLocked, setSizeLocked] = useState<boolean>(true);
	const [noteSizes, setNoteSizes] = useState<Record<string, number>>({});

	const [deleteBtnOn, setDeleteBtnOn] = useState<boolean>(true);
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);

	// Load delete button preference
	useEffect(() => {
		try {
			const saved = localStorage.getItem('pe_delete_btn');
			if (saved !== null) {
				setDeleteBtnOn(saved !== '0');
			}
		} catch {
			// Ignore local storage error in private mode
		}
	}, []);

	const notify = useCallback((message: string) => {
		notifications.show({
			message,
			color: 'indigo',
			autoClose: 1800,
			withCloseButton: false,
			styles: {
				root: {
					backgroundColor: 'rgba(31, 41, 55, 0.95)',
					backdropFilter: 'blur(12px)',
					border: '1px solid rgba(99, 102, 241, 0.5)',
					color: '#ffffff',
					borderRadius: 9999,
					padding: '8px 16px',
				},
				description: { color: '#ffffff', fontSize: 13, fontWeight: 500 },
			},
		});
	}, []);

	const getStampKey = useCallback((note: string, acc: string) => `${note}${acc}`, []);

	const currentMainColor = toolColors[currentMode === 'eraser' ? 'pencil' : currentMode].main;
	const currentStrokeColor = toolColors[currentMode === 'eraser' ? 'pencil' : currentMode].stroke;

	const handleSelectMode = useCallback(
		(mode: ToolMode) => {
			stageRef.current?.commitActiveStamp();

			// Remember size for note if unlocked
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental)]: brushSize,
				}));
			}

			setCurrentMode(mode);
			setIsPaletteOpen(false);

			if (!sizeLocked && mode === 'stamp') {
				const key = getStampKey(selectedNote, selectedAccidental);
				if (noteSizes[key] != null) {
					setBrushSize(noteSizes[key]);
				}
			}
		},
		[
			brushSize,
			currentMode,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedNote,
			sizeLocked,
		],
	);

	const handleSelectNote = useCallback(
		(note: string) => {
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental)]: brushSize,
				}));
			}

			setSelectedNote(note);

			const key = getStampKey(note, selectedAccidental);
			const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : brushSize;
			if (!sizeLocked && noteSizes[key] != null) {
				setBrushSize(newSize);
			}

			stageRef.current?.updateActiveStampProps(
				newSize,
				`${note}${selectedAccidental}`,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			brushSize,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedNote,
			sizeLocked,
		],
	);

	const handleSelectAccidental = useCallback(
		(acc: string) => {
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental)]: brushSize,
				}));
			}

			const nextAcc = selectedAccidental === acc ? '' : acc;
			setSelectedAccidental(nextAcc);

			const key = getStampKey(selectedNote, nextAcc);
			const newSize = !sizeLocked && noteSizes[key] != null ? noteSizes[key] : brushSize;
			if (!sizeLocked && noteSizes[key] != null) {
				setBrushSize(newSize);
			}

			stageRef.current?.updateActiveStampProps(
				newSize,
				`${selectedNote}${nextAcc}`,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			brushSize,
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			noteSizes,
			selectedAccidental,
			selectedNote,
			sizeLocked,
		],
	);

	const handleChangeSize = useCallback(
		(sz: number) => {
			setBrushSize(sz);
			if (!sizeLocked && currentMode === 'stamp') {
				setNoteSizes((prev) => ({
					...prev,
					[getStampKey(selectedNote, selectedAccidental)]: sz,
				}));
			}
			stageRef.current?.updateActiveStampProps(
				sz,
				`${selectedNote}${selectedAccidental}`,
				currentMainColor,
				currentStrokeColor,
			);
		},
		[
			currentMainColor,
			currentMode,
			currentStrokeColor,
			getStampKey,
			selectedAccidental,
			selectedNote,
			sizeLocked,
		],
	);

	const handleToggleLock = useCallback(() => {
		setSizeLocked((prev) => {
			const next = !prev;
			if (!next) {
				setNoteSizes((s) => ({
					...s,
					[getStampKey(selectedNote, selectedAccidental)]: brushSize,
				}));
			}
			notify(next ? 'Розмір спільний для всіх нот' : 'Кожна нота має власний розмір');
			return next;
		});
	}, [brushSize, getStampKey, notify, selectedAccidental, selectedNote]);

	const handleChangeMainColor = useCallback(
		(color: string) => {
			setToolColors((prev) => ({
				...prev,
				[currentMode === 'eraser' ? 'pencil' : currentMode]: {
					...prev[currentMode === 'eraser' ? 'pencil' : currentMode],
					main: color,
				},
			}));

			stageRef.current?.updateActiveStampProps(
				brushSize,
				`${selectedNote}${selectedAccidental}`,
				color,
				currentStrokeColor,
			);
		},
		[brushSize, currentMode, currentStrokeColor, selectedAccidental, selectedNote],
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
				notify('Обводку вимкнено');
			}

			stageRef.current?.updateActiveStampProps(
				brushSize,
				`${selectedNote}${selectedAccidental}`,
				currentMainColor,
				color,
			);
		},
		[brushSize, currentMainColor, notify, selectedAccidental, selectedNote],
	);

	const handleSelectStampFromCanvas = useCallback((stamp: StampItem) => {
		setBrushSize(stamp.size);
		setToolColors((prev) => ({
			...prev,
			stamp: { main: stamp.mainColor, stroke: stamp.strokeColor },
		}));

		const acc = stamp.text.match(/[♭♯]$/);
		const accidental = acc ? acc[0] : '';
		const note = stamp.text.replace(/[♭♯]$/, '');

		setSelectedNote(note);
		setSelectedAccidental(accidental);
	}, []);

	const handleToggleDeleteBtn = useCallback(() => {
		setDeleteBtnOn((prev) => {
			const next = !prev;
			try {
				localStorage.setItem('pe_delete_btn', next ? '1' : '0');
			} catch {
				// Ignore
			}
			notify(next ? 'Кошик на штампі увімкнено' : 'Кошик на штампі вимкнено');
			return next;
		});
	}, [notify]);

	// Save / Share logic
	const downloadBlob = useCallback((blob: Blob) => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'notyka-edited.png';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setTimeout(() => URL.revokeObjectURL(url), 15000);
	}, []);

	const shareBlob = useCallback(async (blob: Blob): Promise<boolean> => {
		const file = new File([blob], 'notyka-edited.png', { type: 'image/png' });
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
		if (!hasCanvas) {
			notify('Немає зображення для збереження');
			return;
		}

		const blob = await stageRef.current?.getExportBlob();
		if (!blob) {
			notify('Помилка створення файлу');
			return;
		}

		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

		if (isIOS && (await shareBlob(blob))) return;

		downloadBlob(blob);
		notify('Зображення збережено!');
	}, [downloadBlob, hasCanvas, notify, shareBlob]);

	const handleShare = useCallback(async () => {
		setIsMenuOpen(false);
		if (!hasCanvas) {
			notify('Немає зображення');
			return;
		}

		const blob = await stageRef.current?.getExportBlob();
		if (!blob) {
			notify('Помилка створення файлу');
			return;
		}

		if (await shareBlob(blob)) return;

		if (!window.isSecureContext) {
			notify('Поділитися працює лише через HTTPS — файл завантажено');
		} else {
			notify('Поділитися недоступне — файл завантажено');
		}
		downloadBlob(blob);
	}, [downloadBlob, hasCanvas, notify, shareBlob]);

	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			stageRef.current?.loadImage(file);
			setHasCanvas(true);
			e.target.value = '';
		}
	}, []);

	return (
		<main
			style={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				width: '100%',
				height: '100%',
				overflow: 'hidden',
			}}
		>
			<CanvasStage
				currentMode={currentMode}
				mainColor={currentMainColor}
				strokeColor={currentStrokeColor}
				currentSize={brushSize}
				selectedNote={selectedNote}
				selectedAccidental={selectedAccidental}
				deleteBtnOn={deleteBtnOn}
				hasCanvas={hasCanvas}
				onSelectStamp={handleSelectStampFromCanvas}
				onHistoryChange={(undo, redo) => {
					setCanUndo(undo);
					setCanRedo(redo);
				}}
				onNotify={notify}
				onInitBlank={() => setHasCanvas(true)}
				stageRef={stageRef}
			/>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				style={{ display: 'none' }}
				onChange={handleFileChange}
			/>

			<ImageMenuModal
				opened={isMenuOpen}
				deleteBtnOn={deleteBtnOn}
				onUploadClick={() => {
					setIsMenuOpen(false);
					fileInputRef.current?.click();
				}}
				onNewBlank={() => {
					setIsMenuOpen(false);
					stageRef.current?.createBlank();
					setHasCanvas(true);
				}}
				onClear={() => {
					setIsMenuOpen(false);
					stageRef.current?.clear();
				}}
				onSave={handleSave}
				onShare={handleShare}
				onToggleDeleteBtn={handleToggleDeleteBtn}
				onClose={() => setIsMenuOpen(false)}
			/>

			<ColorPaletteModal
				opened={isPaletteOpen}
				currentMode={currentMode}
				mainColor={currentMainColor}
				strokeColor={currentStrokeColor}
				onChangeMainColor={handleChangeMainColor}
				onChangeStrokeColor={handleChangeStrokeColor}
				onClose={() => setIsPaletteOpen(false)}
			/>

			<Box
				component="footer"
				style={{
					backgroundColor: 'rgba(31, 41, 55, 0.9)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
					borderTop: '1px solid rgba(55, 65, 81, 0.8)',
					padding: '12px',
					paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
					zIndex: 20,
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
				}}
			>
				<BrushSettings
					currentMode={currentMode}
					brushSize={brushSize}
					sizeLocked={sizeLocked}
					mainColor={currentMainColor}
					strokeColor={currentStrokeColor}
					onChangeSize={handleChangeSize}
					onToggleLock={handleToggleLock}
					onTogglePalette={() => {
						setIsPaletteOpen((prev) => !prev);
						setIsMenuOpen(false);
					}}
				/>

				{currentMode === 'stamp' && (
					<StampSettings
						selectedNote={selectedNote}
						selectedAccidental={selectedAccidental}
						onSelectNote={handleSelectNote}
						onSelectAccidental={handleSelectAccidental}
					/>
				)}

				<BottomToolbar
					currentMode={currentMode}
					canUndo={canUndo}
					canRedo={canRedo}
					onSelectMode={handleSelectMode}
					onUndo={() => stageRef.current?.undo()}
					onRedo={() => stageRef.current?.redo()}
					onToggleMenu={() => {
						setIsMenuOpen((prev) => !prev);
						setIsPaletteOpen(false);
					}}
				/>
			</Box>
		</main>
	);
};
