export const NOTES = ['до', 'ре', 'мі', 'фа', 'соль', 'ля', 'сі'] as const;
export const ACCIDENTALS = ['♭', '♯'] as const;

export const COUNT_ITEMS = ['1', '2', '3', '4', 'і', 'та', 'на'] as const;

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

export const PALETTE_COLORS: readonly string[] = [
	'#ffffff',
	'#000000',
	'#ff0055',
	'#ed1c24',
	'#ff7f27',
	'#fff200',
	'#22b14c',
	'#00a2e8',
	'#3f48cc',
	'#a349a4',
];

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 8;
export const MAX_PIXELS = 36e6;
export const MAX_SIDE = 8192;
export const DRAG_SLOP = 8;
export const SMOOTH = 0.35;
export const MAX_HISTORY = 20;
