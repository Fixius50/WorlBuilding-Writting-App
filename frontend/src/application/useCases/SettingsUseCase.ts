import { sqlocal } from '@database';
import { projectService } from '@repositories/projectService';
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

  // Local Storage Handlers
  static loadUser(): UserData | null {
    try {
      const stored = localStorage.getItem('user');
      if (stored && stored !== "undefined") {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse user settings", e);
    }
    return null;
  }

  static saveUser(user: UserData): void {
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('storage_update'));
  }

  static loadSettings(): AppSettings | null {
    try {
      const saved = localStorage.getItem('app_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse app settings", e);
    }
    return null;
  }

  static saveSettings(settings: AppSettings): void {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('storage_update'));
  }

  static loadSyncProjects(): string[] {
    try {
      const saved = localStorage.getItem('sync_projects');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse sync projects", e);
    }
    return [];
  }

  static saveSyncProjects(projects: string[]): void {
    localStorage.setItem('sync_projects', JSON.stringify(projects));
  }
}
