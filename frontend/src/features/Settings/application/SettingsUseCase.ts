import { sqlocal } from "@database";
import { projectService } from "@repositories/projectService";
import { settingsService } from "@repositories/settingsService";
import { syncService } from "@network/syncService";
import { Proyecto } from "@domain/database";

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

const DEFAULT_BACKUP_IDENTIFIER = "worldbuilding_backup";

export class SettingsUseCase {
  private static async waitForAsyncImportJob(
    jobId: string,
    timeoutMs: number = 180000,
    pollEveryMs: number = 350,
  ): Promise<{ success: boolean; message: string }> {
    const start = Date.now();
    let done = false;
    let result = {
      success: false,
      message: "La importación asíncrona no pudo completarse.",
    };

    while (!done) {
      if (Date.now() - start > timeoutMs) {
        done = true;
        result = {
          success: false,
          message: "La importación tardó demasiado en completarse.",
        };
      } else {
        const statusRes = await fetch(`/api/db/import/status/${jobId}`);
        if (!statusRes.ok) {
          done = true;
          result = {
            success: false,
            message: "No se pudo consultar el estado de la importación.",
          };
        } else {
          const statusData = (await statusRes.json()) as {
            status?: string;
            error?: string | null;
          };

          switch (statusData.status) {
            case "completed": {
              const resultRes = await fetch(`/api/db/import/result/${jobId}`, {
                method: "GET",
                headers: { "Cache-Control": "no-cache" },
              });
              if (resultRes.ok) {
                const dbBlob = await resultRes.blob();
                await sqlocal.overwriteDatabaseFile(dbBlob);
                result = {
                  success: true,
                  message:
                    "Universo y assets importados con éxito. Por favor recarga la página.",
                };
              } else {
                result = {
                  success: false,
                  message:
                    "La importación finalizó, pero no se pudo descargar el resultado.",
                };
              }
              done = true;
              break;
            }
            case "failed":
              done = true;
              result = {
                success: false,
                message:
                  statusData.error ||
                  "La importación en el servidor falló durante el procesamiento.",
              };
              break;
            default:
              await new Promise((resolve) => setTimeout(resolve, pollEveryMs));
              break;
          }
        }
      }
    }

    return result;
  }

  static async loadProjects(): Promise<Proyecto[]> {
    try {
      const data = await projectService.list();
      return data || [];
    } catch (err) {
      // [LOG REMOVED]
      return [];
    }
  }

  static async exportBackup(
    identifier: string = DEFAULT_BACKUP_IDENTIFIER,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await syncService.exportToDisk(identifier);
      return res;
    } catch (err) {
      // [LOG REMOVED]
      return {
        success: false,
        message: "Error en la sincronización con el servidor",
      };
    }
  }

  static async importDatabase(
    file: File,
  ): Promise<{ success: boolean; message: string }> {
    let result = {
      success: false,
      message:
        "Solo se permiten bases de datos SQLite (.db, .sqlite, .sqlite3) o archivos de respaldo ZIP (.zip).",
    };
    const isDb =
      file.name.endsWith(".db") ||
      file.name.endsWith(".sqlite3") ||
      file.name.endsWith(".sqlite");
    const isZip = file.name.endsWith(".zip");

    if (isDb || isZip) {
      try {
        if (isZip) {
          const rawName = file.name.substring(0, file.name.lastIndexOf("."));
          const projectName = rawName || DEFAULT_BACKUP_IDENTIFIER;
          const encodedProjectName = encodeURIComponent(projectName);
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(
            `/api/db/import/async/${encodedProjectName}`,
            {
              method: "POST",
              body: formData,
            },
          );

          if (response.ok) {
            const payload = (await response.json()) as {
              jobId?: string;
              status?: string;
              message?: string;
            };

            if (payload.jobId) {
              result = await SettingsUseCase.waitForAsyncImportJob(
                payload.jobId,
              );
            } else {
              result = {
                success: false,
                message:
                  "El servidor no devolvió identificador de trabajo para la importación.",
              };
            }
          } else {
            result = {
              success: false,
              message: "Error en el servidor al iniciar la importación ZIP.",
            };
          }
        } else {
          await sqlocal.overwriteDatabaseFile(file);
          result = {
            success: true,
            message:
              "Universo importado con éxito. Por favor recarga la página.",
          };
        }
      } catch (err: unknown) {
        result = {
          success: false,
          message: "Error al sobreescribir la base de datos local",
        };
      }
    }

    return result;
  }

  // SQLite Settings Handlers (Centralized)
  static async loadUser(): Promise<UserData | null> {
    try {
      const stored = await settingsService.get("user");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // [LOG REMOVED]
    }
    return null;
  }

  static async saveUser(user: UserData): Promise<void> {
    await settingsService.set("user", JSON.stringify(user));
  }

  static async loadSettings(): Promise<AppSettings | null> {
    try {
      const all = await settingsService.getAll();
      if (Object.keys(all).length > 0) {
        return {
          theme: all.theme || "deep_space",
          font: all.font || "Outfit",
          fontSize: Number(all.fontSize) || 16,
          panelMode: all.panelMode || "classic",
          autoBackup: all.autoBackup === "true",
        };
      }
    } catch (e) {
      // [LOG REMOVED]
    }
    return null;
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    await settingsService.set("theme", settings.theme);
    await settingsService.set("font", settings.font);
    await settingsService.set("fontSize", settings.fontSize.toString());
    await settingsService.set("panelMode", settings.panelMode);
    await settingsService.set(
      "autoBackup",
      settings.autoBackup ? "true" : "false",
    );
  }

  static async loadSyncProjects(): Promise<string[]> {
    try {
      const saved = await settingsService.get("sync_projects");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // [LOG REMOVED]
    }
    return [];
  }

  static async saveSyncProjects(projects: string[]): Promise<void> {
    await settingsService.set("sync_projects", JSON.stringify(projects));
  }
}
