import type { Metadata, Viewport } from 'next';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { AppThemeProvider } from '@/theme/app-theme-provider';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

export const metadata: Metadata = {
	title: 'Notyka — Мобільний фоторедактор нот',
	description: 'Редактор музичних нот та штампів на зображеннях',
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: 'cover',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="uk" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript defaultColorScheme="auto" />
				<script
					id="notyka-appearance-init"
					dangerouslySetInnerHTML={{
						__html: `(function(){
	try {
		var raw = localStorage.getItem('notyka_appearance_v2');
		if (!raw) return;
		var cfg = JSON.parse(raw);
		var skins = {
			orange: '#FF5500',
			cobalt: '#2563EB',
			purple: '#8B5CF6',
			lime: '#84CC16',
			amber: '#F59E0B'
		};
		if (cfg && cfg.accentSkin && skins[cfg.accentSkin]) {
			var primary = skins[cfg.accentSkin];
			var contrast = (cfg.accentSkin === 'lime' || cfg.accentSkin === 'amber') ? '#0E1013' : '#FFFFFF';
			document.documentElement.style.setProperty('--accent', primary);
			document.documentElement.style.setProperty('--accent-contrast', contrast);
			document.documentElement.style.setProperty('--accent-text', primary);
		}
	} catch(e) {}
})();`,
					}}
				/>
			</head>
			<body style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
				<AppThemeProvider>{children}</AppThemeProvider>
			</body>
		</html>
	);
}
