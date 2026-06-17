import { entityService } from "@repositories/entityService";
import { folderService } from "@repositories/folderService";
import { templateService } from "@repositories/templateService";
import { Entidad, Carpeta, Plantilla, FolderType } from "@domain/database";

/**
 * 🌍 WORLD BIBLE USE CASE (Capa de Aplicación)
 *
 * ORÍGENES DE LA REFACTORIZACIÓN:
 * Extraído desde:
 * - src/features/WorldBible/pages/WorldBibleLayout.tsx
 * - src/features/WorldBible/components/BibleTableView.tsx
 * - src/features/WorldBible/components/CreateMassEntitiesModal.tsx
 *
 * PROPÓSITO:
 * Centralizar toda la lógica del Codex/Biblia. Controla la jerarquía de carpetas
 * (Root -> Folders -> Nodes) y el CRUD masivo de entidades, abstrayendo a React
 * de saber cómo consultar la base de datos subyacente.
 */
export class WorldBibleUseCase {
  // ==========================================
  // GESTIÓN DE ÁRBOL Y CARPETAS
  // ==========================================

  /** Obtiene las entidades huérfanas o directas de un proyecto */
  static async getRootEntities(projectId: number): Promise<Entidad[]> {
    return await entityService.getAllByProject(projectId); // Temporal: la UI suele filtrar si tienen carpeta
  }

  /** Obtiene una carpeta específica por su ID */
  static async getFolderById(folderId: number): Promise<Carpeta | null> {
    return await folderService.getById(folderId);
  }

  /** Obtiene el contenido de una carpeta (subcarpetas y entidades) */
  static async getFolderContent(
    folderId: number,
  ): Promise<{ folders: Carpeta[]; entities: Entidad[] }> {
    const [folders, entities] = await Promise.all([
      folderService.getSubfolders(folderId),
      entityService.getByFolder(folderId),
    ]);
    return { folders, entities };
  }

  /** Crea una nueva categoría o carpeta raíz */
  static async createCategory(
    name: string,
    projectId: number,
    type: FolderType = "FOLDER",
  ): Promise<Carpeta> {
    const safeName = name.trim() || "Nueva Categoría";
    return await folderService.create(safeName, projectId, null, type);
  }

  // ==========================================
  // GESTIÓN DE ENTIDADES DEL CÓDEX
  // ==========================================

  /** Crea una nueva entidad en el Codex */
  static async createEntity(data: {
    nombre: string;
    tipo: string;
    project_id: number;
    carpeta_id: number | null;
    descripcion?: string;
  }): Promise<Entidad> {
    const slug = data.nombre
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return await entityService.create({
      ...data,
      descripcion: data.descripcion || "",
      slug,
      contenido_json: null,
      folder_slug: null,
      imagen_url: null,
    });
  }

  /** Actualiza un campo específico de una entidad de forma rápida (ej: renombrar en tabla) */
  static async quickUpdateEntity(
    id: number,
    field: string,
    value: unknown,
  ): Promise<void> {
    await entityService.update(id, { [field]: value });
  }

  /** Mueve una lista de entidades a otra carpeta de destino */
  static async moveEntitiesToFolder(
    entityIds: number[],
    folderId: number | null,
  ): Promise<void> {
    await Promise.all(
      entityIds.map((id) => entityService.update(id, { carpeta_id: folderId })),
    );
  }

  /** Elimina lógicamente una entidad de la biblia (Soft Delete) */
  static async deleteEntity(id: number): Promise<void> {
    await entityService.delete(id);
  }

  /** Elimina lógicamente varias entidades a la vez */
  static async bulkDeleteEntities(ids: number[]): Promise<void> {
    await Promise.all(ids.map((id) => entityService.delete(id)));
  }

  // ==========================================
  // CREACIÓN MASIVA CON PLANTILLAS
  // ==========================================

  /** Obtiene todas las plantillas del proyecto para la creación masiva */
  static async getTemplates(projectId: number): Promise<Plantilla[]> {
    return await templateService.getAll(projectId);
  }

  /** Crea una entidad y le asigna sus atributos (EAV) en la misma transacción lógica */
  static async createEntityWithAttributes(
    entityData: {
      nombre: string;
      tipo: string;
      project_id: number;
      carpeta_id: number | null;
      descripcion?: string;
    },
    attributes: { templateId: number; value: string }[],
  ): Promise<Entidad> {
    // 1. Crear Entidad
    const entity = await this.createEntity(entityData);

    // 2. Inyectar Atributos en el Motor EAV si existe la entidad
    if (entity.id && attributes.length > 0) {
      for (const attr of attributes) {
        await entityService.addValue(entity.id, attr.templateId, attr.value);
      }
    }

    return entity;
  }
}
