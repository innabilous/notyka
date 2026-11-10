import { describe, expect, it } from 'vitest';
import { AppearanceConfigSchema } from '@/schemas/appearance.schema';
import { EditorSettingsSchema } from '@/schemas/editor-settings.schema';
import { ProjectItemSchema } from '@/schemas/project.schema';

describe('Zod schemas boundary validation', () => {
	it('validates AppearanceConfigSchema successfully with valid skin and tones', () => {
		const validConfig = {
			accentSkin: 'cobalt',
			darkTone: 'obsidian',
			lightTone: 'cotton',
		};
		const result = AppearanceConfigSchema.safeParse(validConfig);
		expect(result.success).toBe(true);
	});

	it('fails AppearanceConfigSchema on invalid accentSkin', () => {
		const invalidConfig = {
			accentSkin: 'neon-pink',
			darkTone: 'obsidian',
			lightTone: 'cotton',
		};
		const result = AppearanceConfigSchema.safeParse(invalidConfig);
		expect(result.success).toBe(false);
	});

	it('validates EditorSettingsSchema successfully with required toolSizes and toolColors', () => {
		const validSettings = {
			currentMode: 'pencil',
			toolSizes: {
				select: 24,
				pencil: 4,
				stamp: 28,
				eraser: 30,
				ruler: 10,
			},
			toolColors: {
				pencil: { main: '#ef4444', stroke: '#000000' },
				stamp: { main: '#3b82f6', stroke: 'transparent' },
			},
			selectedNote: 'До',
			selectedAccidental: '',
			sizeLocked: false,
			noteSizes: { До: 28 },
			deleteBtnOn: true,
		};
		const result = EditorSettingsSchema.safeParse(validSettings);
		expect(result.success).toBe(true);
	});

	it('validates ProjectItemSchema correctly with valid properties', () => {
		const validProject = {
			id: 'proj_123',
			title: 'Test Song',
			updatedAt: 1700000000000,
			thumbnail: 'data:image/png;base64,aaa',
			hasImage: false,
			bgDataUrl: null,
			baseDataUrl: null,
			stamps: [],
			rulers: [],
			width: 1240,
			height: 1754,
			cssW: 600,
			cssH: 800,
		};
		const result = ProjectItemSchema.safeParse(validProject);
		expect(result.success).toBe(true);
	});
});
