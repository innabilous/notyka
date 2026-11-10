import {
	AutoCountItem,
	RulerItem,
	SelectionMode,
	SelectionShape,
	StampCategory,
	StampItem,
	ToolMode,
} from './editor.types';

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
	stampCategory?: StampCategory;
	customStamps?: string[];
	sizeLocked: boolean;
	noteSizes: Record<string, number>;
	deleteBtnOn: boolean;
	resizeHandlesOn?: boolean;
	visibleTools?: Record<ToolMode, boolean>;
	visibleStampCategories?: Record<StampCategory, boolean>;
	rulersVisible?: boolean;
	rulersSnap?: boolean;
	rulersSnapItems?: boolean;
	rulersAttachContent?: boolean;
	rulersShowDistance?: boolean;
	rulersLockEqualDistance?: boolean;
	compactRulers?: boolean;
	areaSelectEnabled?: boolean;
	selectionShape?: SelectionShape;
	selectionMode?: SelectionMode;
	customText?: string;
	isAutoCountMode?: boolean;
	countPattern?: string[];
	autoCountSequence?: AutoCountItem[];
}

export type SerializedHistoryLayer =
	| {
			type: 'stroke';
			id: string;
			strokeDataUrl?: string;
	  }
	| {
			type: 'stamp';
			id: string;
			stamp: StampItem;
	  };

export interface SerializedHistoryItem {
	stamps: StampItem[];
	rulers: RulerItem[];
	layers: SerializedHistoryLayer[];
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
	rulers: RulerItem[];
	width: number;
	height: number;
	cssW: number;
	cssH: number;
	countPattern?: string[];
	history?: SerializedHistoryItem[];
	historyStep?: number;
}
