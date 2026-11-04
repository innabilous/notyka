'use client';

import React from 'react';
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
	const borderRadius = Math.round(numericSize * 0.26);
	const borderWidth = numericSize >= 64 ? 2.5 : 2;
	const innerBorderRadius = Math.max(0, borderRadius - borderWidth);

	return (
		<div
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
						<stop offset="0%" stopColor="#38bdf8" />
						<stop offset="100%" stopColor="#6366f1" />
					</linearGradient>
				</defs>
			</svg>

			{/* Бейдж з іконкою або чиста іконка */}
			{showBadge ? (
				animated ? (
					/* Анімований бордер: повний видимий контур із сяючим світловим променем */
					<div
						style={{
							position: 'relative',
							width: numericSize,
							height: numericSize,
							borderRadius,
							padding: `${borderWidth}px`,
							boxSizing: 'border-box',
							overflow: 'hidden',
							background: 'rgba(255, 255, 255, 0.22)',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow:
								'0 8px 24px rgba(56, 189, 248, 0.35), 0 0 16px rgba(56, 189, 248, 0.25)',
							flexShrink: 0,
						}}
						aria-label="Notyka Logo"
					>
						{/* Шлейф (хвіст) променя: м'який індиго-ціановий шлейф позаду голови */}
						<div
							className="notyka-border-glow-tail"
							style={{
								position: 'absolute',
								top: '-60%',
								left: '-60%',
								width: '220%',
								height: '220%',
								background:
									'conic-gradient(from 0deg, transparent 0deg, transparent 230deg, rgba(99, 102, 241, 0.25) 260deg, #6366f1 295deg, #38bdf8 320deg, rgba(56, 189, 248, 0.3) 335deg, transparent 345deg)',
								borderRadius: '50%',
								pointerEvents: 'none',
								zIndex: 1,
							}}
						/>
						{/* Сяюча голова променя: плавне біле ядро з м'якими краями */}
						<div
							className="notyka-border-glow-head"
							style={{
								position: 'absolute',
								top: '-60%',
								left: '-60%',
								width: '220%',
								height: '220%',
								background:
									'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(255, 255, 255, 0.25) 320deg, #ffffff 342deg, rgba(255, 255, 255, 0.5) 352deg, transparent 360deg)',
								borderRadius: '50%',
								pointerEvents: 'none',
								zIndex: 2,
							}}
						/>
						{/* Внутрішній фон бейджа: гарантовано поверх градієнтів, щоб промінь не вилазив на логотип */}
						<div
							style={{
								position: 'relative',
								zIndex: 10,
								width: '100%',
								height: '100%',
								borderRadius: innerBorderRadius,
								background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								overflow: 'hidden',
							}}
						>
							<Music
								style={{
									width: iconSize,
									height: iconSize,
									stroke: '#ffffff',
									strokeWidth: 2.2,
									display: 'block',
									filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25))',
								}}
							/>
						</div>
					</div>
				) : (
					/* Статичний бейдж для звичайного відображення */
					<div
						style={{
							position: 'relative',
							width: numericSize,
							height: numericSize,
							borderRadius,
							background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
							border: '1px solid rgba(255, 255, 255, 0.28)',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow:
								'0 8px 24px rgba(56, 189, 248, 0.35), 0 2px 8px rgba(99, 102, 241, 0.25)',
							flexShrink: 0,
							overflow: 'hidden',
						}}
						aria-label="Notyka Logo"
					>
						<Music
							style={{
								width: iconSize,
								height: iconSize,
								stroke: '#ffffff',
								strokeWidth: 2.2,
								display: 'block',
								filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25))',
							}}
						/>
					</div>
				)
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
				<div
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
							color: '#ffffff',
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
				</div>
			)}
		</div>
	);
};
