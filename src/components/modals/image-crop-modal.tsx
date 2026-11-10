'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActionIcon, Box, Button, Group, Modal, Stack, Tooltip } from '@mantine/core';
import clsx from 'clsx';
import {
	Check,
	FlipHorizontal,
	FlipVertical,
	RotateCcw,
	RotateCw,
	SlidersHorizontal,
	Undo2,
	X,
} from 'lucide-react';
import classes from './image-crop-modal.module.css';

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

export function ImageCropModal({
	opened,
	imageSrc,
	fileName,
	onApply,
	onCancel,
}: ImageCropModalProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);
	const cropFrameRef = useRef<HTMLDivElement>(null);
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

	const isRotated90or270 = rotation % 180 !== 0;

	// Sync dynamic crop frame and image transform variables without inline style props
	useLayoutEffect(() => {
		const container = containerRef.current;
		if (container && imageElement) {
			const nw = imageElement.naturalWidth || imageElement.width;
			const nh = imageElement.naturalHeight || imageElement.height;
			const aspect = isRotated90or270 ? `${nh} / ${nw}` : `${nw} / ${nh}`;
			container.style.setProperty('--crop-aspect', aspect);
		}

		const img = imgRef.current;
		if (img) {
			img.style.setProperty(
				'--img-transform',
				`rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
			);
			img.style.setProperty(
				'--img-filter',
				enhanceClarity ? 'contrast(1.14) brightness(1.02)' : 'none',
			);
		}

		const frame = cropFrameRef.current;
		if (frame) {
			frame.style.setProperty('--crop-left', `${crop.x * 100}%`);
			frame.style.setProperty('--crop-top', `${crop.y * 100}%`);
			frame.style.setProperty('--crop-width', `${crop.w * 100}%`);
			frame.style.setProperty('--crop-height', `${crop.h * 100}%`);
		}
	}, [imageElement, isRotated90or270, rotation, flipH, flipV, enhanceClarity, crop]);

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

	function handleAspectChange(ratio: AspectRatio) {
		setAspectRatio(ratio);
		if (!imageElement) return;
		const nw = imageElement.naturalWidth || imageElement.width;
		const nh = imageElement.naturalHeight || imageElement.height;
		setCrop((prev) => applyAspect(ratio, prev, nw, nh));
	}

	function handleRotateLeft() {
		setRotation((prev) => (prev + 270) % 360);
	}

	function handleRotateRight() {
		setRotation((prev) => (prev + 90) % 360);
	}

	function handleToggleFlipH() {
		setFlipH((prev) => !prev);
	}

	function handleToggleFlipV() {
		setFlipV((prev) => !prev);
	}

	function handleToggleEnhance() {
		setEnhanceClarity((prev) => !prev);
	}

	function handleReset() {
		setRotation(0);
		setFlipH(false);
		setFlipV(false);
		setEnhanceClarity(false);
		setAspectRatio('free');
		setCrop({ x: 0, y: 0, w: 1, h: 1 });
	}

	function onPointerDown(
		mode: 'move' | 'nw' | 'ne' | 'se' | 'sw',
		e: React.PointerEvent<HTMLDivElement>,
	) {
		e.stopPropagation();
		e.preventDefault();
		dragModeRef.current = mode;
		dragStartRef.current = {
			clientX: e.clientX,
			clientY: e.clientY,
			startCrop: { ...crop },
		};
	}

	// Pointer move / up listeners on window
	useEffect(() => {
		function handlePointerMove(e: PointerEvent) {
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
		}

		function handlePointerUp() {
			dragModeRef.current = null;
		}

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
		return () => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
		};
	}, [aspectRatio, imageElement, rotation]);

	// Render processed image in full high resolution
	function handleApply() {
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

		// Second offscreen canvas: crop
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
	}

	if (!opened || !imageSrc) return null;

	return (
		<Modal
			fullScreen
			opened={opened}
			onClose={onCancel}
			withCloseButton={false}
			padding={0}
			classNames={{
				body: classes.modalBody,
			}}
		>
			{/* Top Bar */}
			<Group justify="space-between" px="md" py="xs" className={classes.topBar}>
				<Button
					variant="subtle"
					color="gray"
					leftSection={<X size={18} />}
					onClick={onCancel}
				>
					Скасувати
				</Button>

				<Button leftSection={<Check size={18} />} onClick={handleApply}>
					Готово
				</Button>
			</Group>

			{/* Center Preview with interactive crop box */}
			<Box className={classes.previewArea}>
				{imageElement && (
					<Box ref={containerRef} className={classes.imageContainer}>
						{/* Rotated & flipped image */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							ref={imgRef}
							src={imageSrc}
							alt="Preview"
							className={classes.previewImage}
						/>

						{/* Dark overlay outside crop box */}
						<Box className={classes.darkOverlay} />

						{/* Interactive Crop Frame */}
						<Box
							ref={cropFrameRef}
							className={classes.cropFrame}
							onPointerDown={(e) => onPointerDown('move', e)}
						>
							{/* 3x3 Grid lines */}
							<Box className={classes.gridOverlay}>
								<Box className={classes.gridBorderRight} />
								<Box className={classes.gridBorderRight} />
								<Box />
								<Box className={classes.gridBorderTopRight} />
								<Box className={classes.gridBorderTopRight} />
								<Box className={classes.gridBorderTop} />
								<Box className={classes.gridBorderTopRight} />
								<Box className={classes.gridBorderTopRight} />
								<Box className={classes.gridBorderTop} />
							</Box>

							{/* Corner handles */}
							<Box
								className={clsx(classes.handle, classes.handleNw)}
								onPointerDown={(e) => onPointerDown('nw', e)}
							/>
							<Box
								className={clsx(classes.handle, classes.handleNe)}
								onPointerDown={(e) => onPointerDown('ne', e)}
							/>
							<Box
								className={clsx(classes.handle, classes.handleSe)}
								onPointerDown={(e) => onPointerDown('se', e)}
							/>
							<Box
								className={clsx(classes.handle, classes.handleSw)}
								onPointerDown={(e) => onPointerDown('sw', e)}
							/>
						</Box>
					</Box>
				)}
			</Box>

			{/* Bottom Controls Bar */}
			<Stack gap="xs" px="sm" py="xs" className={classes.bottomBar}>
				{/* Aspect ratio buttons */}
				<Group gap={6} justify="center" wrap="nowrap" className={classes.aspectGroup}>
					{(['free', '1:1', '4:3', '16:9', '3:4'] as const).map((ratio) => (
						<Button
							key={ratio}
							size="compact-xs"
							radius="md"
							variant={aspectRatio === ratio ? 'filled' : 'default'}
							onClick={() => handleAspectChange(ratio)}
							className={classes.aspectBtn}
						>
							{ratio === 'free' ? 'Вільний' : ratio}
						</Button>
					))}
				</Group>

				{/* Transform buttons: Rotate & Flip & Reset */}
				<Group gap="sm" justify="center">
					<Tooltip label="Повернути проти годинникової стрілки (-90°)">
						<ActionIcon
							size={36}
							radius="md"
							variant="default"
							onClick={handleRotateLeft}
							aria-label="Повернути проти годинникової стрілки"
						>
							<RotateCcw size={16} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Повернути за годинниковою стрілкою (+90°)">
						<ActionIcon
							size={36}
							radius="md"
							variant="default"
							onClick={handleRotateRight}
							aria-label="Повернути за годинниковою стрілкою"
						>
							<RotateCw size={16} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Віддзеркалити горизонтально">
						<ActionIcon
							size={36}
							radius="md"
							variant={flipH ? 'filled' : 'default'}
							onClick={handleToggleFlipH}
							aria-label="Віддзеркалити горизонтально"
						>
							<FlipHorizontal size={16} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Віддзеркалити вертикально">
						<ActionIcon
							size={36}
							radius="md"
							variant={flipV ? 'filled' : 'default'}
							onClick={handleToggleFlipV}
							aria-label="Віддзеркалити вертикально"
						>
							<FlipVertical size={16} />
						</ActionIcon>
					</Tooltip>

					<Tooltip
						label={
							enhanceClarity
								? 'Покращення чіткості увімкнено (натисніть, щоб вимкнути)'
								: 'Покращити чіткість нот та контраст партитури'
						}
					>
						<ActionIcon
							size={36}
							radius="md"
							variant={enhanceClarity ? 'filled' : 'default'}
							onClick={handleToggleEnhance}
							aria-label="Покращити чіткість нот та контраст партитури"
						>
							<SlidersHorizontal size={16} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Скинути налаштування">
						<ActionIcon
							size={36}
							radius="md"
							variant="default"
							color="gray"
							onClick={handleReset}
							aria-label="Скинути налаштування"
						>
							<Undo2 size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Stack>
		</Modal>
	);
}
