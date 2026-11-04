'use client';

import React from 'react';

export const ToolbarSkeleton: React.FC = () => {
	return (
		<footer aria-hidden="true" style={{ pointerEvents: 'none' }}>
			{/* Skeleton Brush Settings Pill */}
			<div
				id="brush-settings"
				style={{
					height: '2.5rem',
					width: 'min(440px, calc(100vw - 1.25rem))',
					borderRadius: '9999px',
					background: 'rgba(22, 23, 27, 0.92)',
					display: 'flex',
					alignItems: 'center',
					padding: '0.35rem',
					gap: '0.6rem',
				}}
			>
				<div
					style={{
						width: '1.65rem',
						height: '1.65rem',
						borderRadius: '50%',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						flex: 1,
						height: '5px',
						borderRadius: '9999px',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						width: '3.4rem',
						height: '1.65rem',
						borderRadius: '9999px',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						width: '1.65rem',
						height: '1.65rem',
						borderRadius: '50%',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
			</div>

			{/* Skeleton Bottom Toolbar Dock (Full width, rounded top corners) */}
			<div
				id="toolbar"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '2rem',
					padding: '0.45rem 1rem',
					width: '100%',
					borderRadius: '1.25rem 1.25rem 0 0',
					background: 'rgba(20, 22, 27, 0.96)',
					borderTop: '1px solid var(--line-strong)',
				}}
			>
				<div
					style={{
						width: '2.85rem',
						height: '2.85rem',
						borderRadius: '0.75rem',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						width: '2.85rem',
						height: '2.85rem',
						borderRadius: '0.75rem',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						width: '2.85rem',
						height: '2.85rem',
						borderRadius: '0.75rem',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
			</div>
		</footer>
	);
};
