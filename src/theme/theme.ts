import { CSSVariablesResolver, MantineColorsTuple, createTheme } from '@mantine/core';
import { AccentSkin, AppearanceConfig, DarkSurfaceTone, LightSurfaceTone } from '@/types/editor';

export const APPEARANCE_STORAGE_KEY = 'notyka_appearance_v2';

export const DEFAULT_APPEARANCE_CONFIG: AppearanceConfig = {
	accentSkin: 'cobalt',
	darkTone: 'obsidian',
	lightTone: 'pure',
};

export const ACCENT_SKIN_ORDER: readonly AccentSkin[] = [
	'cobalt',
	'purple',
	'lime',
	'orange',
	'amber',
];

// 10-shade Mantine palettes for Accent Skins
export const ACCENT_PALETTES: Record<AccentSkin, MantineColorsTuple> = {
	orange: [
		'#fff5eb',
		'#ffe8d6',
		'#ffd0b0',
		'#ffb080',
		'#ff8447',
		'#ff5500', // shade 5: International Orange (dark theme active)
		'#e64800', // shade 6: deep vibrant orange (light theme active)
		'#bf3900',
		'#992c00',
		'#732000',
	],
	cobalt: [
		'#eff6ff',
		'#dbeafe',
		'#bfdbfe',
		'#93c5fd',
		'#60a5fa',
		'#3b82f6', // shade 5: Cobalt Blue (dark theme active)
		'#1d4ed8', // shade 6: deep Cobalt Blue (light theme active)
		'#1e40af',
		'#1e3a8a',
		'#172554',
	],
	purple: [
		'#f5f3ff',
		'#ede9fe',
		'#ddd6fe',
		'#c4b5fd',
		'#a78bfa',
		'#8b5cf6', // shade 5: Electric Purple (dark theme active)
		'#7c3aed', // shade 6: Deep Violet (light theme active)
		'#6d28d9',
		'#5b21b6',
		'#4c1d95',
	],
	lime: [
		'#f7fee7',
		'#ecfccb',
		'#d9f99d',
		'#bef264',
		'#a3e635',
		'#84cc16', // shade 5: Acid Lime (dark theme active)
		'#65a30d', // shade 6: shade for light theme
		'#4d7c0f',
		'#3f6212',
		'#365314',
	],
	amber: [
		'#fffbeb',
		'#fef3c7',
		'#fde68a',
		'#fcd34d',
		'#fbbf24',
		'#f59e0b', // shade 5: Studio Amber (dark theme active)
		'#d97706', // shade 6: shade for light theme
		'#b45309',
		'#92400e',
		'#78350f',
	],
};

export const ACCENT_SKIN_METADATA: Record<
	AccentSkin,
	{ label: string; shortLabel: string; primaryHex: string; contrastHex: string; description: string }
> = {
	orange: {
		label: 'Teenage Orange',
		shortLabel: 'Orange',
		primaryHex: '#FF5500',
		contrastHex: '#FFFFFF',
		description: 'Культовий апаратний акцент Teenage Engineering',
	},
	cobalt: {
		label: 'Cobalt Studio',
		shortLabel: 'Cobalt',
		primaryHex: '#2563EB',
		contrastHex: '#FFFFFF',
		description: 'Глибокий інженерний індиго-кобальт Bauhaus',
	},
	purple: {
		label: 'Electric Purple',
		shortLabel: 'Purple',
		primaryHex: '#8B5CF6',
		contrastHex: '#FFFFFF',
		description: 'Енергійний студійний фіолетовий акцент',
	},
	lime: {
		label: 'Acid Lime',
		shortLabel: 'Lime',
		primaryHex: '#84CC16',
		contrastHex: '#0E1013',
		description: 'Висококонтрастний студійний лайм Linear',
	},
	amber: {
		label: 'Hardware Amber',
		shortLabel: 'Amber',
		primaryHex: '#F59E0B',
		contrastHex: '#0E1013',
		description: 'Теплий аналоговий індикатор апаратури',
	},
};

