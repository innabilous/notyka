'use client';

import React, { useEffect, useState } from 'react';
import { Box, Stack } from '@mantine/core';
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
		<Box
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
			<Stack align="center" gap="1rem">
				<BrandLogo size={64} animated={true} showText={true} />
			</Stack>
		</Box>
	);
};
