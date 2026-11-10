import * as z from 'zod';
import { ShapeTypeSchema, StampCategorySchema } from './editor-settings.schema';

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
	rulers: z.array(RulerItemSchema),
	width: z.number(),
	height: z.number(),
	cssW: z.number(),
	cssH: z.number(),
	countPattern: z.array(z.string()).optional(),
	history: z.array(SerializedHistoryItemSchema).optional(),
	historyStep: z.number().optional(),
});
