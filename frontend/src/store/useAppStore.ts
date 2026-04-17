import { create } from 'zustand';

interface User {
  username: string;
}

interface AppState {
  theme: string;
  user: User | null;
  setTheme: (theme: string) => void;
  setUser: (user: User | null) => void;
  syncFromStorage: () => void;
}

const parseStorageItem = <T>(key: string): T | null => {
  const raw = localStorage.getItem(key);
  if (!raw || raw === 'undefined') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const useAppStore = create<AppState>((set) => ({
  theme: parseStorageItem<{ theme: string }>('app_settings')?.theme ?? 'deep_space',
  user: parseStorageItem<User>('user'),

  setTheme: (theme: string) => {
    set({ theme });
    // Aquí puedes manejar la lógica de guardado local
  },

  setUser: (user: User | null) => set({ user }),

  syncFromStorage: () => {
    const settings = parseStorageItem<{ theme: string }>('app_settings');
    const user = parseStorageItem<User>('user');
    set((state) => ({
      theme: settings?.theme ?? state.theme,
      user: user ?? state.user,
    }));
  },
}));
