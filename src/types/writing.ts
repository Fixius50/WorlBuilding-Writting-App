export interface Notebook {
 id: number | string;
 titulo: string;
 descripcion?: string;
 contenido?: string;
 proyecto_id?: number | string;
 created_at?: string;
 updatedAt?: string; // used in NotebookManager
}

export interface NotebookPage {
 id: number | string;
 cuaderno_id: number | string;
 titulo?: string;
 contenido?: string;
 orden?: number;
 created_at?: string;
 updated_at?: string;
}

export interface NotebookManagerState {
 activeNotebook: Notebook | null;
 editingTitleId: string | null;
 confirmDeleteId: string | null;
}

export interface EditorSettings {
 font: string;
 fontSize: number;
}

export interface MentionData {
 label: string;
 type: string | null;
 desc: string | null;
 id: string | null;
}

