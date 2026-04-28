import { create } from 'zustand';
import { settingsService } from '@repositories/settingsService';

interface User {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  success?: boolean;
  localMode?: boolean;
}

interface AppState {
  isInitialized: boolean;
  theme: string;
  language: string;
  panelMode: 'classic' | 'binder' | 'floating';
  user: User | null;
  lastProjectId: number | null;
  savedGraphViewport: { x: number; y: number; zoom: number } | null;

  // Acciones
  initializeStore: () => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
  setLanguage: (lang: string) => Promise<void>;
  setPanelMode: (mode: 'classic' | 'binder' | 'floating') => Promise<void>;
  setUser: (user: User | null) => Promise<void>;
  setLastProjectId: (id: number | null) => Promise<void>;
  setGraphViewport: (viewport: { x: number; y: number; zoom: number } | null) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialized: false,
  theme: 'deep_space',
  language: 'es',
  panelMode: 'classic',
  user: null,
  lastProjectId: null,
  savedGraphViewport: null,

  // Esta función se llama UNA VEZ al abrir la app
  initializeStore: async () => {
    try {
      const allSettings = await settingsService.getAll();
      
      set({
        theme: allSettings['theme'] || 'deep_space',
        language: allSettings['language'] || 'es',
        panelMode: (allSettings['panelMode'] as any) || 'classic',
        user: allSettings['user'] ? JSON.parse(allSettings['user']) : null,
        lastProjectId: allSettings['lastProjectId'] ? Number(allSettings['lastProjectId']) : null,
        savedGraphViewport: allSettings['savedGraphViewport'] ? JSON.parse(allSettings['savedGraphViewport']) : null,
        isInitialized: true // Avisamos a la app que ya puede renderizarse
      });
    } catch (error) {
      console.error("Error cargando ajustes desde SQLite:", error);
      set({ isInitialized: true });
    }
  },

  setTheme: async (theme: string) => {
    set({ theme });
    await settingsService.set('theme', theme);
  },

  setLanguage: async (language: string) => {
    set({ language });
    await settingsService.set('language', language);
  },

  setPanelMode: async (panelMode: 'classic' | 'binder' | 'floating') => {
    set({ panelMode });
    await settingsService.set('panelMode', panelMode);
  },

  setUser: async (user: User | null) => {
    set({ user });
    await settingsService.set('user', user ? JSON.stringify(user) : '');
  },

  setLastProjectId: async (id: number | null) => {
    set({ lastProjectId: id });
    await settingsService.set('lastProjectId', id ? id.toString() : '');
  },

  setGraphViewport: async (viewport: { x: number; y: number; zoom: number } | null) => {
    set({ savedGraphViewport: viewport });
    await settingsService.set('savedGraphViewport', viewport ? JSON.stringify(viewport) : '');
  }
}));
