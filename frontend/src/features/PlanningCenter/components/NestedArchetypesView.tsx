import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Stage, Layer, Circle as KonvaCircle, Text as KonvaText, Line as KonvaLine, Group } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { RelationshipUseCase } from "@features/Relationships";
import { Entidad, Relacion } from "@domain/database";

// --- CATEGORÍAS DE ARQUETIPOS ---
const cosmicTypes = ["UNIVERSO", "PLANETA", "SISTEMA", "DIMENSION", "ASTRO", "UNIVERSE", "PLANET", "SYSTEM"];
const territoryTypes = ["REINO", "CIUDAD", "LUGAR", "CONTINENTE", "LOCATION", "PLACE", "GEOGRAPHY", "MAP", "MAPA"];
const collectiveTypes = [
  "ENTIDADCOLECTIVA", "COLECTIVO", "COLLECTIVE", "FACCION", "RELIGION", "RAZA", "CLASE", "PROFESION", 
  "ORGANIZACION", "FACTION", "RACE", "CLASS", "PROFESSION", "ORGANIZATION", "CONLANG"
];

const getLevel = (tipoRaw: string): number => {
  const t = tipoRaw ? tipoRaw.toUpperCase().trim() : "";
  const isCosmic = cosmicTypes.some((ct) => t.includes(ct));
  const isTerritory = territoryTypes.some((tt) => t.includes(tt));
  const isCollective = collectiveTypes.some((ct) => t.includes(ct));

  return isCosmic ? 0 : isTerritory ? 1 : isCollective ? 2 : 3;
};

const getLevelLabel = (level: number): string => {
  switch (level) {
    case 0: return "Cósmico";
    case 1: return "Territorial";
    case 2: return "Colectivo";
    default: return "Individual";
  }
};

const getLevelColors = (level: number) => {
  const colors = [
    { border: "rgba(99, 102, 241, 0.45)", label: "#818cf8" }, // Cósmico (Indigo)
    { border: "rgba(234, 179, 8, 0.45)", label: "#facc15" },  // Territorial (Amarillo)
    { border: "rgba(168, 85, 247, 0.45)", label: "#c084fc" }, // Colectivo (Púrpura)
    { border: "rgba(59, 130, 246, 0.45)", label: "#60a5fa" }, // Individual (Azul)
  ];
  return colors[level] || colors[3];
};

interface TreeNode {
  id: number;
  nombre: string;
  tipo: string;
  level: number;
  children: TreeNode[];
}

interface PositionedNode {
  node: TreeNode;
  x: number;
  y: number;
  r: number;
  children: PositionedNode[];
}

interface FlattenedCircle {
  node: TreeNode;
  x: number;
  y: number;
  r: number;
}

interface NestedArchetypesViewProps {
  projectId?: number;
}

