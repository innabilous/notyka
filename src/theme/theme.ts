import { CSSVariablesResolver, MantineColorsTuple, createTheme } from '@mantine/core';
import { AccentSkin, AppearanceConfig, DarkSurfaceTone, LightSurfaceTone } from '@/types/editor';

export const DEFAULT_APPEARANCE_CONFIG: AppearanceConfig = {
	accentSkin: 'orange',
	darkTone: 'carbon',
	lightTone: 'cotton',
};

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
	{ label: string; primaryHex: string; contrastHex: string; description: string }
> = {
	orange: {
		label: 'Teenage Orange',
		primaryHex: '#FF5500',
		contrastHex: '#FFFFFF',
		description: 'Культовий апаратний акцент Teenage Engineering',
	},
	cobalt: {
		label: 'Cobalt Studio',
		primaryHex: '#2563EB',
		contrastHex: '#FFFFFF',
		description: 'Глибокий інженерний індиго-кобальт Bauhaus',
	},
	lime: {
		label: 'Acid Lime',
		primaryHex: '#84CC16',
		contrastHex: '#0E1013',
		description: 'Висококонтрастний студійний лайм Linear',
	},
	amber: {
		label: 'Hardware Amber',
		primaryHex: '#F59E0B',
		contrastHex: '#0E1013',
		description: 'Теплий аналоговий індикатор апаратури',
	},
};

export const DARK_SURFACE_METADATA: Record<
	DarkSurfaceTone,
	{ label: string; bgHex: string; panelHex: string; description: string }
> = {
	carbon: {
		label: 'Matte Carbon',
		bgHex: '#121315',
		panelHex: '#1C1E22',
		description: 'Матовий графітовий карбон студійних пристроїв',
	},
	obsidian: {
		label: 'OLED Obsidian',
		bgHex: '#070809',
		panelHex: '#101215',
		description: 'Глибокий контрастний чорний для OLED-екранів',
	},
};

export const LIGHT_SURFACE_METADATA: Record<
	LightSurfaceTone,
	{ label: string; bgHex: string; panelHex: string; description: string }
> = {
	cotton: {
		label: 'Warm Cotton',
		bgHex: '#E6E2D8',
		panelHex: '#F4F1EA',
		description: 'Теплий бавовняний папір партитур та скетчбуків',
	},
	anodized: {
		label: 'Anodized Silver',
		bgHex: '#DCE0E5',
		panelHex: '#ECEEF1',
		description: 'Студійний анодований алюміній Apple & Teenage',
	},
};

export const createNotykaTheme = (config: AppearanceConfig = DEFAULT_APPEARANCE_CONFIG) => {
	const activeSkin = config.accentSkin || 'orange';

	return createTheme({
		primaryColor: activeSkin,
		primaryShade: { light: 6, dark: 5 },
		autoContrast: true,
		luminanceThreshold: 0.35,
		fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
		fontFamilyMonospace:
			"'JetBrains Mono', 'SF Mono', 'Fira Code', 'Roboto Mono', Consolas, monospace",
		radius: {
			xs: '3px',
			sm: '5px',
			md: '7px',
			lg: '10px',
			xl: '12px',
		},
		defaultRadius: 'sm',
		shadows: {
			xs: '0 1px 2px rgba(0, 0, 0, 0.08)',
			sm: '0 1px 3px rgba(0, 0, 0, 0.14), inset 0 1px 0 var(--surface-specular, rgba(255, 255, 255, 0.06))',
			md: '0 3px 8px rgba(0, 0, 0, 0.18), inset 0 1px 0 var(--surface-specular, rgba(255, 255, 255, 0.08))',
			lg: '0 6px 16px rgba(0, 0, 0, 0.22), 0 1px 2px rgba(0, 0, 0, 0.12)',
			xl: '0 12px 28px rgba(0, 0, 0, 0.32), 0 2px 4px rgba(0, 0, 0, 0.16)',
		},
		colors: {
			...ACCENT_PALETTES,
			// Підтримка legacy-коду, що може посилатися на sky
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
				'#2c3038', // 5: Slate card / active element
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
					radius: 'sm',
					size: 'xs',
				},
			},
			ActionIcon: {
				defaultProps: {
					radius: 'sm',
					size: 'sm',
					variant: 'subtle',
				},
			},
			Modal: {
				defaultProps: {
					radius: 'lg',
					centered: true,
					overlayProps: {
						backgroundOpacity: 0.65,
						blur: 0,
					},
				},
				styles: {
					content: {
						background: 'var(--panel)',
						border: '1px solid var(--line-strong)',
						boxShadow: 'var(--shadow-xl)',
					},
					header: {
						background: 'var(--panel)',
						borderBottom: '1px solid var(--line)',
						padding: '12px 16px',
					},
					body: {
						padding: '16px',
					},
				},
			},
			SegmentedControl: {
				defaultProps: {
					radius: 'sm',
					size: 'xs',
				},
			},
			Switch: {
				defaultProps: {
					radius: 'sm',
				},
			},
			Badge: {
				defaultProps: {
					radius: 'xs',
					size: 'xs',
				},
			},
			Paper: {
				defaultProps: {
					radius: 'sm',
				},
			},
			Divider: {
				styles: {
					root: {
						borderColor: 'var(--line)',
					},
				},
			},
			Tooltip: {
				defaultProps: {
					radius: 'xs',
					withArrow: true,
				},
			},
			Slider: {
				defaultProps: {
					radius: 'xs',
				},
			},
			NavLink: {
				defaultProps: {
					radius: 'sm',
				},
			},
			TextInput: {
				defaultProps: {
					radius: 'sm',
				},
			},
			Textarea: {
				defaultProps: {
					radius: 'sm',
				},
			},
		},
	});
};

