import { describe, expect, it } from 'vitest';
import { getStampCategory, getStampFont } from '@/helpers/stamp.helpers';
import { StampItem } from '@/types/editor.types';

describe('stamp.helpers', () => {
	it('identifies explicit category or shape category', () => {
		const shapeStamp: StampItem = {
			id: '1',
			x: 0,
			y: 0,
			size: 20,
			text: '',
			mainColor: '#000',
			strokeColor: '#fff',
			shapeType: 'rect',
		};
		expect(getStampCategory(shapeStamp)).toBe('shapes');
	});

	it('identifies notes from prefix', () => {
		const noteStamp: StampItem = {
			id: '2',
			x: 0,
			y: 0,
			size: 20,
			text: 'До♯',
			mainColor: '#000',
			strokeColor: '#fff',
		};
		expect(getStampCategory(noteStamp)).toBe('notes');
	});

	it('identifies count items', () => {
		const countStamp: StampItem = {
			id: '3',
			x: 0,
			y: 0,
			size: 20,
			text: 'та',
			mainColor: '#000',
			strokeColor: '#fff',
		};
		expect(getStampCategory(countStamp)).toBe('count');
	});

	it('computes correct font size string', () => {
		expect(getStampFont(20, 1.5)).toContain('60px');
	});
});
