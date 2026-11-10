import { describe, expect, it } from 'vitest';
import {
	findRulerNearPoint,
	getClosestRulerY,
	getRulerDeleteCoords,
	isPointInRulerDelete,
	isStampAttachedToRuler,
} from '@/helpers/ruler.helpers';
import { RulerItem, StampItem } from '@/types/editor.types';

describe('ruler.helpers', () => {
	const rulers: RulerItem[] = [
		{ id: 'r1', y: 100 },
		{ id: 'r2', y: 200 },
	];

	it('finds ruler near point within threshold', () => {
		const found = findRulerNearPoint({ x: 50, y: 105 }, rulers, 1);
		expect(found?.id).toBe('r1');

		const notFound = findRulerNearPoint({ x: 50, y: 150 }, rulers, 1);
		expect(notFound).toBeNull();
	});

	it('gets closest ruler Y coordinate', () => {
		expect(getClosestRulerY(198, rulers, 10)).toBe(200);
		expect(getClosestRulerY(150, rulers, 10)).toBeNull();
	});

	it('computes ruler delete button coordinates and hit-testing', () => {
		const coords = getRulerDeleteCoords(rulers[0], 1);
		expect(coords.y).toBe(100);
		expect(coords.x).toBe(18);

		expect(isPointInRulerDelete({ x: 18, y: 100 }, rulers[0], 1)).toBe(true);
		expect(isPointInRulerDelete({ x: 100, y: 100 }, rulers[0], 1)).toBe(false);
	});

	it('checks if stamp is attached to ruler axis', () => {
		const stampOnAxis: StampItem = {
			id: 'st1',
			x: 100,
			y: 100.5,
			size: 20,
			text: 'До',
			mainColor: '#000',
			strokeColor: '#fff',
		};
		expect(isStampAttachedToRuler(stampOnAxis, rulers[0], rulers, 1)).toBe(true);

		const stampFar: StampItem = { ...stampOnAxis, y: 120 };
		expect(isStampAttachedToRuler(stampFar, rulers[0], rulers, 1)).toBe(false);
	});
});
