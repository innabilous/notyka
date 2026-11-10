import { describe, expect, it } from 'vitest';
import { buildChordText } from '@/helpers/chord.helpers';

describe('chord.helpers', () => {
	it('builds standard chord without slash', () => {
		expect(buildChordText('C', '#', 'm7', false, '', '')).toBe('C#m7');
		expect(buildChordText('A', '', 'm', false, 'E', '')).toBe('Am');
	});

	it('builds slash chord with bass note and accidental', () => {
		expect(buildChordText('G', '', '', true, 'B', '')).toBe('G/B');
		expect(buildChordText('D', '', 'm', true, 'F', '#')).toBe('Dm/F#');
	});

	it('handles slash mode without bass note gracefully', () => {
		expect(buildChordText('G', '', '', true, '', '')).toBe('G');
	});
});
