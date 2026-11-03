'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Button, Stack, Text } from '@mantine/core';
import { FilePlus, Image as ImageIcon } from 'lucide-react';
import {
	DRAG_SLOP,
	MAX_HISTORY,
	MAX_PIXELS,
	MAX_SCALE,
	MAX_SIDE,
	MIN_SCALE,
	SMOOTH,
} from '@/constants/editor';
import { HistoryItem, Point, StampItem, ToolMode } from '@/types/editor';
import {
	drawStamp,
	getDeleteCoords,
	getHandleCoords,
	isPointInDelete,
	isPointInHandle,
	isPointInStamp,
} from '@/utils/canvas-renderer';

interface CanvasStageProps {
	currentMode: ToolMode;
	mainColor: string;
	strokeColor: string;
	currentSize: number;
	selectedNote: string;
	selectedAccidental: string;
	deleteBtnOn: boolean;
	hasCanvas: boolean;
	onSelectStamp: (stamp: StampItem) => void;
	onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
	onNotify: (message: string) => void;
	onInitBlank: () => void;
	stageRef: React.MutableRefObject<CanvasStageHandle | null>;
}

export interface CanvasStageHandle {
	createBlank: () => void;
	loadImage: (file: File) => void;
	clear: () => void;
	undo: () => void;
	redo: () => void;
	commitActiveStamp: () => void;
	getExportBlob: () => Promise<Blob | null>;
	updateActiveStampProps: (
		size: number,
		text: string,
		mainColor: string,
		strokeColor: string,
	) => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
	currentMode,
	mainColor,
	strokeColor,
	currentSize,
	selectedNote,
	selectedAccidental,
	deleteBtnOn,
	hasCanvas,
	onSelectStamp,
	onHistoryChange,
	onNotify,
	onInitBlank,
	stageRef,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Offscreen canvas layers
	const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

