'use client';

import React, { useRef } from 'react';
import { Box, Group, Paper, SimpleGrid, Text, UnstyledButton } from '@mantine/core';
import { Pipette } from 'lucide-react';
import { PALETTE_COLORS } from '@/constants/editor';
import { ToolMode } from '@/types/editor';

interface ColorPaletteModalProps {
	opened: boolean;
	currentMode: ToolMode;
	mainColor: string;
	strokeColor: string;
	onChangeMainColor: (color: string) => void;
	onChangeStrokeColor: (color: string) => void;
	onClose: () => void;
}

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
	opened,
	currentMode,
	mainColor,
	strokeColor,
	onChangeMainColor,
	onChangeStrokeColor,
}) => {
	const fillInputRef = useRef<HTMLInputElement>(null);
	const strokeInputRef = useRef<HTMLInputElement>(null);

	if (!opened) return null;

	const isStamp = currentMode === 'stamp';

	return (
		<Paper
			shadow="xl"
			p="sm"
			radius="lg"
			style={{
				position: 'absolute',
				bottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))',
				right: '1rem',
				backgroundColor: 'rgba(31, 41, 55, 0.95)',
				backdropFilter: 'blur(12px)',
				border: '1px solid rgba(75, 85, 99, 0.6)',
				width: 'min(360px, calc(100vw - 2rem))',
				zIndex: 50,
			}}
		>
			<Box mb="xs">
				<Group justify="space-between" mb={6}>
					<Text size="xs" c="dimmed" fw={600}>
						{isStamp ? 'Колір штампа:' : 'Колір олівця:'}
					</Text>
					<UnstyledButton
						onClick={() => fillInputRef.current?.click()}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 4,
							fontSize: 11,
							color: '#818cf8',
							cursor: 'pointer',
						}}
					>
						<Pipette size={12} />
						Свій
						<input
							ref={fillInputRef}
							type="color"
							value={mainColor.startsWith('#') ? mainColor : '#ff0055'}
							onChange={(e) => onChangeMainColor(e.target.value)}
							style={{
								position: 'absolute',
								opacity: 0,
								width: 0,
								height: 0,
								pointerEvents: 'none',
							}}
						/>
					</UnstyledButton>
				</Group>

				<SimpleGrid cols={10} spacing={4}>
					{PALETTE_COLORS.map((c) => (
						<UnstyledButton
							key={`fill-${c}`}
							onClick={() => onChangeMainColor(c)}
							style={{
								width: '100%',
								aspectRatio: '1',
								borderRadius: '50%',
								backgroundColor: c,
								border:
									mainColor === c
										? '2px solid #818cf8'
										: '1px solid rgba(255, 255, 255, 0.3)',
								boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
								transform: mainColor === c ? 'scale(1.1)' : 'scale(1)',
								transition: 'transform 0.15s',
							}}
						/>
					))}
				</SimpleGrid>
			</Box>

			{isStamp && (
				<Box pt="xs" style={{ borderTop: '1px solid rgba(55, 65, 81, 0.6)' }}>
					<Group justify="space-between" mb={6}>
						<Text size="xs" c="dimmed" fw={600}>
							Колір обводки:
						</Text>
						<UnstyledButton
							onClick={() => strokeInputRef.current?.click()}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 4,
								fontSize: 11,
								color: '#818cf8',
								cursor: 'pointer',
							}}
						>
							<Pipette size={12} />
							Свій
							<input
								ref={strokeInputRef}
								type="color"
								value={strokeColor.startsWith('#') ? strokeColor : '#000000'}
								onChange={(e) => onChangeStrokeColor(e.target.value)}
								style={{
									position: 'absolute',
									opacity: 0,
									width: 0,
									height: 0,
									pointerEvents: 'none',
								}}
							/>
						</UnstyledButton>
					</Group>

					<SimpleGrid cols={11} spacing={4}>
						{PALETTE_COLORS.map((c) => (
							<UnstyledButton
								key={`stroke-${c}`}
								onClick={() => onChangeStrokeColor(c)}
								style={{
									width: '100%',
									aspectRatio: '1',
									borderRadius: '50%',
									backgroundColor: c,
									border:
										strokeColor === c
											? '2px solid #818cf8'
											: '1px solid rgba(255, 255, 255, 0.3)',
									boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
									transform: strokeColor === c ? 'scale(1.1)' : 'scale(1)',
									transition: 'transform 0.15s',
								}}
							/>
						))}
						<UnstyledButton
							onClick={() => onChangeStrokeColor('transparent')}
							style={{
								width: '100%',
								aspectRatio: '1',
								borderRadius: '50%',
								backgroundColor: '#111827',
								border:
									strokeColor === 'transparent'
										? '2px solid #ef4444'
										: '1px solid rgba(239, 68, 68, 0.6)',
								color: '#ef4444',
								fontSize: 10,
								fontWeight: 700,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: strokeColor === 'transparent' ? 'scale(1.1)' : 'scale(1)',
								transition: 'transform 0.15s',
							}}
							title="Без обводки"
						>
							✕
						</UnstyledButton>
					</SimpleGrid>
				</Box>
			)}
		</Paper>
	);
};
