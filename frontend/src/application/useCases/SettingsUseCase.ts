import { sqlocal } from '@database';
import { projectService } from '@repositories/projectService';
import { settingsService } from '@repositories/settingsService';
import { syncService } from '@network/syncService';
import { Proyecto } from '@domain/models/database';

export interface UserData {
  displayName?: string;
  username?: string;
  avatarUrl?: string;
}

export interface AppSettings {
  theme: string;
  font: string;
  fontSize: number;
  panelMode: string;
  autoBackup: boolean;
}

export class SettingsUseCase {
  static async loadProjects(): Promise<Proyecto[]> {
    try {
      const data = await projectService.list();
      return data || [];
    } catch (err) {
      console.error("Error loading projects for sync", err);
      return [];
    }
  }

  static async exportBackup(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await syncService.exportToDisk('worldbuilding_master');
      return res;
    } catch (err) {
      console.error("Backup error", err);
      return { success: false, message: 'Error en la sincronización con el servidor' };
    }
  }

  static async importDatabase(file: File): Promise<{ success: boolean; message: string }> {
    if (!file.name.endsWith('.db') && !file.name.endsWith('.sqlite3') && !file.name.endsWith('.sqlite')) {
      return { success: false, message: 'Solo se permiten bases de datos SQLite (.db, .sqlite3)' };
    }
    try {
      await sqlocal.overwriteDatabaseFile(file);
      return { success: true, message: 'Universo importado con éxito. Por favor recarga la página.' };
    } catch (err: unknown) {
      console.error("Import error", err);
      return { success: false, message: 'Error al sobreescribir la base de datos local' };
    }
  }

  // SQLite Settings Handlers (Centralized)
  static async loadUser(): Promise<UserData | null> {
    try {
      const stored = await settingsService.get('user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse user settings", e);
    }
    return null;
  }

  static async saveUser(user: UserData): Promise<void> {
    await settingsService.set('user', JSON.stringify(user));
  }

  static async loadSettings(): Promise<AppSettings | null> {
    try {
      const all = await settingsService.getAll();
      if (Object.keys(all).length > 0) {
        return {
          theme: all.theme || 'deep_space',
          font: all.font || 'Outfit',
          fontSize: Number(all.fontSize) || 16,
          panelMode: all.panelMode || 'classic',
          autoBackup: all.autoBackup === 'true'
        };
      }
    } catch (e) {
      console.error("Failed to parse app settings", e);
    }
    return null;
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    await settingsService.set('theme', settings.theme);
    await settingsService.set('font', settings.font);
    await settingsService.set('fontSize', settings.fontSize.toString());
    await settingsService.set('panelMode', settings.panelMode);
    await settingsService.set('autoBackup', settings.autoBackup ? 'true' : 'false');
  }

  static async loadSyncProjects(): Promise<string[]> {
    try {
      const saved = await settingsService.get('sync_projects');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse sync projects", e);
    }
    return [];
  }

  static async saveSyncProjects(projects: string[]): Promise<void> {
    await settingsService.set('sync_projects', JSON.stringify(projects));
  }
}
