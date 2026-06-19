import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Entidad, Relacion } from "@domain/database";
import { RelationshipUseCase } from "@features/Relationships";
import { PositionedNode, FlattenedCircle, GroupedEntities } from "../domain/cosmology.types";
import { buildHierarchyRoots, flattenTree, groupByLevel, getLevelColors } from "../application/cosmologyLayout";

// Props del hook
interface UseNestedArchetypesProps {
  projectId?: number;
}

// Tipo de retorno del hook
export interface UseNestedArchetypesResult {
  loading: boolean;
  // Stage
  containerRef: React.RefObject<HTMLDivElement | null>;
  stageRef: React.RefObject<Konva.Stage | null>;
  dimensions: { width: number; height: number };
  scale: number;
  position: { x: number; y: number };
  selectedNodeId: number | null;
  setSelectedNodeId: (id: number | null) => void;
  themeCanvasBackground: string;
  // Datos
  flatCircles: FlattenedCircle[];
  visibleEntities: Entidad[];
  groupedEntities: GroupedEntities;
  selectedEntityDetails: Entidad | null;
  hierarchyRoots: PositionedNode[];
  // Rejilla
  gridLines: { verticalLines: number[]; horizontalLines: number[]; startX: number; endX: number; startY: number; endY: number };
  // Handlers de canvas
  handleWheel: (e: KonvaEventObject<WheelEvent>) => void;
  handleDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  handleFocusNode: (nodeId: number) => void;
  // Minimapa
  minimapCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  minimapWidth: number;
  minimapHeight: number;
  handleMinimapMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMinimapMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMinimapMouseUp: () => void;
}

