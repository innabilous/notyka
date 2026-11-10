import * as z from 'zod';

export const AccentSkinSchema = z.enum(['orange', 'cobalt', 'purple', 'lime', 'amber']);
export const DarkSurfaceToneSchema = z.enum(['oled', 'obsidian', 'carbon', 'tinted']);
export const LightSurfaceToneSchema = z.enum(['pure', 'anodized', 'cotton', 'tinted']);

export const AppearanceConfigSchema = z.object({
	accentSkin: AccentSkinSchema,
	darkTone: DarkSurfaceToneSchema,
	lightTone: LightSurfaceToneSchema,
});
