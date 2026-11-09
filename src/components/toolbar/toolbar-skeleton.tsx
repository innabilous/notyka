'use client';

import React from 'react';
import { Box, Group, Skeleton } from '@mantine/core';

export const ToolbarSkeleton: React.FC = () => {
	return (
		<Box component="footer" aria-hidden="true" style={{ pointerEvents: 'none' }}>
			{/* Skeleton Brush Settings Pill */}
			<Box
				id="brush-settings"
				style={{
					height: '2.5rem',
					width: 'min(440px, calc(100vw - 1.25rem))',
					borderRadius: '9999px',
					background: 'var(--panel-bg-translucent)',
					display: 'flex',
					alignItems: 'center',
					padding: '0.35rem',
					gap: '0.6rem',
				}}
			>
				<Skeleton circle height="1.65rem" />
				<Skeleton height={5} radius="xl" style={{ flex: 1 }} />
				<Skeleton height="1.65rem" width="3.4rem" radius="xl" />
				<Skeleton circle height="1.65rem" />
			</Box>

			{/* Skeleton Bottom Toolbar Dock (Full width, rounded top corners) */}
			<Group
				id="toolbar"
				gap="2rem"
				justify="center"
				style={{
					padding: '0.45rem 1rem',
					width: '100%',
					borderRadius: '1.25rem 1.25rem 0 0',
					background: 'var(--panel-bg-translucent)',
					borderTop: '1px solid var(--line-strong)',
				}}
			>
				<Skeleton height="2.85rem" width="2.85rem" radius="md" />
				<Skeleton height="2.85rem" width="2.85rem" radius="md" />
				<Skeleton height="2.85rem" width="2.85rem" radius="md" />
			</Group>
		</Box>
	);
};