	// Editor state refs
	const currentImageRef = useRef<HTMLImageElement | null>(null);
	const stampsListRef = useRef<StampItem[]>([]);
	const activeStampRef = useRef<StampItem | null>(null);
	const activeOrigRef = useRef<string>('');
	const cursorPosRef = useRef<Point | null>(null);

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
	const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });
	const dragStartPtRef = useRef<Point | null>(null);
	const dragMovedRef = useRef<boolean>(true);

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
	const startPanRef = useRef<Point>({ x: 0, y: 0 });
	const startPinchCenterRef = useRef<Point>({ x: 0, y: 0 });
	const ignoreMouseDownRef = useRef<boolean>(false);

	const pendingStartRef = useRef<Point | null>(null);
	const pendingClientRef = useRef<Point | null>(null);
	const pendingTimerRef = useRef<NodeJS.Timeout | null>(null);

	// History stack
	const historyStackRef = useRef<HistoryItem[]>([]);
	const historyStepRef = useRef<number>(-1);

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
	}, [applyTransform]);

	const updateUndoRedo = useCallback(() => {
		const canUndo = historyStepRef.current > 0;
		const canRedo = historyStepRef.current < historyStackRef.current.length - 1;
		onHistoryChange(canUndo, canRedo);
	}, [onHistoryChange]);

	const render = useCallback(() => {
		const canvas = canvasRef.current;
		const baseCanvas = baseCanvasRef.current;
		const bgCanvas = bgCanvasRef.current;
		if (!canvas || !baseCanvas || !bgCanvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (currentImageRef.current) {
			ctx.drawImage(bgCanvas, 0, 0);
		}
		ctx.drawImage(baseCanvas, 0, 0);

		stampsListRef.current.forEach((st) => {
			drawStamp(st, false, ctx, uRef.current, deleteBtnOn);
		});

		if (activeStampRef.current) {
			drawStamp(activeStampRef.current, true, ctx, uRef.current, deleteBtnOn);
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
	}, [currentMode, currentSize, deleteBtnOn]);

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
		const bctx = baseCanvas.getContext('2d');
		if (!bctx) return;

		const currentStack = historyStackRef.current.slice(0, historyStepRef.current + 1);
		currentStack.push({
			imageData: bctx.getImageData(0, 0, baseCanvas.width, baseCanvas.height),
			stamps: JSON.parse(JSON.stringify(stampsListRef.current)),
		});

		const maxH = Math.max(
			5,
			Math.min(MAX_HISTORY, Math.floor(250e6 / (baseCanvas.width * baseCanvas.height * 4))),
		);
		while (currentStack.length > maxH) {
			currentStack.shift();
		}

		historyStackRef.current = currentStack;
		historyStepRef.current = currentStack.length - 1;
		updateUndoRedo();
	}, [updateUndoRedo]);

	const commitActiveStamp = useCallback(() => {
		const active = activeStampRef.current;
		if (!active) return;

		const changed = JSON.stringify(active) !== activeOrigRef.current;
		stampsListRef.current.push(active);
		activeStampRef.current = null;
		activeOrigRef.current = '';
		render();

		if (changed) {
			saveHistory();
		}
	}, [render, saveHistory]);

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

		const bctx = base.getContext('2d');
		if (bctx) bctx.imageSmoothingQuality = 'high';
	}, []);

	const createBlank = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;

		currentImageRef.current = null;
		stampsListRef.current = [];
		activeStampRef.current = null;
		activeOrigRef.current = '';
		resetTransform();

		const cssW = Math.max(300, container.clientWidth - 20);
		const cssH = Math.max(300, container.clientHeight - 20);
		const k = Math.min(
			Math.max(2, window.devicePixelRatio || 1),
			Math.sqrt(MAX_PIXELS / (cssW * cssH)),
		);

		initCanvas(Math.round(cssW * k), Math.round(cssH * k), cssW, cssH);
		onInitBlank();
		render();

		historyStackRef.current = [];
		historyStepRef.current = -1;
		saveHistory();
		onNotify('Створено білий аркуш');
	}, [initCanvas, onInitBlank, onNotify, render, resetTransform, saveHistory]);

	const loadImage = useCallback(
		(file: File) => {
			const container = containerRef.current;
			if (!container) return;

			const reader = new FileReader();
			reader.onload = (ev) => {
				const src = ev.target?.result;
				if (typeof src !== 'string') return;

				const img = new Image();
				img.onload = () => {
					currentImageRef.current = img;
					stampsListRef.current = [];
					activeStampRef.current = null;
					activeOrigRef.current = '';
					resetTransform();

					const cw = container.clientWidth - 20;
					const ch = container.clientHeight - 20;
					const fit = Math.min(cw / img.width, ch / img.height);
					const k = Math.min(
						1,
						Math.sqrt(MAX_PIXELS / (img.width * img.height)),
						MAX_SIDE / Math.max(img.width, img.height),
					);

					initCanvas(
						Math.round(img.width * k),
						Math.round(img.height * k),
						Math.round(img.width * fit),
						Math.round(img.height * fit),
					);

					const bg = bgCanvasRef.current;
					if (bg) {
						const bgctx = bg.getContext('2d');
						if (bgctx) {
							bgctx.imageSmoothingQuality = 'high';
							bgctx.drawImage(img, 0, 0, bg.width, bg.height);
						}
					}

					onInitBlank();
					render();

					historyStackRef.current = [];
					historyStepRef.current = -1;
					saveHistory();
					onNotify('Зображення завантажено');
				};
				img.src = src;
			};
			reader.readAsDataURL(file);
		},
		[initCanvas, onInitBlank, onNotify, render, resetTransform, saveHistory],
	);

	const clearCanvas = useCallback(() => {
		activeStampRef.current = null;
		activeOrigRef.current = '';
		stampsListRef.current = [];

		if (currentImageRef.current) {
			const base = baseCanvasRef.current;
			if (base) {
				const bctx = base.getContext('2d');
				if (bctx) bctx.clearRect(0, 0, base.width, base.height);
			}
			render();
			saveHistory();
		} else {
			resetTransform();
			historyStackRef.current = [];
			historyStepRef.current = -1;
			updateUndoRedo();
		}
		onNotify('Очищено');
	}, [onNotify, render, resetTransform, saveHistory, updateUndoRedo]);

	const restoreHistory = useCallback(
		(step: number) => {
			const item = historyStackRef.current[step];
			const base = baseCanvasRef.current;
			if (!item || !base) return;

			const bctx = base.getContext('2d');
			if (bctx) {
				bctx.putImageData(item.imageData, 0, 0);
			}
			stampsListRef.current = JSON.parse(JSON.stringify(item.stamps));
			activeStampRef.current = null;
			activeOrigRef.current = '';
			render();
			updateUndoRedo();
		},
		[render, updateUndoRedo],
	);

	const handleUndo = useCallback(() => {
		commitActiveStamp();
		if (historyStepRef.current > 0) {
			historyStepRef.current -= 1;
			restoreHistory(historyStepRef.current);
			onNotify('Скасовано');
		}
	}, [commitActiveStamp, onNotify, restoreHistory]);

	const handleRedo = useCallback(() => {
		commitActiveStamp();
		if (historyStepRef.current < historyStackRef.current.length - 1) {
			historyStepRef.current += 1;
			restoreHistory(historyStepRef.current);
			onNotify('Повернуто');
		}
	}, [commitActiveStamp, onNotify, restoreHistory]);

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
		const wasNew = activeOrigRef.current === '';
		activeStampRef.current = null;
		activeOrigRef.current = '';
		isDraggingStampRef.current = false;
		isDraggingHandleRef.current = false;
		render();
		if (!wasNew) saveHistory();
		onNotify('Штамп видалено');
	}, [onNotify, render, saveHistory]);

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
			const list = stampsListRef.current;
			for (let i = list.length - 1; i >= 0; i--) {
				const s = list[i];
				if (isPointInStamp(pt, s, uRef.current, ctx)) {
					commitActiveStamp();
					const selected = list.splice(i, 1)[0];
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

			// 4. Create new stamp at clicked position
			commitActiveStamp();
			const newStamp: StampItem = {
				id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
				x: pt.x,
				y: pt.y,
				size: currentSize,
				text: selectedNote + selectedAccidental,
				mainColor,
				strokeColor,
			};
			activeStampRef.current = newStamp;
			activeOrigRef.current = '';
			isDraggingStampRef.current = true;
			dragOffsetRef.current = { x: 0, y: 0 };
			render();
		},
		[
			commitActiveStamp,
			currentSize,
			deleteActiveStamp,
			deleteBtnOn,
			mainColor,
			onNotify,
			onSelectStamp,
			render,
			selectedAccidental,
			selectedNote,
			strokeColor,
		],
	);

	const drawPencilStroke = useCallback(
		(fx: number, fy: number, tx: number, ty: number) => {
			const base = baseCanvasRef.current;
			if (!base) return;
			const bctx = base.getContext('2d');
			if (!bctx) return;

			bctx.save();
			bctx.lineCap = 'round';
			bctx.lineJoin = 'round';

			const isDot = fx === tx && fy === ty;
			const isEraser = currentMode === 'eraser';
			const w = (isEraser ? currentSize * 1.5 : currentSize) * uRef.current;

			if (isEraser) {
				bctx.globalCompositeOperation = 'destination-out';
				const canvas = canvasRef.current;
				const ctx = canvas?.getContext('2d');
				if (ctx) {
					for (let i = stampsListRef.current.length - 1; i >= 0; i--) {
						if (
							isPointInStamp({ x: tx, y: ty }, stampsListRef.current[i], uRef.current, ctx)
						) {
							stampsListRef.current.splice(i, 1);
						}
					}
				}
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
			const base = baseCanvasRef.current;
			if (!base) return;
			const bctx = base.getContext('2d');
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
					active.x = pt.x - dragOffsetRef.current.x;
					active.y = pt.y - dragOffsetRef.current.y - 24 * uRef.current;
					render();
				}
			} else if (isDraggingStampRef.current) {
				active.x = pt.x - dragOffsetRef.current.x;
				active.y = pt.y - dragOffsetRef.current.y;
				render();
			}
		},
		[render],
	);

	const pointerDown = useCallback(
		(pt: Point) => {
			if (currentMode === 'stamp') {
				placeStamp(pt);
				return;
			}

			commitActiveStamp();
			isDrawingRef.current = true;
			lastCoordsRef.current = pt;

			if (currentMode === 'eraser') {
				cursorPosRef.current = pt;
			}
			if (currentMode === 'pencil') {
				smoothPosRef.current = { ...pt };
				lastMidRef.current = { ...pt };
			}
			drawPencilStroke(pt.x, pt.y, pt.x, pt.y);
		},
		[commitActiveStamp, currentMode, drawPencilStroke, placeStamp],
	);

	const pointerMove = useCallback(
		(pt: Point) => {
			if (isDrawingRef.current) {
				if (currentMode === 'eraser') {
					cursorPosRef.current = pt;
				}
				if (currentMode === 'pencil' && smoothPosRef.current) {
					strokeSmooth(pt);
				} else if (lastCoordsRef.current) {
					drawPencilStroke(lastCoordsRef.current.x, lastCoordsRef.current.y, pt.x, pt.y);
				}
				lastCoordsRef.current = pt;
			} else if (currentMode === 'stamp') {
				moveActive(pt);
			}
		},
		[currentMode, drawPencilStroke, moveActive, strokeSmooth],
	);

	const pointerUp = useCallback(() => {
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
			saveHistory();
		}
		isDraggingStampRef.current = false;
		isDraggingHandleRef.current = false;
	}, [currentMode, quadSegment, saveHistory]);

	// Attach stageRef imperative handle
	useEffect(() => {
		stageRef.current = {
			createBlank,
			loadImage,
			clear: clearCanvas,
			undo: handleUndo,
			redo: handleRedo,
			commitActiveStamp,
			getExportBlob: async () => {
				const base = baseCanvasRef.current;
				const bg = bgCanvasRef.current;
				if (!base || !bg) return null;

				const exportCanvas = document.createElement('canvas');
				exportCanvas.width = base.width;
				exportCanvas.height = base.height;
				const expCtx = exportCanvas.getContext('2d');
				if (!expCtx) return null;

				expCtx.fillStyle = '#ffffff';
				expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
				if (currentImageRef.current) {
					expCtx.drawImage(bg, 0, 0);
				}
				expCtx.drawImage(base, 0, 0);

				stampsListRef.current.forEach((st) => {
					drawStamp(st, false, expCtx, uRef.current, false);
				});
				if (activeStampRef.current) {
					drawStamp(activeStampRef.current, false, expCtx, uRef.current, false);
				}

				return new Promise<Blob | null>((res) => exportCanvas.toBlob(res, 'image/png'));
			},
			updateActiveStampProps: (sz, txt, mClr, sClr) => {
				const active = activeStampRef.current;
				if (!active) return;
				active.size = sz;
				active.text = txt;
				active.mainColor = mClr;
				active.strokeColor = sClr;
				render();
			},
		};
	}, [
		clearCanvas,
		commitActiveStamp,
		createBlank,
		handleRedo,
		handleUndo,
		loadImage,
		render,
		stageRef,
	]);

	// Re-render when size/mode/colors change
	useEffect(() => {
		render();
	}, [render]);

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

		const onTouchStart = (e: TouchEvent) => {
			ignoreMouseDownRef.current = true;
			if (e.touches.length === 2) {
				cancelPending();
				if (isDrawingRef.current) pointerUp();
				isMultiTouchRef.current = true;
				isDrawingRef.current = false;
				isDraggingStampRef.current = false;
				isDraggingHandleRef.current = false;

				const a = e.touches[0];
				const b = e.touches[1];
				initialPinchDistRef.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
				startScaleRef.current = scaleRef.current;
				startPanRef.current = { ...panRef.current };
				startPinchCenterRef.current = {
					x: (a.clientX + b.clientX) / 2,
					y: (a.clientY + b.clientY) / 2,
				};
			} else if (e.touches.length === 1 && !isMultiTouchRef.current) {
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
				const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
				const center = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };

				if (initialPinchDistRef.current > 0) {
					const ns = Math.min(
						Math.max(MIN_SCALE, (startScaleRef.current * dist) / initialPinchDistRef.current),
						MAX_SCALE,
					);
					const r = container.getBoundingClientRect();
					const fx = startPinchCenterRef.current.x - r.left;
					const fy = startPinchCenterRef.current.y - r.top;

					panRef.current = {
						x:
							fx -
							(fx - startPanRef.current.x) * (ns / startScaleRef.current) +
							(center.x - startPinchCenterRef.current.x),
						y:
							fy -
							(fy - startPanRef.current.y) * (ns / startScaleRef.current) +
							(center.y - startPinchCenterRef.current.y),
					};
					scaleRef.current = ns;
					applyTransform();
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

		const onMouseDown = (e: MouseEvent) => {
			if (ignoreMouseDownRef.current) return;
			if (e.button === 1) {
				// Middle click pan
				e.preventDefault();
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
			if (e.button !== 0) return;
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
			if (isDrawingRef.current || isDraggingStampRef.current || isDraggingHandleRef.current) {
				pointerMove(pt);
			} else if (currentMode === 'eraser' && container.contains(e.target as Node)) {
				cursorPosRef.current = pt;
				render();
			}
		};

		const onMouseUp = (e: MouseEvent) => {
			if (isPanningRef.current && e.button === 1) {
				isPanningRef.current = false;
				container.style.cursor = '';
				return;
			}
			if (!ignoreMouseDownRef.current && e.button === 0) {
				pointerUp();
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
			const ns = Math.min(
				Math.max(MIN_SCALE, scaleRef.current * Math.exp(-e.deltaY * 0.0015)),
				MAX_SCALE,
			);
			if (ns === scaleRef.current) return;

			const r = container.getBoundingClientRect();
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

			if (currentMode === 'eraser' && !isDrawingRef.current) {
				cursorPosRef.current = getCanvasCoords(e.clientX, e.clientY);
				render();
			}
		};

		container.addEventListener('touchstart', onTouchStart, { passive: false });
		container.addEventListener('touchmove', onTouchMove, { passive: false });
		container.addEventListener('touchend', onTouchEnd);
		container.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
		container.addEventListener('mouseleave', onMouseLeave);
		container.addEventListener('wheel', onWheel, { passive: false });

		return () => {
			container.removeEventListener('touchstart', onTouchStart);
			container.removeEventListener('touchmove', onTouchMove);
			container.removeEventListener('touchend', onTouchEnd);
			container.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			container.removeEventListener('mouseleave', onMouseLeave);
			container.removeEventListener('wheel', onWheel);
		};
	}, [applyTransform, currentMode, getCanvasCoords, pointerDown, pointerMove, pointerUp, render]);

	return (
		<div
			ref={containerRef}
			style={{
				position: 'relative',
				flex: 1,
				width: '100%',
				height: '100%',
				backgroundColor: '#030712',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
				touchAction: 'none',
			}}
		>
			{!hasCanvas ? (
				<Stack align="center" gap="md" p="xl" style={{ zIndex: 10, textAlign: 'center' }}>
					<ImageIcon size={64} style={{ opacity: 0.4, color: '#6b7280' }} />
					<Text size="md" fw={500} c="gray.5">
						Відкрийте зображення або почніть на білому аркуші
					</Text>
					<Button
						leftSection={<FilePlus size={18} />}
						color="indigo"
						size="md"
						radius="md"
						onClick={createBlank}
						style={{ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)' }}
					>
						Новий білий аркуш
					</Button>
				</Stack>
			) : (
				<canvas
					ref={canvasRef}
					style={{
						backgroundColor: '#ffffff',
						boxShadow: '0 25px 50px -12px rgba(0,0,0,.6)',
						cursor: currentMode === 'stamp' ? 'move' : 'crosshair',
						transformOrigin: '0 0',
						willChange: 'transform',
					}}
				/>
			)}
		</div>
	);
};
