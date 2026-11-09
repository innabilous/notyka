import { createTheme } from '@mantine/core';

export const theme = createTheme({
	primaryColor: 'sky',
	primaryShade: { light: 6, dark: 5 },
	autoContrast: true,
	defaultGradient: { from: 'sky.4', to: 'sky.6', deg: 135 },
	colors: {
		sky: [
			'#f0f9ff',
			'#e0f2fe',
			'#bae6fd',
			'#7dd3fc',
			'#38bdf8',
			'#0ea5e9',
			'#0284c7',
			'#0369a1',
			'#075985',
			'#0c4a6e',
		],
		dark: [
			'#c7cad1',
			'#7e8390',
			'#2e323b',
			'#202227',
			'#16171b',
			'#121316',
			'#0f1013',
			'#090a0c',
			'#050507',
			'#000000',
		],
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
	},
	defaultRadius: 'md',
	cursorType: 'pointer',
	components: {
		Button: {
			defaultProps: {
				radius: 'md',
				color: 'sky',
			},
		},
		ActionIcon: {
			defaultProps: {
				radius: 'md',
				variant: 'subtle',
				color: 'sky',
			},
		},
		Modal: {
			defaultProps: {
				radius: 'lg',
				centered: true,
				overlayProps: {
					backgroundOpacity: 0.7,
					blur: 8,
				},
			},
			styles: {
				content: {
					background: 'var(--panel)',
					border: '1px solid var(--line-strong)',
					boxShadow: 'var(--shadow-lg)',
				},
				header: {
					background: 'var(--panel)',
					borderBottom: '1px solid var(--line)',
				},
			},
		},
		SegmentedControl: {
			defaultProps: {
				radius: 'xl',
				color: 'sky',
			},
		},
		Switch: {
			defaultProps: {
				color: 'sky',
				radius: 'xl',
			},
		},
		Badge: {
			defaultProps: {
				color: 'sky',
				radius: 'sm',
			},
		},
		Paper: {
			defaultProps: {
				radius: 'md',
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
				radius: 'sm',
				withArrow: true,
			},
		},
		Slider: {
			defaultProps: {
				color: 'sky',
			},
		},
		NavLink: {
			defaultProps: {
				color: 'sky',
			},
		},
		TextInput: {
			defaultProps: {
				radius: 'md',
			},
		},
		Textarea: {
			defaultProps: {
				radius: 'md',
			},
		},
	},
});

