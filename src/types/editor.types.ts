import { AccentSkin, DarkSurfaceTone, LightSurfaceTone } from './appearance.types';

export * from './appearance.types';

export type ToolMode = 'select' | 'pencil' | 'stamp' | 'eraser' | 'ruler';
export type StampCategory = 'notes' | 'chords' | 'count' | 'custom' | 'text' | 'draw' | 'shapes';
export type SelectFilterCategory = 'all' | StampCategory;
export type ShapeType = 'rect' | 'circle' | 'arrow';
export type SelectionShape = 'lasso' | 'rect';
export type SelectionMode = 'inside' | 'intersect';

export const TOOL_MODES: readonly ToolMode[] = ['select', 'pencil', 'stamp', 'ruler', 'eraser'];
export const STAMP_CATEGORY_IDS: readonly StampCategory[] = [
	'notes',
	'chords',
	'count',
	'custom',
	'text',
	'draw',
	'shapes',
];

// Type guards for safe boundary narrowing without type assertions (`as`)
export function isToolMode(val: unknown): val is ToolMode {
	return (
		val === 'select' ||
		val === 'pencil' ||
		val === 'stamp' ||
		val === 'eraser' ||
		val === 'ruler'
	);
}

export function isStampCategory(val: unknown): val is StampCategory {
	return (
		val === 'notes' ||
		val === 'chords' ||
		val === 'count' ||
		val === 'custom' ||
		val === 'text' ||
		val === 'draw' ||
		val === 'shapes'
	);
}

export function isSelectFilterCategory(val: unknown): val is SelectFilterCategory {
	return val === 'all' || isStampCategory(val);
}

export function isAccentSkin(val: unknown): val is AccentSkin {
	return (
		val === 'orange' ||
		val === 'cobalt' ||
		val === 'purple' ||
		val === 'lime' ||
		val === 'amber'
	);
}

export function isDarkSurfaceTone(val: unknown): val is DarkSurfaceTone {
	return val === 'oled' || val === 'obsidian' || val === 'carbon' || val === 'tinted';
}

export function isLightSurfaceTone(val: unknown): val is LightSurfaceTone {
	return val === 'pure' || val === 'anodized' || val === 'cotton' || val === 'tinted';
}

export interface RulerItem {
	id: string;
	y: number;
}

export interface StampDrawingPath {
	points: Point[];
}

export interface AutoCountItem {
	id: string;
	text: string;
	enabled: boolean;
}

export interface StampItem {
	id: string;
	x: number;
	y: number;
	size: number;
	text: string;
	mainColor: string;
	strokeColor: string;
	badgeMode?: boolean;
	category?: StampCategory;
	isDrawing?: boolean;
	initialSize?: number;
	rawBounds?: { width: number; height: number };
	paths?: StampDrawingPath[];
	strokeWidth?: number;
	isAutoCount?: boolean;
	autoCountIndex?: number;
	autoCountSeqId?: string;
	shapeType?: ShapeType;
	width?: number;
	height?: number;
	endX?: number;
	endY?: number;
	rotation?: number;
}

export type CanvasLayerItem =
	| {
			type: 'stroke';
			id: string;
			imageData?: ImageData;
			strokeDataUrl?: string;
	  }
	| {
			type: 'stamp';
			id: string;
			stamp: StampItem;
	  };

export interface HistoryItem {
	stamps: StampItem[];
	rulers: RulerItem[];
	layers: CanvasLayerItem[];
}

export interface Point {
	x: number;
	y: number;
}

export interface BoundingBox {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface SnapGuide {
	x: number;
	y1: number;
	y2: number;
}
