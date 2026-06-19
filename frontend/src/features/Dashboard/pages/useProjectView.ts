import { useState, useEffect } from "react";
import { useLanguage } from "@context/LanguageContext";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAppStore } from "@features/App";
import { Entidad } from "@domain/database";
import { entityService } from "@repositories/entityService";
import { folderService } from "@repositories/folderService";
import { notebookService } from "@repositories/notebookService";
import { relationshipService } from "@repositories/relationshipService";
import { timelineService } from "@repositories/timelineService";

export interface ProjectPreviewStats {
  bible: {
    entitiesCount: number;
    foldersCount: number;
    recentEntities: { id: number; nombre: string; tipo: string; fecha_actualizacion: string }[];
  };
  atlas: {
    mapsCount: number;
    recentMaps: { id: number; nombre: string; fecha_actualizacion: string }[];
  };
  chronicles: {
    notebooksCount: number;
    pagesCount: number;
    recentPages: { id: number; titulo: string; cuaderno_titulo: string }[];
  };
  graph: {
    relationsCount: number;
  };
  timeline: {
    eventsCount: number;
    recentEvents: { id: number; titulo: string; fecha_simulada: string }[];
  };
  linguistics: {
    conlangsCount: number;
    wordsCount: number;
    mainLangName: string | null;
  };
}

