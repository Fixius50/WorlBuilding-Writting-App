import { notebookService } from "@repositories/notebookService";
import { Cuaderno, Hoja } from "@domain/database";

export interface NotebookMetadata {
  status?: "idea" | "draft" | "review" | "done";
  priority?: "low" | "medium" | "high";
  audience?: string;
  summary?: string;
}

export interface Snapshot {
  id: number;
  timestamp: string;
  contenido: string;
}

export interface MentionResult {
  hoja_id: number;
  hoja_titulo: string;
  cuaderno_titulo: string;
  cuaderno_id: number;
  snippet: string;
}

export interface WritingComment {
  id: number;
  hoja_id: number;
  parent_id: number | null;
  texto: string;
  seleccion_texto: string | null;
  rango_inicio: number | null;
  rango_fin: number | null;
  estado: "open" | "resolved";
  created_at: string;
  updated_at: string;
}

/**
 * ✍️ WRITING USE CASE (Capa de Aplicación)
 *
 * ORÍGENES DE LA REFACTORIZACIÓN:
 * Extraído desde:
 * - src/features/Writing/pages/WritingHub.tsx (CRUD de Cuadernos)
 * - src/features/Writing/pages/WritingView.tsx (Gestión de Páginas y Snapshots)
 *
 * PROPÓSITO:
 * Desacoplar los componentes de React de la base de datos SQLocal.
 * Si en el futuro cambiamos a una base de datos remota o Firebase,
 * los componentes .tsx no se enterarán; solo editaremos este archivo.
 */
export class WritingUseCase {
  // ==========================================
  // GESTIÓN DE CUADERNOS (NOTEBOOKS)
  // ==========================================

  /** Obtiene todos los cuadernos de un proyecto */
  static async getNotebooks(projectId: number): Promise<Cuaderno[]> {
    return await notebookService.getAllByProject(projectId);
  }

  /** Obtiene un cuaderno específico por ID */
  static async getNotebookById(notebookId: number): Promise<Cuaderno | null> {
    return await notebookService.getById(notebookId);
  }

  /** Crea un nuevo cuaderno */
  static async createNotebook(
    projectId: number,
    title: string,
    genre: string,
    metadata: NotebookMetadata = {},
  ): Promise<Cuaderno> {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new Error("El título no puede estar vacío");
    return await notebookService.create(
      projectId,
      trimmedTitle,
      genre,
      JSON.stringify(metadata),
    );
  }

  /** Actualiza un cuaderno existente */
  static async updateNotebook(
    notebookId: number,
    title: string,
    genre: string,
    metadata: NotebookMetadata = {},
  ): Promise<void> {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new Error("El título no puede estar vacío");
    await notebookService.update(notebookId, {
      titulo: trimmedTitle,
      genero: genre,
      metadata_json: JSON.stringify(metadata),
    });
  }

  /** Elimina un cuaderno (borrado lógico o físico según el service) */
  static async deleteNotebook(notebookId: number): Promise<void> {
    await notebookService.delete(notebookId);
  }

  // ==========================================
  // GESTIÓN DE PÁGINAS (PAGES)
  // ==========================================

  /** Obtiene todas las páginas de un cuaderno */
  static async getPages(notebookId: number): Promise<Hoja[]> {
    return await notebookService.getPagesByNotebook(notebookId);
  }

  /** Crea una página vacía dentro de un cuaderno */
  static async createPage(notebookId: number): Promise<Hoja> {
    return await notebookService.createPage(notebookId);
  }

  /** Actualiza el contenido u orden de una página */
  static async updatePage(pageId: number, data: Partial<Hoja>): Promise<void> {
    await notebookService.updatePage(pageId, data);
  }

  /** Elimina una página de un cuaderno */
  static async deletePage(pageId: number): Promise<void> {
    await notebookService.deletePage(pageId);
  }

  // ==========================================
  // GESTIÓN DE INSTANTÁNEAS (SNAPSHOTS)
  // ==========================================

  /** Crea una copia de seguridad (snapshot) del contenido actual de una página */
  static async createSnapshot(
    pageId: number,
    htmlContent: string,
  ): Promise<void> {
    if (!htmlContent) return;
    await notebookService.createSnapshot(pageId, htmlContent);
  }

  /** Recupera el historial de instantáneas de una página */
  static async getSnapshots(pageId: number): Promise<Snapshot[]> {
    return await notebookService.getSnapshots(pageId);
  }

  /** Busca menciones de un texto en los cuadernos del proyecto */
  static async getMentions(
    projectId: number,
    query: string,
  ): Promise<MentionResult[]> {
    return await notebookService.getMentions(projectId, query);
  }

  static async getComments(pageId: number): Promise<WritingComment[]> {
    return await notebookService.getCommentsByPage(pageId);
  }

  static async createComment(input: {
    pageId: number;
    text: string;
    parentId?: number | null;
    selectedText?: string | null;
    rangeStart?: number | null;
    rangeEnd?: number | null;
  }): Promise<WritingComment> {
    return await notebookService.createComment({
      hojaId: input.pageId,
      texto: input.text,
      parentId: input.parentId,
      selectedText: input.selectedText,
      rangeStart: input.rangeStart,
      rangeEnd: input.rangeEnd,
    });
  }

  static async resolveComment(commentId: number): Promise<void> {
    await notebookService.resolveComment(commentId);
  }

  static async reopenComment(commentId: number): Promise<void> {
    await notebookService.reopenComment(commentId);
  }

  static async deleteComment(commentId: number): Promise<void> {
    await notebookService.deleteComment(commentId);
  }
}
