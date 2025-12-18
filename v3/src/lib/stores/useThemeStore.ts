import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    mode: 'minimal' | 'detailed';
    toggleMode: () => void;
    setMode: (mode: 'minimal' | 'detailed') => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'minimal', // Default to minimal as requested
            toggleMode: () => set((state) => ({ mode: state.mode === 'minimal' ? 'detailed' : 'minimal' })),
            setMode: (mode) => set({ mode }),
        }),
        {
            name: 'chronos-theme-storage',
        }
    )
);
