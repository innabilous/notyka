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

//! Зупиняє штамп на межі канвасу, не дозволяючи жодному елементу вийти за межі
export function clampStampPosition(
	x: number,
	y: number,
	stamp: StampItem,
	U: number,
	ctx: CanvasRenderingContext2D,
): { x: number; y: number } {
	const offsets = getStampBoxOffsets(stamp, U, ctx);
	const canvasW = ctx.canvas?.width ?? 10000;
	const canvasH = ctx.canvas?.height ?? 10000;

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
	const bx = calculateStampBox(stamp, U, ctx);
	const canvasH = ctx.canvas?.height ?? 10000;
	const canvasW = ctx.canvas?.width ?? 10000;
	const radius = 9 * U;

	const handle = getHandleCoords(stamp, U, ctx);
	const spaceAbove = bx.y;
	const spaceBelow = canvasH - (bx.y + bx.h);
	const neededSpace = 15 * U + radius + 4 * U;

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
	const bx = calculateStampBox(stamp, U, ctx);
	const handles = getResizeHandleCoords(stamp, U, ctx);

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
		const bx = calculateStampBox(stamp, U, ctx);
		ctx.strokeStyle = '#6366f1';
		ctx.lineWidth = 2 * U;
		ctx.setLineDash([5 * U, 4 * U]);
		ctx.beginPath();
		//! Для штампів розміром менше 8px радіус рамки зменшується, зберігаючи рівні грані для хендлів
		const maxBoxRadius = Math.min(bx.w, bx.h) * 0.25;
		const baseBoxRadius =
			stamp.size < 8 ? Math.max(1.5 * U, (stamp.size / 8) * 8 * U) : 8 * U;
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
