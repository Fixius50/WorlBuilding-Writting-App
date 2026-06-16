import { sql } from "../client";
import { Proyecto } from "@domain/database";
import { emitUIRefresh } from "@utils/uiRefresh";

export const projectService = {
  async list(): Promise<Proyecto[]> {
    try {
      const data =
        await sql<Proyecto>`SELECT * FROM proyectos ORDER BY ultima_modificacion DESC`;
      // [LOG REMOVED]
      return data;
    } catch (err) {
      // [LOG REMOVED]
      return [];
    }
  },

  async create(
    name: string,
    title?: string,
    tag?: string,
    image_url?: string,
  ): Promise<Proyecto> {
    const initials = (title || name || "P")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    try {
      // [LOG REMOVED]
      await sql`
        INSERT INTO proyectos (nombre, descripcion, tag, image_url, initials)
        VALUES (${name}, ${title || ""}, ${tag || ""}, ${image_url || ""}, ${initials})
      `;

      // Pequeña espera para asegurar que el sistema de archivos (OPFS) se sincronice antes del select
      await new Promise((r) => setTimeout(r, 50));

      const result =
        await sql<Proyecto>`SELECT * FROM proyectos WHERE nombre = ${name} LIMIT 1`;
      // [LOG REMOVED]
      emitUIRefresh({ operation: "create", scope: "project", id: result[0].id });
      return result[0];
    } catch (err) {
      // [LOG REMOVED]
      throw err;
    }
  },

  async getByName(name: string): Promise<Proyecto | null> {
    const result =
      await sql<Proyecto>`SELECT * FROM proyectos WHERE nombre = ${name} LIMIT 1`;
    return result[0] || null;
  },

  async delete(id: number): Promise<void> {
    await sql`DELETE FROM proyectos WHERE id = ${id}`;
    emitUIRefresh({ operation: "delete", scope: "project", id });
  },

  async update(id: number, data: Partial<Proyecto>): Promise<void> {
    if (data.nombre) {
      await sql`UPDATE proyectos SET nombre = ${data.nombre}, ultima_modificacion = CURRENT_TIMESTAMP WHERE id = ${id}`;
    }
    if (data.descripcion) {
      await sql`UPDATE proyectos SET descripcion = ${data.descripcion}, ultima_modificacion = CURRENT_TIMESTAMP WHERE id = ${id}`;
    }
    emitUIRefresh({ operation: "update", scope: "project", id });
  },
};
