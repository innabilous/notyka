import { SelectFilterCategory, StampCategory } from '@/types/editor.types';

export const STAMP_CATEGORIES: readonly { id: StampCategory; label: string }[] = [
	{ id: 'notes', label: 'Ноти' },
	{ id: 'chords', label: 'Акорди' },
	{ id: 'count', label: 'Рахунок' },
	{ id: 'custom', label: 'Власні' },
	{ id: 'text', label: 'Текст' },
	{ id: 'draw', label: 'Малюнок' },
	{ id: 'shapes', label: 'Фігури' },
] as const;

export const SELECT_FILTER_CATEGORIES: readonly { id: SelectFilterCategory; label: string }[] = [
	{ id: 'all', label: 'Всі' },
	...STAMP_CATEGORIES,
] as const;

export const NOTES: readonly string[] = ['До', 'Ре', 'Мі', 'Фа', 'Соль', 'Ля', 'Сі'];
export const ACCIDENTALS = ['♯', '♭'] as const;

export const CHORD_ROOTS: readonly string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
export const CHORD_ACCIDENTALS = ['#', 'b'] as const;

export const CHORD_QUALITIES = [
	'm',
	'7',
	'maj7',
	'm7',
	'sus4',
	'sus2',
	'dim',
	'aug',
] as const;

export const CHORD_EXTENSIONS = [
	'6',
	'm6',
	'9',
	'maj9',
	'm9',
	'add9',
	'11',
	'5',
] as const;

export const COUNT_ITEMS: readonly string[] = [
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'і',
	'та',
	'на',
];

// Default 16-step auto-count pattern (1, 2, 3, 4 on downbeats with empty sub-steps)
export const DEFAULT_COUNT_PATTERN: readonly string[] = [
	'1', '', '', '',
	'2', '', '', '',
	'3', '', '', '',
	'4', '', '', '',
];

export const MAX_COUNT_PATTERN_LENGTH = 64;
export const MIN_COUNT_PATTERN_LENGTH = 16;
export const COUNT_PATTERN_STEP = 16;

export const DEFAULT_AUTO_COUNT_SEQUENCE = [
	{ id: 'ac_1', text: '1', enabled: true },
	{ id: 'ac_2', text: 'та', enabled: true },
	{ id: 'ac_3', text: 'і', enabled: true },
	{ id: 'ac_4', text: 'та', enabled: true },
	{ id: 'ac_5', text: '2', enabled: true },
	{ id: 'ac_6', text: 'та', enabled: true },
	{ id: 'ac_7', text: 'і', enabled: true },
	{ id: 'ac_8', text: 'та', enabled: true },
	{ id: 'ac_9', text: '3', enabled: true },
	{ id: 'ac_10', text: 'та', enabled: true },
	{ id: 'ac_11', text: 'і', enabled: true },
	{ id: 'ac_12', text: 'та', enabled: true },
	{ id: 'ac_13', text: '4', enabled: true },
	{ id: 'ac_14', text: 'та', enabled: true },
	{ id: 'ac_15', text: 'і', enabled: true },
	{ id: 'ac_16', text: 'та', enabled: true },
];

export const REMARKS_ITEMS = [
	'p',
	'mp',
	'mf',
	'f',
	'ff',
	'rit.',
	'cresc.',
	'dim.',
	'fine',
	'V',
	'П',
	'𝄐',
] as const;
