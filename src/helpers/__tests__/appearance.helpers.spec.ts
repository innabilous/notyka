import { describe, expect, it } from 'vitest';
import { parseAppearanceConfig } from '@/helpers/appearance.helpers';
import { DEFAULT_APPEARANCE_CONFIG } from '@/constants/appearance.constants';

describe('appearance.helpers', () => {
	it('parses valid appearance configuration JSON correctly', () => {
		const json = JSON.stringify({
			accentSkin: 'lime',
			darkTone: 'oled',
			lightTone: 'pure',
		});
		const result = parseAppearanceConfig(json);
		expect(result).toEqual({
			accentSkin: 'lime',
			darkTone: 'oled',
			lightTone: 'pure',
		});
	});

	it('falls back to DEFAULT_APPEARANCE_CONFIG on invalid JSON or broken structure', () => {
		expect(parseAppearanceConfig('not-json')).toEqual(DEFAULT_APPEARANCE_CONFIG);
		expect(parseAppearanceConfig(null)).toEqual(DEFAULT_APPEARANCE_CONFIG);
		expect(parseAppearanceConfig(JSON.stringify({ accentSkin: 'invalid' }))).toEqual(
			DEFAULT_APPEARANCE_CONFIG,
		);
	});
});
