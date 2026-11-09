'use client';

import React from 'react';
import { Box } from '@mantine/core';
import { Music } from 'lucide-react';

interface BrandLogoProps {
	size?: number | string;
	animated?: boolean;
	showBadge?: boolean;
	showText?: boolean;
	className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
	size = 64,
	showBadge = true,
	showText = false,
	className = '',
}) => {
	const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 64;
	const iconSize = Math.round(numericSize * 0.52);
	const borderRadius = 6;

	return (
		<Box
			className={className.trim()}
			style={{
				display: 'inline-flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: showText ? `${Math.round(numericSize * 0.16)}px` : '0',
				position: 'relative',
			}}
		>
			{/* Бейдж з іконкою або чиста іконка */}
			{showBadge ? (
				<Box
					style={{
						position: 'relative',
						width: numericSize,
						height: numericSize,
						borderRadius,
						background: 'var(--panel-2)',
						border: '1px solid var(--line-strong)',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: 'var(--shadow-sm)',
						flexShrink: 0,
					}}
					aria-label="Notyka Logo"
				>
					<Music
						style={{
							width: iconSize,
							height: iconSize,
							stroke: 'var(--text)',
							strokeWidth: 2,
							display: 'block',
						}}
					/>
				</Box>
			) : (
				<Music
					style={{
						width: iconSize,
						height: iconSize,
						stroke: 'var(--text)',
						strokeWidth: 2,
						display: 'block',
					}}
				/>
			)}

			{showText && (
				<Box
					style={{
						display: 'inline-flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: `${Math.max(1, Math.round(numericSize * 0.04))}px`,
						fontFamily: 'inherit',
						lineHeight: 1,
					}}
				>
					<span
						style={{
							fontWeight: 600,
							letterSpacing: '0.04em',
							fontSize: `${Math.round(numericSize * 0.3)}px`,
							color: 'var(--text)',
						}}
					>
						Notyka
					</span>
					<span
						style={{
							fontSize: `${Math.max(8, Math.round(numericSize * 0.12))}px`,
							fontWeight: 500,
							letterSpacing: '0.12em',
							color: 'var(--muted)',
							textTransform: 'uppercase',
						}}
					>
						editor
					</span>
				</Box>
			)}
		</Box>
	);
};

