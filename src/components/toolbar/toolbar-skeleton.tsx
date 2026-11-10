'use client';

import React from 'react';
import { Box, Skeleton } from '@mantine/core';
import classes from './toolbar-skeleton.module.css';

export function ToolbarSkeleton() {
	return (
		<Box component="footer" aria-hidden="true" className={classes.root}>
			{/* Skeleton Brush Settings */}
			<Box id="brush-settings" className={classes.brushBar}>
				<Skeleton height="1.65rem" width="1.65rem" radius="sm" />
				<Skeleton height={5} radius="xs" className={classes.sliderSkeleton} />
				<Skeleton height="1.65rem" width="3.4rem" radius="sm" />
				<Skeleton height="1.65rem" width="1.65rem" radius="sm" />
			</Box>

			{/* Skeleton Bottom Toolbar Dock */}
			<Box id="toolbar" className={classes.bottomDock}>
				<Skeleton height="3rem" width="3rem" radius="lg" />
				<Skeleton height="3rem" width="3rem" radius="lg" />
				<Skeleton height="3rem" width="3rem" radius="lg" />
			</Box>
		</Box>
	);
}
