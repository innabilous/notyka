import { createTheme } from '@mantine/core';

export const theme = createTheme({
	primaryColor: 'sky',
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
	},
	defaultRadius: 'md',
	cursorType: 'pointer',
	components: {
		Button: {
			defaultProps: {
				radius: 'md',
			},
		},
		ActionIcon: {
			defaultProps: {
				radius: 'md',
				variant: 'subtle',
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
		},
		SegmentedControl: {
			defaultProps: {
				radius: 'xl',
				color: 'sky',
			},
		},
		Paper: {
			defaultProps: {
				radius: 'md',
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
	},
});
