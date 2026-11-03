'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Check,
	Crop,
	FlipHorizontal,
	FlipVertical,
	RotateCcw,
	RotateCw,
	Sparkles,
	Undo2,
	X,
} from 'lucide-react';

interface ImageCropModalProps {
	opened: boolean;
	imageSrc: string | null;
	fileName?: string;
	onApply: (processedDataUrl: string, title?: string) => void;
	onCancel: () => void;
}

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '3:4';

interface NormalizedRect {
	x: number; // 0..1
	y: number; // 0..1
	w: number; // 0..1
	h: number; // 0..1
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
	opened,
	imageSrc,
	fileName,
	onApply,
	onCancel,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

	const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
	const [flipH, setFlipH] = useState<boolean>(false);
	const [flipV, setFlipV] = useState<boolean>(false);
	const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');
	const [enhanceClarity, setEnhanceClarity] = useState<boolean>(false);

	const [crop, setCrop] = useState<NormalizedRect>({ x: 0, y: 0, w: 1, h: 1 });
	const dragModeRef = useRef<'move' | 'nw' | 'ne' | 'se' | 'sw' | null>(null);
	const dragStartRef = useRef<{ clientX: number; clientY: number; startCrop: NormalizedRect }>({
		clientX: 0,
		clientY: 0,
		startCrop: { x: 0, y: 0, w: 1, h: 1 },
	});

	// Load image when src changes
	useEffect(() => {
		if (!imageSrc || !opened) {
			setImageElement(null);
			return;
		}
		const img = new Image();
		img.onload = () => {
			setImageElement(img);
			setRotation(0);
			setFlipH(false);
			setFlipV(false);
			setEnhanceClarity(false);
			setCrop({ x: 0, y: 0, w: 1, h: 1 });
		};
		img.src = imageSrc;
	}, [imageSrc, opened]);

	// Adjust crop rect when aspect ratio changes
	const applyAspect = useCallback(
		(ratio: AspectRatio, currentCrop: NormalizedRect, imgW: number, imgH: number) => {
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
		},
		[rotation],
	);

	const handleAspectChange = (ratio: AspectRatio) => {
		setAspectRatio(ratio);
		if (!imageElement) return;
		const nw = imageElement.naturalWidth || imageElement.width;
		const nh = imageElement.naturalHeight || imageElement.height;
		setCrop((prev) => applyAspect(ratio, prev, nw, nh));
	};

	const handleRotateLeft = () => {
		setRotation((prev) => (prev + 270) % 360);
	};

	const handleRotateRight = () => {
		setRotation((prev) => (prev + 90) % 360);
	};

	const handleToggleFlipH = () => {
		setFlipH((prev) => !prev);
	};

	const handleToggleFlipV = () => {
		setFlipV((prev) => !prev);
	};

	const handleToggleEnhance = () => {
		setEnhanceClarity((prev) => !prev);
	};

	const handleReset = () => {
		setRotation(0);
		setFlipH(false);
		setFlipV(false);
		setEnhanceClarity(false);
		setAspectRatio('free');
		setCrop({ x: 0, y: 0, w: 1, h: 1 });
	};

	// Start dragging
	const onPointerDown = (
		mode: 'move' | 'nw' | 'ne' | 'se' | 'sw',
		e: React.PointerEvent<HTMLDivElement>,
	) => {
		e.stopPropagation();
		e.preventDefault();
		dragModeRef.current = mode;
		dragStartRef.current = {
			clientX: e.clientX,
			clientY: e.clientY,
			startCrop: { ...crop },
		};
	};

