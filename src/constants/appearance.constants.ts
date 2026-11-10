import {
	AccentSkin,
	AppearanceConfig,
	DarkSurfaceTone,
	LightSurfaceTone,
} from '@/types/appearance.types';

export const APPEARANCE_STORAGE_KEY = 'notyka_appearance_v1';

export const DEFAULT_APPEARANCE_CONFIG: AppearanceConfig = {
	accentSkin: 'cobalt',
	darkTone: 'obsidian',
	lightTone: 'cotton',
};

export const ACCENT_SKIN_OPTIONS: readonly { id: AccentSkin; label: string; color: string }[] = [
	{ id: 'cobalt', label: 'Cobalt', color: '#3b82f6' },
	{ id: 'purple', label: 'Purple', color: '#8b5cf6' },
	{ id: 'lime', label: 'Lime', color: '#84cc16' },
	{ id: 'orange', label: 'Orange', color: '#f97316' },
	{ id: 'amber', label: 'Amber', color: '#f59e0b' },
] as const;

export const DARK_SURFACE_TONE_OPTIONS: readonly {
	id: DarkSurfaceTone;
	label: string;
	description: string;
}[] = [
	{ id: 'oled', label: 'Deep Black', description: 'Maximum contrast deep pitch black for OLED' },
	{ id: 'obsidian', label: 'Obsidian', description: 'Deep balanced graphite tone' },
	{ id: 'carbon', label: 'Carbon', description: 'Soft slate dark background' },
	{ id: 'tinted', label: 'Tinted', description: 'Dark background infused with accent color' },
] as const;

export const LIGHT_SURFACE_TONE_OPTIONS: readonly {
	id: LightSurfaceTone;
	label: string;
	description: string;
}[] = [
	{ id: 'pure', label: 'Pure White', description: 'Clean snow-white background without shadows' },
	{ id: 'anodized', label: 'Anodized', description: 'Cool tech-matte silver tone' },
	{ id: 'cotton', label: 'Cotton', description: 'Soft warm neutral paper tone' },
	{ id: 'tinted', label: 'Tinted', description: 'Light background infused with accent color' },
] as const;
