import { CSSVariablesResolver, MantineColorsTuple, createTheme } from '@mantine/core';
import { AccentSkin, AppearanceConfig, DarkSurfaceTone, LightSurfaceTone } from '@/types/editor';

export const DEFAULT_APPEARANCE_CONFIG: AppearanceConfig = {
	accentSkin: 'cobalt',
	darkTone: 'obsidian',
	lightTone: 'anodized',
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
	purple: {
		label: 'Electric Purple',
		primaryHex: '#8B5CF6',
		contrastHex: '#FFFFFF',
		description: 'Енергійний студійний фіолетовий акцент',
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
				'#383e4a', // 5: Slate card / active element (підвищений контраст)
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
				styles: {
					root: {
						border: 'none',
					},
				},
			},
			ActionIcon: {
				defaultProps: {
					radius: 'md',
					size: 'sm',
					variant: 'subtle',
				},
				styles: {
					root: {
						border: 'none',
					},
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
				styles: {
					content: {
						background: 'var(--panel)',
						border: 'none',
						boxShadow: 'none',
					},
					header: {
						background: 'var(--panel)',
						borderBottom: 'none',
						padding: '14px 18px',
					},
					body: {
						padding: '16px 18px',
					},
				},
			},
			SegmentedControl: {
				defaultProps: {
					radius: 'xl',
					size: 'xs',
					withItemsBorders: false,
				},
				styles: {
					root: {
						borderRadius: '14px',
						border: 'none',
						background: 'var(--panel-2)',
						padding: '3px',
					},
					indicator: {
						borderRadius: '12px',
						boxShadow: 'none',
					},
				},
			},
			Switch: {
				defaultProps: {
					radius: 'xl',
					size: 'sm',
				},
				styles: {
					root: {
						'--switch-width-sm': '38px',
						'--switch-height-sm': '22px',
						'--switch-thumb-size-sm': '16px',
						'--switch-track-label-padding-sm': '3px',
					},
					track: {
						borderRadius: '9999px',
						border: 'none',
						cursor: 'pointer',
					},
					thumb: {
						borderRadius: '50%',
						border: 'none',
						background: '#ffffff',
						boxShadow: 'none',
					},
				},
			},
			Badge: {
				defaultProps: {
					radius: 'xl',
					size: 'xs',
				},
				styles: {
					root: {
						border: 'none',
					},
				},
			},
			Paper: {
				defaultProps: {
					radius: 'lg',
				},
				styles: {
					root: {
						border: 'none',
					},
				},
			},
			Card: {
				defaultProps: {
					radius: 'lg',
				},
				styles: {
					root: {
						border: 'none',
					},
				},
			},
			Popover: {
				defaultProps: {
					radius: 'lg',
					shadow: 'none',
				},
				styles: {
					dropdown: {
						border: 'none',
						borderRadius: '16px',
						background: 'var(--popup-bg)',
						boxShadow: 'none',
					},
				},
			},
			Menu: {
				defaultProps: {
					radius: 'lg',
					shadow: 'none',
				},
				styles: {
					dropdown: {
						border: 'none',
						borderRadius: '16px',
						background: 'var(--popup-bg)',
						padding: '4px',
						boxShadow: 'none',
					},
					item: {
						borderRadius: '12px',
					},
				},
			},
			NavLink: {
				defaultProps: {
					radius: 'md',
				},
				styles: {
					root: {
						borderRadius: '12px',
					},
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
					radius: 'md',
					withArrow: true,
				},
				styles: {
					tooltip: {
						borderRadius: '8px',
						border: 'none',
						background: 'var(--panel-3)',
						color: 'var(--text)',
						fontSize: '0.75rem',
					},
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
				styles: {
					input: {
						borderRadius: '12px',
						border: 'none',
						background: 'var(--panel-2)',
						color: 'var(--text)',
					},
				},
			},
			Textarea: {
				defaultProps: {
					radius: 'md',
					variant: 'filled',
				},
				styles: {
					input: {
						borderRadius: '12px',
						border: 'none',
						background: 'var(--panel-2)',
						color: 'var(--text)',
					},
				},
			},
			Select: {
				defaultProps: {
					radius: 'md',
					variant: 'filled',
				},
				styles: {
					input: {
						borderRadius: '12px',
						border: 'none',
						background: 'var(--panel-2)',
						color: 'var(--text)',
					},
					dropdown: {
						borderRadius: '14px',
						border: 'none',
						background: 'var(--popup-bg)',
					},
				},
			},
			NumberInput: {
				defaultProps: {
					radius: 'md',
					variant: 'filled',
				},
				styles: {
					input: {
						borderRadius: '12px',
						border: 'none',
						background: 'var(--panel-2)',
						color: 'var(--text)',
					},
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
					panel3: '#2d333d',
					line: 'rgba(255, 255, 255, 0.07)',
					lineStrong: 'rgba(255, 255, 255, 0.14)',
					surfaceSpecular: 'rgba(255, 255, 255, 0.05)',
					keycapBg: '#17191e',
					keycapBorder: 'rgba(255, 255, 255, 0.09)',
					keycapShadow: 'none',
					readoutBg: '#070809',
					readoutBorder: 'rgba(255, 255, 255, 0.12)',
				}
			: {
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

	// Light tone variables
	const lightSurfaces =
		lightTone === 'anodized'
			? {
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
				}
			: {
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
};

export const theme = createNotykaTheme(DEFAULT_APPEARANCE_CONFIG);
export const cssVariablesResolver = createNotykaCssVariablesResolver(DEFAULT_APPEARANCE_CONFIG);