// Synchronous `<head>` script generated from `ACCENT_SKIN_METADATA` single source of truth
export const APPEARANCE_INIT_SCRIPT = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(
	APPEARANCE_STORAGE_KEY,
)});if(!raw)return;var cfg=JSON.parse(raw);var skins=${JSON.stringify(
	Object.fromEntries(
		Object.entries(ACCENT_SKIN_METADATA).map(([k, v]) => [
			k,
			{ primary: v.primaryHex, contrast: v.contrastHex },
		]),
	),
)};var s=cfg&&cfg.accentSkin&&skins[cfg.accentSkin];if(s){document.documentElement.style.setProperty('--accent',s.primary);document.documentElement.style.setProperty('--accent-contrast',s.contrast);document.documentElement.style.setProperty('--accent-text',s.primary);}}catch(e){}})();`;

export const DARK_SURFACE_METADATA: Record<
	DarkSurfaceTone,
	{ label: string; bgHex: string; panelHex: string; description: string }
> = {
	oled: {
		label: 'Pure OLED',
		bgHex: '#000000',
		panelHex: '#0A0A0C',
		description: 'Абсолютний 100% чорний для максимального контрасту OLED-екранів',
	},
	obsidian: {
		label: 'Obsidian',
		bgHex: '#070809',
		panelHex: '#101215',
		description: 'Глибокий контрастний чорний обсидіан',
	},
	carbon: {
		label: 'Matte Carbon',
		bgHex: '#121315',
		panelHex: '#1C1E22',
		description: 'Матовий графітовий карбон студійних пристроїв',
	},
	tinted: {
		label: 'Tinted',
		bgHex: '#0B0C12',
		panelHex: '#12131C',
		description: 'Студійна поверхня з легким відтінком обраного акценту',
	},
};

export const LIGHT_SURFACE_METADATA: Record<
	LightSurfaceTone,
	{ label: string; bgHex: string; panelHex: string; description: string }
> = {
	pure: {
		label: 'Pure White',
		bgHex: '#FFFFFF',
		panelHex: '#F8F9FA',
		description: 'Максимально чистий 100% білий контрастний фон (протилежність OLED)',
	},
	anodized: {
		label: 'Anodized Silver',
		bgHex: '#DCE0E5',
		panelHex: '#ECEEF1',
		description: 'Студійний анодований алюміній Apple & Teenage',
	},
	cotton: {
		label: 'Warm Cotton',
		bgHex: '#E6E2D8',
		panelHex: '#F4F1EA',
		description: 'Теплий бавовняний папір партитур та скетчбуків',
	},
	tinted: {
		label: 'Tinted',
		bgHex: '#F6F8FB',
		panelHex: '#FAFBFE',
		description: 'Світла поверхня з легким відтінком обраного акценту',
	},
};

export function createNotykaTheme(config: AppearanceConfig = DEFAULT_APPEARANCE_CONFIG) {
	const activeSkin = config.accentSkin || 'cobalt';

	return createTheme({
		primaryColor: activeSkin,
		primaryShade: { light: 6, dark: 5 },
		autoContrast: true,
		luminanceThreshold: 0.35,
		fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
		fontFamilyMonospace:
			"'JetBrains Mono', 'SF Mono', 'Fira Code', 'Roboto Mono', Consolas, monospace",
		radius: {
			xs: '6px',
			sm: '10px',
			md: '14px',
			lg: '18px',
			xl: '26px',
		},
		defaultRadius: 'md',
		shadows: {
			xs: 'none',
			sm: 'none',
			md: 'none',
			lg: 'none',
			xl: 'none',
		},
		colors: {
			...ACCENT_PALETTES,
			// Cobalt alias for Mantine components
			sky: ACCENT_PALETTES.cobalt,
			red: [
				'#fef2f2',
				'#fee2e2',
				'#fecaca',
				'#fca5a5',
				'#f87171',
				'#ef4444',
				'#dc2626',
				'#b91c1c',
				'#991b1b',
				'#7f1d1d',
			],
			dark: [
				'#f5f6f8', // 0: primary crisp readable text
				'#d4d8e0', // 1: secondary text
				'#9ea4b0', // 2: muted labels
				'#6b7382', // 3: subtle text / dim
				'#3b404a', // 4: simple border
				'#383e4a', // 5: Slate card / active element (elevated contrast)
				'#24272d', // 6: elevated panel / control background
				'#1c1e22', // 7: panel / card surface
				'#15171a', // 8: organic matte dark charcoal
				'#0e1012', // 9: canvas void backdrop
			],
		},
		cursorType: 'pointer',
		components: {
			Button: {
				defaultProps: {
					radius: 'md',
					size: 'xs',
				},
			},
			ActionIcon: {
				defaultProps: {
					radius: 'md',
					size: 'sm',
					variant: 'subtle',
				},
			},
			Modal: {
				defaultProps: {
					radius: 'xl',
					centered: true,
					overlayProps: {
						backgroundOpacity: 0.65,
						blur: 0,
					},
				},
			},
			SegmentedControl: {
				defaultProps: {
					radius: 'xl',
					size: 'xs',
					withItemsBorders: false,
				},
			},
			Switch: {
				defaultProps: {
					radius: 'xl',
					size: 'sm',
				},
			},
			Badge: {
				defaultProps: {
					radius: 'xl',
					size: 'xs',
				},
			},
			Paper: {
				defaultProps: {
					radius: 'lg',
				},
			},
			Card: {
				defaultProps: {
					radius: 'lg',
				},
			},
			Popover: {
				defaultProps: {
					radius: 'lg',
					shadow: 'none',
				},
			},
			Menu: {
				defaultProps: {
					radius: 'lg',
					shadow: 'none',
				},
			},
			NavLink: {
				defaultProps: {
					radius: 'md',
				},
			},
			Tooltip: {
				defaultProps: {
					radius: 'md',
					withArrow: true,
				},
			},
			Slider: {
				defaultProps: {
					radius: 'md',
				},
			},
			TextInput: {
				defaultProps: {
					radius: 'md',
					variant: 'filled',
				},
			},
			Textarea: {
				defaultProps: {
					radius: 'md',
					variant: 'filled',
				},
			},
			Select: {
				defaultProps: {
					radius: 'md',
					variant: 'filled',
				},
			},
			NumberInput: {
				defaultProps: {
					radius: 'md',
					variant: 'filled',
				},
			},
		},
	});
}

export function createNotykaCssVariablesResolver(
	config: AppearanceConfig = DEFAULT_APPEARANCE_CONFIG,
): CSSVariablesResolver {
	const activeSkin = config.accentSkin || 'cobalt';
	const darkTone = config.darkTone || 'obsidian';
	const lightTone = config.lightTone || 'pure';

	const skinMeta = ACCENT_SKIN_METADATA[activeSkin] ?? ACCENT_SKIN_METADATA.cobalt;

	// Dark tone variables
	const darkSurfaces = (() => {
		switch (darkTone) {
			case 'oled':
				return {
					bgDark: '#000000',
					bg: '#000000',
					panel: '#0a0a0c',
					panel2: '#121215',
					panel3: '#1e1e24',
					line: 'rgba(255, 255, 255, 0.08)',
					lineStrong: 'rgba(255, 255, 255, 0.16)',
					surfaceSpecular: 'rgba(255, 255, 255, 0.05)',
					keycapBg: '#121215',
					keycapBorder: 'rgba(255, 255, 255, 0.1)',
					keycapShadow: 'none',
					readoutBg: '#000000',
					readoutBorder: 'rgba(255, 255, 255, 0.14)',
				};
			case 'tinted':
				return {
					bgDark: `color-mix(in srgb, ${skinMeta.primaryHex} 4%, #07070a)`,
					bg: `color-mix(in srgb, ${skinMeta.primaryHex} 6%, #0b0c12)`,
					panel: `color-mix(in srgb, ${skinMeta.primaryHex} 8%, #12131c)`,
					panel2: `color-mix(in srgb, ${skinMeta.primaryHex} 11%, #181a26)`,
					panel3: `color-mix(in srgb, ${skinMeta.primaryHex} 16%, #282b3d)`,
					line: `color-mix(in srgb, ${skinMeta.primaryHex} 12%, rgba(255, 255, 255, 0.08))`,
					lineStrong: `color-mix(in srgb, ${skinMeta.primaryHex} 20%, rgba(255, 255, 255, 0.16))`,
					surfaceSpecular: `color-mix(in srgb, ${skinMeta.primaryHex} 10%, rgba(255, 255, 255, 0.05))`,
					keycapBg: `color-mix(in srgb, ${skinMeta.primaryHex} 11%, #181a26)`,
					keycapBorder: `color-mix(in srgb, ${skinMeta.primaryHex} 18%, rgba(255, 255, 255, 0.1))`,
					keycapShadow: 'none',
					readoutBg: `color-mix(in srgb, ${skinMeta.primaryHex} 5%, #08080d)`,
					readoutBorder: `color-mix(in srgb, ${skinMeta.primaryHex} 22%, rgba(255, 255, 255, 0.14))`,
				};
			case 'obsidian':
				return {
					bgDark: '#070809',
					bg: '#0a0b0d',
					panel: '#101215',
					panel2: '#17191e',
					panel3: '#2d333d',
					line: 'rgba(255, 255, 255, 0.07)',
					lineStrong: 'rgba(255, 255, 255, 0.14)',
					surfaceSpecular: 'rgba(255, 255, 255, 0.05)',
					keycapBg: '#17191e',
					keycapBorder: 'rgba(255, 255, 255, 0.09)',
					keycapShadow: 'none',
					readoutBg: '#070809',
					readoutBorder: 'rgba(255, 255, 255, 0.12)',
				};
			case 'carbon':
			default:
				return {
					bgDark: '#121315',
					bg: '#15171a',
					panel: '#1c1e22',
					panel2: '#24272d',
					panel3: '#383e4a',
					line: 'rgba(255, 255, 255, 0.08)',
					lineStrong: 'rgba(255, 255, 255, 0.16)',
					surfaceSpecular: 'rgba(255, 255, 255, 0.06)',
					keycapBg: '#24272d',
					keycapBorder: 'rgba(255, 255, 255, 0.11)',
					keycapShadow: 'none',
					readoutBg: '#121315',
					readoutBorder: 'rgba(255, 255, 255, 0.14)',
				};
		}
	})();

	// Light tone variables
	const lightSurfaces = (() => {
		switch (lightTone) {
			case 'pure':
				return {
					bgDark: '#ffffff',
					bg: '#ffffff',
					panel: '#f8f9fa',
					panel2: '#f1f3f5',
					panel3: '#e9ecef',
					line: 'rgba(0, 0, 0, 0.07)',
					lineStrong: '#e2e5e8',
					surfaceSpecular: 'rgba(255, 255, 255, 0.95)',
					keycapBg: '#ffffff',
					keycapBorder: '#e2e5e8',
					keycapShadow: 'none',
					readoutBg: '#ffffff',
					readoutBorder: '#dee2e6',
				};
			case 'tinted':
				return {
					bgDark: `color-mix(in srgb, ${skinMeta.primaryHex} 4%, #f1f3f7)`,
					bg: `color-mix(in srgb, ${skinMeta.primaryHex} 5%, #f6f8fb)`,
					panel: `color-mix(in srgb, ${skinMeta.primaryHex} 7%, #fafbfe)`,
					panel2: `color-mix(in srgb, ${skinMeta.primaryHex} 10%, #eff2f8)`,
					panel3: `color-mix(in srgb, ${skinMeta.primaryHex} 14%, #e2e6f1)`,
					line: `color-mix(in srgb, ${skinMeta.primaryHex} 10%, rgba(0, 0, 0, 0.08))`,
					lineStrong: `color-mix(in srgb, ${skinMeta.primaryHex} 18%, #cdd3e2)`,
					surfaceSpecular: 'rgba(255, 255, 255, 0.85)',
					keycapBg: '#ffffff',
					keycapBorder: `color-mix(in srgb, ${skinMeta.primaryHex} 15%, #d5dae6)`,
					keycapShadow: 'none',
					readoutBg: `color-mix(in srgb, ${skinMeta.primaryHex} 6%, #eff2f8)`,
					readoutBorder: `color-mix(in srgb, ${skinMeta.primaryHex} 18%, #cbd1e0)`,
				};
			case 'cotton':
				return {
					bgDark: '#e6e2d8',
					bg: '#ece8df',
					panel: '#f4f1ea',
					panel2: '#e5e1d7',
					panel3: '#d9d4c7',
					line: 'rgba(0, 0, 0, 0.08)',
					lineStrong: '#d5cfc3',
					surfaceSpecular: 'rgba(255, 255, 255, 0.65)',
					keycapBg: '#faf8f4',
					keycapBorder: '#d8d2c6',
					keycapShadow: 'none',
					readoutBg: '#e5e1d7',
					readoutBorder: '#d0c9bc',
				};
			case 'anodized':
			default:
				return {
					bgDark: '#dce0e5',
					bg: '#e4e7ec',
					panel: '#eceef1',
					panel2: '#dee2e7',
					panel3: '#cfd5dc',
					line: 'rgba(0, 0, 0, 0.08)',
					lineStrong: '#c8ced6',
					surfaceSpecular: 'rgba(255, 255, 255, 0.75)',
					keycapBg: '#ffffff',
					keycapBorder: '#cbd1d9',
					keycapShadow: 'none',
					readoutBg: '#dee2e7',
					readoutBorder: '#c4cacf',
				};
		}
	})();

	return () => ({
		variables: {
			'--accent': skinMeta.primaryHex,
			'--accent-contrast': skinMeta.contrastHex,
			'--accent-text': skinMeta.primaryHex,
		},
		dark: {
			'--bg-dark': darkSurfaces.bgDark,
			'--bg': darkSurfaces.bg,
			'--panel': darkSurfaces.panel,
			'--panel-2': darkSurfaces.panel2,
			'--panel-3': darkSurfaces.panel3,
			'--panel-bg-translucent': darkSurfaces.panel,
			'--popup-bg': darkSurfaces.panel,
			'--top-bar-gradient': darkSurfaces.panel,
			'--line': darkSurfaces.line,
			'--line-strong': darkSurfaces.lineStrong,
			'--surface-specular': darkSurfaces.surfaceSpecular,
			'--keycap-bg': darkSurfaces.keycapBg,
			'--keycap-border': darkSurfaces.keycapBorder,
			'--keycap-shadow': darkSurfaces.keycapShadow,
			'--readout-bg': darkSurfaces.readoutBg,
			'--readout-border': darkSurfaces.readoutBorder,
			'--text': '#f5f6f8',
			'--text-secondary': '#9ea4b0',
			'--muted': '#6b7382',
			'--accent': skinMeta.primaryHex,
			'--accent-hover': skinMeta.primaryHex,
			'--accent-contrast': skinMeta.contrastHex,
			'--accent-text': skinMeta.primaryHex,
			'--accent-gradient': skinMeta.primaryHex,
			'--accent-glow': 'none',
			'--accent-subtle': `color-mix(in srgb, ${skinMeta.primaryHex} 16%, transparent)`,
			'--accent-subtle-hover': `color-mix(in srgb, ${skinMeta.primaryHex} 26%, transparent)`,
			'--accent-border': `color-mix(in srgb, ${skinMeta.primaryHex} 40%, transparent)`,
			'--segmented-indicator-bg': darkSurfaces.panel3,
			'--segmented-active-color': '#ffffff',
		},
		light: {
			'--bg-dark': lightSurfaces.bgDark,
			'--bg': lightSurfaces.bg,
			'--panel': lightSurfaces.panel,
			'--panel-2': lightSurfaces.panel2,
			'--panel-3': lightSurfaces.panel3,
			'--panel-bg-translucent': lightSurfaces.panel,
			'--popup-bg': lightSurfaces.panel,
			'--top-bar-gradient': lightSurfaces.panel,
			'--line': lightSurfaces.line,
			'--line-strong': lightSurfaces.lineStrong,
			'--surface-specular': lightSurfaces.surfaceSpecular,
			'--keycap-bg': lightSurfaces.keycapBg,
			'--keycap-border': lightSurfaces.keycapBorder,
			'--keycap-shadow': lightSurfaces.keycapShadow,
			'--readout-bg': lightSurfaces.readoutBg,
			'--readout-border': lightSurfaces.readoutBorder,
			'--text': '#141619',
			'--text-secondary': '#4d535e',
			'--muted': '#727986',
			'--accent': skinMeta.primaryHex,
			'--accent-hover': skinMeta.primaryHex,
			'--accent-contrast': skinMeta.contrastHex,
			'--accent-text': skinMeta.primaryHex,
			'--accent-gradient': skinMeta.primaryHex,
			'--accent-glow': 'none',
			'--accent-subtle': `color-mix(in srgb, ${skinMeta.primaryHex} 12%, transparent)`,
			'--accent-subtle-hover': `color-mix(in srgb, ${skinMeta.primaryHex} 20%, transparent)`,
			'--accent-border': `color-mix(in srgb, ${skinMeta.primaryHex} 32%, transparent)`,
			'--segmented-indicator-bg': '#ffffff',
			'--segmented-active-color': '#0e1013',
		},
	});
}

export const theme = createNotykaTheme(DEFAULT_APPEARANCE_CONFIG);
export const cssVariablesResolver = createNotykaCssVariablesResolver(DEFAULT_APPEARANCE_CONFIG);
