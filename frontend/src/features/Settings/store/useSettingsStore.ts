import { create } from "zustand";
import { SettingsUseCase, UserData, AppSettings } from "@features/Settings";
import { Proyecto } from "@domain/database";
import { useAppStore } from "@features/App";

export interface NotificationData {
  id: number;
  message: string;
  type: "success" | "info" | "error";
  progressCurrent?: number;
  progressTotal?: number;
}

export interface NotificationOptions {
  id?: number;
  autoCloseMs?: number | null;
  progress?: {
    current: number;
    total: number;
  };
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
  addNotification: (
    message: string,
    type?: "success" | "info" | "error",
    options?: NotificationOptions,
  ) => number;
}

const defaultSettings: AppSettings = {
  theme: "deep_space",
  font: "Outfit",
  fontSize: 16,
  panelMode: "classic",
  autoBackup: false,
};

let autoBackupInterval: ReturnType<typeof setInterval> | null = null;
const notificationTimers = new Map<number, ReturnType<typeof setTimeout>>();

export const useSettingsStore = create<SettingsState>((set, get) => ({
  user: null,
  projects: [],
  selectedProjects: [],
  settings: defaultSettings,
  notifications: [],

  addNotification: (
    message: string,
    type: "success" | "info" | "error" = "success",
    options?: NotificationOptions,
  ) => {
    const id = options?.id ?? Date.now() + Math.floor(Math.random() * 1000);
    const progressCurrent = options?.progress?.current;
    const progressTotal = options?.progress?.total;

    set((state) => {
      const existingIndex = state.notifications.findIndex((n) => n.id === id);
      const nextNotification: NotificationData = {
        id,
        message,
        type,
        progressCurrent,
        progressTotal,
      };

      const updated = [...state.notifications];
      existingIndex === -1
        ? updated.push(nextNotification)
        : (() => {
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...nextNotification,
            };
          })();

      return { notifications: updated };
    });

    const previousTimer = notificationTimers.get(id);
    previousTimer
      ? (() => {
          clearTimeout(previousTimer);
          notificationTimers.delete(id);
        })()
      : null;

    const autoCloseMs = options?.autoCloseMs ?? 3000;
    const shouldAutoClose = autoCloseMs !== null && autoCloseMs >= 0;
    shouldAutoClose
      ? (() => {
          const timer = setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }));
            notificationTimers.delete(id);
          }, autoCloseMs);
          notificationTimers.set(id, timer);
        })()
      : null;

    return id;
  },

  initialize: async () => {
    const user = await SettingsUseCase.loadUser();
    const settings = (await SettingsUseCase.loadSettings()) || defaultSettings;
    const selectedProjects = await SettingsUseCase.loadSyncProjects();
    const projects = await SettingsUseCase.loadProjects();

    set({ user, settings, selectedProjects, projects });

    const shouldStartBackup = settings.autoBackup && !autoBackupInterval;
    shouldStartBackup
      ? (() => {
          autoBackupInterval = setInterval(
            () => {
              get().handleDownloadBackup();
            },
            10 * 60 * 1000,
          );
        })()
      : null;
  },

  updateSetting: async (key: keyof AppSettings, value: unknown) => {
    const newSettings = { ...get().settings, [key]: value } as AppSettings;
    set({ settings: newSettings });
    await SettingsUseCase.saveSettings(newSettings);
    get().addNotification(`Ajuste actualizado: ${String(key)}`);

    switch (key) {
      case "theme": {
        useAppStore.getState().setTheme(value as string);
        break;
      }
      case "panelMode": {
        useAppStore
          .getState()
          .setPanelMode(value as "classic" | "binder" | "floating");
        break;
      }
      case "autoBackup": {
        value
          ? (!autoBackupInterval
              ? (() => {
                  autoBackupInterval = setInterval(
                    () => {
                      get().handleDownloadBackup();
                    },
                    10 * 60 * 1000,
                  );
                })()
              : null)
          : (autoBackupInterval
              ? (() => {
                  clearInterval(autoBackupInterval!);
                  autoBackupInterval = null;
                })()
              : null);
        break;
      }
      default:
        break;
    }
  },

  toggleProjectSelection: async (id: string) => {
    const { selectedProjects } = get();
    const isSelected = selectedProjects.includes(id);
    const newSelection = isSelected
      ? selectedProjects.filter((p) => p !== id)
      : [...selectedProjects, id];

    set({ selectedProjects: newSelection });
    await SettingsUseCase.saveSyncProjects(newSelection);
    get().addNotification(
      isSelected
        ? "Universo desmarcado de sincronización"
        : "Universo incluido en sincronización",
    );
  },

  updateProfile: async (key: keyof UserData, value: string) => {
    const newUser = { ...(get().user || {}), [key]: value };
    set({ user: newUser });
    await SettingsUseCase.saveUser(newUser);
    useAppStore.getState().setUser(newUser);
  },

  setAvatar: async (avatarUrl: string) => {
    const newUser = { ...(get().user || {}), avatarUrl };
    set({ user: newUser });
    try {
      await SettingsUseCase.saveUser(newUser);
      useAppStore.getState().setUser(newUser);
      get().addNotification("Foto de perfil actualizada", "success");
    } catch (_err) {
      get().addNotification("Error al guardar imagen (memoria llena)", "error");
    }
  },

  handleDownloadBackup: async () => {
    get().addNotification("Sincronizando con el servidor local...", "info");
    const res = await SettingsUseCase.exportBackup();
    if (res.success) {
      get().addNotification(
        "Copia de seguridad guardada en el servidor",
        "success",
      );
    } else {
      get().addNotification(res.message, "error");
    }
  },

  handleImportDatabase: async (file: File) => {
    get().addNotification(
      "Sobrescribiendo la base de datos local OPFS...",
      "info",
    );
    const res = await SettingsUseCase.importDatabase(file);
    res.success
      ? get().addNotification(res.message, "success")
      : get().addNotification(res.message, "error");

    return res.success;
  },
}));