const NestedArchetypesView: React.FC<NestedArchetypesViewProps> = ({ projectId }) => {
  const [entities, setEntities] = useState<Entidad[]>([]);
  const [relationships, setRelationships] = useState<Relacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del Stage
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(0.65);
  const [position, setPosition] = useState({ x: 100, y: 50 });
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingMinimap = useRef<boolean>(false);

  // Lectura de variables CSS dinámicas de tema
  const readHslToken = useCallback((tokenName: string, fallback: string): string => {
    const cssValue =
      typeof window === "undefined"
        ? ""
        : getComputedStyle(document.documentElement)
            .getPropertyValue(tokenName)
            .trim();
    return cssValue.length > 0 ? `hsl(${cssValue})` : `hsl(${fallback})`;
  }, []);

  const themeCanvasBackground = useMemo(() => readHslToken("--canvas-bg", "0 0% 100%"), [readHslToken]);
  const themeGridColor = useMemo(() => readHslToken("--canvas-grid", "240 10% 3.9%"), [readHslToken]);
  const themeLabelColor = useMemo(() => readHslToken("--canvas-label", "240 10% 3.9%"), [readHslToken]);

  // Redimensionar Stage
  useEffect(() => {
    const handleResize = () => {
      containerRef.current ? setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      }) : undefined;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cargar datos
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      const hasProject = !!projectId;
      switch (hasProject) {
        case true: {
          setLoading(true);
          try {
            const network = await RelationshipUseCase.getFullNetwork(projectId!);
            setEntities(network.entities);
            setRelationships(network.relationships);
          } catch (_err) {
            // Ignorado
          } finally {
            setLoading(false);
          }
          break;
        }
        default:
          break;
      }
    };
    loadData();
  }, [projectId]);

  // Construcción de la jerarquía
  const hierarchyRoots = useMemo((): PositionedNode[] => {
    const hasData = entities.length > 0;
    const result: PositionedNode[] = [];

    switch (hasData) {
      case true: {
        const nodeMap = new Map<number, TreeNode>();
        entities.forEach((ent) => {
          nodeMap.set(ent.id, {
            id: ent.id,
            nombre: ent.nombre,
            tipo: ent.tipo,
            level: getLevel(ent.tipo),
            children: [],
          });
        });

        const relationMap = new Map<number, number[]>();
        relationships.forEach((rel) => {
          const orig = Number(rel.origen_id);
          const dest = Number(rel.destino_id);
          const hasOrig = relationMap.has(orig);
          const hasDest = relationMap.has(dest);

          hasOrig ? undefined : relationMap.set(orig, []);
          hasDest ? undefined : relationMap.set(dest, []);

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
            hasParents ? (() => {
              parentMap.set(node.id, potentialParents[0].id);
              foundParent = true;
            })() : (() => {
              searchLevel--;
            })();
          }
        });

        const roots: TreeNode[] = [];
        treeNodes.forEach((node) => {
          const parentId = parentMap.get(node.id);
          const hasParent = parentId !== undefined;

          hasParent ? (() => {
            const parentNode = nodeMap.get(parentId!);
            parentNode ? parentNode.children.push(node) : roots.push(node);
          })() : (() => {
            roots.push(node);
          })();
        });

        const layoutNode = (node: TreeNode, relativeX: number, relativeY: number): PositionedNode => {
          const isLeaf = node.children.length === 0;

          switch (isLeaf) {
            case true: {
              const defaultRadii = [95, 70, 50, 28];
              return {
                node,
                x: relativeX,
                y: relativeY,
                r: defaultRadii[node.level],
                children: [],
              };
            }
            default: {
              const tempChildren = node.children.map((child) => layoutNode(child, 0, 0));
              const maxChildRadius = Math.max(...tempChildren.map((c) => c.r));
              const totalChildRadiiSum = tempChildren.reduce((sum, c) => sum + c.r, 0);

              let orbitRadius = 0;
              const positionedChildren: PositionedNode[] = [];

              const hasSingleChild = tempChildren.length === 1;
              hasSingleChild ? (() => {
                orbitRadius = 0;
                positionedChildren.push({ ...tempChildren[0], x: 0, y: 0 });
              })() : (() => {
                orbitRadius = Math.max(maxChildRadius * 1.6, (totalChildRadiiSum * 1.25) / Math.PI);
                tempChildren.forEach((child, idx) => {
                  const angle = (idx / tempChildren.length) * 2 * Math.PI;
                  positionedChildren.push({
                    ...child,
                    x: Math.cos(angle) * orbitRadius,
                    y: Math.sin(angle) * orbitRadius,
                  });
                });
              })();

              const parentRadius = orbitRadius + maxChildRadius + 35;
              return {
                node,
                x: relativeX,
                y: relativeY,
                r: parentRadius,
                children: positionedChildren,
              };
            }
          }
        };

        const positionedRoots: PositionedNode[] = [];
        // FILTRADO CLAVE: Excluir raíces huérfanas sin hijos para mostrar solo contenedores y contenidos reales
        const filteredRoots = roots.filter(r => r.children.length > 0);
        const rawLayoutRoots = filteredRoots.map((r) => layoutNode(r, 0, 0));

        const centerX = 1500;
        const centerY = 1500;
        const totalRoots = rawLayoutRoots.length;
        const maxRootRadius = Math.max(...rawLayoutRoots.map((rl) => rl.r));
        const totalRootsRadiiSum = rawLayoutRoots.reduce((sum, rl) => sum + rl.r, 0);

        const rootsOrbitRadius = totalRoots <= 1 ? 0 : Math.max(maxRootRadius * 2, (totalRootsRadiiSum * 1.5) / Math.PI);

        rawLayoutRoots.forEach((rl, idx) => {
          const angle = (idx / totalRoots) * 2 * Math.PI;
          positionedRoots.push({
            ...rl,
            x: centerX + Math.cos(angle) * rootsOrbitRadius,
            y: centerY + Math.sin(angle) * rootsOrbitRadius,
          });
        });

        positionedRoots.forEach((pr) => result.push(pr));
        break;
      }
      default:
        break;
    }

    return result;
  }, [entities, relationships]);

  // Aplanar el árbol jerárquico para Konva
  const flatCircles = useMemo((): FlattenedCircle[] => {
    const list: FlattenedCircle[] = [];
    const flatten = (nodes: PositionedNode[], parentX: number = 0, parentY: number = 0): void => {
      nodes.forEach((n) => {
        const gx = parentX + n.x;
        const gy = parentY + n.y;
        list.push({ node: n.node, x: gx, y: gy, r: n.r });
        flatten(n.children, gx, gy);
      });
    };
    flatten(hierarchyRoots);
    // Ordenar de mayor a menor nivel (Cósmicos primero para que actúen como fondo de los individuales)
    return list.sort((a, b) => a.node.level - b.node.level);
  }, [hierarchyRoots]);

  // Filtrar entidades que pertenecen al diagrama concéntrico (para el panel lateral)
  const visibleEntities = useMemo((): Entidad[] => {
    const visibleIds = new Set(flatCircles.map(c => c.node.id));
    return entities.filter(e => visibleIds.has(e.id));
  }, [entities, flatCircles]);

  // Manejo de zoom por rueda
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    switch (!!stage) {
      case true: {
        const scaleBy = 1.1;
        const oldScale = stage!.scaleX();
        const pointer = stage!.getPointerPosition();
        pointer ? (() => {
          const mousePointTo = {
            x: (pointer.x - stage!.x()) / oldScale,
            y: (pointer.y - stage!.y()) / oldScale,
          };
          const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
          setScale(newScale);
          setPosition({
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          });
        })() : undefined;
        break;
      }
      default:
        break;
    }
  };

  // Encontrar nodo recursivo por ID
  const findPositionedNode = useCallback((nodes: PositionedNode[], id: number): PositionedNode | null => {
    let found: PositionedNode | null = null;
    let i = 0;

    while (i < nodes.length && !found) {
      const n = nodes[i];
      const matches = n.node.id === id;

      switch (matches) {
        case true:
          found = n;
          break;
        default: {
          const childFound = findPositionedNode(n.children, id);
          childFound ? found = childFound : undefined;
          break;
        }
      }
      i++;
    }
    return found;
  }, []);

  // Enfoque desde barra lateral
  const handleFocusNode = (nodeId: number) => {
    const pNode = findPositionedNode(hierarchyRoots, nodeId);
    pNode ? (() => {
      setSelectedNodeId(nodeId);
      setScale(0.85);
      setPosition({
        x: dimensions.width / 2 - pNode.x * 0.85,
        y: dimensions.height / 2 - pNode.y * 0.85,
      });
    })() : undefined;
  };

  // Rejilla de Fondo Técnica
  const BACKGROUND_GRID_SIZE = 50;
  const startX = Math.floor(-position.x / scale / BACKGROUND_GRID_SIZE) * BACKGROUND_GRID_SIZE - BACKGROUND_GRID_SIZE * 10;
  const endX = startX + dimensions.width / scale + BACKGROUND_GRID_SIZE * 20;
  const startY = Math.floor(-position.y / scale / BACKGROUND_GRID_SIZE) * BACKGROUND_GRID_SIZE - BACKGROUND_GRID_SIZE * 10;
  const endY = startY + dimensions.height / scale + BACKGROUND_GRID_SIZE * 20;

  const verticalLines = [];
  for (let x = startX; x < endX; x += BACKGROUND_GRID_SIZE) {
    verticalLines.push(x);
  }
  const horizontalLines = [];
  for (let y = startY; y < endY; y += BACKGROUND_GRID_SIZE) {
    horizontalLines.push(y);
  }

  // --- LÓGICA DEL MINIMAPA ---
  const getCanvasBounds = () => {
    const bounds = flatCircles.length === 0
      ? { minX: 1000, maxX: 2000, minY: 1000, maxY: 2000 }
      : (() => {
          let minX = Infinity;
          let maxX = -Infinity;
          let minY = Infinity;
          let maxY = -Infinity;
          flatCircles.forEach((n) => {
            n.x - n.r < minX ? (minX = n.x - n.r) : undefined;
            n.x + n.r > maxX ? (maxX = n.x + n.r) : undefined;
            n.y - n.r < minY ? (minY = n.y - n.r) : undefined;
            n.y + n.r > maxY ? (maxY = n.y + n.r) : undefined;
          });
          const margin = 200;
          return { minX: minX - margin, maxX: maxX + margin, minY: minY - margin, maxY: maxY + margin };
        })();
    return bounds;
  };

  const minimapWidth = 180;
  const minimapHeight = 135;

  const getMinimapScaleAndOffset = () => {
    const bounds = getCanvasBounds();
    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;

    const scaleX = minimapWidth / boundsWidth;
    const scaleY = minimapHeight / boundsHeight;
    const mScale = Math.min(scaleX, scaleY, 0.4);

    const offsetX = (minimapWidth - boundsWidth * mScale) / 2;
    const offsetY = (minimapHeight - boundsHeight * mScale) / 2;

    return { bounds, mScale, offsetX, offsetY };
  };

  const cxToMx = (x: number, bounds: { minX: number }, mScale: number, offsetX: number) => (x - bounds.minX) * mScale + offsetX;
  const cyToMy = (y: number, bounds: { minY: number }, mScale: number, offsetY: number) => (y - bounds.minY) * mScale + offsetY;
  const mxToCx = (x: number, bounds: { minX: number }, mScale: number, offsetX: number) => (x - offsetX) / mScale + bounds.minX;
  const myToCy = (y: number, bounds: { minY: number }, mScale: number, offsetY: number) => (y - offsetY) / mScale + bounds.minY;

  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    const shouldDraw = canvas && flatCircles.length > 0;

    shouldDraw ? (() => {
      const ctx = canvas.getContext("2d");
      ctx ? (() => {
        const { bounds, mScale, offsetX, offsetY } = getMinimapScaleAndOffset();
        ctx.clearRect(0, 0, minimapWidth, minimapHeight);

        // 1. Dibujar círculos
        flatCircles.forEach((circle) => {
          const colors = getLevelColors(circle.node.level);
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(
            cxToMx(circle.x, bounds, mScale, offsetX),
            cyToMy(circle.y, bounds, mScale, offsetY),
            circle.r * mScale,
            0,
            2 * Math.PI
          );
          ctx.stroke();
        });

        // 2. Dibujar Viewport de la cámara
        const vx1 = -position.x / scale;
        const vy1 = -position.y / scale;
        const vWidth = dimensions.width / scale;
        const vHeight = dimensions.height / scale;

        const mx1 = cxToMx(vx1, bounds, mScale, offsetX);
        const my1 = cyToMy(vy1, bounds, mScale, offsetY);
        const mw = vWidth * mScale;
        const mh = vHeight * mScale;

        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(mx1, my1, mw, mh);
        ctx.fillStyle = "rgba(59, 130, 246, 0.05)";
        ctx.fillRect(mx1, my1, mw, mh);
      })() : undefined;
    })() : undefined;
  }, [flatCircles, position, scale, dimensions]);

  const handleMinimapInteraction = (clientX: number, clientY: number, canvasElement: HTMLCanvasElement) => {
    const rect = canvasElement.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    const { bounds, mScale, offsetX, offsetY } = getMinimapScaleAndOffset();
    const canvasX = mxToCx(localX, bounds, mScale, offsetX);
    const canvasY = myToCy(localY, bounds, mScale, offsetY);

    const newPosX = -scale * canvasX + dimensions.width / 2;
    const newPosY = -scale * canvasY + dimensions.height / 2;

    setPosition({ x: newPosX, y: newPosY });
  };

  const handleMinimapMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingMinimap.current = true;
    handleMinimapInteraction(e.clientX, e.clientY, e.currentTarget);
  };

  const handleMinimapMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingMinimap.current ? handleMinimapInteraction(e.clientX, e.clientY, e.currentTarget) : undefined;
  };

  const handleMinimapMouseUp = () => {
    isDraggingMinimap.current = false;
  };

  // Detalles del nodo enfocado
  const selectedEntityDetails = useMemo(() => {
    const isSelected = selectedNodeId !== null;
    return isSelected ? entities.find((e) => e.id === selectedNodeId) || null : null;
  }, [selectedNodeId, entities]);

  switch (loading) {
    case true:
      return (
        <div className="flex flex-col items-center justify-center h-full w-full opacity-35 font-mono text-xs tracking-widest uppercase gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-none" />
          Mapeando Cosmología...
        </div>
      );
    default:
      break;
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative overflow-hidden bg-background">
      {/* Stage de Konva para el Lienzo de Cosmología */}
      <div
        ref={containerRef}
        className="flex-1 h-full relative overflow-hidden outline-none"
        style={{ backgroundColor: themeCanvasBackground }}
      >
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          draggable
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          onWheel={handleWheel}
          onDragEnd={(e) => {
            const isStage = e.target === stageRef.current;
            isStage ? setPosition({ x: e.target.x(), y: e.target.y() }) : undefined;
          }}
          ref={stageRef}
        >
          {/* Capa de Rejilla de Fondo Técnica */}
          <Layer id="background-grid">
            {verticalLines.map((x, i) => (
              <KonvaLine
                key={`v-${i}`}
                points={[x, startY - 1000, x, endY + 1000]}
                stroke={themeGridColor}
                opacity={0.08}
                strokeWidth={1 / scale}
              />
            ))}
            {horizontalLines.map((y, i) => (
              <KonvaLine
                key={`h-${i}`}
                points={[startX - 1000, y, endX + 1000, y]}
                stroke={themeGridColor}
                opacity={0.08}
                strokeWidth={1 / scale}
              />
            ))}
          </Layer>

          {/* Capa de los Círculos Concéntricos */}
          <Layer id="nested-circles">
            {flatCircles.map((circle) => {
              const isSelected = selectedNodeId === circle.node.id;
              const colors = getLevelColors(circle.node.level);

              return (
                <Group key={circle.node.id}>
                  {/* Círculo de contención con Relleno SÓLIDO opaco */}
                  <KonvaCircle
                    x={circle.x}
                    y={circle.y}
                    radius={circle.r}
                    fill={themeCanvasBackground}
                    stroke={isSelected ? "#3b82f6" : colors.border}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    dash={circle.node.level === 0 ? [8, 4] : undefined}
                    onClick={(e) => {
                      e.cancelBubble = true; // Detener la propagación para evitar clicks fantasmas en padres
                      setSelectedNodeId(isSelected ? null : circle.node.id);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      setSelectedNodeId(isSelected ? null : circle.node.id);
                    }}
                  />

                  {/* Nombre del elemento en la parte superior de la corona */}
                  <KonvaText
                    x={circle.x - circle.r}
                    y={circle.y - circle.r + 10}
                    width={circle.r * 2}
                    align="center"
                    text={circle.node.nombre.toUpperCase()}
                    fontSize={circle.node.level === 0 ? 9 : 8}
                    fontFamily="Space Mono, monospace"
                    fontStyle="bold"
                    fill={colors.label}
                    opacity={isSelected ? 1 : 0.7}
                  />
                </Group>
              );
            })}
          </Layer>
        </Stage>

        {/* LEYENDA ARRIBA A LA DERECHA */}
        <div className="absolute top-4 right-4 bg-background/90 border border-foreground/10 px-4 py-2 flex flex-col gap-1.5 z-30 pointer-events-none select-none">
          <span className="font-mono text-[8px] text-foreground/45 uppercase tracking-wider mb-0.5">Escala Cosmología</span>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400" />
            <span className="font-mono text-[9px] text-foreground/70 uppercase">Cósmico</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
            <span className="font-mono text-[9px] text-foreground/70 uppercase">Territorial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-400" />
            <span className="font-mono text-[9px] text-foreground/70 uppercase">Colectivo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-mono text-[9px] text-foreground/70 uppercase">Individual</span>
          </div>
        </div>

        {/* MINIMAPA ABAJO A LA IZQUIERDA */}
        <div className="absolute bottom-4 left-4 border border-foreground/10 bg-background/90 p-1.5 shadow-2xl z-30">
          <canvas
            ref={minimapCanvasRef}
            width={minimapWidth}
            height={minimapHeight}
            className="cursor-pointer bg-background/40"
            onMouseDown={handleMinimapMouseDown}
            onMouseMove={handleMinimapMouseMove}
            onMouseUp={handleMinimapMouseUp}
            onMouseLeave={handleMinimapMouseUp}
          />
        </div>
      </div>

      {/* Panel lateral derecho de inspección */}
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-foreground/10 bg-background flex flex-col h-1/3 md:h-full z-20">
        <div className="p-4 border-b border-foreground/10 flex flex-col gap-2.5">
          <h3 className="font-serif text-sm text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[1.1rem]">motion_photos_on</span>
            Cosmología
          </h3>
          <p className="text-[10px] text-foreground/40 leading-relaxed font-sans">
            Visualiza los elementos contenidos espacial y conceptualmente según su escala de influencia.
          </p>
        </div>

        {/* Lista de Entidades para Enfoque Rápido (FILTRADA SOLO PARA ELEMENTOS ACTIVOS) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          <div>
            <label className="font-mono text-[9px] text-foreground/45 uppercase tracking-wider mb-2 block">
              Índice de Elementos
            </label>
            <div className="flex flex-col gap-1">
              {visibleEntities.map((ent) => {
                const level = getLevel(ent.tipo);
                const colors = [
                  "border-indigo-500/20 text-indigo-400 bg-indigo-500/5",
                  "border-yellow-500/20 text-yellow-400 bg-yellow-500/5",
                  "border-purple-500/20 text-purple-400 bg-purple-500/5",
                  "border-blue-500/20 text-blue-400 bg-blue-500/5",
                ];
                return (
                  <button
                    key={ent.id}
                    onClick={() => handleFocusNode(ent.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-all text-left group"
                  >
                    <span className="text-xs truncate font-medium text-foreground/80 group-hover:text-foreground">
                      {ent.nombre}
                    </span>
                    <span className={`font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 border ${colors[level] || colors[3]}`}>
                      {getLevelLabel(level)}
                    </span>
                  </button>
                );
              })}
              {visibleEntities.length === 0 && (
                <div className="text-[10px] text-foreground/30 font-mono py-4 text-center">
                  Sin elementos con relaciones de contención
                </div>
              )}
            </div>
          </div>

          {/* Detalles del elemento enfocado */}
          {selectedEntityDetails && (
            <div className="border border-foreground/10 bg-foreground/[0.01] p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-foreground/10 pb-2">
                <div className="min-w-0">
                  <h4 className="font-serif text-sm text-foreground truncate">
                    {selectedEntityDetails.nombre}
                  </h4>
                  <span className="font-mono text-[8px] text-primary uppercase tracking-wider">
                    {selectedEntityDetails.tipo}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-foreground/40 hover:text-foreground text-xs"
                >
                  Cerrar
                </button>
              </div>
              <p className="text-[11px] text-foreground/60 leading-relaxed font-sans">
                {selectedEntityDetails.descripcion || "Sin descripción disponible."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NestedArchetypesView;
