import { Entidad, Relacion } from "@domain/database";
import { TreeNode, PositionedNode, FlattenedCircle, GroupedEntities } from "../domain/cosmology.types";

// --- CATEGORÍAS DE ARQUETIPOS ---
const cosmicTypes     = ["UNIVERSO", "PLANETA", "SISTEMA", "DIMENSION", "ASTRO", "UNIVERSE", "PLANET", "SYSTEM"];
const territoryTypes  = ["REINO", "CIUDAD", "LUGAR", "CONTINENTE", "LOCATION", "PLACE", "GEOGRAPHY", "MAP", "MAPA"];
const collectiveTypes = [
  "ENTIDADCOLECTIVA", "COLECTIVO", "COLLECTIVE", "FACCION", "RELIGION", "RAZA", "CLASE", "PROFESION",
  "ORGANIZACION", "FACTION", "RACE", "CLASS", "PROFESSION", "ORGANIZATION", "CONLANG",
];

// Devuelve el nivel jerárquico (0=Cósmico, 1=Territorial, 2=Colectivo, 3=Individual)
export const getLevel = (tipoRaw: string): number => {
  const t = tipoRaw ? tipoRaw.toUpperCase().trim() : "";
  const isCosmic    = cosmicTypes.some((ct) => t.includes(ct));
  const isTerritory = territoryTypes.some((tt) => t.includes(tt));
  const isCollective = collectiveTypes.some((ct) => t.includes(ct));
  return isCosmic ? 0 : isTerritory ? 1 : isCollective ? 2 : 3;
};

export const getLevelLabel = (level: number): string => {
  switch (level) {
    case 0:  return "Cósmico";
    case 1:  return "Territorial";
    case 2:  return "Colectivo";
    default: return "Individual";
  }
};

export const getLevelColors = (level: number): { border: string; label: string } => {
  const colors = [
    { border: "rgba(99, 102, 241, 0.45)",  label: "#818cf8" }, // Cósmico (Indigo)
    { border: "rgba(234, 179, 8, 0.45)",   label: "#facc15" }, // Territorial (Amarillo)
    { border: "rgba(168, 85, 247, 0.45)",  label: "#c084fc" }, // Colectivo (Púrpura)
    { border: "rgba(59, 130, 246, 0.45)",  label: "#60a5fa" }, // Individual (Azul)
  ];
  return colors[level] || colors[3];
};

// Calcula el layout recursivo de un nodo y sus hijos
const layoutNode = (node: TreeNode, relativeX: number, relativeY: number): PositionedNode => {
  const isLeaf = node.children.length === 0;

  switch (isLeaf) {
    case true: {
      const defaultRadii = [95, 70, 50, 28];
      return { node, x: relativeX, y: relativeY, r: defaultRadii[node.level] ?? 28, children: [] };
    }
    default: {
      const tempChildren = node.children.map((child) => layoutNode(child, 0, 0));
      const maxChildRadius    = Math.max(...tempChildren.map((c) => c.r));
      const totalChildRadiiSum = tempChildren.reduce((sum, c) => sum + c.r, 0);

      let orbitRadius = 0;
      const positionedChildren: PositionedNode[] = [];

      const hasSingleChild = tempChildren.length === 1;
      hasSingleChild
        ? positionedChildren.push({ ...tempChildren[0], x: 0, y: 0 })
        : (() => {
            orbitRadius = Math.max(maxChildRadius * 1.6, (totalChildRadiiSum * 1.25) / Math.PI);
            tempChildren.forEach((child, idx) => {
              const angle = (idx / tempChildren.length) * 2 * Math.PI;
              positionedChildren.push({ ...child, x: Math.cos(angle) * orbitRadius, y: Math.sin(angle) * orbitRadius });
            });
          })();

      const parentRadius = orbitRadius + maxChildRadius + 35;
      return { node, x: relativeX, y: relativeY, r: parentRadius, children: positionedChildren };
    }
  }
};

