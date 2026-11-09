'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import {
	DEFAULT_APPEARANCE_CONFIG,
	createNotykaCssVariablesResolver,
	createNotykaTheme,
} from '@/theme/theme';
import { AccentSkin, AppearanceConfig, DarkSurfaceTone, LightSurfaceTone } from '@/types/editor';

const STORAGE_KEY = 'notyka_appearance_v1';

interface AppearanceContextValue {
	config: AppearanceConfig;
	setAccentSkin: (skin: AccentSkin) => void;
	setDarkTone: (tone: DarkSurfaceTone) => void;
	setLightTone: (tone: LightSurfaceTone) => void;
	setConfig: (config: AppearanceConfig) => void;
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

	// Load stored appearance configuration
	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved) as Partial<AppearanceConfig>;
				if (parsed && typeof parsed === 'object') {
					setConfigState((prev) => ({
						accentSkin:
							parsed.accentSkin === 'orange' ||
							parsed.accentSkin === 'cobalt' ||
							parsed.accentSkin === 'lime' ||
							parsed.accentSkin === 'amber'
								? parsed.accentSkin
								: prev.accentSkin,
						darkTone:
							parsed.darkTone === 'carbon' || parsed.darkTone === 'obsidian'
								? parsed.darkTone
								: prev.darkTone,
						lightTone:
							parsed.lightTone === 'cotton' || parsed.lightTone === 'anodized'
								? parsed.lightTone
								: prev.lightTone,
					}));
				}
			}
		} catch {
			// Ignore localStorage parsing errors
		}
	}, []);

	const setConfig = (newConfig: AppearanceConfig) => {
		setConfigState(newConfig);
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
		} catch {
			// Ignore quota errors
		}
	};

	const setAccentSkin = (accentSkin: AccentSkin) => {
		setConfig({ ...config, accentSkin });
	};

	const setDarkTone = (darkTone: DarkSurfaceTone) => {
		setConfig({ ...config, darkTone });
	};

	const setLightTone = (lightTone: LightSurfaceTone) => {
		setConfig({ ...config, lightTone });
	};

	const theme = useMemo(() => createNotykaTheme(config), [config]);
	const cssVariablesResolver = useMemo(() => createNotykaCssVariablesResolver(config), [config]);

	const contextValue = useMemo<AppearanceContextValue>(
		() => ({
			config,
			setAccentSkin,
			setDarkTone,
			setLightTone,
			setConfig,
		}),
		[config]
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

