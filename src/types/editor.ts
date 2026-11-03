export type ToolMode = 'pencil' | 'stamp' | 'eraser';

export interface StampItem {
	id: string;
	x: number;
	y: number;
	size: number;
	text: string;
	mainColor: string;
	strokeColor: string;
}

export interface HistoryItem {
	imageData: ImageData;
	stamps: StampItem[];
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
