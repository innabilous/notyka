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
				borderRadius: showBadge ? `${Math.round(numericSize * 0.25)}px` : undefined,
				backgroundColor: showBadge ? 'var(--panel-2)' : 'transparent',
				border: showBadge ? '1px solid var(--line-strong)' : 'none',
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxShadow: showBadge ? '0 8px 24px rgba(0, 0, 0, 0.45)' : 'none',
				flexShrink: 0,
			}}
			aria-label="Notyka Logo"
		>
			<svg width={0} height={0} style={{ position: 'absolute', pointerEvents: 'none' }}>
				<defs>
					<linearGradient id="notyka-lucide-grad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#38bdf8" />
						<stop offset="100%" stopColor="#6366f1" />
					</linearGradient>
				</defs>
			</svg>
			<Music
				style={{
					width: iconSize,
					height: iconSize,
					stroke: 'url(#notyka-lucide-grad)',
					strokeWidth: 2,
					display: 'block',
				}}
			/>
		</div>
	);
};
