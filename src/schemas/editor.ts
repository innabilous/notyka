import * as z from 'zod';

export const ToolModeSchema = z.enum(['select', 'pencil', 'stamp', 'eraser', 'ruler']);

export const StampCategorySchema = z.enum([
	'notes',
	'chords',
	'count',
	'custom',
	'text',
	'draw',
	'shapes',
]);

export const ShapeTypeSchema = z.enum(['rect', 'circle', 'arrow']);
export const SelectionShapeSchema = z.enum(['lasso', 'rect']);
export const SelectionModeSchema = z.enum(['inside', 'intersect']);

export const AccentSkinSchema = z.enum(['orange', 'cobalt', 'purple', 'lime', 'amber']);
export const DarkSurfaceToneSchema = z.enum(['oled', 'obsidian', 'carbon', 'tinted']);
export const LightSurfaceToneSchema = z.enum(['pure', 'anodized', 'cotton', 'tinted']);

export const AppearanceConfigSchema = z.object({
	accentSkin: AccentSkinSchema,
	darkTone: DarkSurfaceToneSchema,
	lightTone: LightSurfaceToneSchema,
});

export const PointSchema = z.object({
	x: z.number(),
	y: z.number(),
});

export const RulerItemSchema = z.object({
	id: z.string(),
	y: z.number(),
});

export const StampDrawingPathSchema = z.object({
	points: z.array(PointSchema),
});

export const AutoCountItemSchema = z.object({
	id: z.string(),
	text: z.string(),
	enabled: z.boolean(),
});

export const StampItemSchema = z.object({
	id: z.string(),
	x: z.number(),
	y: z.number(),
	size: z.number(),
	text: z.string(),
	mainColor: z.string(),
	strokeColor: z.string(),
	badgeMode: z.boolean().optional(),
	category: StampCategorySchema.optional(),
	isDrawing: z.boolean().optional(),
	initialSize: z.number().optional(),
	rawBounds: z
		.object({
			width: z.number(),
			height: z.number(),
		})
		.optional(),
	paths: z.array(StampDrawingPathSchema).optional(),
	strokeWidth: z.number().optional(),
	isAutoCount: z.boolean().optional(),
	autoCountIndex: z.number().optional(),
	autoCountSeqId: z.string().optional(),
	shapeType: ShapeTypeSchema.optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	endX: z.number().optional(),
	endY: z.number().optional(),
	rotation: z.number().optional(),
});

const ColorPairSchema = z.object({
	main: z.string(),
	stroke: z.string(),
});

export const EditorSettingsSchema = z.object({
	currentMode: ToolModeSchema,
	toolSizes: z.object({
		select: z.number(),
		pencil: z.number(),
		stamp: z.number(),
		eraser: z.number(),
		ruler: z.number(),
	}),
	toolColors: z.object({
		pencil: ColorPairSchema,
		stamp: ColorPairSchema,
	}),
	categoryColors: z.record(z.string(), ColorPairSchema).optional(),
	selectedNote: z.string(),
	selectedAccidental: z.string(),
	selectedChordRoot: z.string().optional(),
	selectedChordAccidental: z.string().optional(),
	selectedChordModifier: z.string().optional(),
	selectedChordSlash: z.boolean().optional(),
	selectedChordBassRoot: z.string().optional(),
	selectedChordBassAccidental: z.string().optional(),
	stampBadgeMode: z.boolean().optional(),
	activeStampText: z.string().optional(),
	stampCategory: StampCategorySchema.optional(),
	customStamps: z.array(z.string()).optional(),
	sizeLocked: z.boolean(),
	noteSizes: z.record(z.string(), z.number()),
	deleteBtnOn: z.boolean(),
	resizeHandlesOn: z.boolean().optional(),
	visibleTools: z
		.object({
			select: z.boolean(),
			pencil: z.boolean(),
			stamp: z.boolean(),
			eraser: z.boolean(),
			ruler: z.boolean(),
		})
		.optional(),
	visibleStampCategories: z
		.object({
			notes: z.boolean(),
			chords: z.boolean(),
			count: z.boolean(),
			custom: z.boolean(),
			text: z.boolean(),
			draw: z.boolean(),
			shapes: z.boolean(),
		})
		.optional(),
	rulersVisible: z.boolean().optional(),
	rulersSnap: z.boolean().optional(),
	rulersSnapItems: z.boolean().optional(),
	rulersAttachContent: z.boolean().optional(),
	rulersShowDistance: z.boolean().optional(),
	rulersLockEqualDistance: z.boolean().optional(),
	compactRulers: z.boolean().optional(),
	areaSelectEnabled: z.boolean().optional(),
	selectionShape: SelectionShapeSchema.optional(),
	selectionMode: SelectionModeSchema.optional(),
	customText: z.string().optional(),
	isAutoCountMode: z.boolean().optional(),
	countPattern: z.array(z.string()).optional(),
	autoCountSequence: z.array(AutoCountItemSchema).optional(),
});

export const SerializedHistoryLayerSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('stroke'),
		id: z.string(),
		strokeDataUrl: z.string().optional(),
	}),
	z.object({
		type: z.literal('stamp'),
		id: z.string(),
		stamp: StampItemSchema,
	}),
]);

export const SerializedHistoryItemSchema = z.object({
	stamps: z.array(StampItemSchema),
	rulers: z.array(RulerItemSchema),
	layers: z.array(SerializedHistoryLayerSchema),
});

export const ProjectItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	updatedAt: z.number(),
	thumbnail: z.string(),
	hasImage: z.boolean(),
	bgDataUrl: z.string().nullable(),
	baseDataUrl: z.string().nullable(),
	stamps: z.array(StampItemSchema),
	rulers: z.array(RulerItemSchema).optional(),
	width: z.number(),
	height: z.number(),
	cssW: z.number(),
	cssH: z.number(),
	countPattern: z.array(z.string()).optional(),
	history: z.array(SerializedHistoryItemSchema).optional(),
	historyStep: z.number().optional(),
});

