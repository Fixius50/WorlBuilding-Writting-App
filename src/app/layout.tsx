import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Chronos Atlas - Narrative IDE',
    description: 'IDE Narrativo para Worldbuilding con causalidad temporal y mapas de escala infinita',
    keywords: ['worldbuilding', 'narrative', 'IDE', 'maps', 'storytelling', 'timeline'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
            <body className="font-sans antialiased" suppressHydrationWarning>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}

