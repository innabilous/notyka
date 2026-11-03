import { BoundingBox, Point, StampItem } from '@/types/editor';

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
	return { x: stamp.x, y: Math.max(bx.y - 20 * U, 14 * U), radius: 13 * U };
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

		// Crosshair inside handle
		ctx.beginPath();
		ctx.moveTo(hx - 5 * U, hy);
		ctx.lineTo(hx + 5 * U, hy);
		ctx.moveTo(hx, hy - 5 * U);
		ctx.lineTo(hx, hy + 5 * U);
		ctx.stroke();

		if (deleteBtnOn) {
			const d = getDeleteCoords(stamp, U, ctx);
			ctx.beginPath();
			ctx.arc(d.x, d.y, 11 * U, 0, Math.PI * 2);
			ctx.fillStyle = '#ef4444';
			ctx.fill();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2 * U;
			ctx.stroke();

			const paths = getTrashPaths();
			if (paths.length > 0) {
				ctx.save();
				const k = (12 * U) / 24;
				ctx.translate(d.x - 12 * k, d.y - 12 * k);
				ctx.scale(k, k);
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 2.4;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				paths.forEach((pth) => ctx.stroke(pth));
				ctx.restore();
			}
		}
	}

	ctx.restore();
}
