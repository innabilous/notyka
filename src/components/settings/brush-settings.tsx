'use client';

import React from 'react';
import { ActionIcon, Box, Group, Slider, Text } from '@mantine/core';
import { Lock, Unlock } from 'lucide-react';
import { ToolMode } from '@/types/editor';

interface BrushSettingsProps {
	currentMode: ToolMode;
	brushSize: number;
	sizeLocked: boolean;
	mainColor: string;
	strokeColor: string;
	onChangeSize: (size: number) => void;
	onToggleLock: () => void;
	onTogglePalette: () => void;
}

export const BrushSettings: React.FC<BrushSettingsProps> = ({
	currentMode,
	brushSize,
	sizeLocked,
	mainColor,
	strokeColor,
	onChangeSize,
	onToggleLock,
	onTogglePalette,
}) => {
	const isTransparent = strokeColor === 'transparent';

	return (
		<Group
			justify="space-between"
			gap="xs"
			wrap="nowrap"
			style={{
				padding: '6px 12px',
				backgroundColor: 'rgba(17, 24, 39, 0.85)',
				borderRadius: 12,
				border: '1px solid rgba(55, 65, 81, 0.6)',
			}}
		>
			{currentMode === 'stamp' && (
				<ActionIcon
					size={32}
					radius="xl"
					variant="filled"
					color={sizeLocked ? 'indigo.6' : 'dark.4'}
					onClick={onToggleLock}
					aria-label={sizeLocked ? 'Розмір спільний для всіх нот' : 'Розмір індивідуальний'}
				>
					{sizeLocked ? <Lock size={15} /> : <Unlock size={15} />}
				</ActionIcon>
			)}

			<Text size="xs" c="dimmed" style={{ flexShrink: 0, fontWeight: 500 }}>
				Розмір:
			</Text>

			<Box style={{ flex: 1, minWidth: 60 }}>
				<Slider
					value={brushSize}
					onChange={onChangeSize}
					min={1}
					max={100}
					size="sm"
					color="indigo.5"
					label={null}
				/>
			</Box>

			<Text
				size="xs"
				fw={700}
				c="indigo.3"
				style={{
					width: 36,
					textAlign: 'right',
					fontFamily: 'monospace',
					flexShrink: 0,
				}}
			>
				{brushSize}px
			</Text>

			{currentMode !== 'eraser' && (
				<ActionIcon
					size={32}
					radius="xl"
					variant="default"
					onClick={onTogglePalette}
					aria-label="Кольори"
					style={{
						backgroundColor: 'rgba(55, 65, 81, 0.8)',
						border: '1px solid #4b5563',
						flexShrink: 0,
					}}
				>
					<div
						style={{
							width: 20,
							height: 20,
							borderRadius: '50%',
							backgroundColor: mainColor,
							border:
								currentMode !== 'stamp'
									? '2px solid rgba(255, 255, 255, 0.4)'
									: isTransparent
										? '2px solid rgba(255, 255, 255, 0.3)'
										: `2px solid ${strokeColor}`,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
						}}
					>
						{currentMode === 'stamp' && isTransparent && (
							<span style={{ fontSize: 9, color: '#ef4444', fontWeight: 'bold' }}>✕</span>
						)}
					</div>
				</ActionIcon>
			)}
		</Group>
	);
};
