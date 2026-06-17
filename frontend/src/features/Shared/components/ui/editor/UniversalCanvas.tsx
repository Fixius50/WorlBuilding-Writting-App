import React, { useRef, useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Line,
  Circle,
  Text,
  Group,
  RegularPolygon,
  Rect,
  Path,
  Ellipse,
} from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import SectionErrorBoundary from "@features/Shell/layout/SectionErrorBoundary";
import { getHierarchyVisuals } from "@components/ui/hierarchyVisuals";
import { HierarchyTypeId } from "@domain/hierarchy";
import Switch from "@components/ui/Switch";

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  label: string;
  tipo: string;
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  relation?: string;
}

const defaultNodes: CanvasNode[] = [
  { id: "1", x: 400, y: 300, label: "El Sol Rojo", tipo: "estrella" },
  { id: "2", x: 200, y: 150, label: "Planeta Alpha", tipo: "planeta" },
  { id: "3", x: 600, y: 450, label: "Planeta Omega", tipo: "planeta" },
];

const defaultEdges: CanvasEdge[] = [
  { id: "e1-2", from: "1", to: "2" },
  { id: "e1-3", from: "1", to: "3" },
];

export interface UniversalCanvasProps {
  initialNodes?: CanvasNode[];
  initialEdges?: CanvasEdge[];
  onNodeClick?: (id: string) => void;
  onEdgeClick?: (id: string) => void;
  onNodeDragEnd?: (id: string, x: number, y: number) => void;
  backgroundColor?: string;
  onDropNode?: (entityId: string, x: number, y: number) => void;
  draggableEntities?: { id: string; label: string; tipo: string }[];
  onClearCanvas?: () => void;
}

const getArchetypeTypeAndColor = (tipoRaw: string) => {
  const tipo = tipoRaw ? tipoRaw.toUpperCase() : "";
  let result = { type: "DEFAULT", color: "#9ca3af" };

  switch (tipo) {
    case "PERSONAJE":
    case "OBJETO":
    case "RELIQUIA":
    case "VEHICULO":
      result = { type: "ACTOR", color: "#3b82f6" };
      break;

    case "UNIVERSO":
    case "PLANETA":
    case "SISTEMA":
    case "DIMENSION":
    case "ASTRO":
      result = { type: "DEFAULT", color: "#9ca3af" };
      break;

    case "REINO":
    case "CIUDAD":
    case "LUGAR":
    case "CONTINENTE":
      result = { type: "TERRITORY", color: "#eab308" };
      break;

    case "FACCION":
    case "RELIGION":
    case "RAZA":
    case "ORGANIZACION":
      result = { type: "COLLECTIVE", color: "#a855f7" };
      break;

    case "EVENTO":
    case "GUERRA":
    case "ERA":
    case "MARCA_TEMPORAL":
      result = { type: "EVENT", color: "#ef4444" };
      break;

    default:
      break;
  }

  return result;
};

