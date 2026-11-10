import { Point, RulerItem, StampItem } from '@/types/editor.types';

export function getRulerDeleteCoords(
	ruler: RulerItem,
	U: number,
): { x: number; y: number; radius: number } {
	return { x: Math.max(18 * U, 18), y: ruler.y, radius: 9 * U };
}

export function isPointInRulerDelete(p: Point, ruler: RulerItem, U: number): boolean {
	const d = getRulerDeleteCoords(ruler, U);
	const hitRadius = Math.max(d.radius + 6 * U, 18);
	const dx = p.x - d.x;
	const dy = p.y - d.y;
	return dx * dx + dy * dy <= hitRadius * hitRadius;
}

export function isStampAttachedToRuler(
	stamp: StampItem,
	targetRuler: RulerItem,
	allRulers: RulerItem[],
	U: number,
): boolean {
	const distToTarget = Math.abs(stamp.y - targetRuler.y);
	const maxCenterTolerance = Math.max(2 * U, 2.5);
	if (distToTarget > maxCenterTolerance) return false;

	for (const r of allRulers) {
		if (r.id !== targetRuler.id && Math.abs(stamp.y - r.y) < distToTarget) {
			return false;
		}
	}
	return true;
}

export function findRulerNearPoint(p: Point, rulers: RulerItem[], U: number): RulerItem | null {
	const threshold = Math.max(16 * U, 14);
	let closest: RulerItem | null = null;
	let minDist = Infinity;
	for (const r of rulers) {
		const dist = Math.abs(p.y - r.y);
		if (dist <= threshold && dist < minDist) {
			minDist = dist;
			closest = r;
		}
	}
	return closest;
}

export function getClosestRulerY(y: number, rulers: RulerItem[], threshold: number): number | null {
	let closestDist = Infinity;
	let closestY: number | null = null;
	for (const r of rulers) {
		const dist = Math.abs(y - r.y);
		if (dist <= threshold && dist < closestDist) {
			closestDist = dist;
			closestY = r.y;
		}
	}
	return closestY;
}
