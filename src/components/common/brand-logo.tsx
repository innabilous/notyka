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
	animated = false,
	showBadge = true,
	showText = false,
	className = '',
}) => {
	const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 64;
	const iconSize = Math.round(numericSize * 0.52);
	const borderRadius = Math.round(numericSize * 0.28);

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
					className={animated ? 'notyka-logo-badge animated' : 'notyka-logo-badge'}
					style={{
						position: 'relative',
						width: numericSize,
						height: numericSize,
						borderRadius,
						background: 'var(--accent, #3b82f6)',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: 'none',
						border: 'none',
						flexShrink: 0,
						overflow: 'hidden',
					}}
					aria-label="Notyka Logo"
				>
					{/* Спекулярний відблиск (surface sheen sweep) під час анімації */}
					{animated && <Box className="notyka-surface-sheen" />}

					<Music
						className={animated ? 'notyka-note-animated' : undefined}
						style={{
							width: iconSize,
							height: iconSize,
							stroke: '#ffffff',
							strokeWidth: 2.2,
							display: 'block',
							position: 'relative',
							zIndex: 3,
						}}
					/>
				</Box>
			) : (
				/* Чиста іконка без підкладки */
				<Music
					className={animated ? 'notyka-note-animated' : undefined}
					style={{
						width: iconSize,
						height: iconSize,
						stroke: 'var(--accent, #3b82f6)',
						strokeWidth: 2.2,
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
						fontFamily: 'system-ui, -apple-system, sans-serif',
						lineHeight: 1,
					}}
				>
					<span
						style={{
							fontVariant: 'small-caps',
							textTransform: 'lowercase',
							fontWeight: 700,
							letterSpacing: '0.08em',
							fontSize: `${Math.round(numericSize * 0.32)}px`,
							color: 'var(--text, #ffffff)',
						}}
					>
						Notyka
					</span>
					<span
						style={{
							fontFamily: 'system-ui, -apple-system, sans-serif',
							fontSize: `${Math.max(8, Math.round(numericSize * 0.12))}px`,
							fontWeight: 300,
							letterSpacing: '0.25em',
							color: 'var(--text-secondary, rgba(255, 255, 255, 0.65))',
							textTransform: 'lowercase',
							paddingLeft: '0.25em',
						}}
					>
						pro
					</span>
				</Box>
			)}
		</Box>
	);
};
