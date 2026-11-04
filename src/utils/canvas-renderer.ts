import { BoundingBox, Point, RulerItem, StampItem } from '@/types/editor';

let trashPaths: Path2D[] | null = null;

function getTrashPaths(): Path2D[] {
	if (!trashPaths && typeof Path2D !== 'undefined') {
		trashPaths = [
			'M3 6h18',
			'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6',
			'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2',
			'M10 11v6',
			'M14 11v6',
		].map((d) => new Path2D(d));
	}
	return trashPaths ?? [];
}

export function getStampFont(size: number, U: number): string {
	return `bold ${size * 2 * U}px system-ui, -apple-system, sans-serif`;
}

export function calculateStampBox(
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): BoundingBox {
	ctx.save();
	ctx.font = getStampFont(stamp.size, U);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	const m = ctx.measureText(stamp.text);
	ctx.restore();

	const fs = stamp.size * 2 * U;
	const pad = fs * 0.22;
	const outline = stamp.strokeColor !== 'transparent' ? Math.max(2, fs / 10) / 2 : 0;
	const l = m.actualBoundingBoxLeft ?? m.width / 2;
	const r = m.actualBoundingBoxRight ?? m.width / 2;
	const asc = m.actualBoundingBoxAscent ?? fs * 0.4;
	const desc = m.actualBoundingBoxDescent ?? fs * 0.4;

	const x0 = stamp.x - l - outline - pad;
	const x1 = stamp.x + r + outline + pad;
	const y0 = stamp.y - asc - outline - pad;
	const y1 = stamp.y + desc + outline + pad;

	return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function getHandleCoords(
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): { x: number; y: number; radius: number } {
	const bx = calculateStampBox(stamp, U, ctx);
	return { x: stamp.x, y: bx.y + bx.h + 24 * U, radius: 15 * U };
}

export function getDeleteCoords(
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): { x: number; y: number; radius: number } {
	const bx = calculateStampBox(stamp, U, ctx);
	return { x: stamp.x, y: Math.max(bx.y - 15 * U, 11 * U), radius: 9 * U };
}

export function getResizeHandleCoords(
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): {
	left: { x: number; y: number; radius: number; hitRadius: number };
	right: { x: number; y: number; radius: number; hitRadius: number };
} {
	const bx = calculateStampBox(stamp, U, ctx);
	const cy = bx.y + bx.h / 2;
	const radius = 6 * U;
	const hitRadius = Math.max(16 * U, 14);
	return {
		left: { x: bx.x, y: cy, radius, hitRadius },
		right: { x: bx.x + bx.w, y: cy, radius, hitRadius },
	};
}

export function isPointInResizeHandle(
	p: Point,
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): 'left' | 'right' | null {
	const handles = getResizeHandleCoords(stamp, U, ctx);
	const dlx = p.x - handles.left.x;
	const dly = p.y - handles.left.y;
	if (dlx * dlx + dly * dly <= handles.left.hitRadius * handles.left.hitRadius) {
		return 'left';
	}
	const drx = p.x - handles.right.x;
	const dry = p.y - handles.right.y;
	if (drx * drx + dry * dry <= handles.right.hitRadius * handles.right.hitRadius) {
		return 'right';
	}
	return null;
}

export function isPointInStamp(
	p: Point,
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): boolean {
	const bx = calculateStampBox(stamp, U, ctx);
	return p.x >= bx.x && p.x <= bx.x + bx.w && p.y >= bx.y && p.y <= bx.y + bx.h;
}

export function isPointInHandle(
	p: Point,
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): boolean {
	const h = getHandleCoords(stamp, U, ctx);
	const dx = p.x - h.x;
	const dy = p.y - h.y;
	return dx * dx + dy * dy <= h.radius * h.radius;
}

export function isPointInDelete(
	p: Point,
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): boolean {
	const d = getDeleteCoords(stamp, U, ctx);
	const dx = p.x - d.x;
	const dy = p.y - d.y;
	return dx * dx + dy * dy <= d.radius * d.radius;
}

export function drawStamp(
	stamp: StampItem,
	isActive: boolean,
	ctx: CanvasRenderingContext2D,
	U: number,
	deleteBtnOn: boolean = true,
	resizeHandlesOn: boolean = true,
): void {
	const fontSize = stamp.size * 2 * U;
	ctx.save();
	ctx.font = getStampFont(stamp.size, U);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	if (stamp.strokeColor !== 'transparent') {
		ctx.strokeStyle = stamp.strokeColor;
		ctx.lineWidth = Math.max(2, fontSize / 10);
		ctx.strokeText(stamp.text, stamp.x, stamp.y);
	}

	ctx.fillStyle = stamp.mainColor;
	ctx.fillText(stamp.text, stamp.x, stamp.y);

	if (isActive) {
		const bx = calculateStampBox(stamp, U, ctx);
		ctx.strokeStyle = '#6366f1';
		ctx.lineWidth = 2 * U;
		ctx.setLineDash([5 * U, 4 * U]);
		ctx.beginPath();
		if (typeof ctx.roundRect === 'function') {
			ctx.roundRect(bx.x, bx.y, bx.w, bx.h, 8 * U);
		} else {
			ctx.rect(bx.x, bx.y, bx.w, bx.h);
		}
		ctx.stroke();

		const hx = stamp.x;
		const hy = bx.y + bx.h + 24 * U;
		ctx.setLineDash([]);
		ctx.beginPath();
		ctx.moveTo(hx, bx.y + bx.h);
		ctx.lineTo(hx, hy);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(hx, hy, 14 * U, 0, Math.PI * 2);
		ctx.fillStyle = '#6366f1';
		ctx.fill();
		ctx.strokeStyle = '#ffffff';
		ctx.stroke();

		// 4-directional move arrows inside handle
		const s = 6.5 * U;
		const a = 2.5 * U;
		ctx.lineWidth = 1.5 * U;
		ctx.beginPath();
		// Horizontal axis & arrows
		ctx.moveTo(hx - s, hy);
		ctx.lineTo(hx + s, hy);
		ctx.moveTo(hx - s + a, hy - a);
		ctx.lineTo(hx - s, hy);
		ctx.lineTo(hx - s + a, hy + a);
		ctx.moveTo(hx + s - a, hy - a);
		ctx.lineTo(hx + s, hy);
		ctx.lineTo(hx + s - a, hy + a);

		// Vertical axis & arrows
		ctx.moveTo(hx, hy - s);
		ctx.lineTo(hx, hy + s);
		ctx.moveTo(hx - a, hy - s + a);
		ctx.lineTo(hx, hy - s);
		ctx.lineTo(hx + a, hy - s + a);
		ctx.moveTo(hx - a, hy + s - a);
		ctx.lineTo(hx, hy + s);
		ctx.lineTo(hx + a, hy + s - a);
		ctx.stroke();

		if (deleteBtnOn) {
			const d = getDeleteCoords(stamp, U, ctx);
			ctx.beginPath();
			ctx.arc(d.x, d.y, 8.5 * U, 0, Math.PI * 2);
			ctx.fillStyle = '#ef4444';
			ctx.fill();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 1.5 * U;
			ctx.stroke();

			const paths = getTrashPaths();
			if (paths.length > 0) {
				ctx.save();
				const k = (9 * U) / 24;
				ctx.translate(d.x - 12 * k, d.y - 12 * k);
				ctx.scale(k, k);
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 2.2;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				paths.forEach((pth) => ctx.stroke(pth));
				ctx.restore();
			}
		}

		if (resizeHandlesOn) {
			const resizes = getResizeHandleCoords(stamp, U, ctx);
			ctx.fillStyle = '#6366f1';
			ctx.strokeStyle = '#6366f1';
			ctx.lineWidth = 1 * U;

			// Лівий напівкружечок: випинається назовні вліво (від PI/2 до 3*PI/2)
			ctx.beginPath();
			ctx.arc(
				resizes.left.x,
				resizes.left.y,
				resizes.left.radius,
				Math.PI / 2,
				(3 * Math.PI) / 2,
			);
			ctx.closePath();
			ctx.fill();

			// Правий напівкружечок: випинається назовні вправо (від -PI/2 до PI/2)
			ctx.beginPath();
			ctx.arc(resizes.right.x, resizes.right.y, resizes.right.radius, -Math.PI / 2, Math.PI / 2);
			ctx.closePath();
			ctx.fill();
		}
	}

	ctx.restore();
}

export function getRulerDeleteCoords(
	ruler: RulerItem,
	U: number,
): { x: number; y: number; radius: number } {
	return { x: Math.max(24 * U, 24), y: ruler.y, radius: 9 * U };
}

export function isPointInRulerDelete(p: Point, ruler: RulerItem, U: number): boolean {
	const d = getRulerDeleteCoords(ruler, U);
	const hitRadius = Math.max(d.radius + 6 * U, 18);
	const dx = p.x - d.x;
	const dy = p.y - d.y;
	return dx * dx + dy * dy <= hitRadius * hitRadius;
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

export function drawRulers(
	rulers: RulerItem[],
	activeRulerId: string | null,
	isRulerMode: boolean,
	ctx: CanvasRenderingContext2D,
	U: number,
	canvasWidth: number,
): void {
	if (rulers.length === 0) return;

	for (const ruler of rulers) {
		const isActive = isRulerMode && ruler.id === activeRulerId;

		ctx.save();
		if (isActive) {
			ctx.strokeStyle = '#4f46e5';
			ctx.lineWidth = 1.5 * U;
			ctx.setLineDash([6 * U, 4 * U]);
		} else {
			ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
			ctx.lineWidth = 1 * U;
			ctx.setLineDash([5 * U, 5 * U]);
		}

		ctx.beginPath();
		ctx.moveTo(0, ruler.y);
		ctx.lineTo(canvasWidth, ruler.y);
		ctx.stroke();

		if (isActive) {
			const d = getRulerDeleteCoords(ruler, U);
			ctx.setLineDash([]);
			ctx.beginPath();
			ctx.arc(d.x, d.y, 8.5 * U, 0, Math.PI * 2);
			ctx.fillStyle = '#ef4444';
			ctx.fill();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 1.5 * U;
			ctx.stroke();

			const paths = getTrashPaths();
			if (paths.length > 0) {
				ctx.save();
				const k = (9 * U) / 24;
				ctx.translate(d.x - 12 * k, d.y - 12 * k);
				ctx.scale(k, k);
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 2.2;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				paths.forEach((pth) => ctx.stroke(pth));
				ctx.restore();
			}
		}

		ctx.restore();
	}
}
