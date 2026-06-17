import { sql } from "../client";
import { Entidad, Valor } from "@domain/database";
import { emitUIRefresh } from "@utils/uiRefresh";

// interface EntityValueQueryResult is an interface that is used to query the database for values of an entity and return them as an array of objects
// each object has the following properties:
// - id: number - the id of the value
// - entidad_id: number - the id of the entity
// - plantilla_id: number - the id of the template
// - valor: string - the value of the field
// - updated_at: string - the updated at timestamp
// - p_id: number - the id of the plant
// - p_nombre: string - the name of the plant
// - p_tipo: string - the type of the plant
// - p_valor_defecto: string | null - the default value of the plant
// - p_metadata: string | null - the metadata of the plant
// - p_es_obligatorio: number | boolean - whether the plant is required
// - p_project_id: number - the id of the project
// - p_aplica_a_todo: number | boolean - whether the plant applies to all
// - p_tipo_objetivo: string | null - the target type of the plant
// - p_categoria: string | null - the category of the plant
// - p_orden: number - the order of the plant
// - p_created_at: string - the created at timestamp
interface EntityValueQueryResult {
  id: number;
  entidad_id: number;
  plantilla_id: number;
  valor: string;
  updated_at: string;
  p_id: number;
  p_nombre: string;
  p_tipo: string;
  p_valor_defecto: string | null;
  p_metadata: string | null;
  p_es_obligatorio: number | boolean;
  p_project_id: number;
  p_aplica_a_todo: number | boolean;
  p_tipo_objetivo: string | null;
  p_categoria: string | null;
  p_orden: number;
  p_created_at: string;
}