const KonvaArchetypeIcon: React.FC<{
  type: string;
  color: string;
  size?: number;
  strokeWidth?: number;
}> = ({ type, color, size = 40, strokeWidth = 1.5 }) => {
  const scale = size / 24;
  const sw = strokeWidth;

  return (
    <Group scaleX={scale} scaleY={scale} x={-12 * scale} y={-12 * scale}>
      {type === "ACTOR" && (
        <Group>
          <Circle
            x={12}
            y={7}
            radius={4}
            stroke={color}
            strokeWidth={sw / scale}
          />
          <Path
            data="M 4 20 L 7 13 L 17 13 L 20 20"
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
        </Group>
      )}
      {type === "TERRITORY" && (
        <Group>
          <Path
            data="M 2 20 L 9 8 L 14 16.5"
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
          <Path
            data="M 9 14 L 16 3 L 22 20"
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
          <Line
            points={[2, 20, 22, 20]}
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
        </Group>
      )}
      {type === "COLLECTIVE" && (
        <Group>
          <Circle
            x={12}
            y={4}
            radius={2}
            stroke={color}
            strokeWidth={sw / scale}
          />
          <Circle
            x={5}
            y={18}
            radius={2}
            stroke={color}
            strokeWidth={sw / scale}
          />
          <Circle
            x={19}
            y={18}
            radius={2}
            stroke={color}
            strokeWidth={sw / scale}
          />
          <Line
            points={[10.5, 5.5, 6.5, 16.5]}
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
          <Line
            points={[13.5, 5.5, 17.5, 16.5]}
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
          <Line
            points={[7, 18, 17, 18]}
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
        </Group>
      )}
      {type === "EVENT" && (
        <Group>
          <Line
            points={[5, 4, 19, 4, 12, 12]}
            closed
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
          <Line
            points={[5, 20, 19, 20, 12, 12]}
            closed
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
          <Line
            points={[3, 2, 21, 2]}
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
          <Line
            points={[3, 22, 21, 22]}
            stroke={color}
            strokeWidth={sw / scale}
            lineCap="round"
            lineJoin="round"
          />
        </Group>
      )}
      {type === "DEFAULT" && (
        <Group>
          <Circle
            x={12}
            y={12}
            radius={3}
            stroke={color}
            strokeWidth={sw / scale}
          />
          <Ellipse
            x={12}
            y={12}
            radiusX={10}
            radiusY={4}
            rotation={45}
            stroke={color}
            strokeWidth={sw / scale}
          />
          <Ellipse
            x={12}
            y={12}
            radiusX={10}
            radiusY={4}
            rotation={-45}
            stroke={color}
            strokeWidth={sw / scale}
          />
        </Group>
      )}
    </Group>
  );
};

