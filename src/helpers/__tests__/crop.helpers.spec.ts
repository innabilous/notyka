import { describe, expect, it } from 'vitest';
import { applyCropAspectRatio } from '@/helpers/crop.helpers';

describe('crop.helpers', () => {
	const initialCrop = { x: 0, y: 0, w: 1, h: 1 };

	it('keeps free aspect ratio unchanged', () => {
		const result = applyCropAspectRatio('free', initialCrop, 1000, 1000, 0);
		expect(result).toEqual(initialCrop);
	});

	it('computes 1:1 aspect ratio centered in rectangular image', () => {
		const result = applyCropAspectRatio('1:1', initialCrop, 2000, 1000, 0);
		expect(result.h).toBe(1);
		expect(result.w).toBe(0.5);
		expect(result.x).toBe(0.25);
		expect(result.y).toBe(0);
	});

	it('computes 16:9 aspect ratio correctly', () => {
		const result = applyCropAspectRatio('16:9', initialCrop, 1600, 900, 0);
		expect(result.w).toBe(1);
		expect(result.h).toBe(1);
	});
});
