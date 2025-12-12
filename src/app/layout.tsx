import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

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
        <html lang="es" className="dark">
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
                {children}
            </body>
        </html>
    );
}
