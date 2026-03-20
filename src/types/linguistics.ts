export interface Shape {
 id: string;
 type: string;
 stroke?: string;
 strokeWidth?: number;
 opacity?: number;
 lineCap?: string;
 lineJoin?: string;
 x?: number;
 y?: number;
 points?: number[];
 width?: number;
 height?: number;
 radius?: number;
 dash?: number[];
 tension?: number;
 globalCompositeOperation?: string;
 data?: string;
 fill?: string | null;
 scaleX?: number;
 scaleY?: number;
}

export interface Layer {
 id: string;
 name: string;
 visible: boolean;
 locked: boolean;
 shapes: Shape[];
}

export interface LogEntry {
 msg: string;
 type: 'info' | 'success' | 'warning' | 'error';
}

export interface WritingSystemType {
 id: string;
 name: string;
 desc: string;
}

export const WRITING_SYSTEM_TYPES: Record<string, WritingSystemType> = {
 ALPHABET: { id: 'ALPHABET', name: 'Alfabeto', desc: 'Un símbolo por fonema.' },
 ABJAD: { id: 'ABJAD', name: 'Abjad', desc: 'Consonantes marcadas.' },
 SYLLABARY: { id: 'SYLLABARY', name: 'Silabario', desc: 'Símbolos por sílaba.' },
 ABUGIDA: { id: 'ABUGIDA', name: 'Abugida', desc: 'Base consonantes + vocales mod.' }
};