	// Pointer move / up listeners on window
	useEffect(() => {
		const handlePointerMove = (e: PointerEvent) => {
			if (!dragModeRef.current || !containerRef.current || !imageElement) return;
			const rect = containerRef.current.getBoundingClientRect();
			if (rect.width <= 0 || rect.height <= 0) return;

			const dx = (e.clientX - dragStartRef.current.clientX) / rect.width;
			const dy = (e.clientY - dragStartRef.current.clientY) / rect.height;
			const start = dragStartRef.current.startCrop;
			const mode = dragModeRef.current;

			let nx = start.x;
			let ny = start.y;
			let nw = start.w;
			let nh = start.h;

			if (mode === 'move') {
				nx = Math.max(0, Math.min(1 - start.w, start.x + dx));
				ny = Math.max(0, Math.min(1 - start.h, start.y + dy));
			} else if (aspectRatio === 'free') {
				// Free aspect ratio resizing
				if (mode === 'se') {
					nw = Math.max(0.1, Math.min(1 - start.x, start.w + dx));
					nh = Math.max(0.1, Math.min(1 - start.y, start.h + dy));
				} else if (mode === 'sw') {
					const maxDx = start.w - 0.1;
					const realDx = Math.max(-start.x, Math.min(maxDx, dx));
					nx = start.x + realDx;
					nw = start.w - realDx;
					nh = Math.max(0.1, Math.min(1 - start.y, start.h + dy));
				} else if (mode === 'ne') {
					const maxDy = start.h - 0.1;
					const realDy = Math.max(-start.y, Math.min(maxDy, dy));
					ny = start.y + realDy;
					nh = start.h - realDy;
					nw = Math.max(0.1, Math.min(1 - start.x, start.w + dx));
				} else if (mode === 'nw') {
					const maxDx = start.w - 0.1;
					const maxDy = start.h - 0.1;
					const realDx = Math.max(-start.x, Math.min(maxDx, dx));
					const realDy = Math.max(-start.y, Math.min(maxDy, dy));
					nx = start.x + realDx;
					nw = start.w - realDx;
					ny = start.y + realDy;
					nh = start.h - realDy;
				}
			} else {
				// Fixed aspect ratio resizing
				let targetRatio = 1;
				if (aspectRatio === '1:1') targetRatio = 1;
				if (aspectRatio === '4:3') targetRatio = 4 / 3;
				if (aspectRatio === '16:9') targetRatio = 16 / 9;
				if (aspectRatio === '3:4') targetRatio = 3 / 4;

				const isSwap = rotation % 180 !== 0;
				const effW = isSwap ? imageElement.height : imageElement.width;
				const effH = isSwap ? imageElement.width : imageElement.height;
				const normRatio = (targetRatio * effH) / effW;

				if (mode === 'se') {
					nw = Math.max(0.1, Math.min(1 - start.x, start.w + dx));
					nh = nw / normRatio;
					if (nh > 1 - start.y) {
						nh = 1 - start.y;
						nw = nh * normRatio;
					}
				} else if (mode === 'sw') {
					nw = Math.max(0.1, Math.min(start.x + start.w, start.w - dx));
					nh = nw / normRatio;
					if (nh > 1 - start.y) {
						nh = 1 - start.y;
						nw = nh * normRatio;
					}
					nx = start.x + start.w - nw;
				} else if (mode === 'ne') {
					nw = Math.max(0.1, Math.min(1 - start.x, start.w + dx));
					nh = nw / normRatio;
					if (nh > start.y + start.h) {
						nh = start.y + start.h;
						nw = nh * normRatio;
					}
					ny = start.y + start.h - nh;
				} else if (mode === 'nw') {
					nw = Math.max(0.1, Math.min(start.x + start.w, start.w - dx));
					nh = nw / normRatio;
					if (nh > start.y + start.h) {
						nh = start.y + start.h;
						nw = nh * normRatio;
					}
					nx = start.x + start.w - nw;
					ny = start.y + start.h - nh;
				}
			}

			setCrop({ x: nx, y: ny, w: nw, h: nh });
		};

		const handlePointerUp = () => {
			dragModeRef.current = null;
		};

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
		return () => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
		};
	}, [aspectRatio, imageElement, rotation]);

	// Render processed image in full high resolution
	const handleApply = () => {
		if (!imageElement || !imageSrc) return;

		// If no modifications were made, return original image without generation loss
		if (
			rotation === 0 &&
			!flipH &&
			!flipV &&
			crop.x === 0 &&
			crop.y === 0 &&
			crop.w === 1 &&
			crop.h === 1 &&
			!enhanceClarity
		) {
			onApply(imageSrc, fileName);
			return;
		}

		const naturalW = imageElement.naturalWidth || imageElement.width;
		const naturalH = imageElement.naturalHeight || imageElement.height;
		const isSwap = rotation % 180 !== 0;
		const rotW = isSwap ? naturalH : naturalW;
		const rotH = isSwap ? naturalW : naturalH;

		const rotCanvas = document.createElement('canvas');
		rotCanvas.width = rotW;
		rotCanvas.height = rotH;
		const rctx = rotCanvas.getContext('2d');
		if (!rctx) return;

		rctx.imageSmoothingEnabled = true;
		rctx.imageSmoothingQuality = 'high';

		rctx.save();
		rctx.translate(rotW / 2, rotH / 2);
		rctx.rotate((rotation * Math.PI) / 180);
		rctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
		rctx.drawImage(imageElement, -naturalW / 2, -naturalH / 2, naturalW, naturalH);
		rctx.restore();

		// 2. Second offscreen canvas: crop
		const cropPxX = Math.max(0, Math.min(rotW - 1, Math.round(crop.x * rotW)));
		const cropPxY = Math.max(0, Math.min(rotH - 1, Math.round(crop.y * rotH)));
		const cropPxW = Math.max(1, Math.min(rotW - cropPxX, Math.round(crop.w * rotW)));
		const cropPxH = Math.max(1, Math.min(rotH - cropPxY, Math.round(crop.h * rotH)));

		const cropCanvas = document.createElement('canvas');
		cropCanvas.width = cropPxW;
		cropCanvas.height = cropPxH;
		const cctx = cropCanvas.getContext('2d');
		if (!cctx) return;

		cctx.imageSmoothingEnabled = true;
		cctx.imageSmoothingQuality = 'high';

		if (enhanceClarity) {
			// Boost contrast and brightness for crisp, readable musical score lines
			cctx.filter = 'contrast(1.14) brightness(1.02)';
		}

		cctx.drawImage(rotCanvas, cropPxX, cropPxY, cropPxW, cropPxH, 0, 0, cropPxW, cropPxH);

		const resultUrl = cropCanvas.toDataURL('image/png');
		onApply(resultUrl, fileName);
	};

	if (!opened || !imageSrc) return null;

	const isRotated90or270 = rotation % 180 !== 0;

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 9999,
				backgroundColor: 'rgba(3, 7, 18, 0.96)',
				backdropFilter: 'blur(10px)',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				overflow: 'hidden',
			}}
		>
			{/* Top Bar */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0.75rem 1rem',
					borderBottom: '1px solid var(--line)',
					background: 'rgba(31, 41, 55, 0.8)',
				}}
			>
				<button
					type="button"
					style={{
						color: 'var(--muted)',
						display: 'flex',
						alignItems: 'center',
						gap: '0.35rem',
						fontSize: '0.9rem',
						cursor: 'pointer',
					}}
					onClick={onCancel}
				>
					<X className="icon" />
					<span>Скасувати</span>
				</button>

				<button
					type="button"
					style={{
						backgroundColor: 'var(--accent)',
						color: '#ffffff',
						borderRadius: '0.5rem',
						padding: '0.4rem 0.85rem',
						display: 'flex',
						alignItems: 'center',
						gap: '0.35rem',
						fontWeight: 600,
						fontSize: '0.9rem',
						cursor: 'pointer',
					}}
					onClick={handleApply}
				>
					<Check className="icon" />
					<span>Готово</span>
				</button>
			</div>

			{/* Center Preview with interactive crop box */}
			<div
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '1.5rem',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				{imageElement && (
					<div
						ref={containerRef}
						style={{
							position: 'relative',
							maxWidth: '100%',
							maxHeight: '100%',
							aspectRatio: isRotated90or270
								? `${imageElement.naturalHeight || imageElement.height} / ${imageElement.naturalWidth || imageElement.width}`
								: `${imageElement.naturalWidth || imageElement.width} / ${imageElement.naturalHeight || imageElement.height}`,
							boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
							userSelect: 'none',
							touchAction: 'none',
						}}
					>
						{/* Rotated & flipped image */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={imageSrc}
							alt="Preview"
							style={{
								width: '100%',
								height: '100%',
								display: 'block',
								objectFit: 'contain',
								transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
								filter: enhanceClarity ? 'contrast(1.14) brightness(1.02)' : 'none',
								transition: 'transform 0.15s ease-out, filter 0.15s ease-out',
								pointerEvents: 'none',
							}}
						/>

						{/* Dark overlay outside crop box */}
						<div
							style={{
								position: 'absolute',
								inset: 0,
								backgroundColor: 'rgba(0, 0, 0, 0.55)',
								pointerEvents: 'none',
							}}
						/>

						{/* Interactive Crop Frame */}
						<div
							style={{
								position: 'absolute',
								left: `${crop.x * 100}%`,
								top: `${crop.y * 100}%`,
								width: `${crop.w * 100}%`,
								height: `${crop.h * 100}%`,
								border: '2px solid #ffffff',
								boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
								cursor: 'move',
								boxSizing: 'border-box',
							}}
							onPointerDown={(e) => onPointerDown('move', e)}
						>
							{/* 3x3 Grid lines */}
							<div
								style={{
									position: 'absolute',
									inset: 0,
									display: 'grid',
									gridTemplateColumns: '1fr 1fr 1fr',
									gridTemplateRows: '1fr 1fr 1fr',
									pointerEvents: 'none',
								}}
							>
								<div style={{ borderRight: '1px dashed rgba(255,255,255,0.4)' }} />
								<div style={{ borderRight: '1px dashed rgba(255,255,255,0.4)' }} />
								<div />
								<div
									style={{
										borderTop: '1px dashed rgba(255,255,255,0.4)',
										borderRight: '1px dashed rgba(255,255,255,0.4)',
									}}
								/>
								<div
									style={{
										borderTop: '1px dashed rgba(255,255,255,0.4)',
										borderRight: '1px dashed rgba(255,255,255,0.4)',
									}}
								/>
								<div style={{ borderTop: '1px dashed rgba(255,255,255,0.4)' }} />
								<div
									style={{
										borderTop: '1px dashed rgba(255,255,255,0.4)',
										borderRight: '1px dashed rgba(255,255,255,0.4)',
									}}
								/>
								<div
									style={{
										borderTop: '1px dashed rgba(255,255,255,0.4)',
										borderRight: '1px dashed rgba(255,255,255,0.4)',
									}}
								/>
								<div style={{ borderTop: '1px dashed rgba(255,255,255,0.4)' }} />
							</div>

							{/* Corner handles */}
							<div
								style={{
									position: 'absolute',
									left: -8,
									top: -8,
									width: 16,
									height: 16,
									borderLeft: '4px solid var(--accent-2)',
									borderTop: '4px solid var(--accent-2)',
									cursor: 'nwse-resize',
								}}
								onPointerDown={(e) => onPointerDown('nw', e)}
							/>
							<div
								style={{
									position: 'absolute',
									right: -8,
									top: -8,
									width: 16,
									height: 16,
									borderRight: '4px solid var(--accent-2)',
									borderTop: '4px solid var(--accent-2)',
									cursor: 'nesw-resize',
								}}
								onPointerDown={(e) => onPointerDown('ne', e)}
							/>
							<div
								style={{
									position: 'absolute',
									right: -8,
									bottom: -8,
									width: 16,
									height: 16,
									borderRight: '4px solid var(--accent-2)',
									borderBottom: '4px solid var(--accent-2)',
									cursor: 'nwse-resize',
								}}
								onPointerDown={(e) => onPointerDown('se', e)}
							/>
							<div
								style={{
									position: 'absolute',
									left: -8,
									bottom: -8,
									width: 16,
									height: 16,
									borderLeft: '4px solid var(--accent-2)',
									borderBottom: '4px solid var(--accent-2)',
									cursor: 'nesw-resize',
								}}
								onPointerDown={(e) => onPointerDown('sw', e)}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Bottom Controls Bar */}
			<div
				style={{
					background: 'rgba(31, 41, 55, 0.95)',
					borderTop: '1px solid var(--line)',
					padding: '0.65rem 0.75rem',
					paddingBottom: 'calc(0.65rem + env(safe-area-inset-bottom, 0px))',
					display: 'flex',
					flexDirection: 'column',
					gap: '0.5rem',
				}}
			>
				{/* Aspect ratio buttons */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '0.35rem',
						overflowX: 'auto',
						padding: '0.1rem 0',
					}}
				>
					{(['free', '1:1', '4:3', '16:9', '3:4'] as const).map((ratio) => (
						<button
							key={ratio}
							type="button"
							style={{
								padding: '0.3rem 0.6rem',
								borderRadius: '0.5rem',
								fontSize: '0.75rem',
								fontWeight: 600,
								backgroundColor: aspectRatio === ratio ? 'var(--accent)' : 'var(--panel-2)',
								color: aspectRatio === ratio ? '#ffffff' : 'var(--muted)',
								border: '1px solid var(--line)',
								cursor: 'pointer',
								textTransform: 'uppercase',
								flexShrink: 0,
							}}
							onClick={() => handleAspectChange(ratio)}
						>
							{ratio === 'free' ? 'Вільний' : ratio}
						</button>
					))}
				</div>

				{/* Transform buttons: Rotate & Flip & Reset (Icon-only, compact & touch-friendly) */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '0.75rem',
					}}
				>
					<button
						type="button"
						style={{
							width: '2.5rem',
							height: '2.5rem',
							borderRadius: '50%',
							background: 'var(--panel-2)',
							border: '1px solid var(--line)',
							color: 'var(--text)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
						onClick={handleRotateLeft}
						title="Повернути проти годинникової стрілки (-90°)"
						aria-label="Повернути проти годинникової стрілки"
					>
						<RotateCcw className="icon" />
					</button>

					<button
						type="button"
						style={{
							width: '2.5rem',
							height: '2.5rem',
							borderRadius: '50%',
							background: 'var(--panel-2)',
							border: '1px solid var(--line)',
							color: 'var(--text)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
						onClick={handleRotateRight}
						title="Повернути за годинниковою стрілкою (+90°)"
						aria-label="Повернути за годинниковою стрілкою"
					>
						<RotateCw className="icon" />
					</button>

					<button
						type="button"
						style={{
							width: '2.5rem',
							height: '2.5rem',
							borderRadius: '50%',
							background: flipH ? 'var(--accent)' : 'var(--panel-2)',
							border: '1px solid var(--line)',
							color: flipH ? '#ffffff' : 'var(--text)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
						onClick={handleToggleFlipH}
						title="Віддзеркалити горизонтально"
						aria-label="Віддзеркалити горизонтально"
					>
						<FlipHorizontal className="icon" />
					</button>

					<button
						type="button"
						style={{
							width: '2.5rem',
							height: '2.5rem',
							borderRadius: '50%',
							background: flipV ? 'var(--accent)' : 'var(--panel-2)',
							border: '1px solid var(--line)',
							color: flipV ? '#ffffff' : 'var(--text)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
						onClick={handleToggleFlipV}
						title="Віддзеркалити вертикально"
						aria-label="Віддзеркалити вертикально"
					>
						<FlipVertical className="icon" />
					</button>

					<button
						type="button"
						style={{
							width: '2.5rem',
							height: '2.5rem',
							borderRadius: '50%',
							background: enhanceClarity ? 'var(--accent-gradient)' : 'var(--panel-2)',
							border: enhanceClarity ? 'none' : '1px solid var(--line)',
							color: enhanceClarity ? '#ffffff' : 'var(--text)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							boxShadow: enhanceClarity ? '0 2px 8px rgba(56, 189, 248, 0.3)' : 'none',
						}}
						onClick={handleToggleEnhance}
						title={
							enhanceClarity
								? 'Покращення чіткості увімкнено (натисніть, щоб вимкнути)'
								: 'Покращити чіткість нот та контраст партитури'
						}
						aria-label="Покращити чіткість нот та контраст партитури"
					>
						<Sparkles className="icon" />
					</button>

					<button
						type="button"
						style={{
							width: '2.5rem',
							height: '2.5rem',
							borderRadius: '50%',
							background: 'var(--panel-2)',
							border: '1px solid var(--line)',
							color: 'var(--muted)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
						onClick={handleReset}
						title="Скинути налаштування"
						aria-label="Скинути налаштування"
					>
						<Undo2 className="icon" />
					</button>
				</div>
			</div>
		</div>
	);
};
