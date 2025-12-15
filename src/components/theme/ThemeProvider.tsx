'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/stores/useThemeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { mode } = useThemeStore();

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme', mode);
    }, [mode]);

    return <>{children}</>;
}
