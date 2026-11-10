import { describe, expect, it } from 'vitest';
import { formatDate, formatElementsCount } from '@/helpers/format.helpers';

describe('format.helpers', () => {
	it('formats single element (1 елемент)', () => {
		expect(formatElementsCount(1)).toBe('1 елемент');
		expect(formatElementsCount(21)).toBe('21 елемент');
	});

	it('formats 2-4 elements (2 елементи)', () => {
		expect(formatElementsCount(2)).toBe('2 елементи');
		expect(formatElementsCount(4)).toBe('4 елементи');
		expect(formatElementsCount(23)).toBe('23 елементи');
	});

	it('formats 5+ elements and teens (елементів)', () => {
		expect(formatElementsCount(0)).toBe('0 елементів');
		expect(formatElementsCount(5)).toBe('5 елементів');
		expect(formatElementsCount(11)).toBe('11 елементів');
		expect(formatElementsCount(14)).toBe('14 елементів');
	});

	it('formats timestamp into localized Ukrainian date string', () => {
		const ts = new Date('2026-03-15T14:30:00Z').getTime();
		const formatted = formatDate(ts);
		expect(typeof formatted).toBe('string');
		expect(formatted.length).toBeGreaterThan(0);
	});
});
