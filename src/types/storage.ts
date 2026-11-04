import { StampItem, ToolMode } from './editor';

export interface EditorSettings {
	currentMode: ToolMode;
	toolSizes: Record<ToolMode, number>;
	toolColors: Record<'pencil' | 'stamp', { main: string; stroke: string }>;
	selectedNote: string;
	selectedAccidental: string;
	activeStampText?: string;
	stampCategory?: string;
	customStamps?: string[];
	sizeLocked: boolean;
	noteSizes: Record<string, number>;
	deleteBtnOn: boolean;
	resizeHandlesOn?: boolean;
}

export interface ProjectItem {
	id: string;
	title: string;
	updatedAt: number;
	thumbnail: string;
	hasImage: boolean;
	bgDataUrl: string | null;
	baseDataUrl: string | null;
	stamps: StampItem[];
	width: number;
	height: number;
	cssW: number;
	cssH: number;
}
