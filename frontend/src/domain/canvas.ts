export interface Shape {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'round' | 'bevel' | 'miter';
  dash?: number[];
  tension?: number;
  globalCompositeOperation?: string;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  fill?: string | null;
  data?: string;
}

export interface LayerData {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  shapes: Shape[];
}
