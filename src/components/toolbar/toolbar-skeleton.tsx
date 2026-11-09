'use client';

import React from 'react';
import { Box, Group, Skeleton } from '@mantine/core';

export const ToolbarSkeleton: React.FC = () => {
	return (
		<Box component="footer" aria-hidden="true" style={{ pointerEvents: 'none' }}>
			{/* Skeleton Brush Settings */}
			<Box
				id="brush-settings"
				style={{
					height: '2.5rem',
					width: 'min(440px, calc(100vw - 1.25rem))',
					borderRadius: 4,
					background: 'var(--panel)',
					display: 'flex',
					alignItems: 'center',
					padding: '0.35rem',
					gap: '0.6rem',
				}}
			>
				<Skeleton height="1.65rem" width="1.65rem" radius="sm" />
				<Skeleton height={5} radius="xs" style={{ flex: 1 }} />
				<Skeleton height="1.65rem" width="3.4rem" radius="sm" />
				<Skeleton height="1.65rem" width="1.65rem" radius="sm" />
			</Box>

			{/* Skeleton Bottom Toolbar Dock */}
			<Group
				id="toolbar"
				gap="2rem"
				justify="center"
				style={{
					padding: '0.45rem 1rem',
					width: 'calc(100% - 1rem)',
					maxWidth: '480px',
					margin: '0 auto 0.5rem auto',
					borderRadius: 8,
					background: 'var(--panel)',
					border: '1px solid var(--line)',
				}}
			>
				<Skeleton height="2.75rem" width="2.75rem" radius="sm" />
				<Skeleton height="2.75rem" width="2.75rem" radius="sm" />
				<Skeleton height="2.75rem" width="2.75rem" radius="sm" />
			</Group>
		</Box>
	);
};