export const entityService = {
  async getAllByProject(projectId: number): Promise<Entidad[]> {
    return await sql<Entidad>`SELECT * FROM entidades WHERE project_id = ${projectId} AND borrado = 0 ORDER BY fecha_creacion DESC`;
  },

  async getByFolder(folderId: number): Promise<Entidad[]> {
    return await sql<Entidad>`SELECT * FROM entidades WHERE carpeta_id = ${folderId} AND borrado = 0 ORDER BY nombre ASC`;
  },

  async getById(id: number): Promise<Entidad | null> {
    const result =
      await sql<Entidad>`SELECT * FROM entidades WHERE id = ${id} AND borrado = 0 LIMIT 1`;
    return result[0] || null;
  },

  async getBySlug(projectId: number, slug: string): Promise<Entidad | null> {
    const result =
      await sql<Entidad>`SELECT * FROM entidades WHERE project_id = ${projectId} AND (slug = ${slug} OR id = ${slug}) AND borrado = 0 LIMIT 1`;
    return result[0] || null;
  },

  async create(
    entity: Omit<
      Entidad,
      "id" | "fecha_creacion" | "fecha_actualizacion" | "borrado"
    >,
  ): Promise<Entidad> {
    const slug =
      entity.slug ||
      entity.nombre
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    await sql`
      INSERT INTO entidades (
        nombre,
        tipo,
        descripcion,
        contenido_json,
        project_id,
        carpeta_id,
        slug,
        folder_slug,
        imagen_url,
        fecha_actualizacion
      )
      VALUES (
        ${entity.nombre}, 
        ${entity.tipo}, 
        ${entity.descripcion || ""}, 
        ${entity.contenido_json ? (typeof entity.contenido_json === "string" ? entity.contenido_json : JSON.stringify(entity.contenido_json)) : null}, 
        ${entity.project_id}, 
        ${entity.carpeta_id},
        ${slug},
        ${entity.folder_slug ?? null},
        ${entity.imagen_url ?? null},
        ${new Date().toISOString()}
      )
    `;

    // Recuperar la última entidad creada
    const result =
      await sql<Entidad>`SELECT * FROM entidades WHERE project_id = ${entity.project_id} ORDER BY id DESC LIMIT 1`;
    emitUIRefresh({ operation: "create", scope: "entity", id: result[0].id });
    return result[0];
  },

  async update(id: number, entity: Partial<Entidad>): Promise<Entidad> {
    const fields: string[] = [];

    if (entity.nombre !== undefined) fields.push(`nombre = ${entity.nombre}`);
    if (entity.tipo !== undefined) fields.push(`tipo = ${entity.tipo}`);
    if (entity.descripcion !== undefined)
      fields.push(`descripcion = ${entity.descripcion}`);
    if (entity.contenido_json !== undefined) {
      const jsonStr =
        typeof entity.contenido_json === "string"
          ? entity.contenido_json
          : JSON.stringify(entity.contenido_json);
      fields.push(`contenido_json = ${jsonStr}`);
    }
    if (entity.carpeta_id !== undefined)
      fields.push(`carpeta_id = ${entity.carpeta_id}`);
    if (entity.slug !== undefined) fields.push(`slug = ${entity.slug}`);
    if (entity.folder_slug !== undefined)
      fields.push(`folder_slug = ${entity.folder_slug}`);
    if (entity.imagen_url !== undefined)
      fields.push(`imagen_url = ${entity.imagen_url}`);

    if (fields.length > 0) {
      // Usando sintaxis segura de SQLocal con COALESCE para evitar sobrescribir con null si no se desea
      await sql`
        UPDATE entidades SET 
          nombre = COALESCE(${entity.nombre}, nombre),
          tipo = COALESCE(${entity.tipo}, tipo),
          descripcion = COALESCE(${entity.descripcion}, descripcion),
          contenido_json = COALESCE(${entity.contenido_json ? (typeof entity.contenido_json === "string" ? entity.contenido_json : JSON.stringify(entity.contenido_json)) : null}, contenido_json),
          carpeta_id = COALESCE(${entity.carpeta_id}, carpeta_id),
          slug = COALESCE(${entity.slug}, slug),
          folder_slug = COALESCE(${entity.folder_slug}, folder_slug),
          imagen_url = COALESCE(${entity.imagen_url}, imagen_url),
          fecha_actualizacion = COALESCE(${entity.fecha_actualizacion}, CURRENT_TIMESTAMP)
        WHERE id = ${id}
      `;
    }

    const result = await sql<Entidad>`SELECT * FROM entidades WHERE id = ${id}`;
    emitUIRefresh({ operation: "update", scope: "entity", id });
    return result[0];
  },

  async delete(id: number): Promise<void> {
    // Soft Delete: Marcar como borrado
    await sql`UPDATE entidades SET borrado = 1 WHERE id = ${id}`;
    emitUIRefresh({ operation: "delete", scope: "entity", id });
  },

  async move(id: number, targetCarpetaId: number | null): Promise<void> {
    await sql`UPDATE entidades SET carpeta_id = ${targetCarpetaId} WHERE id = ${id}`;
    emitUIRefresh({ operation: "update", scope: "entity", id });
  },

  async getAllByProjectAndType(
    projectId: number,
    type: string,
  ): Promise<Entidad[]> {
    return await sql<Entidad>`SELECT * FROM entidades WHERE project_id = ${projectId} AND tipo = ${type} AND borrado = 0 ORDER BY nombre ASC`;
  },

  async getValues(entityId: number): Promise<Valor[]> {
    const rows = await sql<EntityValueQueryResult>`
      SELECT 
        v.*, 
        p.id as p_id, p.nombre as p_nombre, p.tipo as p_tipo, 
        p.valor_defecto as p_valor_defecto, p.metadata as p_metadata, 
        p.es_obligatorio as p_es_obligatorio, p.project_id as p_project_id,
        p.aplica_a_todo as p_aplica_a_todo, p.tipo_objetivo as p_tipo_objetivo,
        p.categoria as p_categoria, p.orden as p_orden, p.created_at as p_created_at
      FROM valores v
      JOIN plantillas p ON v.plantilla_id = p.id
      WHERE v.entidad_id = ${entityId}
    `;
    return rows.map((r) => ({
      id: r.id,
      entidad_id: r.entidad_id,
      plantilla_id: r.plantilla_id,
      valor: r.valor,
      updated_at: r.updated_at,
      plantilla: {
        id: r.p_id,
        nombre: r.p_nombre,
        tipo: r.p_tipo,
        valor_defecto: r.p_valor_defecto,
        metadata: r.p_metadata,
        es_obligatorio: r.p_es_obligatorio,
        project_id: r.p_project_id,
        aplica_a_todo: r.p_aplica_a_todo,
        tipo_objetivo: r.p_tipo_objetivo,
        categoria: r.p_categoria,
        orden: r.p_orden,
        created_at: r.p_created_at,
      },
    }));
  },

  async addValue(
    entityId: number,
    templateId: number,
    value: string,
  ): Promise<void> {
    await sql`INSERT INTO valores (entidad_id, plantilla_id, valor) VALUES (${entityId}, ${templateId}, ${value})`;
    emitUIRefresh({ operation: "update", scope: "entity", id: entityId });
  },

  async updateValue(valueId: number, value: string): Promise<void> {
    const rows = await sql<{
      entidad_id: number;
    }>`SELECT entidad_id FROM valores WHERE id = ${valueId} LIMIT 1`;
    await sql`UPDATE valores SET valor = ${value}, updated_at = CURRENT_TIMESTAMP WHERE id = ${valueId}`;
    const hasRow = rows.length > 0;
    switch (hasRow) {
      case true:
        emitUIRefresh({
          operation: "update",
          scope: "entity",
          id: rows[0].entidad_id,
        });
        break;
      default:
        break;
    }
  },

  async deleteValue(valueId: number): Promise<void> {
    const rows = await sql<{
      entidad_id: number;
    }>`SELECT entidad_id FROM valores WHERE id = ${valueId} LIMIT 1`;
    await sql`DELETE FROM valores WHERE id = ${valueId}`;
    const hasRow = rows.length > 0;
    switch (hasRow) {
      case true:
        emitUIRefresh({
          operation: "update",
          scope: "entity",
          id: rows[0].entidad_id,
        });
        break;
      default:
        break;
    }
  },

  getPosition: async (
    entityId: number,
    context: string = "general",
  ): Promise<{ x: number; y: number } | null> => {
    console.log("[DB] getPosition for entity:", entityId, "context:", context);
    const rows = await sql<{
      x: number;
      y: number;
    }>`SELECT x, y FROM grafo_posiciones WHERE entidad_id = ${entityId} AND contexto = ${context} LIMIT 1`;
    console.log("[DB] getPosition result:", rows[0]);
    return rows[0] || null;
  },

  getAllPositions: async (
    projectId: number,
    context: string = "general",
  ): Promise<{ entidad_id: number; x: number; y: number }[]> => {
    console.log(
      "[DB] getAllPositions for project:",
      projectId,
      "context:",
      context,
    );
    const result = await sql<{ entidad_id: number; x: number; y: number }>`
      SELECT gp.entidad_id, gp.x, gp.y 
      FROM grafo_posiciones gp
      JOIN entidades e ON gp.entidad_id = e.id
      WHERE e.project_id = ${projectId} AND gp.contexto = ${context} AND e.borrado = 0
    `;
    console.log("[DB] getAllPositions result count:", result.length, result);
    return result;
  },

  savePosition: async (
    entityId: number,
    x: number,
    y: number,
    context: string = "general",
  ): Promise<void> => {
    console.log(
      "[DB] savePosition for entityId:",
      entityId,
      "coords:",
      x,
      y,
      "context:",
      context,
    );
    try {
      await sql`
        INSERT INTO grafo_posiciones (entidad_id, contexto, x, y)
        VALUES (${entityId}, ${context}, ${x}, ${y})
        ON CONFLICT(entidad_id, contexto) DO UPDATE SET x = excluded.x, y = excluded.y
      `;
      console.log("[DB] savePosition success");
    } catch (e) {
      console.error("[DB] savePosition FAILED:", e);
    }
  },
};
