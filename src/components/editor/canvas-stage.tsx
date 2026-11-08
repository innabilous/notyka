'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { FilePlus } from 'lucide-react';
import { BrandLogo } from '@/components/common/brand-logo';
import {
	CHORD_ROOTS,
	COUNT_ITEMS,
	DEFAULT_BLANK_HEIGHT,
	DEFAULT_BLANK_WIDTH,
	DRAG_SLOP,
	MAX_HISTORY,
	MAX_PIXELS,
	MAX_SCALE,
	MAX_SIDE,
	MIN_CANVAS_SIDE,
	MIN_SCALE,
	NOTES,
	SMOOTH,
} from '@/constants/editor';
import {
	CanvasLayerItem,
	HistoryItem,
	Point,
	RulerItem,
	ShapeType,
	StampDrawingPath,
	StampItem,
	ToolMode,
} from '@/types/editor';
import { ProjectItem, SerializedHistoryItem } from '@/types/storage';
import {
	calculateStampBox,
	clampArrowHead,
	clampStampPosition,
	drawRulers,
	drawStamp,
	findRulerNearPoint,
	getClosestRulerY,
	drawSmartGuide,
	getDeleteCoords,
	getHandleCoords,
	getResizeHandleCoords,
	getStampItemHorizontalSnap,
	isPointInDelete,
	isPointInHandle,
	isPointInResizeHandle,
	isPointInCornerResizeHandle,
	isPointInRotateHandle,
	isPointInRulerDelete,
	isPointInStamp,
	isStampAttachedToRuler,
	SnapGuide,
} from '@/utils/canvas-renderer';

export function getStampCategory(stamp: StampItem): string {
	if (stamp.category) return stamp.category;
	if (stamp.isDrawing) return 'draw';
	const t = (stamp.text || '').trim();
	if (NOTES.some((n) => t.startsWith(n))) return 'notes';
	if ((COUNT_ITEMS as readonly string[]).includes(t)) return 'count';
	if (CHORD_ROOTS.some((r) => t.startsWith(r))) return 'chords';
	return 'custom';
}

interface CanvasStageProps {
	currentMode: ToolMode;
	mainColor: string;
	strokeColor: string;
	currentSize: number;
	selectedNote: string;
	selectedAccidental: string;
	selectedShape?: ShapeType;
	activeStampText?: string;
	stampBadgeMode?: boolean;
	stampCategory?: string;
	drawDuplicateMode?: boolean;
	isAutoCountMode?: boolean;
	currentAutoCountIndex?: number;
	currentAutoCountSeqId?: string;
	deleteBtnOn: boolean;
	resizeHandlesOn?: boolean;
	rulersVisible?: boolean;
	rulersSnap?: boolean;
	rulersSnapItems?: boolean;
	rulersAttachContent?: boolean;
	rulersShowDistance?: boolean;
	rulersLockEqualDistance?: boolean;
	hasCanvas: boolean;
	onSelectStamp: (stamp: StampItem) => void;
	onChangeSize?: (newSize: number) => void;
	onAdvanceAutoCount?: () => void;
	onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
	onScaleChange?: (scale: number) => void;
	onRulersCountChange?: (count: number) => void;
	onNotify: (message: string) => void;
	onInitBlank: () => void;
	onResetCanvas: () => void;
	onContentChange?: () => void;
	stageRef: React.MutableRefObject<CanvasStageHandle | null>;
}

export interface CanvasStageHandle {
	createBlank: () => void;
	loadImage: (fileOrSrc: File | string, title?: string) => void;
	clear: () => void;
	clearRulers: () => void;
	undo: () => void;
	redo: () => void;
	distributeRulers: () => void;
	getRulersCount: () => number;
	commitActiveStamp: (save?: boolean) => void;
	duplicateActiveStamp: () => void;
	syncCategorySizes: (category: string, size: number) => void;
	prepareExport: () => void;
	getExportBlob: () => Promise<Blob | null>;
	serializeProject: (title?: string) => Promise<ProjectItem | null>;
	loadProject: (project: ProjectItem) => Promise<void>;
	updateActiveStampProps: (
		size: number,
		text: string,
		mainColor: string,
		strokeColor: string,
		badgeMode?: boolean,
	) => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
	currentMode,
	mainColor,
	strokeColor,
	currentSize,
	selectedNote,
	selectedAccidental,
	selectedShape = 'rect',
	activeStampText,
	stampBadgeMode = false,
	stampCategory = 'notes',
	drawDuplicateMode = false,
	isAutoCountMode = false,
	currentAutoCountIndex = 0,
	currentAutoCountSeqId,
	deleteBtnOn,
	resizeHandlesOn = true,
	rulersVisible = true,
	rulersSnap = true,
	rulersSnapItems = true,
	rulersAttachContent = true,
	rulersShowDistance = false,
	rulersLockEqualDistance = false,
	hasCanvas,
	onSelectStamp,
	onChangeSize,
	onAdvanceAutoCount,
	onHistoryChange,
	onScaleChange,
	onRulersCountChange,
	onNotify,
	onInitBlank,
	onResetCanvas,
	onContentChange,
	stageRef,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Offscreen canvas layers
	const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const layersRef = useRef<
		Array<
			| { type: 'stroke'; id: string; canvas: HTMLCanvasElement }
			| { type: 'stamp'; id: string; stamp: StampItem }
		>
	>([]);
	const activeStrokeCanvasRef = useRef<HTMLCanvasElement | null>(null);

	// Editor state refs
	const currentImageRef = useRef<HTMLImageElement | null>(null);
	const stampsListRef = useRef<StampItem[]>([]);
	const activeStampRef = useRef<StampItem | null>(null);
	const activeOrigRef = useRef<string>('');
	const rulersListRef = useRef<RulerItem[]>([]);
	const activeRulerIdRef = useRef<string | null>(null);
	const isDraggingRulerRef = useRef<boolean>(false);
	const draggedStampIdsRef = useRef<string[]>([]);
	const cursorPosRef = useRef<Point | null>(null);

	const currentProjectIdRef = useRef<string>('');
	const currentProjectTitleRef = useRef<string>('');

	// Canvas dimensions & scale
	const uRef = useRef<number>(1);
	const scaleRef = useRef<number>(1);
	const panRef = useRef<Point>({ x: 0, y: 0 });

	// Interaction flags
	const isDrawingRef = useRef<boolean>(false);
	const lastCoordsRef = useRef<Point | null>(null);
	const smoothPosRef = useRef<Point | null>(null);
	const lastMidRef = useRef<Point | null>(null);

