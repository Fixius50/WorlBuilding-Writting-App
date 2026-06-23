export interface Notebook {
  id: number | string;
  titulo: string;
  descripcion?: string;
  contenido?: string;
  proyecto_id?: number | string;
  created_at?: string;
  updatedAt?: string;
}
