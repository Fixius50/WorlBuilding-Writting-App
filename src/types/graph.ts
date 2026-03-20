export interface GraphNode {
 id: string;
 originalId: number | string;
 originalType: string;
 name: string;
 description: string;
 type: string;
 icon: string;
 x: number;
 y: number;
 color: string;
}

export interface GraphConnection {
 from: string;
 to: string;
 label: string;
 description?: string;
}

export interface GraphData {
 nodes: GraphNode[];
 connections: GraphConnection[];
}
