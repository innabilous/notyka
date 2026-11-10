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
			<svg width={0} height={0} style={{ position: 'absolute', pointerEvents: 'none' }}>
				<defs>
					<linearGradient id="notyka-note-grad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="var(--accent, #3b82f6)" />
						<stop
							offset="100%"
							stopColor="color-mix(in srgb, var(--accent, #3b82f6) 75%, #000000 25%)"
						/>
					</linearGradient>
				</defs>
			</svg>

			{/* Бейдж з іконкою або чиста іконка */}
			{showBadge ? (
				<Box
					className={animated ? 'notyka-logo-badge animated' : 'notyka-logo-badge'}
					style={{
						position: 'relative',
						width: numericSize,
						height: numericSize,
						borderRadius,
						background:
							'linear-gradient(145deg, var(--accent, #3b82f6) 0%, color-mix(in srgb, var(--accent, #3b82f6) 76%, #000000 24%) 100%)',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: 'none',
						flexShrink: 0,
						overflow: 'hidden',
					}}
					aria-label="Notyka Logo"
				>
					{/* Анімований промінь по контуру (border beam) */}
					{animated && (
						<svg
							className="notyka-border-beam"
							style={{
								position: 'absolute',
								inset: -2,
								width: numericSize + 4,
								height: numericSize + 4,
								pointerEvents: 'none',
								borderRadius: borderRadius + 2,
								zIndex: 2,
							}}
							viewBox={`0 0 ${numericSize + 4} ${numericSize + 4}`}
							fill="none"
						>
							<defs>
								<filter id="notyka-beam-glow" x="-50%" y="-50%" width="200%" height="200%">
									<feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
									<feMerge>
										<feMergeNode in="blur" />
										<feMergeNode in="SourceGraphic" />
									</feMerge>
								</filter>
								<linearGradient id="notyka-beam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
									<stop offset="50%" stopColor="rgba(255, 255, 255, 0.6)" />
									<stop offset="100%" stopColor="#ffffff" />
								</linearGradient>
							</defs>
							<rect
								x={2}
								y={2}
								width={numericSize}
								height={numericSize}
								rx={borderRadius}
								ry={borderRadius}
								className="notyka-beam-track"
							/>
							<rect
								x={2}
								y={2}
								width={numericSize}
								height={numericSize}
								rx={borderRadius}
								ry={borderRadius}
								className="notyka-beam-head"
								filter="url(#notyka-beam-glow)"
								pathLength="100"
							/>
						</svg>
					)}

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
					style={{
						width: iconSize,
						height: iconSize,
						stroke: 'url(#notyka-note-grad)',
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
