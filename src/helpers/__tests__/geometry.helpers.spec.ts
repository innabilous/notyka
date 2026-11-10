import { describe, expect, it } from 'vitest';
import {
	clampArrowHead,
	doSegmentsIntersect,
	isPointInCornerResizeHandle,
	isPointInPolygon,
} from '@/helpers/geometry.helpers';
import { StampItem } from '@/types/editor.types';

describe('geometry.helpers', () => {
	it('detects intersecting and non-intersecting line segments', () => {
		const s1 = { x: 0, y: 0 };
		const s2 = { x: 10, y: 10 };
		const s3 = { x: 0, y: 10 };
		const s4 = { x: 10, y: 0 };
		expect(doSegmentsIntersect(s1, s2, s3, s4)).toBe(true);

		const parallelA = { x: 0, y: 0 };
		const parallelB = { x: 10, y: 0 };
		const parallelC = { x: 0, y: 5 };
		const parallelD = { x: 10, y: 5 };
		expect(doSegmentsIntersect(parallelA, parallelB, parallelC, parallelD)).toBe(false);
	});

	it('checks point containment in polygon', () => {
		const poly = [
			{ x: 0, y: 0 },
			{ x: 20, y: 0 },
			{ x: 20, y: 20 },
			{ x: 0, y: 20 },
		];
		expect(isPointInPolygon({ x: 10, y: 10 }, poly)).toBe(true);
		expect(isPointInPolygon({ x: 30, y: 30 }, poly)).toBe(false);
	});

	it('clamps arrow head inside canvas bounds', () => {
		const p1 = { x: 50, y: 50 };
		const target = { x: 2000, y: 2000 };
		const clamped = clampArrowHead(p1, target, 4, 1000, 1000);
		expect(clamped.x).toBeLessThanOrEqual(1000);
		expect(clamped.y).toBeLessThanOrEqual(1000);
	});

	it('detects corner handle under cursor for rectangular shapes', () => {
		const stamp: StampItem = {
			id: 'rect1',
			x: 100,
			y: 100,
			size: 20,
			width: 60,
			height: 40,
			category: 'shapes',
			shapeType: 'rect',
			text: '',
			mainColor: '#000',
			strokeColor: '#fff',
		};
		const corner = isPointInCornerResizeHandle({ x: 130, y: 120 }, stamp, 1);
		expect(corner).toBe('br');
	});
});