export const useProjectView = () => {
  const { projectName, projectId } = useOutletContext<{
    projectName: string;
    projectId: number | null;
  }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = useAppStore((state) => state.user);

  const baseUrl = `/local/${projectName}`;

  const [stats, setStats] = useState<ProjectPreviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async (id: number) => {
    setLoading(true);

    // CÓDIGO ANTERIOR BASADO EN SQL CRUDO PRESERVADO HISTÓRICAMENTE SEGÚN DIRECTRICES
    /*
    try {
      // 1. Codex / Biblia
      const resEntCount = await sql<{ count: number }>`
        SELECT COUNT(*) as count FROM entidades WHERE project_id = ${id} AND borrado = 0
      `;
      const resFoldCount = await sql<{ count: number }>`
        SELECT COUNT(*) as count FROM carpetas WHERE project_id = ${id} AND borrado = 0
      `;
      const resRecentEnt = await sql<{ id: number; nombre: string; tipo: string; fecha_actualizacion: string }>`
        SELECT id, nombre, tipo, fecha_actualizacion 
        FROM entidades 
        WHERE project_id = ${id} AND borrado = 0 
        ORDER BY fecha_actualizacion DESC LIMIT 3
      `;

      // 2. Atlas / Mapas
      const resMapsCount = await sql<{ count: number }>`
        SELECT COUNT(*) as count FROM entidades WHERE project_id = ${id} AND tipo = 'MAP' AND borrado = 0
      `;
      const resRecentMaps = await sql<{ id: number; nombre: string; fecha_actualizacion: string }>`
        SELECT id, nombre, fecha_actualizacion 
        FROM entidades 
        WHERE project_id = ${id} AND tipo = 'MAP' AND borrado = 0 
        ORDER BY fecha_actualizacion DESC LIMIT 3
      `;

      // 3. Crónicas / Escritura
      const resNbCount = await sql<{ count: number }>`
        SELECT COUNT(*) as count FROM cuadernos WHERE project_id = ${id}
      `;
      const resPagesCount = await sql<{ count: number }>`
        SELECT COUNT(h.id) as count 
        FROM hojas h 
        JOIN cuadernos c ON h.cuaderno_id = c.id 
        WHERE c.project_id = ${id}
      `;
      const resRecentPages = await sql<{ id: number; titulo: string; cuaderno_titulo: string }>`
        SELECT h.id, h.titulo, c.titulo as cuaderno_titulo 
        FROM hojas h 
        JOIN cuadernos c ON h.cuaderno_id = c.id 
        WHERE c.project_id = ${id} 
        ORDER BY h.created_at DESC LIMIT 3
      `;

      // 4. Conexión / Grafo
      const resRelCount = await sql<{ count: number }>`
        SELECT COUNT(*) as count FROM relaciones WHERE project_id = ${id}
      `;

      // 5. Cronos / Timeline
      const resEventsCount = await sql<{ count: number }>`
        SELECT COUNT(*) as count FROM eventos WHERE project_id = ${id} AND borrado = 0
      `;
      const resRecentEvents = await sql<{ id: number; titulo: string; fecha_simulada: string }>`
        SELECT id, titulo, fecha_simulada 
        FROM eventos 
        WHERE project_id = ${id} AND borrado = 0 
        ORDER BY id DESC LIMIT 3
      `;

      // 6. Verbo / Lingüística
      const resLangsCount = await sql<{ count: number }>`
        SELECT COUNT(*) as count FROM entidades WHERE project_id = ${id} AND tipo = 'Conlang' AND borrado = 0
      `;
      const resWordsCount = await sql<{ count: number }>`
        SELECT COUNT(*) as count FROM entidades WHERE project_id = ${id} AND tipo = 'Word' AND borrado = 0
      `;
      const resMainLang = await sql<{ nombre: string }>`
        SELECT nombre FROM entidades WHERE project_id = ${id} AND tipo = 'Conlang' AND borrado = 0 LIMIT 1
      `;
    } catch (_err) {}
    */

    // Carga de entidades transversal para optimizar llamadas
    let entities: Entidad[] = [];
    try {
      entities = await entityService.getAllByProject(id);
    } catch (_err) {
      // [LOG REMOVED]
    }
    
    // 1. Codex / Biblia
    let bibleStats = { entitiesCount: 0, foldersCount: 0, recentEntities: [] as { id: number; nombre: string; tipo: string; fecha_actualizacion: string }[] };
    try {
      const folders = await folderService.getByProject(id);
      bibleStats = {
        entitiesCount: entities.length,
        foldersCount: folders.length,
        recentEntities: entities.slice(0, 3).map((e) => ({
          id: e.id,
          nombre: e.nombre,
          tipo: e.tipo,
          fecha_actualizacion: e.fecha_actualizacion || "",
        })),
      };
    } catch (_err) {
      // [LOG REMOVED]
    }

    // 2. Atlas / Mapas
    let atlasStats = { mapsCount: 0, recentMaps: [] as { id: number; nombre: string; fecha_actualizacion: string }[] };
    try {
      const maps = entities.filter((e) => e.tipo === "MAP");
      atlasStats = {
        mapsCount: maps.length,
        recentMaps: maps.slice(0, 3).map((m) => ({
          id: m.id,
          nombre: m.nombre,
          fecha_actualizacion: m.fecha_actualizacion || "",
        })),
      };
    } catch (_err) {
      // [LOG REMOVED]
    }

    // 3. Crónicas / Escritura
    let chroniclesStats = { notebooksCount: 0, pagesCount: 0, recentPages: [] as { id: number; titulo: string; cuaderno_titulo: string }[] };
    try {
      const notebooks = await notebookService.getAllByProject(id);
      let pagesCount = 0;
      const allPages: { id: number; titulo: string; cuaderno_titulo: string }[] = [];
      
      for (const nb of notebooks) {
        const pages = await notebookService.getPagesByNotebook(nb.id);
        pagesCount += pages.length;
        pages.forEach((p) => {
          allPages.push({
            id: p.id,
            titulo: p.titulo || "Sin título",
            cuaderno_titulo: nb.titulo,
          });
        });
      }

      chroniclesStats = {
        notebooksCount: notebooks.length,
        pagesCount: pagesCount,
        recentPages: allPages.slice(0, 3),
      };
    } catch (_err) {
      // [LOG REMOVED]
    }

    // 4. Conexión / Grafo
    let graphStats = { relationsCount: 0 };
    try {
      const relations = await relationshipService.getByProject(id);
      graphStats = {
        relationsCount: relations.length,
      };
    } catch (_err) {
      // [LOG REMOVED]
    }

    // 5. Cronos / Timeline
    let timelineStats = { eventsCount: 0, recentEvents: [] as { id: number; titulo: string; fecha_simulada: string }[] };
    try {
      const events = await timelineService.getByProject(id);
      timelineStats = {
        eventsCount: events.length,
        recentEvents: events.slice(0, 3).map((ev) => ({
          id: ev.id,
          titulo: ev.titulo,
          fecha_simulada: ev.fecha_simulada || "Era Inc.",
        })),
      };
    } catch (_err) {
      // [LOG REMOVED]
    }

    // 6. Verbo / Lingüística
    let linguisticsStats = { conlangsCount: 0, wordsCount: 0, mainLangName: null as string | null };
    try {
      const conlangs = entities.filter((e) => e.tipo === "Conlang");
      const words = entities.filter((e) => e.tipo === "Word");
      linguisticsStats = {
        conlangsCount: conlangs.length,
        wordsCount: words.length,
        mainLangName: conlangs[0]?.nombre || null,
      };
    } catch (_err) {
      // [LOG REMOVED]
    }

    setStats({
      bible: bibleStats,
      atlas: atlasStats,
      chronicles: chroniclesStats,
      graph: graphStats,
      timeline: timelineStats,
      linguistics: linguisticsStats,
    });
    setLoading(false);
  };

  useEffect(() => {
    const fetchStats = async () => {
      const id = projectId;
      switch (id !== null && id !== undefined) {
        case true:
          if (id) {
            await loadData(id);
          }
          break;
        default:
          setLoading(false);
          break;
      }
    };
    fetchStats();
  }, [projectId]);

  return {
    projectName,
    projectId,
    navigate,
    t,
    user,
    baseUrl,
    stats,
    loading
  };
};


