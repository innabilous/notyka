'use client';

import React, { useEffect, useState } from 'react';
import { BrandLogo } from './brand-logo';

interface AppPreloaderProps {
	isLoading: boolean;
}

export const AppPreloader: React.FC<AppPreloaderProps> = ({ isLoading }) => {
	const [shouldRender, setShouldRender] = useState(true);

	useEffect(() => {
		if (!isLoading) {
			const timer = setTimeout(() => {
				setShouldRender(false);
			}, 400);
			return () => clearTimeout(timer);
		} else {
			setShouldRender(true);
		}
	}, [isLoading]);

	if (!shouldRender) return null;

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 9999,
				backgroundColor: 'var(--bg-dark)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				opacity: isLoading ? 1 : 0,
				transition: 'opacity 0.35s ease-out',
				pointerEvents: isLoading ? 'auto' : 'none',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '1rem',
				}}
			>
				{/* Animated Bespoke Logo */}
				<BrandLogo size={80} animated={true} />

				{/* Brand title */}
				<h1
					style={{
						fontSize: '1.5rem',
						fontWeight: 600,
						letterSpacing: '-0.025em',
						color: 'var(--text)',
						margin: 0,
					}}
				>
					Notyka
				</h1>
			</div>
		</div>
	);
};
