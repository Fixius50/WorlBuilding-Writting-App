import { create } from 'zustand';
import { SettingsUseCase, UserData, AppSettings } from '@application/useCases/SettingsUseCase';
import { Proyecto } from '@domain/models/database';

export interface NotificationData {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface SettingsState {
  user: UserData | null;
  projects: Proyecto[];
  selectedProjects: string[];
  settings: AppSettings;
  notifications: NotificationData[];
  
  initialize: () => Promise<void>;
  updateSetting: (key: keyof AppSettings, value: unknown) => void;
  toggleProjectSelection: (id: string) => void;
  updateProfile: (key: keyof UserData, value: string) => void;
  setAvatar: (avatarUrl: string) => void;
  handleDownloadBackup: () => Promise<void>;
  handleImportDatabase: (file: File) => Promise<boolean>;
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const defaultSettings: AppSettings = {
  theme: 'deep_space',
  font: 'Outfit',
  fontSize: 16,
  panelMode: 'classic',
  autoBackup: false
};

let autoBackupInterval: ReturnType<typeof setInterval> | null = null;

export const useSettingsStore = create<SettingsState>((set, get) => ({
  user: null,
  projects: [],
  selectedProjects: [],
  settings: defaultSettings,
  notifications: [],

  addNotification: (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    set((state) => ({ notifications: [...state.notifications, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) }));
    }, 3000);
  },

  initialize: async () => {
    const user = SettingsUseCase.loadUser();
    const settings = SettingsUseCase.loadSettings() || defaultSettings;
    const selectedProjects = SettingsUseCase.loadSyncProjects();
    const projects = await SettingsUseCase.loadProjects();

    set({ user, settings, selectedProjects, projects });

    // Setup auto-backup
    if (settings.autoBackup && !autoBackupInterval) {
      autoBackupInterval = setInterval(() => {
        get().handleDownloadBackup();
      }, 10 * 60 * 1000); // Cada 10 minutos
    }
  },

  updateSetting: (key: keyof AppSettings, value: unknown) => {
    const newSettings = { ...get().settings, [key]: value as any } as AppSettings;
    set({ settings: newSettings });
    SettingsUseCase.saveSettings(newSettings);
    get().addNotification(`Ajuste actualizado: ${key}`);

    if (key === 'autoBackup') {
      if (value && !autoBackupInterval) {
        autoBackupInterval = setInterval(() => {
          get().handleDownloadBackup();
        }, 10 * 60 * 1000);
      } else if (!value && autoBackupInterval) {
        clearInterval(autoBackupInterval);
        autoBackupInterval = null;
      }
    }
  },

  toggleProjectSelection: (id: string) => {
    const { selectedProjects } = get();
    const isSelected = selectedProjects.includes(id);
    const newSelection = isSelected
      ? selectedProjects.filter(p => p !== id)
      : [...selectedProjects, id];

    set({ selectedProjects: newSelection });
    SettingsUseCase.saveSyncProjects(newSelection);
    get().addNotification(isSelected ? "Universo desmarcado de sincronización" : "Universo incluido en sincronización");
  },

  updateProfile: (key: keyof UserData, value: string) => {
    const newUser = { ...(get().user || {}), [key]: value };
    set({ user: newUser });
    SettingsUseCase.saveUser(newUser);
  },

  setAvatar: (avatarUrl: string) => {
    const newUser = { ...(get().user || {}), avatarUrl };
    set({ user: newUser });
    try {
      SettingsUseCase.saveUser(newUser);
      get().addNotification("Foto de perfil actualizada", "success");
    } catch (err) {
      get().addNotification("Error al guardar imagen (memoria llena)", "error");
      console.error("Storage error", err);
    }
  },

  handleDownloadBackup: async () => {
    get().addNotification("Sincronizando con el servidor local...", "info");
    const res = await SettingsUseCase.exportBackup();
    if (res.success) {
      get().addNotification("Copia de seguridad guardada en el servidor", "success");
    } else {
      get().addNotification(res.message, "error");
    }
  },

  handleImportDatabase: async (file: File) => {
    get().addNotification("Sobrescribiendo la base de datos local OPFS...", "info");
    const res = await SettingsUseCase.importDatabase(file);
    if (res.success) {
      get().addNotification(res.message, "success");
      return true;
    } else {
      get().addNotification(res.message, "error");
      return false;
    }
  }
}));