// Construye y posiciona el árbol jerárquico a partir de entidades y relaciones
export const buildHierarchyRoots = (entities: Entidad[], relationships: Relacion[]): PositionedNode[] => {
  const nodeMap = new Map<number, TreeNode>();
  entities.forEach((ent) => {
    nodeMap.set(ent.id, { id: ent.id, nombre: ent.nombre, tipo: ent.tipo, level: getLevel(ent.tipo), children: [] });
  });

  const relationMap = new Map<number, number[]>();
  relationships.forEach((rel) => {
    const orig = Number(rel.origen_id);
    const dest = Number(rel.destino_id);
    relationMap.has(orig) ? undefined : relationMap.set(orig, []);
    relationMap.has(dest) ? undefined : relationMap.set(dest, []);
    relationMap.get(orig)!.push(dest);
    relationMap.get(dest)!.push(orig);
  });

  const parentMap = new Map<number, number>();
  const treeNodes = Array.from(nodeMap.values());
  const sortedNodes = [...treeNodes].sort((a, b) => b.level - a.level);

  sortedNodes.forEach((node) => {
    const neighbors = relationMap.get(node.id) || [];
    let foundParent = false;
    let searchLevel = node.level - 1;

    while (searchLevel >= 0 && !foundParent) {
      const potentialParents = neighbors
        .map((nId) => nodeMap.get(nId))
        .filter((n): n is TreeNode => !!n && n.level === searchLevel);

      const hasParents = potentialParents.length > 0;
      hasParents
        ? (() => { parentMap.set(node.id, potentialParents[0].id); foundParent = true; })()
        : (() => { searchLevel--; })();
    }
  });

  const roots: TreeNode[] = [];
  treeNodes.forEach((node) => {
    const parentId = parentMap.get(node.id);
    parentId !== undefined
      ? (() => {
          const parentNode = nodeMap.get(parentId);
          parentNode ? parentNode.children.push(node) : roots.push(node);
        })()
      : roots.push(node);
  });

  // FILTRADO CLAVE: Excluir raíces huérfanas sin hijos para mostrar solo contenedores y contenidos reales
  const filteredRoots = roots.filter((r) => r.children.length > 0);
  const rawLayoutRoots = filteredRoots.map((r) => layoutNode(r, 0, 0));

  const centerX = 1500;
  const centerY = 1500;
  const totalRoots = rawLayoutRoots.length;
  const maxRootRadius = Math.max(...rawLayoutRoots.map((rl) => rl.r));
  const totalRootsRadiiSum = rawLayoutRoots.reduce((sum, rl) => sum + rl.r, 0);
  const rootsOrbitRadius = totalRoots <= 1 ? 0 : Math.max(maxRootRadius * 2, (totalRootsRadiiSum * 1.5) / Math.PI);

  return rawLayoutRoots.map((rl, idx) => {
    const angle = (idx / totalRoots) * 2 * Math.PI;
    return { ...rl, x: centerX + Math.cos(angle) * rootsOrbitRadius, y: centerY + Math.sin(angle) * rootsOrbitRadius };
  });
};

// Aplana el árbol de nodos posicionados en una lista plana para Konva, ordenada de mayor a menor scope
export const flattenTree = (roots: PositionedNode[]): FlattenedCircle[] => {
  const list: FlattenedCircle[] = [];
  const flatten = (nodes: PositionedNode[], parentX = 0, parentY = 0): void => {
    nodes.forEach((n) => {
      const gx = parentX + n.x;
      const gy = parentY + n.y;
      list.push({ node: n.node, x: gx, y: gy, r: n.r });
      flatten(n.children, gx, gy);
    });
  };
  flatten(roots);
  // Cósmicos primero para que actúen como fondo de los individuales
  return list.sort((a, b) => a.node.level - b.node.level);
};

// Agrupa las entidades visibles por su nivel de arquetipo
export const groupByLevel = (entities: Entidad[], flatCircles: FlattenedCircle[]): GroupedEntities => {
  const visibleIds = new Set(flatCircles.map((c) => c.node.id));
  const visibleEntities = entities.filter((e) => visibleIds.has(e.id));
  const groups: GroupedEntities = { 0: [], 1: [], 2: [], 3: [] };
  visibleEntities.forEach((ent) => { groups[getLevel(ent.tipo)].push(ent); });
  return groups;
};
