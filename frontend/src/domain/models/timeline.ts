import { Carpeta } from "./database";

export interface TimelineLine extends Carpeta {
 lineasTemporales?: TimelineLine[];
 esRaiz?: boolean;
 descripcion?: string;
}

export interface UniverseExtended extends Carpeta {
 lineasTemporales: TimelineLine[];
 descripcion?: string;
}

export interface EventBase {
 titulo: string;
 descripcion?: string;
 fecha_simulada?: string;
 ordenAbsoluto?: number;
}
