import { describe, expect, it } from 'vitest';
import { buildChordText } from '@/components/editor/photo-editor';
import { formatElementsCount } from '@/components/modals/projects-history-modal';
import {
	AppearanceConfigSchema,
	EditorSettingsSchema,
	ProjectItemSchema,
} from '@/schemas/editor';
import { parseAppearanceConfig } from '@/theme/app-theme-provider';
import { DEFAULT_APPEARANCE_CONFIG } from '@/theme/theme';
import { getStampCategory } from '@/utils/canvas-renderer';

describe('Zod Boundary Schemas', () => {
	it('validates AppearanceConfigSchema and falls back on invalid data', () => {
		const valid = AppearanceConfigSchema.safeParse({
			accentSkin: 'purple',
			darkTone: 'oled',
			lightTone: 'tinted',
		});
		expect(valid.success).toBe(true);

		const invalid = AppearanceConfigSchema.safeParse({
			accentSkin: 'unknown-skin',
			darkTone: 'oled',
			lightTone: 'anodized',
		});
		expect(invalid.success).toBe(false);

		expect(
			parseAppearanceConfig(
				JSON.stringify({
					accentSkin: 'lime',
					darkTone: 'obsidian',
					lightTone: 'pure',
				}),
			),
		).toEqual({
			accentSkin: 'lime',
			darkTone: 'obsidian',
			lightTone: 'pure',
		});

		expect(parseAppearanceConfig('invalid-json')).toEqual(DEFAULT_APPEARANCE_CONFIG);
		expect(parseAppearanceConfig('')).toEqual(DEFAULT_APPEARANCE_CONFIG);
	});

	it('validates EditorSettingsSchema with complete fields', () => {
		const parsed = EditorSettingsSchema.safeParse({
			currentMode: 'stamp',
			toolSizes: {
				select: 8,
				pencil: 2,
				stamp: 8,
				eraser: 24,
				ruler: 24,
			},
			toolColors: {
				pencil: { main: '#ef4444', stroke: '#000000' },
				stamp: { main: '#ef4444', stroke: 'transparent' },
			},
			selectedNote: 'До',
			selectedAccidental: '',
			stampCategory: 'chords',
			sizeLocked: false,
			noteSizes: { До: 12 },
			deleteBtnOn: true,
		});
		expect(parsed.success).toBe(true);

		const badMode = EditorSettingsSchema.safeParse({
			currentMode: 'invalid-mode',
		});
		expect(badMode.success).toBe(false);
	});

	it('validates ProjectItemSchema with discriminated layer union', () => {
		const validProject = {
			id: 'proj_1',
			title: 'Test Sheet',
			updatedAt: 1700000000000,
			thumbnail: 'data:image/jpeg;base64,abc',
			hasImage: false,
			bgDataUrl: null,
			baseDataUrl: 'data:image/png;base64,xyz',
			stamps: [
				{
					id: 's1',
					x: 100,
					y: 200,
					size: 12,
					category: 'notes',
					text: 'До',
					mainColor: '#ef4444',
					strokeColor: 'transparent',
				},
			],
			rulers: [{ id: 'r1', y: 150 }],
			history: [
				{
					stamps: [],
					rulers: [{ id: 'r1', y: 150 }],
					layers: [
						{ type: 'stroke', id: 'base', strokeDataUrl: 'data:image/png;base64,xyz' },
					],
				},
			],
			historyStep: 0,
			width: 1240,
			height: 1754,
			cssW: 620,
			cssH: 877,
		};

		const parsed = ProjectItemSchema.safeParse(validProject);
		expect(parsed.success).toBe(true);
	});
});

describe('buildChordText', () => {
	it('builds basic chords and modifiers', () => {
		expect(buildChordText('A', '', 'm', false, '', '')).toBe('Am');
		expect(buildChordText('F', '♯', 'maj7', false, '', '')).toBe('F♯maj7');
	});

	it('builds slash chords with bass notes', () => {
		expect(buildChordText('G', '', '', true, 'B', '')).toBe('G/B');
		expect(buildChordText('D', '', 'm', true, 'F', '♯')).toBe('Dm/F♯');
		expect(buildChordText('C', '', '', true, '', '')).toBe('C/');
	});
});

describe('formatElementsCount', () => {
	it('formats Ukrainian pluralization rules accurately', () => {
		expect(formatElementsCount(0)).toBe('0 елементів');
		expect(formatElementsCount(1)).toBe('1 елемент');
		expect(formatElementsCount(2)).toBe('2 елементи');
		expect(formatElementsCount(4)).toBe('4 елементи');
		expect(formatElementsCount(5)).toBe('5 елементів');
		expect(formatElementsCount(11)).toBe('11 елементів');
		expect(formatElementsCount(14)).toBe('14 елементів');
		expect(formatElementsCount(21)).toBe('21 елемент');
		expect(formatElementsCount(22)).toBe('22 елементи');
		expect(formatElementsCount(25)).toBe('25 елементів');
	});
});

describe('getStampCategory', () => {
	it('resolves explicit and inferred stamp categories', () => {
		expect(
			getStampCategory({
				id: '1',
				x: 0,
				y: 0,
				size: 10,
				text: 'До♯',
				mainColor: '#000',
				strokeColor: 'transparent',
			}),
		).toBe('notes');

		expect(
			getStampCategory({
				id: '2',
				x: 0,
				y: 0,
				size: 10,
				text: 'Am7',
				mainColor: '#000',
				strokeColor: 'transparent',
			}),
		).toBe('chords');

		expect(
			getStampCategory({
				id: '3',
				x: 0,
				y: 0,
				size: 10,
				text: 'і',
				mainColor: '#000',
				strokeColor: 'transparent',
			}),
		).toBe('count');

		expect(
			getStampCategory({
				id: '4',
				x: 0,
				y: 0,
				size: 10,
				shapeType: 'rect',
				text: 'rect',
				mainColor: '#000',
				strokeColor: '#000',
			}),
		).toBe('shapes');
	});
});
