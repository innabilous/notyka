'use client';

import React from 'react';

export const ToolbarSkeleton: React.FC = () => {
	return (
		<footer aria-hidden="true" style={{ pointerEvents: 'none' }}>
			{/* Skeleton Brush Settings */}
			<div
				style={{
					height: '2.4rem',
					width: '100%',
					borderRadius: '9999px',
					background: 'rgba(17, 24, 39, 0.8)',
					display: 'flex',
					alignItems: 'center',
					padding: '0 0.75rem',
					gap: '0.75rem',
				}}
			>
				<div
					className="preloader-spinner"
					style={{
						width: '1.75rem',
						height: '1.75rem',
						borderRadius: '50%',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						flex: 1,
						height: '6px',
						borderRadius: '9999px',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						width: '3.6rem',
						height: '1.75rem',
						borderRadius: '9999px',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						width: '1.75rem',
						height: '1.75rem',
						borderRadius: '50%',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
			</div>

			{/* Skeleton Bottom Toolbar */}
			<div
				id="toolbar"
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '0.35rem',
					width: '100%',
				}}
			>
				<div
					style={{
						width: '2.5rem',
						height: '2.5rem',
						borderRadius: '0.75rem',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						flex: 1,
						height: '2.5rem',
						borderRadius: '0.75rem',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						flex: 1,
						height: '2.5rem',
						borderRadius: '0.75rem',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						flex: 1,
						height: '2.5rem',
						borderRadius: '0.75rem',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
				<div
					style={{
						width: '4.5rem',
						height: '2.5rem',
						borderRadius: '0.75rem',
						background: 'var(--panel-2)',
						opacity: 0.5,
					}}
				/>
			</div>
		</footer>
	);
};

