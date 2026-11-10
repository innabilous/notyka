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

export const AutoCountItemSchema = z.object({
	id: z.string(),
	text: z.string(),
	enabled: z.boolean(),
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
