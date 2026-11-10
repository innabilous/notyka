export type CropAspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '3:4';

export interface NormalizedCropRect {
	x: number; // 0..1
	y: number; // 0..1
	w: number; // 0..1
	h: number; // 0..1
}

export function applyCropAspectRatio(
	ratio: CropAspectRatio,
	currentCrop: NormalizedCropRect,
	imgW: number,
	imgH: number,
	rotation: number,
): NormalizedCropRect {
	if (ratio === 'free') return currentCrop;

	let targetRatio = 1;
	if (ratio === '1:1') targetRatio = 1;
	if (ratio === '4:3') targetRatio = 4 / 3;
	if (ratio === '16:9') targetRatio = 16 / 9;
	if (ratio === '3:4') targetRatio = 3 / 4;

	const isSwap = rotation % 180 !== 0;
	const effectiveW = isSwap ? imgH : imgW;
	const effectiveH = isSwap ? imgW : imgH;
	const currentAspect = (currentCrop.w * effectiveW) / (currentCrop.h * effectiveH);

	let newW = currentCrop.w;
	let newH = currentCrop.h;

	if (currentAspect > targetRatio) {
		newW = (newH * effectiveH * targetRatio) / effectiveW;
	} else {
		newH = (newW * effectiveW) / (effectiveH * targetRatio);
	}

	newW = Math.min(1, Math.max(0.1, newW));
	newH = Math.min(1, Math.max(0.1, newH));

	let newX = currentCrop.x + (currentCrop.w - newW) / 2;
	let newY = currentCrop.y + (currentCrop.h - newH) / 2;
	newX = Math.max(0, Math.min(1 - newW, newX));
	newY = Math.max(0, Math.min(1 - newH, newY));

	return { x: newX, y: newY, w: newW, h: newH };
}
