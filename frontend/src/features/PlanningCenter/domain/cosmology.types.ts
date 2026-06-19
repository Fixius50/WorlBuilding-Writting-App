import { Entidad } from "@domain/database";

// --- TIPOS DE DOMINIO: COSMOLOGÍA ---

export interface TreeNode {
  id: number;
  nombre: string;
  tipo: string;
  level: number;
  children: TreeNode[];
}

export interface PositionedNode {
  node: TreeNode;
  x: number;
  y: number;
  r: number;
  children: PositionedNode[];
}

export interface FlattenedCircle {
  node: TreeNode;
  x: number;
  y: number;
  r: number;
}

// Entidades agrupadas por nivel de arquetipo (0=Cósmico, 1=Territorial, 2=Colectivo, 3=Individual)
export type GroupedEntities = Record<number, Entidad[]>;
