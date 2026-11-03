import { BoundingBox, Point, StampItem } from '@/types/editor';

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

function drawTrashIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, U: number): void {
	const k = (12 * U) / 24;
	ctx.save();
	ctx.translate(cx - 12 * k, cy - 12 * k);
	ctx.scale(k, k);
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 2.4;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	ctx.beginPath();
	// Lid
	ctx.moveTo(3, 6);
	ctx.lineTo(21, 6);
	// Handle
	ctx.moveTo(8, 6);
	ctx.lineTo(8, 4);
	ctx.arcTo(8, 2, 10, 2, 2);
	ctx.lineTo(14, 2);
	ctx.arcTo(16, 2, 16, 4, 2);
	ctx.lineTo(16, 6);
	// Body
	ctx.moveTo(19, 6);
	ctx.lineTo(19, 20);
	ctx.arcTo(19, 22, 17, 22, 2);
	ctx.lineTo(7, 22);
	ctx.arcTo(5, 22, 5, 20, 2);
	ctx.lineTo(5, 6);
	// Ribs
	ctx.moveTo(10, 11);
	ctx.lineTo(10, 17);
	ctx.moveTo(14, 11);
	ctx.lineTo(14, 17);

	ctx.stroke();
	ctx.restore();
}

export function drawStamp(
	stamp: StampItem,
	isActive: boolean,
	ctx: CanvasRenderingContext2D,
	U: number,
	deleteBtnOn: boolean,
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

			drawTrashIcon(ctx, d.x, d.y, U);
		}
	}

	ctx.restore();
}
