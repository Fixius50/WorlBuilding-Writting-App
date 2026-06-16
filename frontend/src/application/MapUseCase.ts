import { entityService } from '@repositories/entityService';
import { Entidad } from '@domain/database';

/**
 * 🗺️ MAP USE CASE (Capa de Aplicación)
 * 
 * ORÍGENES DE LA REFACTORIZACIÓN:
 * Extraído desde:
 * - src/features/Specialized/pages/MapEditor.tsx
 * 
 * PROPÓSITO:
 * Centralizar la lógica de persistencia de mapas interactivos.
 * Un mapa es una Entidad con el JSON de marcadores guardado en `contenido_json`.
 */
export class MapUseCase {
  
  /** Obtiene todos los mapas y entidades geográficas del proyecto */
  static async getAllEntities(projectId: number): Promise<Entidad[]> {
    return await entityService.getAllByProject(projectId);
  }

  /** Obtiene los datos completos de un mapa específico por su ID o Slug */
  static getMapByIdOrSlug = async (
    idOrSlug: string | number,
    projectId: number,
  ): Promise<Entidad | null> => {
    let result: Entidad | null = null;
    const idNum = Number(idOrSlug);

    !isNaN(idNum)
      ? (result = await entityService.getById(idNum))
      : null;

    !result
      ? (result = await entityService.getBySlug(projectId, String(idOrSlug)))
      : null;

    return result;
  };

  /** Crea un nuevo mapa desde cero */
  static async createMap(data: {
    nombre: string;
    project_id: number;
    carpeta_id: number | null;
    contenido_json: string;
    imagen_url: string | null;
  }): Promise<Entidad> {
    const slug = data.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    return await entityService.create({
      nombre: data.nombre,
      tipo: 'MAPA',
      project_id: data.project_id,
      carpeta_id: data.carpeta_id,
      descripcion: '',
      slug,
      contenido_json: data.contenido_json,
      folder_slug: null,
      imagen_url: data.imagen_url
    });
  }

  /** Actualiza un mapa existente (marcadores, imagen, nombre) */
  static async updateMap(mapId: number, data: {
    nombre?: string;
    carpeta_id?: number | null;
    contenido_json?: string;
    imagen_url?: string | null;
  }): Promise<void> {
    const updates: any = { ...data };
    if (data.nombre) {
      updates.slug = data.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    await entityService.update(mapId, updates);
  }
}