export const useNestedArchetypes = ({ projectId }: UseNestedArchetypesProps): UseNestedArchetypesResult => {
  const [entities, setEntities]         = useState<Entidad[]>([]);
  const [relationships, setRelationships] = useState<Relacion[]>([]);
  const [loading, setLoading]           = useState(true);

  // Estados del Stage
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale]           = useState(0.65);
  const [position, setPosition]     = useState({ x: 100, y: 50 });
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const containerRef    = useRef<HTMLDivElement>(null);
  const stageRef        = useRef<Konva.Stage>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingMinimap = useRef<boolean>(false);

  // Fondo blanco fijo (el resto de temas se lee de CSS en otros componentes)
  const themeCanvasBackground = "#ffffff";

  // Redimensionar Stage al cambiar tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      containerRef.current
        ? setDimensions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight })
        : undefined;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cargar datos de la red de relaciones
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
            // Error ignorado intencionadamente
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

  // Construcción de la jerarquía (delegado a la capa application)
  const hierarchyRoots = useMemo(
    (): PositionedNode[] =>
      entities.length > 0 ? buildHierarchyRoots(entities, relationships) : [],
    [entities, relationships]
  );

  // Aplanar árbol para Konva (delegado a la capa application)
  const flatCircles = useMemo((): FlattenedCircle[] => flattenTree(hierarchyRoots), [hierarchyRoots]);

  // Calcular entidades visibles y grupos (delegado a la capa application)
  const groupedEntities = useMemo((): GroupedEntities => groupByLevel(entities, flatCircles), [entities, flatCircles]);
  const visibleEntities = useMemo(
    (): Entidad[] => entities.filter((e) => flatCircles.some((c) => c.node.id === e.id)),
    [entities, flatCircles]
  );

  // Detalles del nodo seleccionado
  const selectedEntityDetails = useMemo(
    (): Entidad | null =>
      selectedNodeId !== null ? entities.find((e) => e.id === selectedNodeId) || null : null,
    [selectedNodeId, entities]
  );

  // --- REJILLA DE FONDO ---
  const BACKGROUND_GRID_SIZE = 50;
  const startX = Math.floor(-position.x / scale / BACKGROUND_GRID_SIZE) * BACKGROUND_GRID_SIZE - BACKGROUND_GRID_SIZE * 10;
  const endX   = startX + dimensions.width / scale + BACKGROUND_GRID_SIZE * 20;
  const startY = Math.floor(-position.y / scale / BACKGROUND_GRID_SIZE) * BACKGROUND_GRID_SIZE - BACKGROUND_GRID_SIZE * 10;
  const endY   = startY + dimensions.height / scale + BACKGROUND_GRID_SIZE * 20;

  const verticalLines: number[]   = [];
  const horizontalLines: number[] = [];
  for (let x = startX; x < endX; x += BACKGROUND_GRID_SIZE) { verticalLines.push(x); }
  for (let y = startY; y < endY; y += BACKGROUND_GRID_SIZE) { horizontalLines.push(y); }
  const gridLines = { verticalLines, horizontalLines, startX, endX, startY, endY };

  // --- HANDLERS DEL STAGE ---
  const handleWheel = (e: KonvaEventObject<WheelEvent>): void => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    switch (!!stage) {
      case true: {
        const scaleBy = 1.1;
        const oldScale = stage!.scaleX();
        const pointer  = stage!.getPointerPosition();
        pointer
          ? (() => {
              const mousePointTo = {
                x: (pointer.x - stage!.x()) / oldScale,
                y: (pointer.y - stage!.y()) / oldScale,
              };
              const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
              setScale(newScale);
              setPosition({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
            })()
          : undefined;
        break;
      }
      default:
        break;
    }
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>): void => {
    const isStage = e.target === stageRef.current;
    isStage ? setPosition({ x: e.target.x(), y: e.target.y() }) : undefined;
  };

  // Búsqueda recursiva de nodo por ID
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
          childFound ? (found = childFound) : undefined;
          break;
        }
      }
      i++;
    }
    return found;
  }, []);

  // Centrar vista en un nodo al hacer clic en el panel de control
  const handleFocusNode = (nodeId: number): void => {
    const pNode = findPositionedNode(hierarchyRoots, nodeId);
    pNode
      ? (() => {
          setSelectedNodeId(nodeId);
          setScale(0.85);
          setPosition({ x: dimensions.width / 2 - pNode.x * 0.85, y: dimensions.height / 2 - pNode.y * 0.85 });
        })()
      : undefined;
  };

  // --- LÓGICA DEL MINIMAPA ---
  const minimapWidth  = 180;
  const minimapHeight = 135;

  const getCanvasBounds = () =>
    flatCircles.length === 0
      ? { minX: 1000, maxX: 2000, minY: 1000, maxY: 2000 }
      : (() => {
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          flatCircles.forEach((n) => {
            n.x - n.r < minX ? (minX = n.x - n.r) : undefined;
            n.x + n.r > maxX ? (maxX = n.x + n.r) : undefined;
            n.y - n.r < minY ? (minY = n.y - n.r) : undefined;
            n.y + n.r > maxY ? (maxY = n.y + n.r) : undefined;
          });
          const margin = 200;
          return { minX: minX - margin, maxX: maxX + margin, minY: minY - margin, maxY: maxY + margin };
        })();

  const getMinimapScaleAndOffset = () => {
    const bounds = getCanvasBounds();
    const scaleX = minimapWidth  / (bounds.maxX - bounds.minX);
    const scaleY = minimapHeight / (bounds.maxY - bounds.minY);
    const mScale = Math.min(scaleX, scaleY, 0.4);
    return {
      bounds,
      mScale,
      offsetX: (minimapWidth  - (bounds.maxX - bounds.minX) * mScale) / 2,
      offsetY: (minimapHeight - (bounds.maxY - bounds.minY) * mScale) / 2,
    };
  };

  const cxToMx = (x: number, bounds: { minX: number }, mScale: number, offsetX: number) => (x - bounds.minX) * mScale + offsetX;
  const cyToMy = (y: number, bounds: { minY: number }, mScale: number, offsetY: number) => (y - bounds.minY) * mScale + offsetY;
  const mxToCx = (x: number, bounds: { minX: number }, mScale: number, offsetX: number) => (x - offsetX) / mScale + bounds.minX;
  const myToCy = (y: number, bounds: { minY: number }, mScale: number, offsetY: number) => (y - offsetY) / mScale + bounds.minY;

  // Efecto de renderizado del minimapa
  useEffect(() => {
    const canvas   = minimapCanvasRef.current;
    const shouldDraw = canvas && flatCircles.length > 0;
    shouldDraw
      ? (() => {
          const ctx = canvas.getContext("2d");
          ctx
            ? (() => {
                const { bounds, mScale, offsetX, offsetY } = getMinimapScaleAndOffset();
                ctx.clearRect(0, 0, minimapWidth, minimapHeight);

                // 1. Dibujar círculos del mapa
                flatCircles.forEach((circle) => {
                  const colors = getLevelColors(circle.node.level);
                  ctx.strokeStyle = colors.border;
                  ctx.lineWidth   = 1;
                  ctx.beginPath();
                  ctx.arc(cxToMx(circle.x, bounds, mScale, offsetX), cyToMy(circle.y, bounds, mScale, offsetY), circle.r * mScale, 0, 2 * Math.PI);
                  ctx.stroke();
                });

                // 2. Dibujar viewport de la cámara
                const vx1    = -position.x / scale;
                const vy1    = -position.y / scale;
                const mx1    = cxToMx(vx1, bounds, mScale, offsetX);
                const my1    = cyToMy(vy1, bounds, mScale, offsetY);
                const mw     = (dimensions.width  / scale) * mScale;
                const mh     = (dimensions.height / scale) * mScale;
                ctx.strokeStyle = "#3b82f6";
                ctx.lineWidth   = 1.5;
                ctx.strokeRect(mx1, my1, mw, mh);
                ctx.fillStyle   = "rgba(59, 130, 246, 0.05)";
                ctx.fillRect(mx1, my1, mw, mh);
              })()
            : undefined;
        })()
      : undefined;
  }, [flatCircles, position, scale, dimensions]);

  const handleMinimapInteraction = (clientX: number, clientY: number, canvasElement: HTMLCanvasElement): void => {
    const rect   = canvasElement.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const { bounds, mScale, offsetX, offsetY } = getMinimapScaleAndOffset();
    setPosition({
      x: -scale * mxToCx(localX, bounds, mScale, offsetX) + dimensions.width  / 2,
      y: -scale * myToCy(localY, bounds, mScale, offsetY) + dimensions.height / 2,
    });
  };

  const handleMinimapMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    isDraggingMinimap.current = true;
    handleMinimapInteraction(e.clientX, e.clientY, e.currentTarget);
  };

  const handleMinimapMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    isDraggingMinimap.current ? handleMinimapInteraction(e.clientX, e.clientY, e.currentTarget) : undefined;
  };

  const handleMinimapMouseUp = (): void => { isDraggingMinimap.current = false; };

  return {
    loading,
    containerRef,
    stageRef,
    dimensions,
    scale,
    position,
    selectedNodeId,
    setSelectedNodeId,
    themeCanvasBackground,
    flatCircles,
    visibleEntities,
    groupedEntities,
    selectedEntityDetails,
    hierarchyRoots,
    gridLines,
    handleWheel,
    handleDragEnd,
    handleFocusNode,
    minimapCanvasRef,
    minimapWidth,
    minimapHeight,
    handleMinimapMouseDown,
    handleMinimapMouseMove,
    handleMinimapMouseUp,
  };
};
