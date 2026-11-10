'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppearanceConfigSchema } from '@/schemas/editor';
import {
	APPEARANCE_STORAGE_KEY,
	DEFAULT_APPEARANCE_CONFIG,
	createNotykaCssVariablesResolver,
	createNotykaTheme,
} from '@/theme/theme';
import {
	AccentSkin,
	AppearanceConfig,
	DarkSurfaceTone,
	LightSurfaceTone,
	isAccentSkin,
	isDarkSurfaceTone,
	isLightSurfaceTone,
} from '@/types/editor';

// Validate and parse appearance configuration from `localStorage` using Zod
export function parseAppearanceConfig(
	raw: string,
	fallback: AppearanceConfig = DEFAULT_APPEARANCE_CONFIG,
): AppearanceConfig {
	try {
		const parsed: unknown = JSON.parse(raw);
		const fullCheck = AppearanceConfigSchema.safeParse(parsed);
		if (fullCheck.success) {
			return fullCheck.data;
		}
		if (!parsed || typeof parsed !== 'object') return fallback;
		const rec: Record<string, unknown> = Object.fromEntries(Object.entries(parsed));
		return {
			accentSkin: isAccentSkin(rec.accentSkin) ? rec.accentSkin : fallback.accentSkin,
			darkTone: isDarkSurfaceTone(rec.darkTone) ? rec.darkTone : fallback.darkTone,
			lightTone: isLightSurfaceTone(rec.lightTone) ? rec.lightTone : fallback.lightTone,
		};
	} catch {
		return fallback;
	}
}

interface AppearanceContextValue {
	config: AppearanceConfig;
	setAccentSkin: (skin: AccentSkin) => void;
	setDarkTone: (tone: DarkSurfaceTone) => void;
	setLightTone: (tone: LightSurfaceTone) => void;
	setConfig: (config: AppearanceConfig) => void;
	resetAppearance: () => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function useAppearance(): AppearanceContextValue {
	const context = useContext(AppearanceContext);
	if (!context) {
		throw new Error('useAppearance must be used within AppThemeProvider');
	}
	return context;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
	const [config, setConfigState] = useState<AppearanceConfig>(DEFAULT_APPEARANCE_CONFIG);

	// Load stored appearance configuration on mount
	useEffect(() => {
		try {
			const saved = localStorage.getItem(APPEARANCE_STORAGE_KEY);
			if (saved) {
				setConfigState((prev) => parseAppearanceConfig(saved, prev));
			}
		} catch {
			// Ignore localStorage parsing errors
		}
	}, []);

	const setConfig = useCallback((newConfig: AppearanceConfig) => {
		setConfigState(newConfig);
		try {
			localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(newConfig));
		} catch {
			// Ignore quota errors
		}
	}, []);

	const setAccentSkin = useCallback(
		(accentSkin: AccentSkin) => {
			setConfig({ ...config, accentSkin });
		},
		[config, setConfig],
	);

	const setDarkTone = useCallback(
		(darkTone: DarkSurfaceTone) => {
			setConfig({ ...config, darkTone });
		},
		[config, setConfig],
	);

	const setLightTone = useCallback(
		(lightTone: LightSurfaceTone) => {
			setConfig({ ...config, lightTone });
		},
		[config, setConfig],
	);

	const resetAppearance = useCallback(() => {
		setConfigState(DEFAULT_APPEARANCE_CONFIG);
		try {
			localStorage.removeItem(APPEARANCE_STORAGE_KEY);
			localStorage.removeItem('mantine-color-scheme-value');
		} catch {
			// Ignore
		}
	}, []);

	const theme = useMemo(() => createNotykaTheme(config), [config]);
	const cssVariablesResolver = useMemo(() => createNotykaCssVariablesResolver(config), [config]);

	const contextValue = useMemo<AppearanceContextValue>(
		() => ({
			config,
			setAccentSkin,
			setDarkTone,
			setLightTone,
			setConfig,
			resetAppearance,
		}),
		[config, resetAppearance, setAccentSkin, setConfig, setDarkTone, setLightTone],
	);

	return (
		<AppearanceContext.Provider value={contextValue}>
			<MantineProvider
				defaultColorScheme="auto"
				theme={theme}
				cssVariablesResolver={cssVariablesResolver}
			>
				<Notifications position="top-center" zIndex={2000} autoClose={1800} />
				{children}
			</MantineProvider>
		</AppearanceContext.Provider>
	);
}

