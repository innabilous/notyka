import { BoundingBox, Point, RulerItem, StampItem } from '@/types/editor';

let trashPaths: Path2D[] | null = null;
let rotatePaths: Path2D[] | null = null;

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

function getRotatePaths(): Path2D[] {
	if (!rotatePaths && typeof Path2D !== 'undefined') {
		rotatePaths = [
			'M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8',
			'M21 3v5h-5',
		].map((d) => new Path2D(d));
	}
	return rotatePaths ?? [];
}

export function getStampFont(size: number, U: number): string {
	return `bold ${size * 2 * U}px system-ui, -apple-system, sans-serif`;
}

//! Розбиваємо текст на рядки з автоматичним переносом по словах, якщо рядок ширший за полотно
export function getStampLines(
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): string[] {
	ctx.save();
	ctx.font = getStampFont(stamp.size, U);

	const maxLineWidth = Math.max(
		100 * U,
		ctx.canvas && ctx.canvas.width > 0 ? ctx.canvas.width - 48 * U : 600 * U,
	);

	const rawLines = String(stamp.text).split('\n');
	const lines: string[] = [];

	for (const rawLine of rawLines) {
		const words = rawLine.split(' ');
		if (words.length <= 1) {
			lines.push(rawLine);
			continue;
		}

		let currentLine = words[0];
		for (let i = 1; i < words.length; i++) {
			const word = words[i];
			const testLine = `${currentLine} ${word}`;
			if (ctx.measureText(testLine).width <= maxLineWidth) {
				currentLine = testLine;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		}
		lines.push(currentLine);
	}

	ctx.restore();
	return lines;
}

export function calculateStampBox(
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): BoundingBox {
	//! Якщо це фігура (прямокутник, коло, стрілка)
	if (stamp.category === 'shapes' || stamp.shapeType) {
		const pad = 8 * U;
		if (stamp.shapeType === 'arrow') {
			const p1 = { x: stamp.x, y: stamp.y };
			const p2 = {
				x: stamp.endX ?? stamp.x + stamp.size * 3 * U,
				y: stamp.endY ?? stamp.y,
			};
			const minX = Math.min(p1.x, p2.x) - pad;
			const minY = Math.min(p1.y, p2.y) - pad;
			const maxX = Math.max(p1.x, p2.x) + pad;
			const maxY = Math.max(p1.y, p2.y) + pad;
			return {
				x: minX,
				y: minY,
				w: Math.max(20 * U, maxX - minX),
				h: Math.max(20 * U, maxY - minY),
			};
		}
		if (stamp.shapeType === 'circle') {
			const rx = (stamp.width ? stamp.width / 2 : stamp.size) * U;
			const ry = (stamp.height ? stamp.height / 2 : stamp.size) * U;
			return {
				x: stamp.x - rx - pad,
				y: stamp.y - ry - pad,
				w: (rx + pad) * 2,
				h: (ry + pad) * 2,
			};
		}
		// За замовчуванням прямокутник
		const w = (stamp.width || stamp.size * 2) * U;
		const h = (stamp.height || stamp.size * 1.5) * U;
		return {
			x: stamp.x - w / 2 - pad,
			y: stamp.y - h / 2 - pad,
			w: w + pad * 2,
			h: h + pad * 2,
		};
	}

	//! Якщо це намальований штамп — рахуємо габарити з його збережених контурів
	if (stamp.isDrawing && stamp.rawBounds) {
		const scale = stamp.size / (stamp.initialSize || 24);
		const sw = (stamp.strokeWidth || 4) * U;
		const pad = 10 * U;
		const halfW = (stamp.rawBounds.width * scale) / 2 + sw / 2;
		const halfH = (stamp.rawBounds.height * scale) / 2 + sw / 2;
		return {
			x: stamp.x - halfW - pad,
			y: stamp.y - halfH - pad,
			w: (halfW + pad) * 2,
			h: (halfH + pad) * 2,
		};
	}

	const lines = getStampLines(stamp, U, ctx);
	ctx.save();
	ctx.font = getStampFont(stamp.size, U);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	let maxW = 0;
	lines.forEach((line) => {
		const m = ctx.measureText(line);
		const l = m.actualBoundingBoxLeft ?? m.width / 2;
		const r = m.actualBoundingBoxRight ?? m.width / 2;
		const w = Math.max(m.width, l + r);
		if (w > maxW) maxW = w;
	});
	ctx.restore();

	const fs = stamp.size * 2 * U;
	const lineH = fs * 1.25;
	const totalH = fs + (lines.length - 1) * lineH;
	const pad = fs * 0.22;
	const outline = stamp.strokeColor !== 'transparent' ? Math.max(2, fs / 10) / 2 : 0;

	const halfW = maxW / 2;
	const halfH = totalH / 2;

	const x0 = stamp.x - halfW - outline - pad;
	const x1 = stamp.x + halfW + outline + pad;
	const y0 = stamp.y - halfH - outline - pad;
	const y1 = stamp.y + halfH + outline + pad;

	return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function getStampBoxOffsets(
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): { left: number; right: number; top: number; bottom: number } {
	const bx = calculateStampBox(stamp, U, ctx);
	return {
		left: stamp.x - bx.x,
		right: bx.x + bx.w - stamp.x,
		top: stamp.y - bx.y,
		bottom: bx.y + bx.h - stamp.y,
	};
}

//! Обмежує положення стрілки так, щоб вістря та його крила не виходили за межі полотна
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

//! Зупиняє штамп на межі канвасу, не дозволяючи жодному елементу вийти за межі
export function clampStampPosition(
	x: number,
	y: number,
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): { x: number; y: number } {
	const canvasW = ctx.canvas?.width ?? 10000;
	const canvasH = ctx.canvas?.height ?? 10000;

	//! Для фігур точний геометричний розрахунок впритик до межі канвасу без зайвих відступів
	if (stamp.category === 'shapes' || stamp.shapeType) {
		const lw = Math.max(1 * U, (stamp.strokeWidth || stamp.size || 2) * U);
		const halfLw = lw / 2;

		if (stamp.shapeType === 'arrow') {
			const p1 = { x: stamp.x, y: stamp.y };
			const p2 = {
				x: stamp.endX ?? stamp.x + stamp.size * 3 * U,
				y: stamp.endY ?? stamp.y,
			};
			const dx = p2.x - p1.x;
			const dy = p2.y - p1.y;
			const len = Math.hypot(dx, dy);
			const angle = Math.atan2(dy, dx);
			const baseHeadLen = Math.max(12 * U, lw * 4.5);
			const headLen = Math.min(len * 0.45, baseHeadLen);
			const headAngle = Math.PI / 6;
			const w1x = p2.x - headLen * Math.cos(angle - headAngle);
			const w1y = p2.y - headLen * Math.sin(angle - headAngle);
			const w2x = p2.x - headLen * Math.cos(angle + headAngle);
			const w2y = p2.y - headLen * Math.sin(angle + headAngle);

			// Межі стрілки відносно базової точки (stamp.x, stamp.y)
			const minRelX = Math.min(0, dx, w1x - p1.x, w2x - p1.x) - halfLw;
			const maxRelX = Math.max(0, dx, w1x - p1.x, w2x - p1.x) + halfLw;
			const minRelY = Math.min(0, dy, w1y - p1.y, w2y - p1.y) - halfLw;
			const maxRelY = Math.max(0, dy, w1y - p1.y, w2y - p1.y) + halfLw;

			const minX = -minRelX;
			const maxX = canvasW - maxRelX;
			const minY = -minRelY;
			const maxY = canvasH - maxRelY;

			const clampedX = maxX >= minX ? Math.max(minX, Math.min(maxX, x)) : canvasW / 2;
			const clampedY = maxY >= minY ? Math.max(minY, Math.min(maxY, y)) : canvasH / 2;
			return { x: clampedX, y: clampedY };
		}

		// Для прямокутника та кола/овалу з урахуванням обертання rot
		const rot = stamp.rotation || 0;
		const w = (stamp.width || stamp.size * 2) * U;
		const h = (stamp.height || stamp.size * 1.5) * U;

		let projW: number;
		let projH: number;

		if (stamp.shapeType === 'circle') {
			const rx = w / 2;
			const ry = h / 2;
			const cos = Math.cos(rot);
			const sin = Math.sin(rot);
			projW = Math.sqrt((rx * cos) ** 2 + (ry * sin) ** 2) + halfLw;
			projH = Math.sqrt((rx * sin) ** 2 + (ry * cos) ** 2) + halfLw;
		} else {
			// Прямокутник
			const absCos = Math.abs(Math.cos(rot));
			const absSin = Math.abs(Math.sin(rot));
			projW = (w / 2) * absCos + (h / 2) * absSin + halfLw;
			projH = (w / 2) * absSin + (h / 2) * absCos + halfLw;
		}

		const minX = projW;
		const maxX = canvasW - projW;
		const minY = projH;
		const maxY = canvasH - projH;

		const clampedX = maxX >= minX ? Math.max(minX, Math.min(maxX, x)) : canvasW / 2;
		const clampedY = maxY >= minY ? Math.max(minY, Math.min(maxY, y)) : canvasH / 2;
		return { x: clampedX, y: clampedY };
	}

	const offsets = getStampBoxOffsets(stamp, U, ctx);

	// Враховуємо бічні напівкружечки зміни розміру (6*U)
	const sideMargin = 7 * U;
	const topBottomMargin = 2 * U;

	const minX = offsets.left + sideMargin;
	const rawMaxX = canvasW - offsets.right - sideMargin;
	const minY = offsets.top + topBottomMargin;
	const rawMaxY = canvasH - offsets.bottom - topBottomMargin;

	const clampedX = rawMaxX >= minX ? Math.max(minX, Math.min(rawMaxX, x)) : canvasW / 2;
	const clampedY = rawMaxY >= minY ? Math.max(minY, Math.min(rawMaxY, y)) : canvasH / 2;

	return { x: clampedX, y: clampedY };
}

export function getHandleCoords(
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): { x: number; y: number; radius: number; isFlipped: boolean } {
	const bx = calculateStampBox(stamp, U, ctx);
	const canvasH = ctx.canvas?.height ?? 10000;
	const canvasW = ctx.canvas?.width ?? 10000;
	const radius = 14 * U;

	const spaceBelow = canvasH - (bx.y + bx.h);
	const spaceAbove = bx.y;
	const neededSpace = 24 * U + radius + 4 * U;

	//! Якщо знизу місця недостатньо, а зверху вистачає — переносимо хендлер нагору
	const isFlipped = spaceBelow < neededSpace && spaceAbove >= neededSpace;
	const rawY = isFlipped ? bx.y - 24 * U : bx.y + bx.h + 24 * U;

	const y = Math.max(radius + 4 * U, Math.min(canvasH - radius - 4 * U, rawY));
	const x = Math.max(radius + 4 * U, Math.min(canvasW - radius - 4 * U, stamp.x));

	return { x, y, radius, isFlipped };
}

export function getDeleteCoords(
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): { x: number; y: number; radius: number } {
	const canvasH = ctx.canvas?.height ?? 10000;
	const canvasW = ctx.canvas?.width ?? 10000;
	const radius = 9 * U;

	const bx = calculateStampBox(stamp, U, ctx);
	const spaceAbove = bx.y;
	const spaceBelow = canvasH - (bx.y + bx.h);
	const neededSpace = 15 * U + radius + 4 * U;

	//! Для фігур (прямокутник, коло, стрілка) кошик перелаштовується адаптивно зверху чи знизу на тій самій відстані, що й у решти штампів
	if (stamp.category === 'shapes' || stamp.shapeType) {
		if (stamp.shapeType === 'arrow') {
			const p1 = { x: stamp.x, y: stamp.y };
			const p2 = { x: stamp.endX ?? stamp.x + stamp.size * 3 * U, y: stamp.endY ?? stamp.y };
			const minY = Math.min(p1.y, p2.y);
			const maxY = Math.max(p1.y, p2.y);
			const midX = (p1.x + p2.x) / 2;
			const targetX = Math.max(radius + 4 * U, Math.min(canvasW - radius - 4 * U, midX));
			if (minY >= neededSpace) {
				return { x: targetX, y: Math.max(radius + 2 * U, minY - 13 * U), radius };
			}
			return { x: targetX, y: Math.min(canvasH - radius - 2 * U, maxY + 13 * U), radius };
		}

		// Для прямокутника та кола точні межі з урахуванням обертання
		const rot = stamp.rotation || 0;
		const w = (stamp.width || stamp.size * 2) * U;
		const h = (stamp.height || stamp.size * 1.5) * U;
		const cos = Math.cos(rot);
		const sin = Math.sin(rot);
		const toC = (lx: number, ly: number) => ({
			x: stamp.x + lx * cos - ly * sin,
			y: stamp.y + lx * sin + ly * cos,
		});
		const c1 = toC(-w / 2, -h / 2);
		const c2 = toC(w / 2, -h / 2);
		const c3 = toC(w / 2, h / 2);
		const c4 = toC(-w / 2, h / 2);
		const minY = Math.min(c1.y, c2.y, c3.y, c4.y);
		const maxY = Math.max(c1.y, c2.y, c3.y, c4.y);
		const targetX = Math.max(radius + 4 * U, Math.min(canvasW - radius - 4 * U, stamp.x));

		if (minY >= neededSpace) {
			return { x: targetX, y: Math.max(radius + 2 * U, minY - 13 * U), radius };
		}
		return { x: targetX, y: Math.min(canvasH - radius - 2 * U, maxY + 13 * U), radius };
	}

	const handle = getHandleCoords(stamp, U, ctx);

	//! Якщо хендлер вгорі (бо знизу мало місця):
	if (handle.isFlipped) {
		// Якщо знизу є місце для кошика — розміщуємо його знизу
		if (spaceBelow >= neededSpace) {
			const x = Math.max(radius + 4 * U, Math.min(canvasW - radius - 4 * U, stamp.x));
			const y = Math.min(canvasH - radius - 2 * U, bx.y + bx.h + 15 * U);
			return { x, y, radius };
		}
		// Інакше ділимо верхній простір з хендлером: праворуч, або ліворуч якщо справа нема місця
		const offset = 26 * U;
		const preferRight = handle.x + offset + radius <= canvasW - 4 * U;
		const rawX = preferRight ? handle.x + offset : handle.x - offset;
		const x = Math.max(radius + 4 * U, Math.min(canvasW - radius - 4 * U, rawX));
		const y = handle.y;
		return { x, y, radius };
	}

	//! Хендлер переміщення знизу:
	// Чи є вільне місце зверху для кошика?
	if (spaceAbove >= neededSpace) {
		const x = Math.max(radius + 4 * U, Math.min(canvasW - radius - 4 * U, stamp.x));
		const y = Math.max(radius + 2 * U, bx.y - 15 * U);
		return { x, y, radius };
	}

	//! Якщо зверху місця немає (нота впритик до верхнього краю) — переміщуємо кошик вниз до хендлера!
	// Якщо нота в правому кутку — кошик розміщується ліворуч від хендлера
	const offset = 26 * U;
	const preferRight = handle.x + offset + radius <= canvasW - 4 * U;
	const rawX = preferRight ? handle.x + offset : handle.x - offset;
	const x = Math.max(radius + 4 * U, Math.min(canvasW - radius - 4 * U, rawX));
	const y = handle.y;
	return { x, y, radius };
}

export function getResizeHandleCoords(
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): {
	left: { x: number; y: number; radius: number; hitRadius: number };
	right: { x: number; y: number; radius: number; hitRadius: number };
} {
	//! Для стрілки лівий хендл — це хвіст (початок), правий — вістря (кінець)
	if (stamp.shapeType === 'arrow') {
		const p1 = { x: stamp.x, y: stamp.y };
		const p2 = {
			x: stamp.endX ?? stamp.x + stamp.size * 3 * U,
			y: stamp.endY ?? stamp.y,
		};
		const radius = Math.max(5 * U, 5);
		const hitRadius = Math.max(16 * U, 16);
		return {
			left: { x: p1.x, y: p1.y, radius, hitRadius },
			right: { x: p2.x, y: p2.y, radius, hitRadius },
		};
	}

	const bx = calculateStampBox(stamp, U, ctx);
	const cy = bx.y + bx.h / 2;
	//! Для малих штампів радіус хендла масштабується від висоти, щоб він лишався на прямій ділянці грані
	const radius = Math.min(6 * U, Math.max(2.5 * U, bx.h * 0.25));
	const hitRadius = Math.max(12 * U, 12);
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

	if (stamp.shapeType === 'arrow') {
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

	const bx = calculateStampBox(stamp, U, ctx);

	//! Обмежуємо зону всередині рамки (макс 15% ширини або 4*U), щоб клік по тексту штампа тягнув штамп, а не масштабував
	const maxInward = Math.min(bx.w * 0.15, 4 * U);

	if (p.x <= bx.x + maxInward) {
		const dlx = p.x - handles.left.x;
		const dly = p.y - handles.left.y;
		if (dlx * dlx + dly * dly <= handles.left.hitRadius * handles.left.hitRadius) {
			return 'left';
		}
	}

	if (p.x >= bx.x + bx.w - maxInward) {
		const drx = p.x - handles.right.x;
		const dry = p.y - handles.right.y;
		if (drx * drx + dry * dry <= handles.right.hitRadius * handles.right.hitRadius) {
			return 'right';
		}
	}

	return null;
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

	// Нормальна позиція: зверху праворуч
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

	// Якщо зверху праворуч немає місця — переміщуємо на протилежний бік: знизу ліворуч
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

export function isPointInRotateHandle(
	p: Point,
	stamp: StampItem,
	U: number,
	ctx?: CanvasRenderingContext2D | null,
): boolean {
	if (stamp.category !== 'shapes' || stamp.shapeType === 'arrow') return false;
	const canvasW = ctx?.canvas?.width ?? 10000;
	const canvasH = ctx?.canvas?.height ?? 10000;
	const rotInfo = getShapeRotateHandleCoords(stamp, U, canvasW, canvasH);
	const hitRadius = Math.max(16 * U, 16);
	const dx = p.x - rotInfo.x;
	const dy = p.y - rotInfo.y;
	return dx * dx + dy * dy <= hitRadius * hitRadius;
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

export function isPointInStamp(
	p: Point,
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): boolean {
	//! Для фігур точніша перевірка потрапляння
	if (stamp.category === 'shapes' || stamp.shapeType) {
		const pad = 12 * U;
		if (stamp.shapeType === 'arrow') {
			const p1 = { x: stamp.x, y: stamp.y };
			const p2 = {
				x: stamp.endX ?? stamp.x + stamp.size * 3 * U,
				y: stamp.endY ?? stamp.y,
			};
			const dx = p2.x - p1.x;
			const dy = p2.y - p1.y;
			const lenSq = dx * dx + dy * dy;
			if (lenSq === 0) return Math.hypot(p.x - p1.x, p.y - p1.y) <= pad;
			const t = Math.max(0, Math.min(1, ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / lenSq));
			const projX = p1.x + t * dx;
			const projY = p1.y + t * dy;
			return Math.hypot(p.x - projX, p.y - projY) <= Math.max(pad, 14 * U);
		}

		// Для прямокутника та кола/овалу переводимо точку в локальні координати з урахуванням обертання
		const rot = stamp.rotation || 0;
		const cos = Math.cos(-rot);
		const sin = Math.sin(-rot);
		const dx = p.x - stamp.x;
		const dy = p.y - stamp.y;
		const lx = dx * cos - dy * sin;
		const ly = dx * sin + dy * cos;

		if (stamp.shapeType === 'circle') {
			const rx = (stamp.width ? stamp.width / 2 : stamp.size) * U + pad;
			const ry = (stamp.height ? stamp.height / 2 : stamp.size) * U + pad;
			const ex = lx / rx;
			const ey = ly / ry;
			return ex * ex + ey * ey <= 1;
		}
		// Прямокутник
		const w = (stamp.width || stamp.size * 2) * U;
		const h = (stamp.height || stamp.size * 1.5) * U;
		return Math.abs(lx) <= w / 2 + pad && Math.abs(ly) <= h / 2 + pad;
	}

	const bx = calculateStampBox(stamp, U, ctx);
	return p.x >= bx.x && p.x <= bx.x + bx.w && p.y >= bx.y && p.y <= bx.y + bx.h;
}

export function isPointInHandle(
	p: Point,
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): boolean {
	//! Для фігур хендлер переміщення відсутній (рухається за тіло фігури, обертається за хендлер повороту)
	if (stamp.category === 'shapes') return false;
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

	if (stamp.isDrawing && stamp.paths) {
		const scale = stamp.size / (stamp.initialSize || 24);
		const sw = (stamp.strokeWidth || 4) * U * scale;
		ctx.save();
		ctx.translate(stamp.x, stamp.y);
		ctx.scale(scale, scale);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		//! Обведення якщо воно задане
		if (stamp.strokeColor && stamp.strokeColor !== 'transparent') {
			ctx.strokeStyle = stamp.strokeColor;
			ctx.lineWidth = sw / scale + 4 * U;
			stamp.paths.forEach((path) => {
				if (path.points.length === 0) return;
				ctx.beginPath();
				if (path.points.length === 1) {
					ctx.arc(path.points[0].x, path.points[0].y, sw / scale / 2, 0, Math.PI * 2);
					ctx.fillStyle = stamp.strokeColor;
					ctx.fill();
				} else {
					ctx.moveTo(path.points[0].x, path.points[0].y);
					for (let i = 1; i < path.points.length; i++) {
						ctx.lineTo(path.points[i].x, path.points[i].y);
					}
					ctx.stroke();
				}
			});
		}

		//! Основний колір штрихів
		ctx.strokeStyle = stamp.mainColor;
		ctx.lineWidth = sw / scale;
		stamp.paths.forEach((path) => {
			if (path.points.length === 0) return;
			ctx.beginPath();
			if (path.points.length === 1) {
				ctx.arc(path.points[0].x, path.points[0].y, sw / scale / 2, 0, Math.PI * 2);
				ctx.fillStyle = stamp.mainColor;
				ctx.fill();
			} else {
				ctx.moveTo(path.points[0].x, path.points[0].y);
				for (let i = 1; i < path.points.length; i++) {
					ctx.lineTo(path.points[i].x, path.points[i].y);
				}
				ctx.stroke();
			}
		});

		ctx.restore();
	} else if (stamp.category === 'shapes' || stamp.shapeType) {
		const lw = Math.max(1 * U, (stamp.strokeWidth || stamp.size || 2) * U);
		const hasFill = stamp.mainColor && stamp.mainColor !== 'transparent';
		const hasStroke = stamp.strokeColor && stamp.strokeColor !== 'transparent';

		if (stamp.shapeType === 'arrow') {
			ctx.save();
			const p1 = { x: stamp.x, y: stamp.y };
			const p2 = {
				x: stamp.endX ?? stamp.x + stamp.size * 3 * U,
				y: stamp.endY ?? stamp.y,
			};
			const dx = p2.x - p1.x;
			const dy = p2.y - p1.y;
			const len = Math.hypot(dx, dy);
			const angle = Math.atan2(dy, dx);
			const arrowColor =
				hasStroke && stamp.strokeColor !== 'transparent'
					? stamp.strokeColor
					: hasFill && stamp.mainColor !== 'transparent'
						? stamp.mainColor
						: '#ed1c24';
			const baseHeadLen = Math.max(12 * U, lw * 4.5);
			const headLen = Math.min(len * 0.45, baseHeadLen);

			ctx.strokeStyle = arrowColor;
			ctx.fillStyle = arrowColor;
			ctx.lineWidth = lw;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'miter';

			// Лінія тіла стрілки
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x - headLen * 0.6 * Math.cos(angle), p2.y - headLen * 0.6 * Math.sin(angle));
			ctx.stroke();

			// Наконечник стрілки - чіткий трикутник без надмірного скруглення
			const headAngle = Math.PI / 6;
			const a1 = angle - headAngle;
			const a2 = angle + headAngle;
			const w1 = { x: p2.x - headLen * Math.cos(a1), y: p2.y - headLen * Math.sin(a1) };
			const w2 = { x: p2.x - headLen * Math.cos(a2), y: p2.y - headLen * Math.sin(a2) };

			ctx.beginPath();
			ctx.moveTo(p2.x, p2.y);
			ctx.lineTo(w1.x, w1.y);
			ctx.lineTo(w2.x, w2.y);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		} else {
			ctx.save();
			ctx.translate(stamp.x, stamp.y);
			if (stamp.rotation) {
				ctx.rotate(stamp.rotation);
			}

			if (stamp.shapeType === 'rect') {
				const w = (stamp.width || stamp.size * 2) * U;
				const h = (stamp.height || stamp.size * 1.5) * U;
				const rx = -w / 2;
				const ry = -h / 2;
				const radius = Math.min(w, h, 20 * U) * 0.18;

				ctx.beginPath();
				if (typeof ctx.roundRect === 'function') {
					ctx.roundRect(rx, ry, w, h, radius);
				} else {
					ctx.rect(rx, ry, w, h);
				}

				if (hasFill) {
					ctx.fillStyle = stamp.mainColor;
					ctx.fill();
				}
				if (hasStroke) {
					ctx.strokeStyle = stamp.strokeColor;
					ctx.lineWidth = lw;
					ctx.stroke();
				} else if (!hasFill) {
					ctx.strokeStyle = '#ed1c24';
					ctx.lineWidth = lw;
					ctx.stroke();
				}
			} else if (stamp.shapeType === 'circle') {
				const rx = (stamp.width ? stamp.width / 2 : stamp.size) * U;
				const ry = (stamp.height ? stamp.height / 2 : stamp.size) * U;
				ctx.beginPath();
				ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
				if (hasFill) {
					ctx.fillStyle = stamp.mainColor;
					ctx.fill();
				}
				if (hasStroke) {
					ctx.strokeStyle = stamp.strokeColor;
					ctx.lineWidth = lw;
					ctx.stroke();
				} else if (!hasFill) {
					ctx.strokeStyle = '#ed1c24';
					ctx.lineWidth = lw;
					ctx.stroke();
				}
			}
			ctx.restore();
		}
	} else {
		const lines = getStampLines(stamp, U, ctx);
		const lineH = fontSize * 1.25;
		const startY = stamp.y - ((lines.length - 1) * lineH) / 2;

		if (stamp.strokeColor !== 'transparent') {
			if (stamp.badgeMode) {
				//! Малюємо кольорову суцільну плашку під текстом
				const bx = calculateStampBox(stamp, U, ctx);
				ctx.fillStyle = stamp.strokeColor;
				ctx.beginPath();
				//! Для малих штампів радіус плашки зменшується пропорційно, щоб плашка залишалась прямокутником
				const maxBadgeRadius = Math.min(bx.w, bx.h) * 0.25;
				const baseBadgeRadius =
					stamp.size < 8 ? Math.max(1.5 * U, (stamp.size / 8) * 6 * U) : 6 * U;
				const radius = Math.min(baseBadgeRadius, maxBadgeRadius);
				if (typeof ctx.roundRect === 'function') {
					ctx.roundRect(bx.x, bx.y, bx.w, bx.h, radius);
				} else {
					ctx.rect(bx.x, bx.y, bx.w, bx.h);
				}
				ctx.fill();
			} else {
				ctx.strokeStyle = stamp.strokeColor;
				ctx.lineWidth = Math.max(2, fontSize / 10);
				lines.forEach((line, i) => {
					ctx.strokeText(line, stamp.x, startY + i * lineH);
				});
			}
		}

		ctx.fillStyle = stamp.mainColor;
		lines.forEach((line, i) => {
			ctx.fillText(line, stamp.x, startY + i * lineH);
		});
	}

	if (isActive) {
		const isShapes = stamp.category === 'shapes' || Boolean(stamp.shapeType);
		const isArrow = stamp.shapeType === 'arrow';

		if (isShapes && !isArrow) {
			const rot = stamp.rotation || 0;
			const w = (stamp.width || stamp.size * 2) * U;
			const h = (stamp.height || stamp.size * 1.5) * U;
			const cos = Math.cos(rot);
			const sin = Math.sin(rot);

			const toCanvas = (lx: number, ly: number) => ({
				x: stamp.x + lx * cos - ly * sin,
				y: stamp.y + lx * sin + ly * cos,
			});

			// 1. Пунктирна рамка
			ctx.save();
			ctx.translate(stamp.x, stamp.y);
			ctx.rotate(rot);
			ctx.strokeStyle = '#6366f1';
			ctx.lineWidth = 1.5 * U;
			ctx.setLineDash([5 * U, 4 * U]);
			ctx.strokeRect(-w / 2, -h / 2, w, h);
			ctx.restore();

			// 2. Хендлер обертання (адаптивно: зверху праворуч або знизу ліворуч якщо на краю)
			const rotInfo = getShapeRotateHandleCoords(
				stamp,
				U,
				ctx.canvas?.width ?? 10000,
				ctx.canvas?.height ?? 10000,
			);

			ctx.save();
			ctx.setLineDash([]);
			ctx.strokeStyle = '#6366f1';
			ctx.lineWidth = 1.5 * U;
			ctx.beginPath();
			ctx.moveTo(rotInfo.stemFrom.x, rotInfo.stemFrom.y);
			ctx.lineTo(rotInfo.x, rotInfo.y);
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(rotInfo.x, rotInfo.y, rotInfo.radius, 0, Math.PI * 2);
			ctx.fillStyle = '#6366f1';
			ctx.fill();
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 1.5 * U;
			ctx.stroke();

			// Іконка кругової стрілки повороту всередині (завжди пряма, без перекошування)
			const rPaths = getRotatePaths();
			if (rPaths.length > 0) {
				ctx.save();
				ctx.translate(rotInfo.x, rotInfo.y);
				const s = (10 * U) / 24;
				ctx.scale(s, s);
				ctx.translate(-12, -12);
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 2.5;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				rPaths.forEach((path) => ctx.stroke(path));
				ctx.restore();
			}
			ctx.restore();

			// 3. 4 кутові хендли зміни розміру
			if (resizeHandlesOn) {
				const corners = [
					{ lx: -w / 2, ly: -h / 2 },
					{ lx: w / 2, ly: -h / 2 },
					{ lx: w / 2, ly: h / 2 },
					{ lx: -w / 2, ly: h / 2 },
				];
				corners.forEach(({ lx, ly }) => {
					const pt = toCanvas(lx, ly);
					ctx.beginPath();
					ctx.arc(pt.x, pt.y, 6.5 * U, 0, Math.PI * 2);
					ctx.fillStyle = '#ffffff';
					ctx.fill();
					ctx.strokeStyle = '#6366f1';
					ctx.lineWidth = 2 * U;
					ctx.stroke();
				});
			}

			// 4. Кнопка видалення
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
		} else if (isArrow) {
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
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 1.5 * U;

				ctx.beginPath();
				ctx.arc(resizes.left.x, resizes.left.y, resizes.left.radius, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();

				ctx.beginPath();
				ctx.arc(resizes.right.x, resizes.right.y, resizes.right.radius, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
			}
		} else {
			const bx = calculateStampBox(stamp, U, ctx);
			ctx.strokeStyle = '#6366f1';
			ctx.lineWidth = 2 * U;
			ctx.setLineDash([5 * U, 4 * U]);
			ctx.beginPath();
			const maxBoxRadius = Math.min(bx.w, bx.h) * 0.25;
			const baseBoxRadius = stamp.size < 8 ? Math.max(1.5 * U, (stamp.size / 8) * 8 * U) : 8 * U;
			const activeRadius = Math.min(baseBoxRadius, maxBoxRadius);
			if (typeof ctx.roundRect === 'function') {
				ctx.roundRect(bx.x, bx.y, bx.w, bx.h, activeRadius);
			} else {
				ctx.rect(bx.x, bx.y, bx.w, bx.h);
			}
			ctx.stroke();

			const handle = getHandleCoords(stamp, U, ctx);
			const hx = handle.x;
			const hy = handle.y;
			ctx.setLineDash([]);
			ctx.beginPath();
			const stemStartY = handle.isFlipped ? bx.y : bx.y + bx.h;
			ctx.moveTo(hx, stemStartY);
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
			ctx.moveTo(hx - s, hy);
			ctx.lineTo(hx + s, hy);
			ctx.moveTo(hx - s + a, hy - a);
			ctx.lineTo(hx - s, hy);
			ctx.lineTo(hx - s + a, hy + a);
			ctx.moveTo(hx + s - a, hy - a);
			ctx.lineTo(hx + s, hy);
			ctx.lineTo(hx + s - a, hy + a);

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
				if (isArrow) {
					ctx.fillStyle = '#ffffff';
					ctx.strokeStyle = '#6366f1';
					ctx.lineWidth = 2 * U;

					ctx.beginPath();
					ctx.arc(resizes.left.x, resizes.left.y, 6.5 * U, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();

					ctx.beginPath();
					ctx.arc(resizes.right.x, resizes.right.y, 6.5 * U, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
				} else {
					ctx.fillStyle = '#6366f1';
					ctx.strokeStyle = '#ffffff';
					ctx.lineWidth = 1.5 * U;

					ctx.beginPath();
					ctx.arc(resizes.left.x, resizes.left.y, resizes.left.radius, Math.PI / 2, (3 * Math.PI) / 2);
					ctx.closePath();
					ctx.fill();

					ctx.beginPath();
					ctx.arc(resizes.right.x, resizes.right.y, resizes.right.radius, -Math.PI / 2, Math.PI / 2);
					ctx.closePath();
					ctx.fill();
				}
			}
		}
	}

	ctx.restore();
}

//! Координати кошика видалення лінійки (18px від лівого краю)
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

//! Перевірка, чи штамп прикріплений/центрований саме на цій лінійці (а не просто торкається краями)
export function isStampAttachedToRuler(
	stamp: StampItem,
	targetRuler: RulerItem,
	allRulers: RulerItem[],
	U: number,
): boolean {
	const distToTarget = Math.abs(stamp.y - targetRuler.y);
	// Допуск центрованого розміщення: штамп має сидіти саме на осі лінійки
	const maxCenterTolerance = Math.max(2 * U, 2.5);
	if (distToTarget > maxCenterTolerance) return false;

	// Ця лінійка має бути найближчою до центру штампа серед усіх лінійок
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

export interface SnapGuide {
	x: number;
	y1: number;
	y2: number;
}

//! Розрахунок горизонтального магнітного снепу штампа до штампів на інших лінійках (Smart Guides)
export function getStampItemHorizontalSnap(
	targetX: number,
	targetY: number,
	activeStamp: StampItem,
	allStamps: StampItem[],
	rulers: RulerItem[],
	U: number,
	ctx: CanvasRenderingContext2D,
): { snappedX: number; guide: SnapGuide | null } {
	if (rulers.length < 2) return { snappedX: targetX, guide: null };

	// Перевіряємо, чи поточна координата targetY знаходиться біля або на лінійці
	const nearThreshold = Math.max(16 * U, 14);
	const activeRuler = rulers.find((r) => Math.abs(targetY - r.y) <= nearThreshold);
	if (!activeRuler) return { snappedX: targetX, guide: null };

	// Цільові штампи для снепу: штампи, прив'язані до інших лінійок
	const otherRulers = rulers.filter((r) => r.id !== activeRuler.id);
	const targetCandidates: { stamp: StampItem; ruler: RulerItem }[] = [];

	for (const st of allStamps) {
		if (st.id === activeStamp.id) continue;
		for (const r of otherRulers) {
			if (isStampAttachedToRuler(st, r, rulers, U)) {
				targetCandidates.push({ stamp: st, ruler: r });
				break;
			}
		}
	}

	if (targetCandidates.length === 0) return { snappedX: targetX, guide: null };

	const activeOffsets = getStampBoxOffsets(activeStamp, U, ctx);
	const snapThreshold = Math.max(8 * U, 7);

	let bestDist = Infinity;
	let bestSnappedX = targetX;
	let bestGuideX = targetX;
	let matchedRulers: RulerItem[] = [];

	for (const { stamp: target, ruler: targetRuler } of targetCandidates) {
		const targetOffsets = getStampBoxOffsets(target, U, ctx);
		const targetLeft = target.x - targetOffsets.left;
		const targetRight = target.x + targetOffsets.right;

		// 1. Центр до центру (головний пріоритет для нот)
		const dCenter = target.x - targetX;
		const absCenter = Math.abs(dCenter);
		if (absCenter <= snapThreshold && absCenter < bestDist) {
			bestDist = absCenter;
			bestSnappedX = target.x;
			bestGuideX = target.x;
			matchedRulers = [activeRuler, targetRuler];
		}

		// 2. Лівий край до лівого краю
		const snappedFromLeft = targetLeft + activeOffsets.left;
		const dLeft = snappedFromLeft - targetX;
		const absLeft = Math.abs(dLeft);
		if (absLeft <= snapThreshold && absLeft + 1 < bestDist) {
			bestDist = absLeft + 1;
			bestSnappedX = snappedFromLeft;
			bestGuideX = targetLeft;
			matchedRulers = [activeRuler, targetRuler];
		}

		// 3. Правий край до правого краю
		const snappedFromRight = targetRight - activeOffsets.right;
		const dRight = snappedFromRight - targetX;
		const absRight = Math.abs(dRight);
		if (absRight <= snapThreshold && absRight + 1 < bestDist) {
			bestDist = absRight + 1;
			bestSnappedX = snappedFromRight;
			bestGuideX = targetRight;
			matchedRulers = [activeRuler, targetRuler];
		}
	}

	if (matchedRulers.length === 0) {
		return { snappedX: targetX, guide: null };
	}

	const allYs = matchedRulers.map((r) => r.y);
	for (const cand of targetCandidates) {
		if (Math.abs(cand.stamp.x - bestSnappedX) <= 1.5) {
			allYs.push(cand.ruler.y);
		}
	}
	const minY = Math.min(...allYs);
	const maxY = Math.max(...allYs);
	const pad = 12 * U;

	return {
		snappedX: bestSnappedX,
		guide: {
			x: bestGuideX,
			y1: minY - pad,
			y2: maxY + pad,
		},
	};
}

//! Відображення вертикальної напрямної розумного снепу (Smart Guide)
export function drawSmartGuide(ctx: CanvasRenderingContext2D, guide: SnapGuide, U: number): void {
	ctx.save();
	ctx.strokeStyle = '#0284c7';
	ctx.lineWidth = 1.5 * U;
	ctx.setLineDash([4 * U, 3 * U]);
	ctx.beginPath();
	ctx.moveTo(guide.x, guide.y1);
	ctx.lineTo(guide.x, guide.y2);
	ctx.stroke();

	ctx.setLineDash([]);
	ctx.fillStyle = '#0284c7';
	ctx.beginPath();
	ctx.arc(guide.x, guide.y1, 2.5 * U, 0, Math.PI * 2);
	ctx.arc(guide.x, guide.y2, 2.5 * U, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}

export function drawRulers(
	rulers: RulerItem[],
	activeRulerId: string | null,
	isRulerMode: boolean,
	ctx: CanvasRenderingContext2D,
	U: number,
	canvasWidth: number,
	showDistance: boolean = false,
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

	//! Відображення дистанції між сусідніми лінійками в пікселях (36px від краю, компактно біля кошика)
	if (showDistance && rulers.length >= 2) {
		const sorted = [...rulers].sort((a, b) => a.y - b.y);
		const dimX = Math.max(36 * U, 36);

		for (let i = 0; i < sorted.length - 1; i++) {
			const r1 = sorted[i];
			const r2 = sorted[i + 1];
			const distPx = Math.round(r2.y - r1.y);
			if (distPx <= 2) continue;
			const midY = (r1.y + r2.y) / 2;

			ctx.save();
			ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
			ctx.lineWidth = 1 * U;
			ctx.setLineDash([3 * U, 3 * U]);
			ctx.beginPath();
			ctx.moveTo(dimX, r1.y);
			ctx.lineTo(dimX, r2.y);
			ctx.stroke();

			const text = `${distPx} px`;
			const fontSize = Math.max(9, Math.round(10 * U));
			ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
			const tw = ctx.measureText(text).width;
			const bw = tw + 8 * U;
			const bh = Math.max(14 * U, fontSize + 4 * U);
			const bx = dimX - bw / 2;
			const by = midY - bh / 2;

			// Фон бейджа в кольорі лінійок замість чорного
			ctx.fillStyle = '#4f46e5';
			ctx.setLineDash([]);
			ctx.beginPath();
			if (typeof ctx.roundRect === 'function') {
				ctx.roundRect(bx, by, bw, bh, 4 * U);
			} else {
				ctx.rect(bx, by, bw, bh);
			}
			ctx.fill();
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
			ctx.lineWidth = 1 * U;
			ctx.stroke();

			ctx.fillStyle = '#ffffff';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(text, dimX, midY);
			ctx.restore();
		}
	}
}
