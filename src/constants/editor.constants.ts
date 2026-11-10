import { StampCategory, ToolMode } from '@/types/editor.types';

export const PALETTE_COLORS: readonly string[] = [
	'#ffffff',
	'#000000',
	'#ef4444',
	'#ff7f27',
	'#fff200',
	'#22b14c',
	'#00a2e8',
	'#3f48cc',
	'#a349a4',
	'#64748b',
];

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 8;
export const MAX_PIXELS = 4.5e6; // ~4.5 MP cap (< 20 MB memory budget to prevent mobile Safari canvas crashes)
export const MAX_SIDE = 2048; // 2048 px max side (2K cap for camera photos)
export const MIN_CANVAS_SIDE = 1000; // Minimum shorter side for imported photos to prevent blurry stamp text
export const DEFAULT_BLANK_WIDTH = 1240; // Standard A4 sheet resolution (1240 × 1754, ~2.1 MP)
export const DEFAULT_BLANK_HEIGHT = 1754;
export const DRAG_SLOP = 8;
export const SMOOTH = 0.35;
export const MAX_HISTORY = 150;

export const DEFAULT_VISIBLE_TOOLS: Record<ToolMode, boolean> = {
	select: true,
	pencil: true,
	stamp: true,
	ruler: true,
	eraser: true,
};

export const DEFAULT_VISIBLE_STAMP_CATEGORIES: Record<StampCategory, boolean> = {
	notes: true,
	chords: true,
	count: true,
	custom: true,
	text: true,
	draw: true,
	shapes: true,
};
