export type AccentSkin = 'orange' | 'cobalt' | 'purple' | 'lime' | 'amber';
export type DarkSurfaceTone = 'oled' | 'obsidian' | 'carbon' | 'tinted';
export type LightSurfaceTone = 'pure' | 'anodized' | 'cotton' | 'tinted';

export interface AppearanceConfig {
	accentSkin: AccentSkin;
	darkTone: DarkSurfaceTone;
	lightTone: LightSurfaceTone;
}
