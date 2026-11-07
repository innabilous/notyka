import { AutoCountItem, RulerItem, StampItem, ToolMode } from './editor';

export interface EditorSettings {
	currentMode: ToolMode;
	toolSizes: Record<ToolMode, number>;
	toolColors: Record<'pencil' | 'stamp', { main: string; stroke: string }>;
	categoryColors?: Record<string, { main: string; stroke: string }>;
	selectedNote: string;
	selectedAccidental: string;
	selectedChordRoot?: string;
	selectedChordAccidental?: string;
	selectedChordModifier?: string;
	selectedChordSlash?: boolean;
	selectedChordBassRoot?: string;
	selectedChordBassAccidental?: string;
	stampBadgeMode?: boolean;
	activeStampText?: string;
	stampCategory?: string;
	customStamps?: string[];
	sizeLocked: boolean;
	noteSizes: Record<string, number>;
	deleteBtnOn: boolean;
	resizeHandlesOn?: boolean;
	rulersVisible?: boolean;
	rulersSnap?: boolean;
	rulersAttachContent?: boolean;
	rulersShowDistance?: boolean;
	rulersLockEqualDistance?: boolean;
	customText?: string;
	isAutoCountMode?: boolean;
	countPattern?: string[];
	autoCountSequence?: AutoCountItem[];
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
	rulers?: RulerItem[];
	width: number;
	height: number;
	cssW: number;
	cssH: number;
	countPattern?: string[];
}