export const createNotykaCssVariablesResolver = (
	config: AppearanceConfig = DEFAULT_APPEARANCE_CONFIG,
): CSSVariablesResolver => {
	const activeSkin = config.accentSkin || 'orange';
	const darkTone = config.darkTone || 'carbon';
	const lightTone = config.lightTone || 'cotton';

	const skinMeta = ACCENT_SKIN_METADATA[activeSkin] ?? ACCENT_SKIN_METADATA.orange;

	// Dark tone variables
	const darkSurfaces =
		darkTone === 'obsidian'
			? {
					bgDark: '#070809',
					bg: '#0a0b0d',
					panel: '#101215',
					panel2: '#17191e',
					panel3: '#20232a',
					line: 'rgba(255, 255, 255, 0.07)',
					lineStrong: 'rgba(255, 255, 255, 0.14)',
					surfaceSpecular: 'rgba(255, 255, 255, 0.05)',
					keycapBg: '#17191e',
					keycapBorder: 'rgba(255, 255, 255, 0.09)',
					keycapShadow: '0 1px 2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
					readoutBg: '#070809',
					readoutBorder: 'rgba(255, 255, 255, 0.12)',
				}
			: {
					bgDark: '#121315',
					bg: '#15171a',
					panel: '#1c1e22',
					panel2: '#24272d',
					panel3: '#2c3038',
					line: 'rgba(255, 255, 255, 0.08)',
					lineStrong: 'rgba(255, 255, 255, 0.16)',
					surfaceSpecular: 'rgba(255, 255, 255, 0.06)',
					keycapBg: '#24272d',
					keycapBorder: 'rgba(255, 255, 255, 0.11)',
					keycapShadow: '0 1px 2px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
					readoutBg: '#121315',
					readoutBorder: 'rgba(255, 255, 255, 0.14)',
				};

	// Light tone variables
	const lightSurfaces =
		lightTone === 'anodized'
			? {
					bgDark: '#dce0e5',
					bg: '#e4e7ec',
					panel: '#eceef1',
					panel2: '#f7f8fa',
					panel3: '#dadfe5',
					line: 'rgba(0, 0, 0, 0.08)',
					lineStrong: '#c8ced6',
					surfaceSpecular: 'rgba(255, 255, 255, 0.75)',
					keycapBg: '#ffffff',
					keycapBorder: '#cbd1d9',
					keycapShadow: '0 1px 2px rgba(0, 0, 0, 0.06), inset 0 1px 0 #ffffff',
					readoutBg: '#dfe3e8',
					readoutBorder: '#c4cacf',
				}
			: {
					bgDark: '#e6e2d8',
					bg: '#ece8df',
					panel: '#f4f1ea',
					panel2: '#faf8f4',
					panel3: '#e3dfd5',
					line: 'rgba(0, 0, 0, 0.08)',
					lineStrong: '#d5cfc3',
					surfaceSpecular: 'rgba(255, 255, 255, 0.65)',
					keycapBg: '#faf8f4',
					keycapBorder: '#d8d2c6',
					keycapShadow: '0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
					readoutBg: '#e7e3d9',
					readoutBorder: '#d0c9bc',
				};

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
			'--accent-subtle': `color-mix(in srgb, ${skinMeta.primaryHex} 16%, transparent)`,
			'--accent-subtle-hover': `color-mix(in srgb, ${skinMeta.primaryHex} 26%, transparent)`,
			'--accent-border': `color-mix(in srgb, ${skinMeta.primaryHex} 40%, transparent)`,
			'--segmented-indicator-bg': darkSurfaces.panel3,
			'--segmented-active-color': '#f5f6f8',
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
			'--accent-subtle': `color-mix(in srgb, ${skinMeta.primaryHex} 12%, transparent)`,
			'--accent-subtle-hover': `color-mix(in srgb, ${skinMeta.primaryHex} 20%, transparent)`,
			'--accent-border': `color-mix(in srgb, ${skinMeta.primaryHex} 32%, transparent)`,
			'--segmented-indicator-bg': '#ffffff',
			'--segmented-active-color': '#141619',
		},
	});
};

export const theme = createNotykaTheme(DEFAULT_APPEARANCE_CONFIG);
export const cssVariablesResolver = createNotykaCssVariablesResolver(DEFAULT_APPEARANCE_CONFIG);
