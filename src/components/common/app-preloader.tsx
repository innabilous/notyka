'use client';

import React, { useEffect, useState } from 'react';
import { Box, Stack } from '@mantine/core';
import clsx from 'clsx';
import { BrandLogo } from './brand-logo';
import classes from './app-preloader.module.css';

interface AppPreloaderProps {
	isLoading: boolean;
}

export function AppPreloader({ isLoading }: AppPreloaderProps) {
	const [shouldRender, setShouldRender] = useState(true);

	useEffect(() => {
		if (!isLoading) {
			const timer = setTimeout(() => {
				setShouldRender(false);
			}, 400);
			return () => clearTimeout(timer);
		}
		setShouldRender(true);
		return undefined;
	}, [isLoading]);

	if (!shouldRender) return null;

	return (
		<Box className={clsx('notyka-app-preloader', classes.root, !isLoading && classes.hidden)}>
			<Stack align="center" gap="md">
				<BrandLogo size="lg" animated={true} showText={true} />
			</Stack>
		</Box>
	);
}
