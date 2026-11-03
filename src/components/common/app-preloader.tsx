'use client';

import React, { useEffect, useState } from 'react';
import { Music } from 'lucide-react';

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
					gap: '1.25rem',
				}}
			>
				{/* Logo Icon with glowing ring */}
				<div
					style={{
						position: 'relative',
						width: '5rem',
						height: '5rem',
						borderRadius: '1.25rem',
						background: 'linear-gradient(135deg, var(--accent) 0%, #a855f7 100%)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
					}}
				>
					<Music
						style={{
							width: '2.5rem',
							height: '2.5rem',
							color: '#ffffff',
						}}
					/>
				</div>

				{/* Brand title */}
				<div style={{ textAlign: 'center' }}>
					<h1
						style={{
							fontSize: '1.5rem',
							fontWeight: 800,
							letterSpacing: '-0.025em',
							color: '#ffffff',
							margin: 0,
						}}
					>
						Notyka
					</h1>
					<p
						style={{
							fontSize: '0.85rem',
							color: 'var(--muted)',
							marginTop: '0.25rem',
						}}
					>
						Музичний фоторедактор
					</p>
				</div>

				{/* Loading indicator */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '0.5rem',
						marginTop: '1rem',
					}}
				>
					<div
						className="preloader-spinner"
						style={{
							width: '1.25rem',
							height: '1.25rem',
							border: '2px solid rgba(255, 255, 255, 0.15)',
							borderTopColor: 'var(--accent-text)',
							borderRadius: '50%',
						}}
					/>
					<span
						style={{
							fontSize: '0.8rem',
							color: 'var(--muted)',
							fontFamily: 'system-ui, sans-serif',
						}}
					>
						Завантаження проекту...
					</span>
				</div>
			</div>
		</div>
	);
};
