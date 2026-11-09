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
			</head>
			<body style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
				<AppThemeProvider>{children}</AppThemeProvider>
			</body>
		</html>
	);
}
