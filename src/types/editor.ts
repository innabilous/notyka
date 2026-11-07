export type ToolMode = 'pencil' | 'stamp' | 'eraser' | 'ruler';

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
}

export interface CanvasLayerItem {
	type: 'stroke' | 'stamp';
	id: string;
	imageData?: ImageData;
	stamp?: StampItem;
}

export interface HistoryItem {
	imageData?: ImageData;
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
