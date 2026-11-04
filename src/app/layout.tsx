import type { Metadata, Viewport } from 'next';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
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
		<html lang="uk" {...mantineHtmlProps} data-mantine-color-scheme="dark">
			<head>
				<ColorSchemeScript defaultColorScheme="dark" />
			</head>
			<body style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
				<MantineProvider defaultColorScheme="dark">
					<Notifications position="top-center" zIndex={2000} autoClose={1800} />
					{children}
				</MantineProvider>
			</body>
		</html>
	);
}
