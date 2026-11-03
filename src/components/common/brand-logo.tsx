'use client';

import React from 'react';
import { Music } from 'lucide-react';

interface BrandLogoProps {
	size?: number | string;
	animated?: boolean;
	showBadge?: boolean;
	className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
	size = 64,
	animated = false,
	showBadge = true,
	className = '',
}) => {
	const pulseClass = animated ? 'notyka-logo-breathe' : '';
	const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 64;
	const iconSize = Math.round(numericSize * 0.52);

	return (
		<div
			className={`${pulseClass} ${className}`.trim()}
			style={{
				position: 'relative',
				width: size,
				height: size,
				borderRadius: showBadge ? `${Math.round(numericSize * 0.26)}px` : undefined,
				background: showBadge
					? 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)'
					: 'transparent',
				border: showBadge ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxShadow: showBadge
					? '0 8px 24px rgba(56, 189, 248, 0.35), 0 2px 8px rgba(99, 102, 241, 0.25)'
					: 'none',
				flexShrink: 0,
			}}
			aria-label="Notyka Logo"
		>
			<svg width={0} height={0} style={{ position: 'absolute', pointerEvents: 'none' }}>
				<defs>
					<linearGradient id="notyka-note-grad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#38bdf8" />
						<stop offset="100%" stopColor="#6366f1" />
					</linearGradient>
				</defs>
			</svg>
			<Music
				style={{
					width: iconSize,
					height: iconSize,
					stroke: showBadge ? '#ffffff' : 'url(#notyka-note-grad)',
					strokeWidth: 2.2,
					display: 'block',
					filter: showBadge ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25))' : 'none',
				}}
			/>
		</div>
	);
};
