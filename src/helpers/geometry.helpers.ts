import { Point, StampItem } from '@/types/editor.types';

export function doSegmentsIntersect(
	p1: Point,
	p2: Point,
	p3: Point,
	p4: Point,
): boolean {
	const ccw = (a: Point, b: Point, c: Point) =>
		(c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
	return (
		ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
		ccw(p1, p2, p3) !== ccw(p1, p2, p4)
	);
}

export function isPointInPolygon(pt: Point, poly: Point[]): boolean {
	if (poly.length < 3) return false;
	let inside = false;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const xi = poly[i].x;
		const yi = poly[i].y;
		const xj = poly[j].x;
		const yj = poly[j].y;
		const intersect =
			yi > pt.y !== yj > pt.y &&
			pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}
	return inside;
}

export function clampArrowHead(
	p1: Point,
	target: Point,
	lw: number,
	canvasW: number,
	canvasH: number,
): Point {
	const halfLw = lw / 2;
	let endX = Math.max(halfLw, Math.min(canvasW - halfLw, target.x));
	let endY = Math.max(halfLw, Math.min(canvasH - halfLw, target.y));

	const dx = endX - p1.x;
	const dy = endY - p1.y;
	const len = Math.hypot(dx, dy);
	if (len < 1e-4) return { x: endX, y: endY };

	const angle = Math.atan2(dy, dx);
	const baseHeadLen = Math.max(12, lw * 4.5);
	const headLen = Math.min(len * 0.45, baseHeadLen);
	const headAngle = Math.PI / 6;

	const w1x = endX - headLen * Math.cos(angle - headAngle);
	const w1y = endY - headLen * Math.sin(angle - headAngle);
	const w2x = endX - headLen * Math.cos(angle + headAngle);
	const w2y = endY - headLen * Math.sin(angle + headAngle);

	const minX = Math.min(endX, w1x, w2x) - halfLw;
	const maxX = Math.max(endX, w1x, w2x) + halfLw;
	const minY = Math.min(endY, w1y, w2y) - halfLw;
	const maxY = Math.max(endY, w1y, w2y) + halfLw;

	if (minX < 0) endX += -minX;
	if (maxX > canvasW) endX -= maxX - canvasW;
	if (minY < 0) endY += -minY;
	if (maxY > canvasH) endY -= maxY - canvasH;

	return {
		x: Math.max(halfLw, Math.min(canvasW - halfLw, endX)),
		y: Math.max(halfLw, Math.min(canvasH - halfLw, endY)),
	};
}

export function getShapeRotateHandleCoords(
	stamp: StampItem,
	U: number,
	canvasW: number,
	canvasH: number,
): { x: number; y: number; stemFrom: Point; radius: number } {
	const rot = stamp.rotation || 0;
	const w = (stamp.width || stamp.size * 2) * U;
	const h = (stamp.height || stamp.size * 1.5) * U;
	const cos = Math.cos(rot);
	const sin = Math.sin(rot);
	const radius = 8.5 * U;

	const toCanvas = (lx: number, ly: number) => ({
		x: stamp.x + lx * cos - ly * sin,
		y: stamp.y + lx * sin + ly * cos,
	});

	const normLX = w / 2 + 16 * U;
	const normLY = -h / 2 - 16 * U;
	const normPt = toCanvas(normLX, normLY);

	const margin = radius + 4 * U;
	const fitsTopRight =
		normPt.x >= margin &&
		normPt.x <= canvasW - margin &&
		normPt.y >= margin &&
		normPt.y <= canvasH - margin;

	if (fitsTopRight) {
		return {
			x: normPt.x,
			y: normPt.y,
			stemFrom: toCanvas(w / 2, -h / 2),
			radius,
		};
	}

	const flipLX = -w / 2 - 16 * U;
	const flipLY = h / 2 + 16 * U;
	const flipPt = toCanvas(flipLX, flipLY);
	return {
		x: Math.max(margin, Math.min(canvasW - margin, flipPt.x)),
		y: Math.max(margin, Math.min(canvasH - margin, flipPt.y)),
		stemFrom: toCanvas(-w / 2, h / 2),
		radius,
	};
}

export function isPointInCornerResizeHandle(
	p: Point,
	stamp: StampItem,
	U: number,
): 'tl' | 'tr' | 'br' | 'bl' | null {
	if (stamp.category !== 'shapes' || stamp.shapeType === 'arrow') return null;
	const rot = stamp.rotation || 0;
	const w = (stamp.width || stamp.size * 2) * U;
	const h = (stamp.height || stamp.size * 1.5) * U;
	const cos = Math.cos(rot);
	const sin = Math.sin(rot);
	const hitRadius = Math.max(14 * U, 14);
	const hitSq = hitRadius * hitRadius;

	const corners: Array<{ side: 'tl' | 'tr' | 'br' | 'bl'; lx: number; ly: number }> = [
		{ side: 'tl', lx: -w / 2, ly: -h / 2 },
		{ side: 'tr', lx: w / 2, ly: -h / 2 },
		{ side: 'br', lx: w / 2, ly: h / 2 },
		{ side: 'bl', lx: -w / 2, ly: h / 2 },
	];

	for (const { side, lx, ly } of corners) {
		const cx = stamp.x + lx * cos - ly * sin;
		const cy = stamp.y + lx * sin + ly * cos;
		const dx = p.x - cx;
		const dy = p.y - cy;
		if (dx * dx + dy * dy <= hitSq) {
			return side;
		}
	}
	return null;
}