	const isDraggingStampRef = useRef<boolean>(false);
	const isDraggingHandleRef = useRef<boolean>(false);
	const isDraggingResizeRef = useRef<'left' | 'right' | null>(null);
	const resizeStartSizeRef = useRef<number>(24);
	const resizeStartDistRef = useRef<number>(0);
	const resizeStartWidthRef = useRef<number>(0);
	const resizeStartHeightRef = useRef<number>(0);
	const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });
	const dragStartPtRef = useRef<Point | null>(null);
	const dragMovedRef = useRef<boolean>(true);
	const activeSnapGuideRef = useRef<SnapGuide | null>(null); //! Активна напрямна лінія для вирівнювання штампів

	// Shapes creation
	const isCreatingShapeRef = useRef<boolean>(false);
	const shapeStartPtRef = useRef<Point | null>(null);
	const isDraggingRotateRef = useRef<boolean>(false);
	const rotateStartAngleRef = useRef<number>(0);
	const rotateInitialAngleRef = useRef<number>(0);
	const isDraggingCornerRef = useRef<'tl' | 'tr' | 'br' | 'bl' | null>(null);
	const lastShapePresetRef = useRef<{
		shapeType: ShapeType;
		width: number;
		height: number;
		rotation: number;
		dx?: number;
		dy?: number;
		strokeWidth: number;
		mainColor: string;
		strokeColor: string;
	} | null>(null);

	// Drawing mode within stamp
	const isDrawingStampRef = useRef<boolean>(false);
	const currentDrawingPathRef = useRef<Point[]>([]);
	const accumulatedDrawingPathsRef = useRef<Point[][]>([]);
	const drawDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Multi-touch / Pan flags
	const isMultiTouchRef = useRef<boolean>(false);
	const isPanningRef = useRef<boolean>(false);
	const panStartRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number }>({
		clientX: 0,
		clientY: 0,
		panX: 0,
		panY: 0,
	});
	const initialPinchDistRef = useRef<number>(0);
	const startScaleRef = useRef<number>(1);
	const pinchFocalRef = useRef<{ x: number; y: number; baseLeft: number; baseTop: number } | null>(
		null,
	);
	const ignoreMouseDownRef = useRef<boolean>(false);

	const pendingStartRef = useRef<Point | null>(null);
	const pendingClientRef = useRef<Point | null>(null);
	const pendingTimerRef = useRef<NodeJS.Timeout | null>(null);

	// History stack
	const historyStackRef = useRef<HistoryItem[]>([]);
	const historyStepRef = useRef<number>(-1);
	const strokeRevisionRef = useRef<number>(0);
	const lastSavedStrokeRevisionRef = useRef<number>(-1);
	const cachedLayerSnapshotsRef = useRef<CanvasLayerItem[] | null>(null);

	// Export cache
	const exportBlobRef = useRef<Blob | null>(null);
	const exportTokenRef = useRef<number>(0);

	// RAF render scheduler
	const rafIdRef = useRef<number>(0);

	const applyTransform = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		canvas.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${scaleRef.current})`;
	}, []);

	const resetTransform = useCallback(() => {
		scaleRef.current = 1;
		panRef.current = { x: 0, y: 0 };
		applyTransform();
		onScaleChange?.(1);
	}, [applyTransform, onScaleChange]);

	const updateUndoRedo = useCallback(() => {
		const canUndo = historyStepRef.current > 0;
		const canRedo = historyStepRef.current < historyStackRef.current.length - 1;
		onHistoryChange(canUndo, canRedo);
	}, [onHistoryChange]);

	const render = useCallback(() => {
		exportTokenRef.current++;
		exportBlobRef.current = null;

		const canvas = canvasRef.current;
		const baseCanvas = baseCanvasRef.current;
		const bgCanvas = bgCanvasRef.current;
		if (!canvas || !baseCanvas || !bgCanvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';

		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (currentImageRef.current) {
			ctx.drawImage(bgCanvas, 0, 0);
		}

		//! Малюємо всі шари (штрихи та штампи) в порядку їх фактичного нанесення
		if (layersRef.current.length === 0 && baseCanvas) {
			ctx.drawImage(baseCanvas, 0, 0);
		} else {
			layersRef.current.forEach((layer) => {
				if (layer.type === 'stroke') {
					ctx.drawImage(layer.canvas, 0, 0);
				} else {
					const isCurrentActive = activeStampRef.current?.id === layer.stamp.id;
					drawStamp(layer.stamp, isCurrentActive, ctx, uRef.current, deleteBtnOn, resizeHandlesOn);
				}
			});
		}

		//! Якщо активний новий штамп ще не закомічений у шари — малюємо його зверху
		if (
			activeStampRef.current &&
			!layersRef.current.some(
				(l) => l.type === 'stamp' && l.id === activeStampRef.current?.id,
			)
		) {
			drawStamp(
				activeStampRef.current,
				true,
				ctx,
				uRef.current,
				deleteBtnOn,
				resizeHandlesOn,
			);
		}

		//! Малюємо незавершені штрихи ручного малювання штампа
		const inProgressPaths = [...accumulatedDrawingPathsRef.current];
		if (isDrawingStampRef.current && currentDrawingPathRef.current.length > 0) {
			inProgressPaths.push(currentDrawingPathRef.current);
		}
		if (inProgressPaths.length > 0) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			const sw = currentSize * uRef.current;
			if (strokeColor && strokeColor !== 'transparent') {
				ctx.strokeStyle = strokeColor;
				ctx.lineWidth = sw + 4 * uRef.current;
				inProgressPaths.forEach((path) => {
					if (path.length === 0) return;
					ctx.beginPath();
					if (path.length === 1) {
						ctx.arc(path[0].x, path[0].y, sw / 2, 0, Math.PI * 2);
						ctx.fillStyle = strokeColor;
						ctx.fill();
					} else {
						ctx.moveTo(path[0].x, path[0].y);
						for (let i = 1; i < path.length; i++) {
							ctx.lineTo(path[i].x, path[i].y);
						}
						ctx.stroke();
					}
				});
			}
			ctx.strokeStyle = mainColor;
			ctx.lineWidth = sw;
			inProgressPaths.forEach((path) => {
				if (path.length === 0) return;
				ctx.beginPath();
				if (path.length === 1) {
					ctx.arc(path[0].x, path[0].y, sw / 2, 0, Math.PI * 2);
					ctx.fillStyle = mainColor;
					ctx.fill();
				} else {
					ctx.moveTo(path[0].x, path[0].y);
					for (let i = 1; i < path.length; i++) {
						ctx.lineTo(path[i].x, path[i].y);
					}
					ctx.stroke();
				}
			});
			ctx.restore();
		}

		if (rulersVisible) {
			drawRulers(
				rulersListRef.current,
				activeRulerIdRef.current,
				currentMode === 'ruler',
				ctx,
				uRef.current,
				canvas.width,
				rulersShowDistance,
			);
		}

		//! Малюємо лінію розумного вирівнювання нот між лінійками
		if (activeSnapGuideRef.current) {
			drawSmartGuide(ctx, activeSnapGuideRef.current, uRef.current);
		}

		if (cursorPosRef.current && currentMode === 'eraser') {
			const r = currentSize * 0.75 * uRef.current;
			const lw = (1.5 * uRef.current) / scaleRef.current;
			ctx.save();
			ctx.beginPath();
			ctx.arc(cursorPosRef.current.x, cursorPosRef.current.y, r, 0, Math.PI * 2);
			ctx.lineWidth = lw * 3;
			ctx.strokeStyle = 'rgba(255,255,255,.9)';
			ctx.stroke();
			ctx.lineWidth = lw;
			ctx.strokeStyle = '#111';
			ctx.stroke();
			ctx.restore();
		}
	}, [
		currentMode,
		currentSize,
		deleteBtnOn,
		mainColor,
		resizeHandlesOn,
		rulersLockEqualDistance,
		rulersShowDistance,
		rulersVisible,
		strokeColor,
	]);

	const scheduleRender = useCallback(() => {
		if (rafIdRef.current) return;
		rafIdRef.current = requestAnimationFrame(() => {
			rafIdRef.current = 0;
			render();
		});
	}, [render]);

	const saveHistory = useCallback(() => {
		const baseCanvas = baseCanvasRef.current;
		if (!baseCanvas) return;

		const currentStack = historyStackRef.current.slice(0, historyStepRef.current + 1);

		//! Перевіряємо, чи змінилися штрихові шари від останнього збереження
		const strokesChanged = strokeRevisionRef.current !== lastSavedStrokeRevisionRef.current;
		let layerSnapshots: CanvasLayerItem[];

		if (strokesChanged || !cachedLayerSnapshotsRef.current) {
			layerSnapshots = layersRef.current.map((layer) => {
				if (layer.type === 'stroke') {
					const ctx = layer.canvas.getContext('2d');
					const strokeDataUrl = layer.canvas.toDataURL('image/png');
					return {
						type: 'stroke',
						id: layer.id,
						imageData: ctx
							? ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height)
							: undefined,
						strokeDataUrl,
					};
				}
				return {
					type: 'stamp',
					id: layer.id,
					stamp: JSON.parse(JSON.stringify(layer.stamp)),
				};
			});
			cachedLayerSnapshotsRef.current = layerSnapshots;
			lastSavedStrokeRevisionRef.current = strokeRevisionRef.current;
		} else {
			//! Штрихи не змінювалися: перевикористовуємо кешовані штрихові шари для економії пам'яті
			layerSnapshots = layersRef.current.map((layer) => {
				if (layer.type === 'stroke') {
					const cached = cachedLayerSnapshotsRef.current?.find((c) => c.id === layer.id);
					if (cached) return cached;
					const ctx = layer.canvas.getContext('2d');
					return {
						type: 'stroke',
						id: layer.id,
						imageData: ctx
							? ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height)
							: undefined,
						strokeDataUrl: layer.canvas.toDataURL('image/png'),
					};
				}
				return {
					type: 'stamp',
					id: layer.id,
					stamp: JSON.parse(JSON.stringify(layer.stamp)),
				};
			});
		}

		currentStack.push({
			stamps: JSON.parse(JSON.stringify(stampsListRef.current)),
			rulers: JSON.parse(JSON.stringify(rulersListRef.current)),
			layers: layerSnapshots,
		});

		while (currentStack.length > MAX_HISTORY) {
			currentStack.shift();
		}

		historyStackRef.current = currentStack;
		historyStepRef.current = currentStack.length - 1;
		updateUndoRedo();
		onContentChange?.();
	}, [onContentChange, updateUndoRedo]);

	const finalizeDrawingStamp = useCallback(() => {
		if (drawDebounceTimerRef.current) {
			clearTimeout(drawDebounceTimerRef.current);
			drawDebounceTimerRef.current = null;
		}

		const paths = accumulatedDrawingPathsRef.current;
		if (paths.length === 0) return;

		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		paths.forEach((p) => {
			p.forEach((pt) => {
				if (pt.x < minX) minX = pt.x;
				if (pt.x > maxX) maxX = pt.x;
				if (pt.y < minY) minY = pt.y;
				if (pt.y > maxY) maxY = pt.y;
			});
		});

		if (minX === Infinity) {
			accumulatedDrawingPathsRef.current = [];
			return;
		}

		let width = maxX - minX;
		let height = maxY - minY;
		if (width <= 0) width = 16 * uRef.current;
		if (height <= 0) height = 16 * uRef.current;

		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;

		const snapY = rulersSnap
			? getClosestRulerY(centerY, rulersListRef.current, 16 * uRef.current)
			: null;
		const finalY = snapY !== null ? snapY : centerY;

		// Normalize paths relative to center (0, 0)
		const normalizedPaths: StampDrawingPath[] = paths.map((path) => ({
			points: path.map((pt) => ({
				x: pt.x - centerX,
				y: pt.y - centerY,
			})),
		}));

		const newStamp: StampItem = {
			id: `draw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
			x: centerX,
			y: finalY,
			size: currentSize,
			initialSize: currentSize,
			category: 'draw',
			isDrawing: true,
			text: '',
			mainColor,
			strokeColor,
			strokeWidth: currentSize,
			rawBounds: { width, height },
			paths: normalizedPaths,
		};

		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (ctx) {
			const clamped = clampStampPosition(newStamp.x, newStamp.y, newStamp, uRef.current, ctx);
			newStamp.x = clamped.x;
			newStamp.y = clamped.y;
		}

		accumulatedDrawingPathsRef.current = [];
		activeStampRef.current = newStamp;
		activeOrigRef.current = JSON.stringify(newStamp);

		layersRef.current.push({
			type: 'stamp',
			id: newStamp.id,
			stamp: newStamp,
		});
		stampsListRef.current.push(newStamp);

		saveHistory();
		render();
		onSelectStamp(newStamp);
		onNotify('Малюнок створено');
	}, [
		currentSize,
		mainColor,
		onNotify,
		onSelectStamp,
		render,
		rulersSnap,
		saveHistory,
		strokeColor,
	]);

	const commitActiveStamp = useCallback(
		(save: boolean = true) => {
			if (drawDebounceTimerRef.current) {
				clearTimeout(drawDebounceTimerRef.current);
				drawDebounceTimerRef.current = null;
				finalizeDrawingStamp();
			}

			const active = activeStampRef.current;
			if (!active) return;

			const changed = JSON.stringify(active) !== activeOrigRef.current;
			const existingIdx = layersRef.current.findIndex(
				(l) => l.type === 'stamp' && l.id === active.id,
			);
			if (existingIdx !== -1) {
				layersRef.current[existingIdx] = { type: 'stamp', id: active.id, stamp: active };
			} else {
				layersRef.current.push({ type: 'stamp', id: active.id, stamp: active });
			}

			stampsListRef.current = layersRef.current
				.filter((l): l is { type: 'stamp'; id: string; stamp: StampItem } => l.type === 'stamp')
				.map((l) => l.stamp);

			activeStampRef.current = null;
			activeOrigRef.current = '';
			activeSnapGuideRef.current = null;
			render();

			if (changed && save) {
				saveHistory();
			}
		},
		[finalizeDrawingStamp, render, saveHistory],
	);

	const syncCategorySizes = useCallback(
		(category: string, size: number) => {
			let updatedCount = 0;
			layersRef.current.forEach((layer) => {
				if (layer.type === 'stamp' && getStampCategory(layer.stamp) === category) {
					layer.stamp.size = size;
					if (layer.stamp.category === 'shapes' || layer.stamp.shapeType) {
						layer.stamp.strokeWidth = size;
					}
					const canvas = canvasRef.current;
					const ctx = canvas?.getContext('2d');
					if (ctx) {
						const clamped = clampStampPosition(
							layer.stamp.x,
							layer.stamp.y,
							layer.stamp,
							uRef.current,
							ctx,
						);
						layer.stamp.x = clamped.x;
						layer.stamp.y = clamped.y;
					}
					updatedCount++;
				}
			});

			stampsListRef.current.forEach((st) => {
				if (getStampCategory(st) === category) {
					st.size = size;
					if (st.category === 'shapes' || st.shapeType) {
						st.strokeWidth = size;
					}
				}
			});

			if (activeStampRef.current && getStampCategory(activeStampRef.current) === category) {
				activeStampRef.current.size = size;
				if (activeStampRef.current.category === 'shapes' || activeStampRef.current.shapeType) {
					activeStampRef.current.strokeWidth = size;
				}
			}

			if (updatedCount > 0) {
				saveHistory();
				render();
				onNotify(
					category === 'shapes'
						? `Товщину ліній ${updatedCount} фігур синхронізовано`
						: `Синхронізовано ${updatedCount} елементів розділу`,
				);
			} else {
				onNotify(
					category === 'shapes'
						? 'Товщину ліній фігур синхронізовано'
						: 'Немає елементів цього розділу на полотні',
				);
			}
		},
		[onNotify, render, saveHistory],
	);

	const initCanvas = useCallback((w: number, h: number, cssW: number, cssH: number) => {
		if (!baseCanvasRef.current) baseCanvasRef.current = document.createElement('canvas');
		if (!bgCanvasRef.current) bgCanvasRef.current = document.createElement('canvas');

		const canvas = canvasRef.current;
		const base = baseCanvasRef.current;
		const bg = bgCanvasRef.current;
		if (!canvas || !base || !bg) return;

		canvas.width = base.width = bg.width = w;
		canvas.height = base.height = bg.height = h;
		canvas.style.width = `${cssW}px`;
		canvas.style.height = `${cssH}px`;
		uRef.current = w / cssW;

		layersRef.current = [{ type: 'stroke', id: 'base', canvas: base }];
		activeStrokeCanvasRef.current = base;

		const bctx = base.getContext('2d');
		if (bctx) {
			bctx.imageSmoothingEnabled = true;
			bctx.imageSmoothingQuality = 'high';
		}
		const bgctx = bg.getContext('2d');
		if (bgctx) {
			bgctx.imageSmoothingEnabled = true;
			bgctx.imageSmoothingQuality = 'high';
		}
	}, []);

	const createBlank = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;

		currentProjectIdRef.current = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
		currentProjectTitleRef.current = `Аркуш ${new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`;

		currentImageRef.current = null;
		stampsListRef.current = [];
		rulersListRef.current = [];
		activeStampRef.current = null;
		activeRulerIdRef.current = null;
		activeOrigRef.current = '';
		resetTransform();

		const availableW = Math.max(300, container.clientWidth - 20);
		const availableH = Math.max(300, container.clientHeight - 130);

		// Пропорція стандартного аркуша A4: 1 : √2 (210 / 297 ≈ 0.707)
		const A4_ASPECT = 210 / 297;

		let cssW = availableW;
		let cssH = Math.round(cssW / A4_ASPECT);

		// Якщо розрахована висота перевищує доступну висоту екрана, підганяємо по висоті
		if (cssH > availableH) {
			cssH = availableH;
			cssW = Math.round(cssH * A4_ASPECT);
		}

		//! Стандартизований буфер A4 (1240 × 1754 px) для ідеальної чіткості без зайвого навантаження пам'яті
		initCanvas(DEFAULT_BLANK_WIDTH, DEFAULT_BLANK_HEIGHT, cssW, cssH);
		onInitBlank();
		render();

		historyStackRef.current = [];
		historyStepRef.current = -1;
		saveHistory();
		onNotify('Створено білий аркуш');
	}, [initCanvas, onInitBlank, onNotify, render, resetTransform, saveHistory]);

	const loadImage = useCallback(
		(fileOrSrc: File | string, title?: string) => {
			const container = containerRef.current;
			if (!container) return;

			const handleImageSource = (src: string, defaultTitle: string) => {
				const img = new Image();
				img.onload = () => {
					currentProjectIdRef.current = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
					currentProjectTitleRef.current =
						title ||
						defaultTitle ||
						`Фото ${new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`;

					currentImageRef.current = img;
					stampsListRef.current = [];
					rulersListRef.current = [];
					activeStampRef.current = null;
					activeRulerIdRef.current = null;
					activeOrigRef.current = '';
					resetTransform();

					const cw = Math.max(280, container.clientWidth - 20);
					const ch = Math.max(280, container.clientHeight - 130);
					const naturalW = img.naturalWidth || img.width;
					const naturalH = img.naturalHeight || img.height;

					//! 1. Якщо зображення менше за мінімальний стандарт (MIN_CANVAS_SIDE), підтягуємо роздільну здатність
					let targetW = naturalW;
					let targetH = naturalH;
					const minSide = Math.min(naturalW, naturalH);
					if (minSide < MIN_CANVAS_SIDE) {
						const upscale = MIN_CANVAS_SIDE / minSide;
						targetW = Math.round(naturalW * upscale);
						targetH = Math.round(naturalH * upscale);
					}

					//! 2. Обмежуємо максимальні габарити (2K / 4.5 Мп) для економії оперативної пам'яті
					const maxSide = Math.max(targetW, targetH);
					const downscale = Math.min(
						1,
						MAX_SIDE / maxSide,
						Math.sqrt(MAX_PIXELS / (targetW * targetH)),
					);
					const canvasW = Math.round(targetW * downscale);
					const canvasH = Math.round(targetH * downscale);

					const fit = Math.min(cw / canvasW, ch / canvasH);
					const cssW = Math.round(canvasW * fit);
					const cssH = Math.round(canvasH * fit);

					initCanvas(canvasW, canvasH, cssW, cssH);

					const bg = bgCanvasRef.current;
					if (bg) {
						const bgctx = bg.getContext('2d');
						if (bgctx) {
							bgctx.imageSmoothingEnabled = true;
							bgctx.imageSmoothingQuality = 'high';
							bgctx.drawImage(img, 0, 0, bg.width, bg.height);
						}
					}

					onInitBlank();
					render();
					onRulersCountChange?.(rulersListRef.current.length);

					const base = baseCanvasRef.current;
					if (base) {
						layersRef.current = [{ type: 'stroke', id: 'base', canvas: base }];
						activeStrokeCanvasRef.current = base;
					}
					stampsListRef.current = [];
					activeStampRef.current = null;

					historyStackRef.current = [];
					historyStepRef.current = -1;
					saveHistory();
					onNotify('Зображення завантажено');
				};
				img.src = src;
			};

			if (typeof fileOrSrc === 'string') {
				handleImageSource(fileOrSrc, title || 'Фото');
			} else {
				const reader = new FileReader();
				const cleanName = fileOrSrc.name.replace(/\.[^/.]+$/, '').trim();
				reader.onload = (ev) => {
					const src = ev.target?.result;
					if (typeof src === 'string') {
						handleImageSource(src, cleanName);
					}
				};
				reader.readAsDataURL(fileOrSrc);
			}
		},
		[initCanvas, onInitBlank, onNotify, onRulersCountChange, render, resetTransform, saveHistory],
	);

	const clearCanvas = useCallback(() => {
		activeStampRef.current = null;
		activeOrigRef.current = '';
		stampsListRef.current = [];
		rulersListRef.current = [];
		activeRulerIdRef.current = null;
		onRulersCountChange?.(0);

		const base = baseCanvasRef.current;
		if (base) {
			const bctx = base.getContext('2d');
			if (bctx) bctx.clearRect(0, 0, base.width, base.height);
			layersRef.current = [{ type: 'stroke', id: 'base', canvas: base }];
			activeStrokeCanvasRef.current = base;
			strokeRevisionRef.current++;
			cachedLayerSnapshotsRef.current = null;
		}

		if (currentImageRef.current) {
			render();
			saveHistory();
		} else {
			onResetCanvas();
			resetTransform();
			historyStackRef.current = [];
			historyStepRef.current = -1;
			updateUndoRedo();
			onContentChange?.();
		}
		onNotify('Очищено');
	}, [
		onContentChange,
		onNotify,
		onResetCanvas,
		onRulersCountChange,
		render,
		resetTransform,
		saveHistory,
		updateUndoRedo,
	]);

	const restoreHistory = useCallback(
		(step: number) => {
			const item = historyStackRef.current[step];
			const base = baseCanvasRef.current;
			if (!item || !base) return;

			//! Скидаємо кеш штрихів при переході по історії
			strokeRevisionRef.current++;
			cachedLayerSnapshotsRef.current = null;
			lastSavedStrokeRevisionRef.current = -1;

			if (item.layers && item.layers.length > 0) {
				layersRef.current = item.layers.map((l) => {
					if (l.type === 'stroke') {
						const sc = document.createElement('canvas');
						sc.width = base.width;
						sc.height = base.height;
						if (l.imageData) {
							sc.getContext('2d')?.putImageData(l.imageData, 0, 0);
						} else if (l.strokeDataUrl) {
							const img = new Image();
							img.onload = () => {
								sc.getContext('2d')?.drawImage(img, 0, 0);
								render();
							};
							img.src = l.strokeDataUrl;
						}
						return {
							type: 'stroke',
							id: l.id,
							canvas: sc,
							strokeDataUrl: l.strokeDataUrl,
						};
					}
					return {
						type: 'stamp',
						id: l.id,
						stamp: JSON.parse(JSON.stringify(l.stamp!)),
					};
				});

				const firstStroke = layersRef.current.find(
					(l): l is { type: 'stroke'; id: string; canvas: HTMLCanvasElement } =>
						l.type === 'stroke',
				);
				if (firstStroke) {
					baseCanvasRef.current = firstStroke.canvas;
				}
				activeStrokeCanvasRef.current =
					layersRef.current[layersRef.current.length - 1]?.type === 'stroke'
						? (layersRef.current[layersRef.current.length - 1] as { type: 'stroke'; id: string; canvas: HTMLCanvasElement }).canvas
						: (firstStroke ? firstStroke.canvas : base);
			} else {
				const bctx = base.getContext('2d');
				if (bctx && item.imageData) {
					bctx.putImageData(item.imageData, 0, 0);
				}
				layersRef.current = [{ type: 'stroke', id: 'base', canvas: base }];
				(item.stamps || []).forEach((st) => {
					layersRef.current.push({
						type: 'stamp',
						id: st.id,
						stamp: JSON.parse(JSON.stringify(st)),
					});
				});
				activeStrokeCanvasRef.current = base;
			}

			stampsListRef.current = layersRef.current
				.filter(
					(l): l is { type: 'stamp'; id: string; stamp: StampItem } =>
						l.type === 'stamp',
				)
				.map((l) => l.stamp);

			rulersListRef.current = item.rulers ? JSON.parse(JSON.stringify(item.rulers)) : [];
			activeStampRef.current = null;
			activeRulerIdRef.current = null;
			activeOrigRef.current = '';
			render();
			updateUndoRedo();
			onContentChange?.();
			onRulersCountChange?.(rulersListRef.current.length);
		},
		[onContentChange, onRulersCountChange, render, updateUndoRedo],
	);

	const handleUndo = useCallback(() => {
		if (drawDebounceTimerRef.current) {
			clearTimeout(drawDebounceTimerRef.current);
			drawDebounceTimerRef.current = null;
			accumulatedDrawingPathsRef.current = [];
		}
		activeStampRef.current = null;
		activeOrigRef.current = '';
		if (historyStepRef.current > 0) {
			historyStepRef.current -= 1;
			restoreHistory(historyStepRef.current);
			onNotify('Скасовано');
		}
	}, [onNotify, restoreHistory]);

	const handleRedo = useCallback(() => {
		if (drawDebounceTimerRef.current) {
			clearTimeout(drawDebounceTimerRef.current);
			drawDebounceTimerRef.current = null;
			accumulatedDrawingPathsRef.current = [];
		}
		activeStampRef.current = null;
		activeOrigRef.current = '';
		if (historyStepRef.current < historyStackRef.current.length - 1) {
			historyStepRef.current += 1;
			restoreHistory(historyStepRef.current);
			onNotify('Повернуто');
		}
	}, [onNotify, restoreHistory]);

	const getCanvasCoords = useCallback((cx: number, cy: number): Point => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };
		const r = canvas.getBoundingClientRect();
		return {
			x: (cx - r.left) * (canvas.width / r.width),
			y: (cy - r.top) * (canvas.height / r.height),
		};
	}, []);

	const deleteActiveStamp = useCallback(() => {
		const active = activeStampRef.current;
		const wasNew = activeOrigRef.current === '';
		if (active) {
			layersRef.current = layersRef.current.filter((l) => !(l.type === 'stamp' && l.id === active.id));
			stampsListRef.current = stampsListRef.current.filter((s) => s.id !== active.id);
		}
		activeStampRef.current = null;
		activeOrigRef.current = '';
		isDraggingStampRef.current = false;
		isDraggingHandleRef.current = false;
		isDraggingResizeRef.current = null;
		isDraggingRotateRef.current = false;
		isDraggingCornerRef.current = null;
		isDraggingRotateRef.current = false;
		isDraggingCornerRef.current = null;
		render();
		if (!wasNew) saveHistory();
		onNotify('Штамп видалено');
	}, [onNotify, render, saveHistory]);

	const duplicateActiveStamp = useCallback(() => {
		const active = activeStampRef.current;
		if (!active) return;

		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		const offset = 24 * uRef.current;

		const clonedPaths = active.paths
			? active.paths.map((p) => ({
					points: p.points.map((pt) => ({ ...pt })),
				}))
			: undefined;

		const cloned: StampItem = {
			...active,
			id: `${active.isDrawing ? 'draw' : 'stamp'}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
			x: active.x + offset,
			y: active.y + offset,
			endX: active.endX !== undefined ? active.endX + offset : undefined,
			endY: active.endY !== undefined ? active.endY + offset : undefined,
			paths: clonedPaths,
			rawBounds: active.rawBounds ? { ...active.rawBounds } : undefined,
		};

		if (ctx) {
			const clamped = clampStampPosition(cloned.x, cloned.y, cloned, uRef.current, ctx);
			cloned.x = clamped.x;
			cloned.y = clamped.y;
		}

		layersRef.current.push({
			type: 'stamp',
			id: cloned.id,
			stamp: cloned,
		});
		stampsListRef.current.push(cloned);

		activeStampRef.current = cloned;
		activeOrigRef.current = JSON.stringify(cloned);

		saveHistory();
		render();
		onSelectStamp(cloned);
		onNotify('Елемент продубльовано');
	}, [onNotify, onSelectStamp, render, saveHistory]);

	const placeStamp = useCallback(
		(pt: Point) => {
			dragStartPtRef.current = pt;
			dragMovedRef.current = false;

			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const active = activeStampRef.current;

			// 0. Trash button click on active stamp
			if (active && deleteBtnOn && isPointInDelete(pt, active, uRef.current, ctx)) {
				deleteActiveStamp();
				return;
			}

			// 0.05. Rotate handle click on active shape
			if (active && isPointInRotateHandle(pt, active, uRef.current, ctx)) {
				isDraggingRotateRef.current = true;
				rotateStartAngleRef.current = Math.atan2(pt.y - active.y, pt.x - active.x);
				rotateInitialAngleRef.current = active.rotation || 0;
				return;
			}

			// 0.08. Corner resize handle click on active shape (rect / circle)
			if (
				active &&
				resizeHandlesOn &&
				(active.category === 'shapes' || active.shapeType) &&
				active.shapeType !== 'arrow'
			) {
				const corner = isPointInCornerResizeHandle(pt, active, uRef.current);
				if (corner) {
					isDraggingCornerRef.current = corner;
					dragStartPtRef.current = pt;
					return;
				}
			}

			// 0.1. Resize handle click on active stamp (лівий або правий)
			if (active && resizeHandlesOn) {
				const resizeSide = isPointInResizeHandle(pt, active, uRef.current, ctx);
				if (resizeSide) {
					isDraggingResizeRef.current = resizeSide;
					resizeStartSizeRef.current = active.size;
					resizeStartDistRef.current = Math.max(10 * uRef.current, Math.abs(pt.x - active.x));
					resizeStartWidthRef.current = active.width || active.size * 2;
					resizeStartHeightRef.current = active.height || active.size * 1.5;
					return;
				}
			}

			// 1. Handle drag on active stamp
			if (active && isPointInHandle(pt, active, uRef.current, ctx)) {
				isDraggingHandleRef.current = true;
				const h = getHandleCoords(active, uRef.current, ctx);
				dragOffsetRef.current = { x: pt.x - h.x, y: pt.y - h.y };
				return;
			}

			// 2. Stamp body drag
			if (active && isPointInStamp(pt, active, uRef.current, ctx)) {
				isDraggingStampRef.current = true;
				dragOffsetRef.current = { x: pt.x - active.x, y: pt.y - active.y };
				return;
			}

			// 3. Selection of existing stamps from top to bottom
			for (let i = layersRef.current.length - 1; i >= 0; i--) {
				const l = layersRef.current[i];
				if (l.type === 'stamp' && isPointInStamp(pt, l.stamp, uRef.current, ctx)) {
					commitActiveStamp(false);
					const selected = l.stamp;
					if (selected.category === 'shapes' && selected.shapeType) {
						lastShapePresetRef.current = {
							shapeType: selected.shapeType,
							width: selected.width || (selected.shapeType === 'rect' ? 80 : 60),
							height: selected.height || (selected.shapeType === 'rect' ? 50 : 60),
							rotation: selected.rotation || 0,
							dx: selected.shapeType === 'arrow' && selected.endX !== undefined ? selected.endX - selected.x : undefined,
							dy: selected.shapeType === 'arrow' && selected.endY !== undefined ? selected.endY - selected.y : undefined,
							strokeWidth: selected.strokeWidth || selected.size || currentSize,
							mainColor: selected.mainColor,
							strokeColor: selected.strokeColor,
						};
					}
					activeStampRef.current = selected;
					activeOrigRef.current = JSON.stringify(selected);

					onSelectStamp(selected);

					isDraggingStampRef.current = true;
					dragOffsetRef.current = { x: pt.x - selected.x, y: pt.y - selected.y };
					render();
					onNotify('Штамп виділено');
					return;
				}
			}

			//! 4. Якщо обрано режим малювання штампа
			if (stampCategory === 'draw') {
				if (drawDuplicateMode && active && active.isDrawing) {
					commitActiveStamp(false);
					const snapY = rulersSnap
						? getClosestRulerY(pt.y, rulersListRef.current, 16 * uRef.current)
						: null;
					const finalY = snapY !== null ? snapY : pt.y;

					const clonedPaths = active.paths
						? active.paths.map((p) => ({
								points: p.points.map((pth) => ({ ...pth })),
							}))
						: undefined;

					let finalX = pt.x;
					if (rulersSnapItems) {
						const tempDrawStamp: StampItem = {
							...active,
							id: 'temp_draw_snap',
							x: pt.x,
							y: finalY,
						};
						const { snappedX, guide } = getStampItemHorizontalSnap(
							pt.x,
							finalY,
							tempDrawStamp,
							stampsListRef.current,
							rulersListRef.current,
							uRef.current,
							ctx,
						);
						finalX = snappedX;
						activeSnapGuideRef.current = guide;
					} else {
						activeSnapGuideRef.current = null;
					}

					const cloned: StampItem = {
						...active,
						id: `draw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
						x: finalX,
						y: finalY,
						paths: clonedPaths,
						rawBounds: active.rawBounds ? { ...active.rawBounds } : undefined,
					};

					const clamped = clampStampPosition(cloned.x, cloned.y, cloned, uRef.current, ctx);
					cloned.x = clamped.x;
					cloned.y = clamped.y;

					layersRef.current.push({
						type: 'stamp',
						id: cloned.id,
						stamp: cloned,
					});
					stampsListRef.current.push(cloned);

					activeStampRef.current = cloned;
					activeOrigRef.current = JSON.stringify(cloned);
					isDraggingStampRef.current = true;
					dragOffsetRef.current = { x: 0, y: 0 };

					saveHistory();
					render();
					onSelectStamp(cloned);
					onNotify('Елемент продубльовано');
					return;
				}

				//! Якщо таймер дебаунсу активний, скасовуємо його без фіналізації, щоб об'єднати штрихи
				if (drawDebounceTimerRef.current) {
					clearTimeout(drawDebounceTimerRef.current);
					drawDebounceTimerRef.current = null;
				} else {
					commitActiveStamp(false);
				}
				isDrawingStampRef.current = true;
				currentDrawingPathRef.current = [pt];
				scheduleRender();
				return;
			}

			//! 4.1. Якщо обрано категорію фігур
			if (stampCategory === 'shapes') {
				if (active && active.category === 'shapes' && active.shapeType) {
					lastShapePresetRef.current = {
						shapeType: active.shapeType,
						width: active.width || (active.shapeType === 'rect' ? 80 : 60),
						height: active.height || (active.shapeType === 'rect' ? 50 : 60),
						rotation: active.rotation || 0,
						dx:
							active.shapeType === 'arrow' && active.endX !== undefined
								? active.endX - active.x
								: undefined,
						dy:
							active.shapeType === 'arrow' && active.endY !== undefined
								? active.endY - active.y
								: undefined,
						strokeWidth: active.strokeWidth || active.size || currentSize,
						mainColor: active.mainColor,
						strokeColor: active.strokeColor,
					};
				}
				commitActiveStamp(false);
				isCreatingShapeRef.current = true;

				const canvas = canvasRef.current;
				const canvasW = canvas?.width ?? 10000;
				const canvasH = canvas?.height ?? 10000;
				const U = uRef.current;
				const shape = selectedShape || 'rect';
				const preset =
					lastShapePresetRef.current?.shapeType === shape
						? lastShapePresetRef.current
						: null;
				const initialLw = Math.max(1 * U, (preset?.strokeWidth ?? currentSize) * U);
				const halfLw = initialLw / 2;

				const snapY = rulersSnap
					? getClosestRulerY(pt.y, rulersListRef.current, 16 * U)
					: null;
				const rawStartY = snapY !== null ? snapY : pt.y;
				const clampedStartX = Math.max(halfLw, Math.min(canvasW - halfLw, pt.x));
				const clampedStartY = Math.max(halfLw, Math.min(canvasH - halfLw, rawStartY));
				shapeStartPtRef.current = { x: clampedStartX, y: clampedStartY };

				const newShapeStamp: StampItem = {
					id: `shape_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
					x: clampedStartX,
					y: clampedStartY,
					size: preset?.strokeWidth ?? currentSize,
					category: 'shapes',
					shapeType: shape,
					text: shape,
					mainColor: preset?.mainColor ?? mainColor,
					strokeColor: preset?.strokeColor ?? strokeColor,
					strokeWidth: preset?.strokeWidth ?? currentSize,
					rotation: 0,
					width: shape === 'arrow' ? undefined : 0,
					height: shape === 'arrow' ? undefined : 0,
					endX: shape === 'arrow' ? clampedStartX : undefined,
					endY: shape === 'arrow' ? clampedStartY : undefined,
				};

				layersRef.current.push({
					type: 'stamp',
					id: newShapeStamp.id,
					stamp: newShapeStamp,
				});
				stampsListRef.current.push(newShapeStamp);
				activeStampRef.current = newShapeStamp;
				activeOrigRef.current = JSON.stringify(newShapeStamp);
				scheduleRender();
				return;
			}

			// 5. Create new stamp at clicked position
			commitActiveStamp(false);
			const stampText = activeStampText ?? '';
			if (!stampText.trim()) {
				return;
			}
			const snapY = rulersSnap
				? getClosestRulerY(pt.y, rulersListRef.current, 16 * uRef.current)
				: null;
			const finalY = snapY !== null ? snapY : pt.y;

			let finalX = pt.x;
			if (rulersSnapItems) {
				const tempNewStamp: StampItem = {
					id: 'temp_new_snap',
					x: pt.x,
					y: finalY,
					size: currentSize,
					category: stampCategory || 'custom',
					text: stampText,
					mainColor,
					strokeColor,
					badgeMode: stampBadgeMode,
				};
				const { snappedX, guide } = getStampItemHorizontalSnap(
					pt.x,
					finalY,
					tempNewStamp,
					stampsListRef.current,
					rulersListRef.current,
					uRef.current,
					ctx,
				);
				finalX = snappedX;
				activeSnapGuideRef.current = guide;
			} else {
				activeSnapGuideRef.current = null;
			}

			const isAuto = Boolean(isAutoCountMode && stampCategory === 'count');

			const newStamp: StampItem = {
				id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
				x: finalX,
				y: finalY,
				size: currentSize,
				category: stampCategory || 'custom',
				text: stampText,
				mainColor,
				strokeColor,
				badgeMode: stampBadgeMode,
				isAutoCount: isAuto,
				autoCountIndex: isAuto ? currentAutoCountIndex : undefined,
				autoCountSeqId: isAuto ? currentAutoCountSeqId : undefined,
			};
			//! Гарантуємо, що новостворений штамп не виходить за межі полотна
			const clamped = clampStampPosition(newStamp.x, newStamp.y, newStamp, uRef.current, ctx);
			newStamp.x = clamped.x;
			newStamp.y = clamped.y;
			activeStampRef.current = newStamp;
			activeOrigRef.current = JSON.stringify(newStamp);
			layersRef.current.push({
				type: 'stamp',
				id: newStamp.id,
				stamp: newStamp,
			});
			stampsListRef.current.push(newStamp);
			isDraggingStampRef.current = true;
			dragMovedRef.current = false;
			dragOffsetRef.current = { x: 0, y: 0 };
			if (isAuto) {
				onAdvanceAutoCount?.();
			}
			saveHistory();
			render();
		},
		[
			activeStampText,
			commitActiveStamp,
			currentSize,
			currentAutoCountIndex,
			currentAutoCountSeqId,
			deleteActiveStamp,
			deleteBtnOn,
			drawDuplicateMode,
			duplicateActiveStamp,
			isAutoCountMode,
			mainColor,
			onAdvanceAutoCount,
			onNotify,
			onSelectStamp,
			render,
			resizeHandlesOn,
			rulersSnap,
			rulersSnapItems,
			saveHistory,
			scheduleRender,
			selectedAccidental,
			selectedNote,
			selectedShape,
			stampBadgeMode,
			stampCategory,
			strokeColor,
		],
	);

	const drawPencilStroke = useCallback(
		(fx: number, fy: number, tx: number, ty: number) => {
			strokeRevisionRef.current++;
			const targetCanvas = activeStrokeCanvasRef.current || baseCanvasRef.current;
			if (!targetCanvas) return;
			const bctx = targetCanvas.getContext('2d');
			if (!bctx) return;

			bctx.save();
			bctx.lineCap = 'round';
			bctx.lineJoin = 'round';

			const isDot = fx === tx && fy === ty;
			const isEraser = currentMode === 'eraser';
			const w = (isEraser ? currentSize * 1.5 : currentSize) * uRef.current;

			if (isEraser) {
				layersRef.current.forEach((layer) => {
					if (layer.type === 'stroke') {
						const lctx = layer.canvas.getContext('2d');
						if (lctx) {
							lctx.save();
							lctx.lineCap = 'round';
							lctx.lineJoin = 'round';
							lctx.globalCompositeOperation = 'destination-out';
							lctx.beginPath();
							if (isDot) {
								lctx.arc(tx, ty, w / 2, 0, Math.PI * 2);
								lctx.fill();
							} else {
								lctx.lineWidth = w;
								lctx.moveTo(fx, fy);
								lctx.lineTo(tx, ty);
								lctx.stroke();
							}
							lctx.restore();
						}
					}
				});

				const canvas = canvasRef.current;
				const ctx = canvas?.getContext('2d');
				if (ctx) {
					for (let i = stampsListRef.current.length - 1; i >= 0; i--) {
						const st = stampsListRef.current[i];
						if (isPointInStamp({ x: tx, y: ty }, st, uRef.current, ctx)) {
							stampsListRef.current.splice(i, 1);
							layersRef.current = layersRef.current.filter((l) => !(l.type === 'stamp' && l.id === st.id));
						}
					}
				}
				scheduleRender();
				return;
			}

			bctx.beginPath();
			if (isDot) {
				bctx.fillStyle = mainColor;
				bctx.arc(tx, ty, w / 2, 0, Math.PI * 2);
				bctx.fill();
			} else {
				bctx.strokeStyle = mainColor;
				bctx.lineWidth = w;
				bctx.moveTo(fx, fy);
				bctx.lineTo(tx, ty);
				bctx.stroke();
			}
			bctx.restore();
			scheduleRender();
		},
		[currentMode, currentSize, mainColor, scheduleRender],
	);

	const quadSegment = useCallback(
		(a: Point, ctrl: Point, b: Point) => {
			strokeRevisionRef.current++;
			const targetCanvas = activeStrokeCanvasRef.current || baseCanvasRef.current;
			if (!targetCanvas) return;
			const bctx = targetCanvas.getContext('2d');
			if (!bctx) return;

			bctx.save();
			bctx.lineCap = 'round';
			bctx.lineJoin = 'round';
			bctx.strokeStyle = mainColor;
			bctx.lineWidth = currentSize * uRef.current;
			bctx.beginPath();
			bctx.moveTo(a.x, a.y);
			bctx.quadraticCurveTo(ctrl.x, ctrl.y, b.x, b.y);
			bctx.stroke();
			bctx.restore();
			scheduleRender();
		},
		[currentSize, mainColor, scheduleRender],
	);

	const strokeSmooth = useCallback(
		(c: Point) => {
			const prev = smoothPosRef.current;
			if (!prev || !lastMidRef.current) return;

			const newSmooth = {
				x: prev.x + (c.x - prev.x) * SMOOTH,
				y: prev.y + (c.y - prev.y) * SMOOTH,
			};
			smoothPosRef.current = newSmooth;

			const mid = {
				x: (prev.x + newSmooth.x) / 2,
				y: (prev.y + newSmooth.y) / 2,
			};
			quadSegment(lastMidRef.current, prev, mid);
			lastMidRef.current = mid;
		},
		[quadSegment],
	);

	const moveActive = useCallback(
		(pt: Point) => {
			const active = activeStampRef.current;
			if (!active) return;

			//! 0. Обертання фігури навколо центру
			if (isDraggingRotateRef.current) {
				dragMovedRef.current = true;
				const currentAngle = Math.atan2(pt.y - active.y, pt.x - active.x);
				const delta = currentAngle - rotateStartAngleRef.current;
				let angle = rotateInitialAngleRef.current + delta;
				// Магнітне прилипання до 0°, 90°, 180°, 270°
				const snapAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2, -Math.PI, Math.PI * 2];
				for (const sa of snapAngles) {
					if (Math.abs(angle - sa) < (5 * Math.PI) / 180) {
						angle = sa;
						break;
					}
				}
				active.rotation = angle;
				const canvas = canvasRef.current;
				const ctx = canvas?.getContext('2d');
				if (ctx) {
					const clamped = clampStampPosition(active.x, active.y, active, uRef.current, ctx);
					active.x = clamped.x;
					active.y = clamped.y;
				}
				const layer = layersRef.current.find((l) => l.type === 'stamp' && l.id === active.id);
				if (layer && layer.type === 'stamp') {
					layer.stamp = active;
				}
				render();
				return;
			}

			//! 0.1. Зміна розміру фігури за кутові хендли (без зміни товщини ліній!)
			if (isDraggingCornerRef.current) {
				dragMovedRef.current = true;
				const rot = active.rotation || 0;
				const cos = Math.cos(-rot);
				const sin = Math.sin(-rot);
				const dx = pt.x - active.x;
				const dy = pt.y - active.y;
				const lx = dx * cos - dy * sin;
				const ly = dx * sin + dy * cos;

				const U = uRef.current;
				const canvas = canvasRef.current;
				const canvasW = canvas?.width ?? 10000;
				const canvasH = canvas?.height ?? 10000;
				const lw = Math.max(1 * U, (active.strokeWidth || active.size || 2) * U);
				const halfLw = lw / 2;

				let propW = Math.max(10 * U, Math.abs(lx) * 2);
				let propH = Math.max(10 * U, Math.abs(ly) * 2);

				const maxProjW = Math.max(1, Math.min(active.x, canvasW - active.x) - halfLw);
				const maxProjH = Math.max(1, Math.min(active.y, canvasH - active.y) - halfLw);

				let curProjW: number;
				let curProjH: number;

				if (active.shapeType === 'circle') {
					const rx = propW / 2;
					const ry = propH / 2;
					const rCos = Math.cos(rot);
					const rSin = Math.sin(rot);
					curProjW = Math.sqrt((rx * rCos) ** 2 + (ry * rSin) ** 2);
					curProjH = Math.sqrt((rx * rSin) ** 2 + (ry * rCos) ** 2);
				} else {
					const absCos = Math.abs(Math.cos(rot));
					const absSin = Math.abs(Math.sin(rot));
					curProjW = (propW / 2) * absCos + (propH / 2) * absSin;
					curProjH = (propW / 2) * absSin + (propH / 2) * absCos;
				}

				const scaleFactor = Math.min(
					1,
					maxProjW / Math.max(1, curProjW),
					maxProjH / Math.max(1, curProjH),
				);
				propW *= scaleFactor;
				propH *= scaleFactor;

				active.width = Math.max(6, Math.round(propW / U));
				active.height = Math.max(6, Math.round(propH / U));

				const layer = layersRef.current.find((l) => l.type === 'stamp' && l.id === active.id);
				if (layer && layer.type === 'stamp') {
					layer.stamp = active;
				}
				render();
				return;
			}

			if (isDraggingResizeRef.current) {
				//! Для стрілки переміщуємо хвіст (left) або вістря (right) напряму (без зміни товщини лінії!)
				if (active.shapeType === 'arrow') {
					dragMovedRef.current = true;
					const canvas = canvasRef.current;
					const canvasW = canvas?.width ?? 10000;
					const canvasH = canvas?.height ?? 10000;
					const U = uRef.current;
					const lw = Math.max(1 * U, (active.strokeWidth || active.size || 2) * U);
					const halfLw = lw / 2;

					if (isDraggingResizeRef.current === 'left') {
						const head = { x: active.endX ?? active.x, y: active.endY ?? active.y };
						const clampedTailX = Math.max(halfLw, Math.min(canvasW - halfLw, pt.x));
						const clampedTailY = Math.max(halfLw, Math.min(canvasH - halfLw, pt.y));
						active.x = clampedTailX;
						active.y = clampedTailY;
						const clampedHead = clampArrowHead(
							{ x: clampedTailX, y: clampedTailY },
							head,
							lw,
							canvasW,
							canvasH,
						);
						active.endX = clampedHead.x;
						active.endY = clampedHead.y;
					} else {
						const clampedHead = clampArrowHead(
							{ x: active.x, y: active.y },
							pt,
							lw,
							canvasW,
							canvasH,
						);
						active.endX = clampedHead.x;
						active.endY = clampedHead.y;
					}
					const layer = layersRef.current.find((l) => l.type === 'stamp' && l.id === active.id);
					if (layer && layer.type === 'stamp') {
						layer.stamp = active;
					}
					render();
					return;
				}

				const currentDist = Math.abs(pt.x - active.x);
				const startDist = resizeStartDistRef.current;
				const ratio = currentDist / startDist;
				const newCalculatedSize = Math.max(
					1,
					Math.min(100, Math.round(resizeStartSizeRef.current * ratio)),
				);

				const canvas = canvasRef.current;
				const ctx = canvas?.getContext('2d');
				let finalSize = newCalculatedSize;

				if (ctx && canvas) {
					const canvasW = canvas.width;
					const canvasH = canvas.height;

					//! Перевіряємо чи рамка штампа/малюнка вміщується у межі канвасу
					const doesFit = (s: number) => {
						const testStamp: StampItem = { ...active, size: s };
						const box = calculateStampBox(testStamp, uRef.current, ctx);
						return box.x >= 0 && box.x + box.w <= canvasW && box.y >= 0 && box.y + box.h <= canvasH;
					};

					if (finalSize > active.size && !doesFit(finalSize)) {
						let low = active.size;
						let high = finalSize;
						let best = active.size;
						while (low <= high) {
							const mid = Math.floor((low + high) / 2);
							if (doesFit(mid)) {
								best = mid;
								low = mid + 1;
							} else {
								high = mid - 1;
							}
						}
						finalSize = best;
					}
				}

				if (finalSize !== active.size) {
					dragMovedRef.current = true;
					//! Переносимо змінений штамп на найвищий рівень серед усіх шарів
					const idx = layersRef.current.findIndex((l) => l.type === 'stamp' && l.id === active.id);
					if (idx !== -1 && idx !== layersRef.current.length - 1) {
						const [layer] = layersRef.current.splice(idx, 1);
						layersRef.current.push(layer);
					}
					const sIdx = stampsListRef.current.findIndex((s) => s.id === active.id);
					if (sIdx !== -1 && sIdx !== stampsListRef.current.length - 1) {
						const [st] = stampsListRef.current.splice(sIdx, 1);
						stampsListRef.current.push(st);
					}

					active.size = newCalculatedSize;
					if (active.shapeType === 'rect') {
						active.width = Math.max(4, Math.round(resizeStartWidthRef.current * ratio));
						active.height = Math.max(4, Math.round(resizeStartHeightRef.current * ratio));
					} else if (active.shapeType === 'circle') {
						const s = Math.max(4, Math.round(resizeStartWidthRef.current * ratio));
						active.width = s;
						active.height = s;
					}
					const canvas = canvasRef.current;
					const ctx = canvas?.getContext('2d');
					if (ctx) {
						const clamped = clampStampPosition(active.x, active.y, active, uRef.current, ctx);
						active.x = clamped.x;
						active.y = clamped.y;
					}
					const layer = layersRef.current.find(l => l.type === 'stamp' && l.id === active.id);
					if (layer && layer.type === 'stamp') {
						layer.stamp = active;
					}
					onChangeSize?.(newCalculatedSize);
					render();
				}
				return;
			}

			if ((isDraggingHandleRef.current || isDraggingStampRef.current) && !dragMovedRef.current) {
				const start = dragStartPtRef.current;
				if (
					start &&
					(Math.hypot(pt.x - start.x, pt.y - start.y) * scaleRef.current) / uRef.current <
						DRAG_SLOP
				) {
					return;
				}
				dragMovedRef.current = true;
				//! Переносимо переміщений штамп на найвищий рівень серед усіх шарів
				const idx = layersRef.current.findIndex((l) => l.type === 'stamp' && l.id === active.id);
				if (idx !== -1 && idx !== layersRef.current.length - 1) {
					const [layer] = layersRef.current.splice(idx, 1);
					layersRef.current.push(layer);
				}
				const sIdx = stampsListRef.current.findIndex((s) => s.id === active.id);
				if (sIdx !== -1 && sIdx !== stampsListRef.current.length - 1) {
					const [st] = stampsListRef.current.splice(sIdx, 1);
					stampsListRef.current.push(st);
				}

				const canvas = canvasRef.current;
				const ctx = canvas?.getContext('2d');
				if (isDraggingHandleRef.current && ctx) {
					const h = getHandleCoords(active, uRef.current, ctx);
					dragOffsetRef.current = { x: pt.x - h.x, y: pt.y - h.y };
				} else {
					dragOffsetRef.current = { x: pt.x - active.x, y: pt.y - active.y };
				}
			}

			if (isDraggingHandleRef.current) {
				const canvas = canvasRef.current;
				const ctx = canvas?.getContext('2d');
				if (ctx) {
					//! Зрушуємо штамп на дельту переміщення хендлера та зупиняємо на межі полотна
					const h = getHandleCoords(active, uRef.current, ctx);
					const dx = pt.x - dragOffsetRef.current.x - h.x;
					const dy = pt.y - dragOffsetRef.current.y - h.y;
					let targetX = active.x + dx;
					let targetY = active.y + dy;
					const snapY = rulersSnap
						? getClosestRulerY(targetY, rulersListRef.current, 16 * uRef.current)
						: null;
					if (snapY !== null) {
						targetY = snapY;
					}
					if (rulersSnapItems) {
						const { snappedX, guide } = getStampItemHorizontalSnap(
							targetX,
							targetY,
							active,
							stampsListRef.current,
							rulersListRef.current,
							uRef.current,
							ctx,
						);
						targetX = snappedX;
						activeSnapGuideRef.current = guide;
					} else {
						activeSnapGuideRef.current = null;
					}
					const clamped = clampStampPosition(targetX, targetY, active, uRef.current, ctx);
					const shiftX = clamped.x - active.x;
					const shiftY = clamped.y - active.y;
					active.x = clamped.x;
					active.y = clamped.y;
					if (active.shapeType === 'arrow' && active.endX !== undefined && active.endY !== undefined) {
						active.endX += shiftX;
						active.endY += shiftY;
					}
					const layer = layersRef.current.find(l => l.type === 'stamp' && l.id === active.id);
					if (layer && layer.type === 'stamp') {
						layer.stamp = active;
					}
					render();
				}
			} else if (isDraggingStampRef.current) {
				const canvas = canvasRef.current;
				const ctx = canvas?.getContext('2d');
				if (ctx) {
					let targetX = pt.x - dragOffsetRef.current.x;
					let targetY = pt.y - dragOffsetRef.current.y;
					const snapY = rulersSnap
						? getClosestRulerY(targetY, rulersListRef.current, 16 * uRef.current)
						: null;
					if (snapY !== null) {
						targetY = snapY;
					}
					if (rulersSnapItems) {
						const { snappedX, guide } = getStampItemHorizontalSnap(
							targetX,
							targetY,
							active,
							stampsListRef.current,
							rulersListRef.current,
							uRef.current,
							ctx,
						);
						targetX = snappedX;
						activeSnapGuideRef.current = guide;
					} else {
						activeSnapGuideRef.current = null;
					}
					const clamped = clampStampPosition(targetX, targetY, active, uRef.current, ctx);
					const shiftX = clamped.x - active.x;
					const shiftY = clamped.y - active.y;
					active.x = clamped.x;
					active.y = clamped.y;
					if (active.shapeType === 'arrow' && active.endX !== undefined && active.endY !== undefined) {
						active.endX += shiftX;
						active.endY += shiftY;
					}
					const layer = layersRef.current.find(l => l.type === 'stamp' && l.id === active.id);
					if (layer && layer.type === 'stamp') {
						layer.stamp = active;
					}
					render();
				}
			}
		},
		[onChangeSize, render, rulersSnap, rulersSnapItems],
	);

	const pointerDown = useCallback(
		(pt: Point) => {
			if (currentMode === 'ruler') {
				//! Якщо відображення лінійок вимкнено — блокуємо створення та редагування
				if (!rulersVisible) {
					onNotify('Увімкніть відображення лінійок для їх редагування');
					return;
				}

				// 0. Trash button click on active ruler
				if (activeRulerIdRef.current) {
					const activeRuler = rulersListRef.current.find(
						(r) => r.id === activeRulerIdRef.current,
					);
					if (activeRuler && isPointInRulerDelete(pt, activeRuler, uRef.current)) {
						rulersListRef.current = rulersListRef.current.filter(
							(r) => r.id !== activeRuler.id,
						);
						activeRulerIdRef.current = null;
						isDraggingRulerRef.current = false;
						saveHistory();
						scheduleRender();
						onRulersCountChange?.(rulersListRef.current.length);
						onNotify('Лінійку видалено');
						return;
					}
				}

				// 1. Click near existing ruler to activate and drag it
				const nearRuler = findRulerNearPoint(pt, rulersListRef.current, uRef.current);
				if (nearRuler) {
					activeRulerIdRef.current = nearRuler.id;
					isDraggingRulerRef.current = true;
					dragMovedRef.current = false;
					dragOffsetRef.current = { x: 0, y: pt.y - nearRuler.y };
					if (rulersAttachContent) {
						if (rulersLockEqualDistance) {
							draggedStampIdsRef.current = stampsListRef.current
								.filter((s) => rulersListRef.current.some((r) => isStampAttachedToRuler(s, r, rulersListRef.current, uRef.current)))
								.map((s) => s.id);
						} else {
							draggedStampIdsRef.current = stampsListRef.current
								.filter((s) => isStampAttachedToRuler(s, nearRuler, rulersListRef.current, uRef.current))
								.map((s) => s.id);
						}
					} else {
						draggedStampIdsRef.current = [];
					}
					scheduleRender();
					return;
				}

				// 2. Click empty canvas -> create new ruler
				const newRuler: RulerItem = {
					id: `ruler_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
					y: pt.y,
				};
				rulersListRef.current.push(newRuler);
				activeRulerIdRef.current = newRuler.id;
				isDraggingRulerRef.current = true;
				dragMovedRef.current = false;
				dragOffsetRef.current = { x: 0, y: 0 };
				draggedStampIdsRef.current = [];

				if (rulersLockEqualDistance && rulersListRef.current.length >= 3) {
					//! При активній фіксації відстані автоматично перераховуємо відстані для всіх ліній
					const sorted = [...rulersListRef.current].sort((a, b) => a.y - b.y);
					const top = sorted[0].y;
					const bottom = sorted[sorted.length - 1].y;
					const totalDist = bottom - top;
					if (totalDist > 0) {
						const step = totalDist / (sorted.length - 1);
						sorted.forEach((r, idx) => {
							r.y = Math.round(top + idx * step);
						});
					}
				}

				onRulersCountChange?.(rulersListRef.current.length);
				saveHistory();
				scheduleRender();
				onNotify('Лінійку створено');
				return;
			}

			if (currentMode === 'stamp') {
				placeStamp(pt);
				return;
			}

			commitActiveStamp();
			isDrawingRef.current = true;
			lastCoordsRef.current = pt;

			//! Забезпечуємо шар для штрихів поверх попередніх штампів
			const lastLayer = layersRef.current[layersRef.current.length - 1];
			let currentStrokeCanvas: HTMLCanvasElement;
			if (lastLayer && lastLayer.type === 'stroke') {
				currentStrokeCanvas = lastLayer.canvas;
			} else {
				const canvas = canvasRef.current;
				const newCanvas = document.createElement('canvas');
				if (canvas) {
					newCanvas.width = canvas.width;
					newCanvas.height = canvas.height;
				}
				currentStrokeCanvas = newCanvas;
				layersRef.current.push({
					type: 'stroke',
					id: `stroke_${Date.now()}`,
					canvas: newCanvas,
				});
			}
			activeStrokeCanvasRef.current = currentStrokeCanvas;

			const snapY = rulersSnap
				? getClosestRulerY(pt.y, rulersListRef.current, 14 * uRef.current)
				: null;
			const finalPt = snapY !== null ? { x: pt.x, y: snapY } : pt;

			if (currentMode === 'eraser') {
				cursorPosRef.current = finalPt;
			}
			if (currentMode === 'pencil') {
				smoothPosRef.current = { ...finalPt };
				lastMidRef.current = { ...finalPt };
			}
			drawPencilStroke(finalPt.x, finalPt.y, finalPt.x, finalPt.y);
		},
		[
			commitActiveStamp,
			currentMode,
			drawPencilStroke,
			onNotify,
			placeStamp,
			rulersAttachContent,
			rulersLockEqualDistance,
			rulersSnap,
			rulersVisible,
			saveHistory,
			scheduleRender,
		],
	);

	const pointerMove = useCallback(
		(pt: Point) => {
			if (currentMode === 'ruler') {
				if (isDraggingRulerRef.current && activeRulerIdRef.current) {
					const canvas = canvasRef.current;
					if (!canvas) return;
					const ruler = rulersListRef.current.find((r) => r.id === activeRulerIdRef.current);
					if (ruler) {
						const prevY = ruler.y;
						const newY = Math.max(0, Math.min(canvas.height, pt.y - dragOffsetRef.current.y));
						const dy = newY - prevY;
						if (dy !== 0) {
							dragMovedRef.current = true;

							if (rulersLockEqualDistance && rulersListRef.current.length >= 3) {
								const sorted = [...rulersListRef.current].sort((a, b) => a.y - b.y);
								const isTop = ruler.id === sorted[0].id;
								const isBottom = ruler.id === sorted[sorted.length - 1].id;

								if (isTop || isBottom) {
									//! Переміщення крайньої лінійки: проміжні лінії автопідлаштовуються для однакової відстані
									ruler.y = newY;
									const currentSorted = [...rulersListRef.current].sort((a, b) => a.y - b.y);
									const topY = currentSorted[0].y;
									const bottomY = currentSorted[currentSorted.length - 1].y;
									const totalDist = bottomY - topY;
									const step = totalDist / (currentSorted.length - 1);

									currentSorted.forEach((r, idx) => {
										if (idx === 0 || idx === currentSorted.length - 1) return;
										const targetY = Math.round(topY + idx * step);
										const deltaY = targetY - r.y;
										if (rulersAttachContent && deltaY !== 0) {
											stampsListRef.current.forEach((st) => {
												if (isStampAttachedToRuler(st, r, currentSorted, uRef.current)) {
													st.y += deltaY;
												}
											});
											if (
												activeStampRef.current &&
												isStampAttachedToRuler(activeStampRef.current, r, currentSorted, uRef.current)
											) {
												activeStampRef.current.y += deltaY;
											}
										}
										r.y = targetY;
									});
								} else {
									//! Переміщення внутрішньої лінійки: всі лінійки переміщуються разом із зафіксованою відстанню
									rulersListRef.current.forEach((r) => {
										if (r.id === ruler.id) {
											r.y = newY;
										} else {
											r.y = Math.max(0, Math.min(canvas.height, r.y + dy));
										}
									});
									if (rulersAttachContent && draggedStampIdsRef.current.length > 0) {
										const ctx = canvas.getContext('2d');
										for (const st of stampsListRef.current) {
											if (draggedStampIdsRef.current.includes(st.id)) {
												st.y += dy;
												if (ctx) {
													const clamped = clampStampPosition(st.x, st.y, st, uRef.current, ctx);
													st.x = clamped.x;
													st.y = clamped.y;
												}
											}
										}
										if (
											activeStampRef.current &&
											draggedStampIdsRef.current.includes(activeStampRef.current.id)
										) {
											activeStampRef.current.y += dy;
											if (ctx) {
												const clamped = clampStampPosition(
													activeStampRef.current.x,
													activeStampRef.current.y,
													activeStampRef.current,
													uRef.current,
													ctx,
												);
												activeStampRef.current.x = clamped.x;
												activeStampRef.current.y = clamped.y;
											}
										}
									}
								}
							} else {
								//! Звичайний вільний режим переміщення окремої лінійки
								ruler.y = newY;
								if (rulersAttachContent && draggedStampIdsRef.current.length > 0) {
									const ctx = canvas.getContext('2d');
									for (const st of stampsListRef.current) {
										if (draggedStampIdsRef.current.includes(st.id)) {
											st.y += dy;
											if (ctx) {
												const clamped = clampStampPosition(st.x, st.y, st, uRef.current, ctx);
												st.x = clamped.x;
												st.y = clamped.y;
											}
										}
									}
									if (
										activeStampRef.current &&
										draggedStampIdsRef.current.includes(activeStampRef.current.id)
									) {
										activeStampRef.current.y += dy;
										if (ctx) {
											const clamped = clampStampPosition(
												activeStampRef.current.x,
												activeStampRef.current.y,
												activeStampRef.current,
												uRef.current,
												ctx,
											);
											activeStampRef.current.x = clamped.x;
											activeStampRef.current.y = clamped.y;
										}
									}
								}
							}
							scheduleRender();
						}
					}
				}
				return;
			}

			if (isDrawingRef.current) {
				const snapY = rulersSnap
					? getClosestRulerY(pt.y, rulersListRef.current, 14 * uRef.current)
					: null;
				const finalPt = snapY !== null ? { x: pt.x, y: snapY } : pt;

				if (currentMode === 'eraser') {
					cursorPosRef.current = finalPt;
				}
				if (currentMode === 'pencil' && smoothPosRef.current) {
					strokeSmooth(finalPt);
				} else if (lastCoordsRef.current) {
					drawPencilStroke(
						lastCoordsRef.current.x,
						lastCoordsRef.current.y,
						finalPt.x,
						finalPt.y,
					);
				}
				lastCoordsRef.current = finalPt;
			} else if (currentMode === 'stamp') {
				if (isCreatingShapeRef.current && activeStampRef.current && shapeStartPtRef.current) {
					const active = activeStampRef.current;
					const p1 = shapeStartPtRef.current;
					const shape = active.shapeType || 'rect';
					dragMovedRef.current = true;

					const canvas = canvasRef.current;
					const canvasW = canvas?.width ?? 10000;
					const canvasH = canvas?.height ?? 10000;
					const U = uRef.current;
					const lw = Math.max(1 * U, (active.strokeWidth || active.size || currentSize) * U);
					const halfLw = lw / 2;

					if (shape === 'arrow') {
						const clampedHead = clampArrowHead(p1, pt, lw, canvasW, canvasH);
						active.endX = clampedHead.x;
						active.endY = clampedHead.y;
					} else if (shape === 'rect' || shape === 'circle') {
						const clampedPtX = Math.max(halfLw, Math.min(canvasW - halfLw, pt.x));
						const clampedPtY = Math.max(halfLw, Math.min(canvasH - halfLw, pt.y));
						active.x = (p1.x + clampedPtX) / 2;
						active.y = (p1.y + clampedPtY) / 2;
						active.width = Math.max(4, Math.abs(clampedPtX - p1.x) / U);
						active.height = Math.max(4, Math.abs(clampedPtY - p1.y) / U);
					}
					scheduleRender();
				} else if (isDrawingStampRef.current) {
					currentDrawingPathRef.current.push(pt);
					scheduleRender();
				} else {
					moveActive(pt);
				}
			}
		},
		[
			currentMode,
			drawPencilStroke,
			moveActive,
			rulersAttachContent,
			rulersLockEqualDistance,
			rulersSnap,
			scheduleRender,
			strokeSmooth,
		],
	);

	const pointerUp = useCallback(() => {
		if (isDraggingRulerRef.current) {
			isDraggingRulerRef.current = false;
			draggedStampIdsRef.current = [];
			if (dragMovedRef.current) {
				saveHistory();
			}
			return;
		}

		if (isCreatingShapeRef.current) {
			isCreatingShapeRef.current = false;
			const active = activeStampRef.current;
			if (active && shapeStartPtRef.current) {
				const p1 = shapeStartPtRef.current;
				const U = uRef.current;
				const shape = active.shapeType || 'rect';

				const isArrow = shape === 'arrow';
				const arrowDist = isArrow
					? Math.hypot((active.endX ?? p1.x) - p1.x, (active.endY ?? p1.y) - p1.y)
					: 0;
				const shapeW = (active.width || 0) * U;
				const shapeH = (active.height || 0) * U;
				const isTiny = isArrow ? arrowDist < 8 * U : Math.max(shapeW, shapeH) < 8 * U;

				//! Якщо користувач просто клікнув без протягування — клонуємо попередню фігуру або застосовуємо розмір за замовчуванням
				if (isTiny) {
					const preset =
						lastShapePresetRef.current?.shapeType === shape
							? lastShapePresetRef.current
							: null;
					if (shape === 'arrow') {
						const dx = preset?.dx ?? 80 * U;
						const dy = preset?.dy ?? 0;
						active.x = p1.x;
						active.y = p1.y;
						active.endX = p1.x + dx;
						active.endY = p1.y + dy;
					} else if (shape === 'rect') {
						active.x = p1.x;
						active.y = p1.y;
						active.width = preset?.width ?? 80;
						active.height = preset?.height ?? 50;
						active.rotation = preset?.rotation ?? 0;
					} else if (shape === 'circle') {
						active.x = p1.x;
						active.y = p1.y;
						active.width = preset?.width ?? 60;
						active.height = preset?.height ?? 60;
						active.rotation = preset?.rotation ?? 0;
					}
					if (preset) {
						active.strokeWidth = preset.strokeWidth;
						active.size = preset.strokeWidth;
						active.mainColor = preset.mainColor;
						active.strokeColor = preset.strokeColor;
					} else {
						active.size = currentSize;
						active.strokeWidth = currentSize;
					}
				} else {
					active.size = currentSize;
					active.strokeWidth = currentSize;
				}

				// Оновлюємо пресет для наступного створення/клонування
				lastShapePresetRef.current = {
					shapeType: shape,
					width: active.width || (shape === 'rect' ? 80 : 60),
					height: active.height || (shape === 'rect' ? 50 : 60),
					rotation: active.rotation || 0,
					dx:
						shape === 'arrow' && active.endX !== undefined
							? active.endX - active.x
							: undefined,
					dy:
						shape === 'arrow' && active.endY !== undefined
							? active.endY - active.y
							: undefined,
					strokeWidth: active.strokeWidth || active.size || currentSize,
					mainColor: active.mainColor,
					strokeColor: active.strokeColor,
				};

				const canvas = canvasRef.current;
				const ctx = canvas?.getContext('2d');
				if (ctx) {
					const clamped = clampStampPosition(active.x, active.y, active, U, ctx);
					const shiftX = clamped.x - active.x;
					const shiftY = clamped.y - active.y;
					active.x = clamped.x;
					active.y = clamped.y;
					if (active.shapeType === 'arrow' && active.endX !== undefined && active.endY !== undefined) {
						active.endX += shiftX;
						active.endY += shiftY;
					}
				}

				activeOrigRef.current = JSON.stringify(active);
				saveHistory();
				render();
				onSelectStamp(active);
				onNotify('Фігуру створено');
			}
			shapeStartPtRef.current = null;
			return;
		}

		if (isDrawingStampRef.current) {
			isDrawingStampRef.current = false;
			if (currentDrawingPathRef.current.length > 0) {
				accumulatedDrawingPathsRef.current.push([...currentDrawingPathRef.current]);
				currentDrawingPathRef.current = [];
			}
			scheduleRender();
			if (drawDebounceTimerRef.current) {
				clearTimeout(drawDebounceTimerRef.current);
			}
			drawDebounceTimerRef.current = setTimeout(() => {
				finalizeDrawingStamp();
			}, 1000);
			return;
		}

		if (isDrawingRef.current) {
			if (
				currentMode === 'pencil' &&
				smoothPosRef.current &&
				lastCoordsRef.current &&
				lastMidRef.current
			) {
				quadSegment(lastMidRef.current, smoothPosRef.current, lastCoordsRef.current);
			}
			isDrawingRef.current = false;
			lastCoordsRef.current = null;
			smoothPosRef.current = null;
			lastMidRef.current = null;
			dragMovedRef.current = false;
			saveHistory();
		} else if (dragMovedRef.current) {
			dragMovedRef.current = false;
			saveHistory();
		}
		isDraggingStampRef.current = false;
		isDraggingHandleRef.current = false;
		isDraggingResizeRef.current = null;
		isDraggingRotateRef.current = false;
		isDraggingCornerRef.current = null;
		if (activeSnapGuideRef.current) {
			activeSnapGuideRef.current = null;
			render();
		}
	}, [
		currentMode,
		currentSize,
		finalizeDrawingStamp,
		onNotify,
		onSelectStamp,
		quadSegment,
		render,
		saveHistory,
		scheduleRender,
	]);

	const buildExportCanvas = useCallback((): HTMLCanvasElement | null => {
		const base = baseCanvasRef.current;
		const bg = bgCanvasRef.current;
		if (!base || !bg) return null;

		const exportCanvas = document.createElement('canvas');
		exportCanvas.width = base.width;
		exportCanvas.height = base.height;
		const expCtx = exportCanvas.getContext('2d');
		if (!expCtx) return null;

		expCtx.imageSmoothingEnabled = true;
		expCtx.imageSmoothingQuality = 'high';
		expCtx.fillStyle = '#ffffff';
		expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
		if (currentImageRef.current) {
			expCtx.drawImage(bg, 0, 0);
		}

		if (layersRef.current.length === 0) {
			expCtx.drawImage(base, 0, 0);
		} else {
			layersRef.current.forEach((layer) => {
				if (layer.type === 'stroke') {
					expCtx.drawImage(layer.canvas, 0, 0);
				} else {
					drawStamp(layer.stamp, false, expCtx, uRef.current, false);
				}
			});
		}

		if (
			activeStampRef.current &&
			!layersRef.current.some(
				(l) => l.type === 'stamp' && l.id === activeStampRef.current?.id,
			)
		) {
			drawStamp(activeStampRef.current, false, expCtx, uRef.current, false);
		}

		return exportCanvas;
	}, []);

	const prepareExport = useCallback(() => {
		if (!hasCanvas) return;
		const token = ++exportTokenRef.current;
		exportBlobRef.current = null;
		const exp = buildExportCanvas();
		if (!exp) return;
		exp.toBlob((b) => {
			if (token === exportTokenRef.current) {
				exportBlobRef.current = b;
			}
		}, 'image/png');
	}, [buildExportCanvas, hasCanvas]);

	const serializeProject = useCallback(
		async (title?: string): Promise<ProjectItem | null> => {
			const canvas = canvasRef.current;
			const base = baseCanvasRef.current;
			const bg = bgCanvasRef.current;
			if (!canvas || !base || !bg || !hasCanvas) return null;

			const currentStamps = [...stampsListRef.current];
			if (activeStampRef.current) {
				currentStamps.push({ ...activeStampRef.current });
			}

			let thumbnail = '';
			const expCanvas = buildExportCanvas();
			if (expCanvas) {
				const thumbCanvas = document.createElement('canvas');
				const maxDim = 180;
				const scale = Math.min(maxDim / expCanvas.width, maxDim / expCanvas.height, 1);
				thumbCanvas.width = Math.max(1, Math.round(expCanvas.width * scale));
				thumbCanvas.height = Math.max(1, Math.round(expCanvas.height * scale));
				const tctx = thumbCanvas.getContext('2d');
				if (tctx) {
					tctx.drawImage(expCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
					thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.85);
				}
			}

			const compBase = document.createElement('canvas');
			compBase.width = canvas.width;
			compBase.height = canvas.height;
			const bctx = compBase.getContext('2d');
			if (bctx) {
				layersRef.current.forEach((layer) => {
					if (layer.type === 'stroke') {
						bctx.drawImage(layer.canvas, 0, 0);
					}
				});
			}
			const baseDataUrl = compBase.toDataURL('image/png');
			const bgDataUrl = currentImageRef.current ? bg.toDataURL('image/png') : null;

			const serializedHistory: SerializedHistoryItem[] = historyStackRef.current.map((item) => ({
				stamps: JSON.parse(JSON.stringify(item.stamps || [])),
				rulers: JSON.parse(JSON.stringify(item.rulers || [])),
				layers: (item.layers || []).map((l) => ({
					type: l.type,
					id: l.id,
					stamp: l.stamp ? JSON.parse(JSON.stringify(l.stamp)) : undefined,
					strokeDataUrl: l.strokeDataUrl,
				})),
			}));

			const project: ProjectItem = {
				id:
					currentProjectIdRef.current ||
					`proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
				title:
					title ||
					currentProjectTitleRef.current ||
					`Малюнок ${new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`,
				updatedAt: Date.now(),
				thumbnail,
				hasImage: !!currentImageRef.current,
				bgDataUrl,
				baseDataUrl,
				stamps: currentStamps,
				rulers: JSON.parse(JSON.stringify(rulersListRef.current)),
				history: serializedHistory,
				historyStep: historyStepRef.current,
				width: canvas.width,
				height: canvas.height,
				cssW: parseFloat(canvas.style.width) || canvas.width,
				cssH: parseFloat(canvas.style.height) || canvas.height,
			};

			currentProjectIdRef.current = project.id;
			currentProjectTitleRef.current = project.title;
			return project;
		},
		[buildExportCanvas, hasCanvas],
	);

	const loadProject = useCallback(
		async (project: ProjectItem) => {
			const container = containerRef.current;
			if (!container) return;

			currentProjectIdRef.current = project.id;
			currentProjectTitleRef.current = project.title;

			//! Адаптуємо CSS розміри полотна до поточного контейнера, щоб не обрізалися краї на мобілці
			const maxW = Math.max(280, container.clientWidth - 20);
			const maxH = Math.max(280, container.clientHeight - 130);
			let targetCssW = project.cssW;
			let targetCssH = project.cssH;
			if (targetCssW > maxW || targetCssH > maxH) {
				const fitScale = Math.min(maxW / targetCssW, maxH / targetCssH);
				targetCssW = Math.max(200, Math.round(targetCssW * fitScale));
				targetCssH = Math.max(200, Math.round(targetCssH * fitScale));
			}

			initCanvas(project.width, project.height, targetCssW, targetCssH);
			const canvas = canvasRef.current;
			const base = baseCanvasRef.current;
			const bg = bgCanvasRef.current;
			if (!canvas || !base || !bg) return;

			const bctx = base.getContext('2d');
			const bgctx = bg.getContext('2d');
			if (!bctx || !bgctx) return;

			bctx.clearRect(0, 0, base.width, base.height);
			bgctx.clearRect(0, 0, bg.width, bg.height);

			if (project.hasImage && project.bgDataUrl) {
				await new Promise<void>((resolve) => {
					const img = new Image();
					img.onload = () => {
						currentImageRef.current = img;
						bgctx.drawImage(img, 0, 0);
						resolve();
					};
					img.onerror = () => resolve();
					img.src = project.bgDataUrl!;
				});
			} else {
				currentImageRef.current = null;
			}

			if (project.baseDataUrl) {
				await new Promise<void>((resolve) => {
					const img = new Image();
					img.onload = () => {
						bctx.drawImage(img, 0, 0);
						resolve();
					};
					img.onerror = () => resolve();
					img.src = project.baseDataUrl!;
				});
			}

			layersRef.current = [{ type: 'stroke', id: 'base', canvas: base }];
			(project.stamps || []).forEach((st) => {
				layersRef.current.push({
					type: 'stamp',
					id: st.id,
					stamp: JSON.parse(JSON.stringify(st)),
				});
			});
			stampsListRef.current = layersRef.current
				.filter((l): l is { type: 'stamp'; id: string; stamp: StampItem } => l.type === 'stamp')
				.map((l) => l.stamp);

			activeStrokeCanvasRef.current = base;
			rulersListRef.current = project.rulers ? JSON.parse(JSON.stringify(project.rulers)) : [];
			activeStampRef.current = null;
			activeRulerIdRef.current = null;
			activeOrigRef.current = '';

			resetTransform();
			onInitBlank();
			render();
			onRulersCountChange?.(rulersListRef.current.length);

			//! Якщо в проекті збережена історія undo/redo, відновлюємо її повністю
			if (project.history && project.history.length > 0) {
				historyStackRef.current = project.history.map((item) => ({
					stamps: item.stamps || [],
					rulers: item.rulers || [],
					layers: (item.layers || []).map((l) => ({
						type: l.type,
						id: l.id,
						stamp: l.stamp,
						strokeDataUrl: l.strokeDataUrl,
					})),
				}));
				const restoredStep =
					typeof project.historyStep === 'number' &&
					project.historyStep >= 0 &&
					project.historyStep < historyStackRef.current.length
						? project.historyStep
						: historyStackRef.current.length - 1;
				historyStepRef.current = restoredStep;
				restoreHistory(restoredStep);
			} else {
				historyStackRef.current = [];
				historyStepRef.current = -1;
				saveHistory();
			}
		},
		[initCanvas, onInitBlank, onRulersCountChange, render, resetTransform, restoreHistory, saveHistory],
	);

	const distributeRulers = useCallback(
		(notify: boolean = true) => {
			const rulers = rulersListRef.current;
			if (rulers.length < 3) {
				if (notify) {
					onNotify('Потрібно щонайменше 3 лінійки для вирівнювання');
				}
				return;
			}

			const sorted = [...rulers].sort((a, b) => a.y - b.y);
			const top = sorted[0];
			const bottom = sorted[sorted.length - 1];
			const totalDist = bottom.y - top.y;
			if (totalDist <= 0) return;

			const step = totalDist / (sorted.length - 1);
			const u = uRef.current;

			sorted.forEach((ruler, index) => {
				if (index === 0 || index === sorted.length - 1) return;
				const newY = Math.round(top.y + index * step);
				const deltaY = newY - ruler.y;

				if (rulersAttachContent && deltaY !== 0) {
					stampsListRef.current.forEach((st) => {
						if (isStampAttachedToRuler(st, ruler, sorted, u)) {
							st.y += deltaY;
						}
					});
					if (activeStampRef.current && isStampAttachedToRuler(activeStampRef.current, ruler, sorted, u)) {
						activeStampRef.current.y += deltaY;
					}
				}

				ruler.y = newY;
			});

			saveHistory();
			render();
			scheduleRender();
			onContentChange?.();
			onRulersCountChange?.(rulersListRef.current.length);
			if (notify) {
				onNotify('Лінійки вирівняно рівновіддалено');
			}
		},
		[onContentChange, onNotify, onRulersCountChange, render, rulersAttachContent, saveHistory, scheduleRender],
	);

	const clearRulers = useCallback(() => {
		if (rulersListRef.current.length === 0) return;
		rulersListRef.current = [];
		activeRulerIdRef.current = null;
		isDraggingRulerRef.current = false;
		draggedStampIdsRef.current = [];
		saveHistory();
		render();
		scheduleRender();
		onContentChange?.();
		onRulersCountChange?.(0);
		onNotify('Всі лінійки очищено');
	}, [onContentChange, onNotify, onRulersCountChange, render, saveHistory, scheduleRender]);

	useEffect(() => {
		if (rulersLockEqualDistance && rulersListRef.current.length >= 3) {
			distributeRulers(false);
		}
	}, [distributeRulers, rulersLockEqualDistance]);

	// Attach stageRef imperative handle
	useEffect(() => {
		stageRef.current = {
			createBlank,
			loadImage,
			clear: clearCanvas,
			clearRulers,
			undo: handleUndo,
			redo: handleRedo,
			distributeRulers: () => distributeRulers(true),
			getRulersCount: () => rulersListRef.current.length,
			commitActiveStamp,
			duplicateActiveStamp,
			syncCategorySizes,
			prepareExport,
			getExportBlob: async () => {
				if (exportBlobRef.current) return exportBlobRef.current;
				const exp = buildExportCanvas();
				if (!exp) return null;
				return new Promise<Blob | null>((res) => exp.toBlob(res, 'image/png'));
			},
			serializeProject,
			loadProject,
			updateActiveStampProps: (sz, txt, mClr, sClr, bMode) => {
				const active = activeStampRef.current;
				if (!active) return;
				active.size = sz;
				if (active.shapeType) {
					active.strokeWidth = sz;
				}
				active.text = txt;
				active.mainColor = mClr;
				active.strokeColor = sClr;
				if (bMode !== undefined) {
					active.badgeMode = bMode;
				}
				const l = layersRef.current.find((layer) => layer.type === 'stamp' && layer.id === active.id);
				if (l && l.type === 'stamp') {
					l.stamp = active;
				}
				render();
			},
		};
	}, [
		buildExportCanvas,
		clearCanvas,
		clearRulers,
		commitActiveStamp,
		createBlank,
		distributeRulers,
		duplicateActiveStamp,
		handleRedo,
		handleUndo,
		loadImage,
		loadProject,
		onContentChange,
		onNotify,
		prepareExport,
		render,
		rulersAttachContent,
		saveHistory,
		serializeProject,
		stageRef,
		syncCategorySizes,
	]);

	// Re-render when size/mode/colors change
	useEffect(() => {
		render();
	}, [render]);

	useEffect(() => {
		if (currentMode === 'ruler') {
			onRulersCountChange?.(rulersListRef.current.length);
		} else if (activeRulerIdRef.current) {
			activeRulerIdRef.current = null;
			scheduleRender();
		}
	}, [currentMode, onRulersCountChange, scheduleRender]);

	// Native gesture listeners on container
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const flushPending = () => {
			if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
			if (pendingStartRef.current) {
				const c = pendingStartRef.current;
				pendingStartRef.current = null;
				pointerDown(c);
			}
		};

		const cancelPending = () => {
			if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
			pendingStartRef.current = null;
		};

		const getTouchStats = (a: Touch, b: Touch) => {
			return {
				dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
				center: { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 },
			};
		};

		const onTouchStart = (e: TouchEvent) => {
			ignoreMouseDownRef.current = true;
			if (e.touches.length === 2) {
				cancelPending();
				if (isDrawingRef.current) pointerUp();
				isMultiTouchRef.current = true;
				isDrawingRef.current = false;
				isDraggingStampRef.current = false;
				isDraggingHandleRef.current = false;
				isDraggingResizeRef.current = null;
				isDraggingRotateRef.current = false;
				isDraggingCornerRef.current = null;
				isDraggingRulerRef.current = false;

				const a = e.touches[0];
				const b = e.touches[1];
				const s = getTouchStats(a, b);
				initialPinchDistRef.current = s.dist;
				startScaleRef.current = scaleRef.current;

				const canvas = canvasRef.current;
				if (canvas) {
					const cr = canvas.getBoundingClientRect();
					pinchFocalRef.current = {
						x: (s.center.x - cr.left) / scaleRef.current,
						y: (s.center.y - cr.top) / scaleRef.current,
						baseLeft: cr.left - panRef.current.x,
						baseTop: cr.top - panRef.current.y,
					};
				}
			} else if (e.touches.length === 1 && !isMultiTouchRef.current) {
				const target = e.target as HTMLElement | null;
				if (target?.closest('#placeholder button')) return;
				if (!hasCanvas) createBlank();
				const t = e.touches[0];
				cancelPending();
				pendingStartRef.current = getCanvasCoords(t.clientX, t.clientY);
				pendingClientRef.current = { x: t.clientX, y: t.clientY };
				pendingTimerRef.current = setTimeout(flushPending, 90);
			}
		};

		const onTouchMove = (e: TouchEvent) => {
			e.preventDefault();
			if (e.touches.length >= 2 && isMultiTouchRef.current) {
				const a = e.touches[0];
				const b = e.touches[1];
				const s = getTouchStats(a, b);

				if (initialPinchDistRef.current > 0 && pinchFocalRef.current) {
					const ns = Math.min(
						Math.max(
							MIN_SCALE,
							(startScaleRef.current * s.dist) / initialPinchDistRef.current,
						),
						MAX_SCALE,
					);
					const focal = pinchFocalRef.current;

					panRef.current = {
						x: s.center.x - focal.x * ns - focal.baseLeft,
						y: s.center.y - focal.y * ns - focal.baseTop,
					};
					scaleRef.current = ns;
					applyTransform();
					onScaleChange?.(ns);
				}
			} else if (e.touches.length === 1 && !isMultiTouchRef.current) {
				const t = e.touches[0];
				if (pendingStartRef.current && pendingClientRef.current) {
					if (
						Math.hypot(
							t.clientX - pendingClientRef.current.x,
							t.clientY - pendingClientRef.current.y,
						) < 6
					) {
						return;
					}
					flushPending();
				}
				pointerMove(getCanvasCoords(t.clientX, t.clientY));
			}
		};

		const onTouchEnd = (e: TouchEvent) => {
			if (e.touches.length < 2) {
				isMultiTouchRef.current = false;
				pinchFocalRef.current = null;
			}
			if (e.touches.length === 0) {
				flushPending();
				pointerUp();
				if (cursorPosRef.current) {
					cursorPosRef.current = null;
					render();
				}
				setTimeout(() => {
					ignoreMouseDownRef.current = false;
				}, 400);
			}
		};

		// Pointer events for robust middle-click drag across browsers
		const onPointerDown = (e: PointerEvent) => {
			if (e.button === 1 || e.buttons === 4) {
				e.preventDefault();
				e.stopPropagation();
				isPanningRef.current = true;
				panStartRef.current = {
					clientX: e.clientX,
					clientY: e.clientY,
					panX: panRef.current.x,
					panY: panRef.current.y,
				};
				container.style.cursor = 'grabbing';
				try {
					container.setPointerCapture(e.pointerId);
				} catch {
					// Ignore if capture not available
				}
			}
		};

		const onPointerMove = (e: PointerEvent) => {
			if (isPanningRef.current) {
				panRef.current = {
					x: panStartRef.current.panX + (e.clientX - panStartRef.current.clientX),
					y: panStartRef.current.panY + (e.clientY - panStartRef.current.clientY),
				};
				applyTransform();
			}
		};

		const onPointerUp = (e: PointerEvent) => {
			if (isPanningRef.current) {
				isPanningRef.current = false;
				container.style.cursor = '';
				try {
					container.releasePointerCapture(e.pointerId);
				} catch {
					// Ignore
				}
			}
		};

		const onMouseDown = (e: MouseEvent) => {
			if (e.button === 1 || (e.buttons & 4) !== 0) {
				e.preventDefault();
				e.stopPropagation();
				isPanningRef.current = true;
				panStartRef.current = {
					clientX: e.clientX,
					clientY: e.clientY,
					panX: panRef.current.x,
					panY: panRef.current.y,
				};
				container.style.cursor = 'grabbing';
				return;
			}
			if (ignoreMouseDownRef.current) return;
			if (e.button !== 0) return;
			const target = e.target as HTMLElement | null;
			if (target?.closest('#placeholder button')) return;
			if (!hasCanvas) createBlank();
			pointerDown(getCanvasCoords(e.clientX, e.clientY));
		};

		const onMouseMove = (e: MouseEvent) => {
			if (isPanningRef.current) {
				panRef.current = {
					x: panStartRef.current.panX + (e.clientX - panStartRef.current.clientX),
					y: panStartRef.current.panY + (e.clientY - panStartRef.current.clientY),
				};
				applyTransform();
				return;
			}
			if (ignoreMouseDownRef.current) return;
			const pt = getCanvasCoords(e.clientX, e.clientY);
			if (
				isDrawingRef.current ||
				isDrawingStampRef.current ||
				isDraggingStampRef.current ||
				isDraggingHandleRef.current ||
				isDraggingResizeRef.current ||
				isDraggingRotateRef.current ||
				isDraggingCornerRef.current ||
				isCreatingShapeRef.current ||
				isDraggingRulerRef.current
			) {
				pointerMove(pt);
			} else if (currentMode === 'eraser' && container.contains(e.target as Node)) {
				cursorPosRef.current = pt;
				render();
			}
		};

		const onMouseUp = (e: MouseEvent) => {
			if (isPanningRef.current && (e.button === 1 || (e.buttons & 4) === 0)) {
				isPanningRef.current = false;
				container.style.cursor = '';
				return;
			}
			if (!ignoreMouseDownRef.current && e.button === 0) {
				pointerUp();
			}
		};

		const onPointerUpGlobal = () => {
			if (isPanningRef.current) {
				isPanningRef.current = false;
				container.style.cursor = '';
			}
		};

		const onWindowBlur = () => {
			if (isPanningRef.current) {
				isPanningRef.current = false;
				container.style.cursor = '';
			}
		};

		const onMouseLeave = () => {
			if (cursorPosRef.current && !isDrawingRef.current) {
				cursorPosRef.current = null;
				render();
			}
		};

		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const canvas = canvasRef.current;
			if (!canvas || !hasCanvas) return;

			const ns = Math.min(
				Math.max(MIN_SCALE, scaleRef.current * Math.exp(-e.deltaY * 0.0015)),
				MAX_SCALE,
			);
			if (ns === scaleRef.current) return;

			const r = canvas.getBoundingClientRect();
			const lx = (e.clientX - r.left) / scaleRef.current;
			const ly = (e.clientY - r.top) / scaleRef.current;
			const baseLeft = r.left - panRef.current.x;
			const baseTop = r.top - panRef.current.y;

			panRef.current = {
				x: e.clientX - lx * ns - baseLeft,
				y: e.clientY - ly * ns - baseTop,
			};
			scaleRef.current = ns;
			applyTransform();
			onScaleChange?.(ns);

			if (currentMode === 'eraser' && !isDrawingRef.current) {
				cursorPosRef.current = getCanvasCoords(e.clientX, e.clientY);
				render();
			}
		};

		const onAuxClick = (e: MouseEvent) => {
			e.preventDefault();
		};

		container.addEventListener('pointerdown', onPointerDown);
		container.addEventListener('pointermove', onPointerMove);
		container.addEventListener('pointerup', onPointerUp);
		container.addEventListener('pointercancel', onPointerUp);
		container.addEventListener('touchstart', onTouchStart, { passive: false });
		container.addEventListener('touchmove', onTouchMove, { passive: false });
		container.addEventListener('touchend', onTouchEnd);
		container.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
		window.addEventListener('pointerup', onPointerUpGlobal);
		window.addEventListener('blur', onWindowBlur);
		container.addEventListener('mouseleave', onMouseLeave);
		container.addEventListener('wheel', onWheel, { passive: false });
		container.addEventListener('auxclick', onAuxClick);

		return () => {
			container.removeEventListener('pointerdown', onPointerDown);
			container.removeEventListener('pointermove', onPointerMove);
			container.removeEventListener('pointerup', onPointerUp);
			container.removeEventListener('pointercancel', onPointerUp);
			container.removeEventListener('touchstart', onTouchStart);
			container.removeEventListener('touchmove', onTouchMove);
			container.removeEventListener('touchend', onTouchEnd);
			container.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('pointerup', onPointerUpGlobal);
			window.removeEventListener('blur', onWindowBlur);
			container.removeEventListener('mouseleave', onMouseLeave);
			container.removeEventListener('wheel', onWheel);
			container.removeEventListener('auxclick', onAuxClick);
		};
	}, [
		applyTransform,
		createBlank,
		currentMode,
		getCanvasCoords,
		hasCanvas,
		pointerDown,
		pointerMove,
		pointerUp,
		render,
	]);

	return (
		<main id="canvas-container" ref={containerRef}>
			<div id="placeholder" className={hasCanvas ? 'hidden' : ''}>
				<div style={{ marginBottom: '1.25rem' }}>
					<BrandLogo size={56} showBadge={true} showText={true} />
				</div>
				<h2>Нотний редактор</h2>
				<p>Створіть чистий білий аркуш або відкрийте фото чи партитуру для розмітки</p>
				<button
					id="btn-create-blank"
					type="button"
					className="btn-primary"
					onClick={createBlank}
				>
					<FilePlus className="icon" />
					<span>Новий білий аркуш</span>
				</button>
			</div>

			<canvas id="editor-canvas" ref={canvasRef} className={!hasCanvas ? 'hidden' : ''} />
		</main>
	);
};
