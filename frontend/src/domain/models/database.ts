export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  tag?: string;
  image_url?: string;
  initials?: string;
  fecha_creacion: string;
  ultima_modificacion: string;
}

export type FolderType = 'FOLDER' | 'TIMELINE' | 'DIMENSION' | 'CONLANG' | 'MAPS' | 'ARCHIVE';

export interface Carpeta {
  id: number;
  nombre: string;
  project_id: number;
  padre_id: number | null;
  tipo: FolderType;
  slug: string;
  borrado: number;
  // Virtual field
  itemCount?: number;
}

export interface Entidad {
  id: number;
  nombre: string;
  slug: string;
  tipo: string; 
  descripcion: string | null;
  contenido_json: string | null; // Stores extended attributes (color, tags, etc.)
  project_id: number;
  carpeta_id: number | null;
  folder_slug: string | null;
  imagen_url: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  borrado: number;
  // Virtual fields populated by service
  valores?: Valor[];
}

export interface Word extends Omit<Entidad, 'id'> {
  id: number | string;
  lema: string;
  palabraOriginal?: string;
  categoriaGramatical: string;
  definicion: string;
  traduccionEspanol?: string;
  genero?: string;
  notas?: string;
  svgPathData?: string;
  rawEditorData?: string;
  unicodeCode?: string;
  isNew?: boolean;
  placeholder?: boolean;
}

export interface Plantilla {
  id: number;
  nombre: string;
  tipo: string;
  valor_defecto: string | null;
  metadata: string | null; // JSON string for options/config
  es_obligatorio: boolean | number;
  project_id: number;
  created_at: string;
}

export interface Valor {
  id: number;
  entidad_id: number;
  plantilla_id: number;
  valor: string | null;
  updated_at: string;
  // Virtual field
  plantilla?: Plantilla;
}

export interface Evento {
  orden: number;
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_simulada: string | null;
  project_id: number;
  timeline_id: number;
  linea_id?: number | null;
  created_at: string;
  borrado: number;
}

export interface Relacion {
  id: number;
  origen_id: number;
  destino_id: number;
  tipo: string;
  descripcion: string | null;
  project_id: number;
  created_at: string;
}

export interface DimensionLinea {
  id: number;
  nombre: string;
  carpeta_id: number;
  color?: string;
  entidad_id?: number | null;
}

export interface EventoEntidad {
  id: number;
  evento_id: number;
  entidad_id: number;
  // Virtual field
  entidad?: Entidad;
}