const UniversalCanvas: React.FC<UniversalCanvasProps> = ({
  initialNodes = defaultNodes,
  initialEdges = defaultEdges,
  onNodeClick,
  onEdgeClick,
  onNodeDragEnd,
  backgroundColor,
  onDropNode,
  draggableEntities,
  onClearCanvas,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingMinimap = useRef<boolean>(false);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialEdges);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [dragSearchTerm, setDragSearchTerm] = useState("");
  const [showMinimap, setShowMinimap] = useState<boolean>(true);

  // Estados de Interacción
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dashOffset, setDashOffset] = useState(0);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges]);

  // Loop de animación para las líneas activas (flujo de datos)
  useEffect(() => {
    const hasActiveAnimation = pinnedNode !== null || hoveredNode !== null;
    let animId: number;

    const tick = () => {
      setDashOffset((prev) => (prev - 1) % 30);
      animId = requestAnimationFrame(tick);
    };

    hasActiveAnimation ? (animId = requestAnimationFrame(tick)) : undefined;

    return () => {
      hasActiveAnimation ? cancelAnimationFrame(animId) : undefined;
    };
  }, [pinnedNode, hoveredNode]);

  const uniqueTypes = React.useMemo(() => {
    const types = new Set<string>();
    initialNodes.forEach((n) => {
      n.tipo ? types.add(n.tipo) : undefined;
    });
    return Array.from(types);
  }, [initialNodes]);

  const filteredNodes = React.useMemo(() => {
    return nodes.filter((node) => {
      const matchesSearch = node.label
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = filterType === "ALL" || node.tipo === filterType;
      return matchesSearch && matchesType;
    });
  }, [nodes, searchTerm, filterType]);

  const filteredEdges = React.useMemo(() => {
    return edges.filter((edge) => {
      const fromExists = filteredNodes.some((n) => n.id === edge.from);
      const toExists = filteredNodes.some((n) => n.id === edge.to);
      return fromExists && toExists;
    });
  }, [edges, filteredNodes]);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const readHslToken = (tokenName: string, fallback: string): string => {
    const cssValue =
      typeof window === "undefined"
        ? ""
        : getComputedStyle(document.documentElement)
            .getPropertyValue(tokenName)
            .trim();
    return cssValue.length > 0 ? `hsl(${cssValue})` : `hsl(${fallback})`;
  };

  const themeCanvasBackground =
    backgroundColor || readHslToken("--canvas-bg", "0 0% 100%");
  const themeGridColor = readHslToken("--canvas-grid", "240 10% 3.9%");
  const themeEdgeColor = readHslToken("--canvas-edge", "142 70% 45%");
  const themeLabelColor = readHslToken("--canvas-label", "240 10% 3.9%");

  useEffect(() => {
    const handleResize = () => {
      containerRef.current
        ? setDimensions({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
          })
        : undefined;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (stage) {
      const scaleBy = 1.1;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (pointer) {
        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale =
          e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        setScale(newScale);

        setPosition({
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        });
      }
    }
  };

  const handleDragMoveNode = (id: string, e: KonvaEventObject<DragEvent>) => {
    const newNodes = nodes.map((n) => {
      return n.id === id ? { ...n, x: e.target.x(), y: e.target.y() } : n;
    });
    setNodes(newNodes);
  };

  const handleNodeClickLocal = (id: string) => {
    setPinnedNode((prev) => (prev === id ? null : id));
    onNodeClick?.(id);
  };

  // --- ALGORITMO BFS: Ruta más corta ---
  const findShortestPath = (startId: string, endId: string) => {
    let resultPath: string[] | null = null;
    const queue: string[][] =
      startId && endId && startId !== endId ? [[startId]] : [];
    const visited = new Set<string>([startId]);

    while (queue.length > 0 && !resultPath) {
      const path = queue.shift()!;
      const currentId = path[path.length - 1];

      switch (currentId === endId) {
        case true:
          resultPath = path;
          break;
        default: {
          const neighbors: string[] = [];
          filteredEdges.forEach((edge) => {
            edge.from === currentId
              ? neighbors.push(edge.to)
              : edge.to === currentId
                ? neighbors.push(edge.from)
                : undefined;
          });

          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push([...path, neighbor]);
            }
          }
          break;
        }
      }
    }
    return resultPath;
  };

  // --- CÁLCULO DE ESTADOS ACTIVOS ---
  const { activeNodes, activeLinks, routeLinks } = React.useMemo(() => {
    const aNodes = new Set<string>();
    const aEdges = new Set<string>();
    const rEdges = new Set<string>();

    if (pinnedNode) {
      aNodes.add(pinnedNode);
      filteredEdges.forEach((edge) => {
        const matchesPinned =
          edge.from === pinnedNode || edge.to === pinnedNode;
        matchesPinned ? aEdges.add(edge.id) : undefined;
        matchesPinned
          ? aNodes.add(edge.from === pinnedNode ? edge.to : edge.from)
          : undefined;
      });
    }

    if (hoveredNode) {
      aNodes.add(hoveredNode);
      filteredEdges.forEach((edge) => {
        const matchesHovered =
          edge.from === hoveredNode || edge.to === hoveredNode;
        matchesHovered ? aEdges.add(edge.id) : undefined;
        matchesHovered
          ? aNodes.add(edge.from === hoveredNode ? edge.to : edge.from)
          : undefined;
      });
    }

    const hasDifferentSelection =
      !!pinnedNode && !!hoveredNode && pinnedNode !== hoveredNode;
    switch (hasDifferentSelection) {
      case true: {
        const path = findShortestPath(pinnedNode!, hoveredNode!);
        const hasPath = !!path;
        hasPath ? path.forEach((id) => aNodes.add(id)) : undefined;
        if (hasPath) {
          for (let i = 0; i < path.length - 1; i++) {
            const fromId = path[i];
            const toId = path[i + 1];
            const edge =
              filteredEdges.find(
                (e) =>
                  String(e.from) === String(fromId) &&
                  String(e.to) === String(toId),
              ) ||
              filteredEdges.find(
                (e) =>
                  String(e.from) === String(toId) &&
                  String(e.to) === String(fromId),
              );
            if (edge) {
              aEdges.add(edge.id);
              rEdges.add(edge.id);
            }
          }
        }
        break;
      }
      default:
        break;
    }

    return { activeNodes: aNodes, activeLinks: aEdges, routeLinks: rEdges };
  }, [pinnedNode, hoveredNode, filteredEdges]);

  const hasInteraction = pinnedNode !== null || hoveredNode !== null;

  // Estilos de los enlaces precalculados
  const edgeStyles = React.useMemo(() => {
    const styles: Record<
      string,
      {
        strokeColor: string;
        strokeWidth: number;
        opacity: number;
        dash?: number[];
      }
    > = {};
    filteredEdges.forEach((edge) => {
      const isLinkActive = activeLinks.has(edge.id);
      const isRoute = routeLinks.has(edge.id);
      const isAnimated = isRoute || (isLinkActive && pinnedNode !== null);

      const isOutbound =
        pinnedNode !== null
          ? edge.from === pinnedNode
          : hoveredNode !== null
            ? edge.from === hoveredNode
            : false;

      const opacity = hasInteraction
        ? isRoute
          ? 1
          : isLinkActive
            ? 0.6
            : 0.05
        : 0.25;
      const strokeWidth = isRoute ? 4 : isLinkActive ? 2.5 : 1.5;

      const strokeColor = isRoute
        ? "#3b82f6"
        : isLinkActive
          ? themeEdgeColor
          : "#d1d5db";

      const dash = isAnimated ? [10, 5] : undefined;

      styles[edge.id] = { strokeColor, strokeWidth, opacity, dash };
    });
    return styles;
  }, [
    filteredEdges,
    activeLinks,
    routeLinks,
    pinnedNode,
    hoveredNode,
    hasInteraction,
    themeEdgeColor,
  ]);

  // Cálculo para grid infinito simulado
  const BACKGROUND_GRID_SIZE = 50;
  const startX =
    Math.floor(-position.x / scale / BACKGROUND_GRID_SIZE) *
      BACKGROUND_GRID_SIZE -
    BACKGROUND_GRID_SIZE * 10;
  const endX = startX + dimensions.width / scale + BACKGROUND_GRID_SIZE * 20;
  const startY =
    Math.floor(-position.y / scale / BACKGROUND_GRID_SIZE) *
      BACKGROUND_GRID_SIZE -
    BACKGROUND_GRID_SIZE * 10;
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
    const bounds =
      nodes.length === 0
        ? { minX: -400, maxX: 400, minY: -300, maxY: 300 }
        : (() => {
            let minX = Infinity;
            let maxX = -Infinity;
            let minY = Infinity;
            let maxY = -Infinity;
            nodes.forEach((n) => {
              n.x < minX ? (minX = n.x) : undefined;
              n.x > maxX ? (maxX = n.x) : undefined;
              n.y < minY ? (minY = n.y) : undefined;
              n.y > maxY ? (maxY = n.y) : undefined;
            });
            const margin = 200;
            return {
              minX: minX - margin,
              maxX: maxX + margin,
              minY: minY - margin,
              maxY: maxY + margin,
            };
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
    const mScale = Math.min(scaleX, scaleY, 0.5);

    const offsetX = (minimapWidth - boundsWidth * mScale) / 2;
    const offsetY = (minimapHeight - boundsHeight * mScale) / 2;

    return { bounds, mScale, offsetX, offsetY, boundsWidth, boundsHeight };
  };

  const cxToMx = (
    x: number,
    bounds: { minX: number },
    mScale: number,
    offsetX: number,
  ) => (x - bounds.minX) * mScale + offsetX;

  const cyToMy = (
    y: number,
    bounds: { minY: number },
    mScale: number,
    offsetY: number,
  ) => (y - bounds.minY) * mScale + offsetY;

  const mxToCx = (
    x: number,
    bounds: { minX: number },
    mScale: number,
    offsetX: number,
  ) => (x - offsetX) / mScale + bounds.minX;

  const myToCy = (
    y: number,
    bounds: { minY: number },
    mScale: number,
    offsetY: number,
  ) => (y - offsetY) / mScale + bounds.minY;

  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    const shouldDraw = showMinimap && canvas;

    if (shouldDraw) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { bounds, mScale, offsetX, offsetY } = getMinimapScaleAndOffset();

        // Limpiar el canvas
        ctx.clearRect(0, 0, minimapWidth, minimapHeight);

        // 1. Dibujar enlaces
        ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
        ctx.lineWidth = 1;
        filteredEdges.forEach((edge) => {
          const fromNode = filteredNodes.find((n) => n.id === edge.from);
          const toNode = filteredNodes.find((n) => n.id === edge.to);

          if (fromNode && toNode) {
            ctx.beginPath();
            ctx.moveTo(
              cxToMx(fromNode.x, bounds, mScale, offsetX),
              cyToMy(fromNode.y, bounds, mScale, offsetY),
            );
            ctx.lineTo(
              cxToMx(toNode.x, bounds, mScale, offsetX),
              cyToMy(toNode.y, bounds, mScale, offsetY),
            );
            ctx.stroke();
          }
        });

        // 2. Dibujar nodos
        filteredNodes.forEach((node) => {
          const { color } = getArchetypeTypeAndColor(node.tipo);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(
            cxToMx(node.x, bounds, mScale, offsetX),
            cyToMy(node.y, bounds, mScale, offsetY),
            3,
            0,
            2 * Math.PI,
          );
          ctx.fill();
        });

        // 3. Dibujar Viewport (área visible actual)
        const vx1 = -position.x / scale;
        const vy1 = -position.y / scale;
        const vWidth = dimensions.width / scale;
        const vHeight = dimensions.height / scale;

        const mx1 = cxToMx(vx1, bounds, mScale, offsetX);
        const my1 = cyToMy(vy1, bounds, mScale, offsetY);
        const mw = vWidth * mScale;
        const mh = vHeight * mScale;

        // Borde y Fondo del viewport (círculo)
        const centerX = mx1 + mw / 2;
        const centerY = my1 + mh / 2;
        const radius = Math.min(mw, mh) / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);

        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "rgba(59, 130, 246, 0.05)";
        ctx.fill();
      }
    }
  }, [showMinimap, filteredNodes, filteredEdges, position, scale, dimensions]);

  const handleMinimapInteraction = (
    clientX: number,
    clientY: number,
    canvasElement: HTMLCanvasElement,
  ) => {
    const rect = canvasElement.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    const { bounds, mScale, offsetX, offsetY } = getMinimapScaleAndOffset();
    const canvasX = mxToCx(localX, bounds, mScale, offsetX);
    const canvasY = myToCy(localY, bounds, mScale, offsetY);

    // Centrar el viewport en las coordenadas (canvasX, canvasY)
    const newPosX = -scale * canvasX + dimensions.width / 2;
    const newPosY = -scale * canvasY + dimensions.height / 2;

    setPosition({ x: newPosX, y: newPosY });
  };

  const handleMinimapMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingMinimap.current = true;
    handleMinimapInteraction(e.clientX, e.clientY, e.currentTarget);
  };

  const handleMinimapMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingMinimap.current) {
      handleMinimapInteraction(e.clientX, e.clientY, e.currentTarget);
    }
  };

  const handleMinimapMouseUp = () => {
    isDraggingMinimap.current = false;
  };

  const handleMinimapMouseLeave = () => {
    isDraggingMinimap.current = false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const entityId = e.dataTransfer.getData("text/plain");
    if (entityId && onDropNode && stageRef.current) {
      const stage = stageRef.current;
      const rect = stage.container().getBoundingClientRect();

      // Obtener coordenadas exactas del cursor del evento DragEvent respecto al lienzo
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      const stageX = stage.x();
      const stageY = stage.y();
      const stageScale = stage.scaleX();

      const canvasX = (pointerX - stageX) / stageScale;
      const canvasY = (pointerY - stageY) / stageScale;

      onDropNode(entityId, canvasX, canvasY);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{ backgroundColor: themeCanvasBackground }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        draggable
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onDragEnd={(e) => {
          const isStage = e.target === stageRef.current;
          isStage
            ? setPosition({ x: e.target.x(), y: e.target.y() })
            : undefined;
        }}
        ref={stageRef}
      >
        <Layer id="background-grid">
          {verticalLines.map((x, i) => (
            <Line
              key={`v-${i}`}
              points={[x, startY - 1000, x, endY + 1000]}
              stroke={themeGridColor}
              opacity={0.08}
              strokeWidth={1 / scale}
            />
          ))}
          {horizontalLines.map((y, i) => (
            <Line
              key={`h-${i}`}
              points={[startX - 1000, y, endX + 1000, y]}
              stroke={themeGridColor}
              opacity={0.08}
              strokeWidth={1 / scale}
            />
          ))}
        </Layer>

        <Layer id="edges">
          {/* 1. Dibujar líneas de conexión */}
          {filteredEdges.map((edge) => {
            const fromNode = filteredNodes.find((n) => n.id === edge.from);
            const toNode = filteredNodes.find((n) => n.id === edge.to);
            const hasNodes = !!fromNode && !!toNode;

            return hasNodes ? (
              <Line
                key={`line-${edge.id}`}
                points={[fromNode!.x, fromNode!.y, toNode!.x, toNode!.y]}
                stroke={edgeStyles[edge.id].strokeColor}
                strokeWidth={edgeStyles[edge.id].strokeWidth}
                opacity={edgeStyles[edge.id].opacity}
                dash={edgeStyles[edge.id].dash}
                dashOffset={dashOffset}
                onClick={() => onEdgeClick?.(edge.id)}
                onTap={() => onEdgeClick?.(edge.id)}
              />
            ) : null;
          })}

          {/* 2. Dibujar etiquetas de relación sobre las líneas */}
          {filteredEdges.map((edge) => {
            const fromNode = filteredNodes.find((n) => n.id === edge.from);
            const toNode = filteredNodes.find((n) => n.id === edge.to);
            const hasNodes = !!fromNode && !!toNode;

            const isLinkActive = activeLinks.has(edge.id);
            const isRoute = routeLinks.has(edge.id);
            const relationText = edge.relation || "";

            const factor = 0.33;
            const midX = hasNodes
              ? fromNode!.x + (toNode!.x - fromNode!.x) * factor
              : 0;
            const midY = hasNodes
              ? fromNode!.y + (toNode!.y - fromNode!.y) * factor
              : 0;

            const textWidth = relationText.length * 7;
            const rectWidth = textWidth + 12;
            const rectHeight = 20;
            const rx = 10;
            const isOutbound =
              pinnedNode !== null
                ? edge.from === pinnedNode
                : hoveredNode !== null
                  ? edge.from === hoveredNode
                  : false;

            const strokeColor = isRoute
              ? "#3b82f6"
              : isLinkActive
                ? themeEdgeColor
                : "#d1d5db";

            const textColor = isRoute
              ? "#2563eb"
              : isLinkActive
                ? themeEdgeColor
                : "#ffffffff";

            const fillColor = isRoute
              ? "#eff6ff"
              : isLinkActive
                ? "#f0f9ff"
                : "#ffffff";

            return hasNodes && isLinkActive && relationText ? (
              <Group key={`label-${edge.id}`} opacity={isRoute ? 1 : 0.8}>
                <Rect
                  x={midX - rectWidth / 2}
                  y={midY - rectHeight / 2}
                  width={rectWidth}
                  height={rectHeight}
                  cornerRadius={rx}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={1}
                />
                <Text
                  x={midX - rectWidth / 2}
                  y={midY - 5}
                  width={rectWidth}
                  text={relationText}
                  align="center"
                  fontSize={10}
                  fontFamily="Inter, sans-serif"
                  fontStyle={isRoute ? "bold" : "normal"}
                  fill={textColor}
                />
              </Group>
            ) : null;
          })}
        </Layer>

        <Layer id="nodes">
          {filteredNodes.map((node) => {
            const { type, color } = getArchetypeTypeAndColor(node.tipo);
            const isNodeActive = !hasInteraction || activeNodes.has(node.id);
            const isPinned = pinnedNode === node.id;
            const isHovered = hoveredNode === node.id;

            const scaleNode = isHovered || isPinned ? 1.2 : 1;
            const opacityNode = isNodeActive ? 1 : 0.3;

            const shape = (
              <KonvaArchetypeIcon
                type={type}
                color={color}
                size={40 * scaleNode}
                strokeWidth={isPinned ? 2.5 : 1.5}
              />
            );

            const labelColor = isPinned
              ? "#2563eb"
              : isHovered
                ? "#111827"
                : themeLabelColor;

            const fontStyle = isPinned || isHovered ? "bold" : "normal";

            // Cálculo adaptativo de tamaño (auto width & height) basado en el texto del nodo
            const labelLines = node.label.split("\n");
            const maxLineLength = Math.max(
              ...labelLines.map((line) => line.length),
            );
            const calculatedWidth = Math.max(60, maxLineLength * 7.5);
            const calculatedHeight = 55 + labelLines.length * 14;

            return (
              <Group
                key={node.id}
                x={node.x}
                y={node.y}
                draggable
                onDragMove={(e) => handleDragMoveNode(node.id, e)}
                onDragEnd={(e) => {
                  const isCurrentTarget = e.target === e.currentTarget;
                  isCurrentTarget
                    ? onNodeDragEnd?.(node.id, e.target.x(), e.target.y())
                    : undefined;
                }}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  stage
                    ? (stage.container().style.cursor = "pointer")
                    : undefined;
                  setHoveredNode(node.id);
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  stage
                    ? (stage.container().style.cursor = "default")
                    : undefined;
                  setHoveredNode(null);
                }}
                onClick={() => handleNodeClickLocal(node.id)}
                onTap={() => handleNodeClickLocal(node.id)}
              >
                {/* Contenedor transparente adaptativo (hitbox auto width & height) */}
                <Rect
                  x={-calculatedWidth / 2}
                  y={-25}
                  width={calculatedWidth}
                  height={calculatedHeight}
                  fill="rgba(0,0,0,0)"
                  listening={true}
                />
                <Group opacity={opacityNode}>{shape}</Group>
                <Text
                  text={node.label}
                  fill={labelColor}
                  fontSize={12}
                  fontFamily="Inter, sans-serif"
                  fontStyle={fontStyle}
                  align="center"
                  y={28}
                  x={-calculatedWidth / 2}
                  width={calculatedWidth}
                  opacity={opacityNode}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* Panel de Filtro y Búsqueda Flotante */}
      <div className="absolute top-4 right-3 z-10 bg-background border border-foreground/10 p-[0.75rem] rounded shadow-md flex flex-col gap-[0.5rem] w-64 h-auto">
        <div className="flex items-center justify-between border-b border-foreground/10 pb-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
            Navegación
          </span>
          <Switch checked={showMinimap} onChange={setShowMinimap} />
        </div>
        <div className="flex flex-col gap-[0.25rem]">
          <label
            htmlFor="canvas-search-input"
            className="text-[0.69rem] font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Buscar Elemento
          </label>
          <input
            id="canvas-search-input"
            type="text"
            placeholder="Escribe para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted text-foreground border border-foreground/10 rounded px-[0.5rem] py-[0.25rem] text-[0.69rem] outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-[0.25rem]">
          <label
            htmlFor="canvas-type-select"
            className="text-[0.69rem] font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Filtrar por Tipo
          </label>
          <select
            id="canvas-type-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-muted text-foreground border border-foreground/10 rounded px-[0.5rem] py-[0.25rem] text-[0.69rem] outline-none focus:border-primary/50 transition-colors"
          >
            <option value="ALL">Todos los tipos</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {draggableEntities && (
          <div className="border-t border-foreground/10 pt-2.5 flex flex-col gap-2">
            <div>
              <label className="text-[0.69rem] font-bold text-muted-foreground uppercase tracking-wider">
                Biblia de Mundos
              </label>
              <p className="text-[9px] text-muted-foreground/60 leading-tight mt-0.5">
                Arrastra un elemento al lienzo para graficar sus relaciones.
              </p>
            </div>
            <input
              type="text"
              placeholder="Buscar para arrastrar..."
              value={dragSearchTerm}
              onChange={(e) => setDragSearchTerm(e.target.value)}
              className="w-full bg-muted text-foreground border border-foreground/10 rounded px-2 py-1 text-[0.69rem] outline-none focus:border-primary/50 transition-colors"
            />
            {nodes.length > 0 && onClearCanvas && (
              <button
                onClick={onClearCanvas}
                className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded py-1 text-[0.69rem] font-bold transition-all"
              >
                Limpiar Lienzo
              </button>
            )}
            <div
              className="flex flex-col gap-1 overflow-y-auto pr-1"
              style={{
                maxHeight:
                  draggableEntities.filter((ent) =>
                    ent.label
                      .toLowerCase()
                      .includes(dragSearchTerm.toLowerCase()),
                  ).length > 5
                    ? "150px"
                    : "auto",
              }}
            >
              {draggableEntities
                .filter((ent) =>
                  ent.label
                    .toLowerCase()
                    .includes(dragSearchTerm.toLowerCase()),
                )
                .map((ent) => {
                  const visuals = getHierarchyVisuals(ent.tipo);
                  return (
                    <div
                      key={ent.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", ent.id);
                      }}
                      className="flex items-center gap-2 px-2 py-1 rounded bg-muted/40 hover:bg-muted/80 border border-foreground/5 cursor-grab active:cursor-grabbing select-none transition-all duration-200"
                    >
                      <span
                        className={`material-symbols-outlined text-[10px] ${visuals.color}`}
                      >
                        {visuals.icon}
                      </span>
                      <span className="text-[10px] truncate font-medium text-foreground/80">
                        {ent.label}
                      </span>
                    </div>
                  );
                })}
              {draggableEntities.filter((ent) =>
                ent.label.toLowerCase().includes(dragSearchTerm.toLowerCase()),
              ).length === 0 && (
                <div className="text-[9px] text-center text-muted-foreground/50 py-2">
                  Sin elementos
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showMinimap && (
        <div className="absolute bottom-4 left-4 z-10">
          <canvas
            ref={minimapCanvasRef}
            width={180}
            height={135}
            className="cursor-crosshair border border-black bg-transparent"
            onMouseDown={handleMinimapMouseDown}
            onMouseMove={handleMinimapMouseMove}
            onMouseUp={handleMinimapMouseUp}
            onMouseLeave={handleMinimapMouseLeave}
          />
        </div>
      )}
    </div>
  );
};

// --- Safe Export con Error Boundary ---
const UniversalCanvasSafe = (props: Parameters<typeof UniversalCanvas>[0]) => (
  <SectionErrorBoundary sectorName="CANVAS UNIVERSAL">
    <UniversalCanvas {...props} />
  </SectionErrorBoundary>
);

export default UniversalCanvasSafe;
