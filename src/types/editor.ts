export type ToolMode = 'pencil' | 'stamp' | 'eraser' | 'ruler';
export type StampCategory = 'notes' | 'chords' | 'count' | 'custom' | 'text' | 'draw' | 'shapes';
export type ShapeType = 'rect' | 'circle' | 'arrow';

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
	category?: string;
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

export interface CanvasLayerItem {
	type: 'stroke' | 'stamp';
	id: string;
	imageData?: ImageData;
	strokeDataUrl?: string;
	stamp?: StampItem;
}

export interface HistoryItem {
	imageData?: ImageData;
	strokeDataUrl?: string;
	stamps: StampItem[];
	rulers?: RulerItem[];
	layers?: CanvasLayerItem[];
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
