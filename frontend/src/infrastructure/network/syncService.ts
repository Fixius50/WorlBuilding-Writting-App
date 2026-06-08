import { sqlocal, sql } from "@infrastructure/localDB/client";
import { projectService } from "@repositories/projectService";
import { folderService } from "@repositories/folderService";
import { entityService } from "@repositories/entityService";
import { relationshipService } from "@repositories/relationshipService";
import { Carpeta, Entidad, Proyecto, Relacion } from "@domain/models/database";

export interface SyncRealtimePayload {
  schemaVersion: number;
  exportedAt: string;
  project: Proyecto;
  folders: Carpeta[];
  entities: Entidad[];
  relationships: Relacion[];
}

const toNumberBoolean = (
  value: boolean | number | null | undefined,
): number => {
  return value === true || value === 1 ? 1 : 0;
};

/**
 * Servicio para la sincronización de archivos SQLite completos (Bulk Operations)
 * entre el frontend (SQLocal/OPFS) y el servidor auxiliar (Spring Boot).
 */
export const syncService = {
  /**
   * Exporta la base de datos actual desde el navegador al disco duro (vía Spring).
   * @param projectName Nombre del proyecto (se guardará como projectName.sqlite)
   */
  async exportToDisk(
    projectName: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Obtenemos el archivo .sqlite actual de SQLocal (OPFS)
      const dbFile = await sqlocal.getDatabaseFile();

      const formData = new FormData();
      formData.append("file", dbFile, `${projectName}.sqlite`);

      const response = await fetch(`/api/db/upload/${projectName}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const message = await response.text();
      return {
        success: true,
        message: message || "Backup completado en disco.",
      };
    } catch (error) {
      // [LOG REMOVED]
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  },

  /**
   * Importa un archivo SQLite desde el disco duro al navegador y lo carga en SQLocal.
   * @param projectName Nombre del proyecto a descargar
   */
  async importFromDisk(
    projectName: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/db/download/${projectName}`, {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error(
          `No se pudo encontrar el archivo de respaldo para ${projectName}`,
        );
      }

      const dbBlob = await response.blob();

      // Sobrescribimos la base de datos actual en SQLocal/OPFS
      await sqlocal.overwriteDatabaseFile(dbBlob);

      return {
        success: true,
        message: "Base de datos importada y cargada con éxito.",
      };
    } catch (error) {
      // [LOG REMOVED]
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  },

  /**
   * Obtiene la lista de bases de datos disponibles en el servidor local.
   */
  async listAvailableBackups(): Promise<string[]> {
    try {
      const response = await fetch("/api/db/list");
      return response.ok ? await response.json() : [];
    } catch (error) {
      // [LOG REMOVED]
      return [];
    }
  },
  /**
   * Construye un snapshot real del proyecto actual para sincronización P2P.
   */
  async buildRealtimeSnapshot(
    projectName: string,
  ): Promise<{
    success: boolean;
    message: string;
    payload?: SyncRealtimePayload;
  }> {
    let result: {
      success: boolean;
      message: string;
      payload?: SyncRealtimePayload;
    };
    try {
      const project = await projectService.getByName(projectName);

      if (project === null) {
        result = {
          success: false,
          message: `No se encontró el proyecto '${projectName}' en la base de datos local.`,
        };
      } else {
        const [folders, entities, relationships] = await Promise.all([
          folderService.getByProject(project.id),
          entityService.getAllByProject(project.id),
          relationshipService.getByProject(project.id),
        ]);

        result = {
          success: true,
          message: "Snapshot real generado correctamente.",
          payload: {
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            project,
            folders,
            entities,
            relationships,
          },
        };
      }
    } catch (error) {
      result = {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al construir snapshot.",
      };
    }
    return result;
  },

  /**
   * Aplica en local un payload real recibido por sincronización P2P.
   */
  async applyRealtimeSnapshot(
    payload: SyncRealtimePayload,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await sql`PRAGMA foreign_keys = ON`;

      const project = payload.project;
      await sql`
        INSERT INTO proyectos (id, nombre, descripcion, tag, image_url, initials, fecha_creacion, ultima_modificacion)
        VALUES (
          ${project.id},
          ${project.nombre},
          ${project.descripcion || ""},
          ${project.tag || ""},
          ${project.image_url || ""},
          ${project.initials || ""},
          ${project.fecha_creacion || new Date().toISOString()},
          ${project.ultima_modificacion || new Date().toISOString()}
        )
        ON CONFLICT(id) DO UPDATE SET
          nombre = excluded.nombre,
          descripcion = excluded.descripcion,
          tag = excluded.tag,
          image_url = excluded.image_url,
          initials = excluded.initials,
          ultima_modificacion = excluded.ultima_modificacion
      `;

      for (const folder of payload.folders) {
        await sql`
          INSERT INTO carpetas (id, nombre, project_id, padre_id, tipo, slug, borrado)
          VALUES (
            ${folder.id},
            ${folder.nombre},
            ${folder.project_id},
            ${folder.padre_id},
            ${folder.tipo},
            ${folder.slug},
            ${toNumberBoolean(folder.borrado)}
          )
          ON CONFLICT(id) DO UPDATE SET
            nombre = excluded.nombre,
            project_id = excluded.project_id,
            padre_id = excluded.padre_id,
            tipo = excluded.tipo,
            slug = excluded.slug,
            borrado = excluded.borrado
        `;
      }

      for (const entity of payload.entities) {
        await sql`
          INSERT INTO entidades (id, nombre, tipo, descripcion, contenido_json, project_id, carpeta_id, fecha_creacion, borrado)
          VALUES (
            ${entity.id},
            ${entity.nombre},
            ${entity.tipo},
            ${entity.descripcion || ""},
            ${entity.contenido_json || null},
            ${entity.project_id},
            ${entity.carpeta_id},
            ${entity.fecha_creacion || new Date().toISOString()},
            ${toNumberBoolean(entity.borrado)}
          )
          ON CONFLICT(id) DO UPDATE SET
            nombre = excluded.nombre,
            tipo = excluded.tipo,
            descripcion = excluded.descripcion,
            contenido_json = excluded.contenido_json,
            project_id = excluded.project_id,
            carpeta_id = excluded.carpeta_id,
            borrado = excluded.borrado
        `;
      }

      for (const relation of payload.relationships) {
        await sql`
          INSERT INTO relaciones (id, origen_id, destino_id, tipo, descripcion, project_id, created_at, origen_handle, destino_handle)
          VALUES (
            ${relation.id},
            ${relation.origen_id},
            ${relation.destino_id},
            ${relation.tipo},
            ${relation.descripcion || ""},
            ${relation.project_id},
            ${relation.created_at || new Date().toISOString()},
            ${relation.origen_handle || null},
            ${relation.destino_handle || null}
          )
          ON CONFLICT(id) DO UPDATE SET
            origen_id = excluded.origen_id,
            destino_id = excluded.destino_id,
            tipo = excluded.tipo,
            descripcion = excluded.descripcion,
            project_id = excluded.project_id,
            origen_handle = excluded.origen_handle,
            destino_handle = excluded.destino_handle
        `;
      }

      return {
        success: true,
        message: "Datos reales aplicados correctamente en local.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al aplicar snapshot.",
      };
    }
  },

  /**
   * Envía al backend auxiliar el payload recibido para auditoría/respaldo JSON.
   */
  async archiveRealtimePayload(
    projectName: string,
    payload: SyncRealtimePayload,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `/api/sync/payload/${encodeURIComponent(projectName)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      switch (response.ok) {
        case true:
          return {
            success: true,
            message: "Payload archivado en backend auxiliar.",
          };
        default:
          break;
      }

      const text = await response.text();
      return {
        success: false,
        message:
          text || `No se pudo archivar payload (HTTP ${response.status}).`,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Backend no disponible para archivado.",
      };
    }
  },
};

export default syncService;
