'use client';

import React from 'react';
import { Box } from '@mantine/core';
import clsx from 'clsx';
import { Music } from 'lucide-react';
import classes from './brand-logo.module.css';

export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl' | number;

interface BrandLogoProps {
	size?: BrandLogoSize;
	animated?: boolean;
	showBadge?: boolean;
	showText?: boolean;
	className?: string;
}

function resolveSizeClass(size: BrandLogoSize): string {
	if (size === 'sm' || (typeof size === 'number' && size <= 30)) return classes.sizeSm;
	if (size === 'md' || (typeof size === 'number' && size <= 40)) return classes.sizeMd;
	if (size === 'lg' || (typeof size === 'number' && size <= 58)) return classes.sizeLg;
	return classes.sizeXl;
}

export function BrandLogo({
	size = 'xl',
	animated = false,
	showBadge = true,
	showText = false,
	className = '',
}: BrandLogoProps) {
	return (
		<Box
			className={clsx(
				classes.root,
				resolveSizeClass(size),
				showText && classes.withText,
				className,
			)}
		>
			{showBadge ? (
				<Box
					className={clsx('notyka-logo-badge', classes.badge, animated && 'animated')}
					aria-label="Notyka Logo"
				>
					{animated && <Box className="notyka-surface-sheen" />}

					<Music
						className={clsx(classes.badgeIcon, animated && 'notyka-note-animated')}
					/>
				</Box>
			) : (
				<Music className={clsx(classes.bareIcon, animated && 'notyka-note-animated')} />
			)}

			{showText && (
				<Box className={classes.textStack}>
					<span className={classes.titleText}>Notyka</span>
					<span className={classes.subtitleText}>pro</span>
				</Box>
			)}
		</Box>
	);
}
