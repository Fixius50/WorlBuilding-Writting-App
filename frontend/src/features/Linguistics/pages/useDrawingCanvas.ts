import { useState, useCallback, useRef, useEffect } from 'react';
import Konva from 'konva';
import { Shape, LayerData } from '@domain/canvas';
import { Word } from '@domain/database';

export const useDrawingCanvas = () => {
  const [layers, setLayers] = useState<LayerData[]>([
    { id: 'layer1', name: 'Trazo Principal', visible: true, locked: false, shapes: [] },
    { id: 'layer2', name: 'Guías', visible: true, locked: false, shapes: [] }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer1');
  const [selectedShapeId, setSelectedShapeId] = useState<string | string[] | null>(null);
  const [past, setPast] = useState<LayerData[][]>([]);
  const [future, setFuture] = useState<LayerData[][]>([]);
  
  const [tool, setTool] = useState('brush');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [color, setColor] = useState('hsl(var(--primary))');
  const [opacity, setOpacity] = useState(1);
  const [lineCap, setLineCap] = useState('round');
  const [strokeStyle, setStrokeStyle] = useState('linear');

  const stageRef = useRef<Konva.Stage | null>(null);

  const pushToHistory = useCallback((newLayers: LayerData[]) => {
    const snapshot = JSON.parse(JSON.stringify(newLayers));
    setPast(prev => [...prev.slice(-19), snapshot]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture(prev => [layers, ...prev]);
    setPast(newPast);
    setLayers(previous);
  }, [layers, past]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast(prev => [...prev, layers]);
    setFuture(newFuture);
    setLayers(next);
  }, [layers, future]);

  const handleDrawEnd = useCallback((phase: 'START' | 'MOVE' | 'END', data: { pos?: { x: number, y: number } }) => {
    if (phase === 'START' && data.pos) {
      const activeLayer = layers.find(l => l.id === activeLayerId);
      if (!activeLayer || activeLayer.locked || !activeLayer.visible) return;

      const newShape: Shape = {
        id: crypto.randomUUID(),
        type: tool as Shape['type'],
        stroke: color,
        strokeWidth: strokeWidth,
        opacity: opacity,
        lineCap: lineCap as 'round' | 'butt' | 'square',
        lineJoin: 'round',
        x: (tool === 'brush' || tool === 'eraser' || tool === 'line') ? 0 : data.pos.x,
        y: (tool === 'brush' || tool === 'eraser' || tool === 'line') ? 0 : data.pos.y,
      };

      if (tool === 'brush' || tool === 'eraser') {
        newShape.type = 'line';
        newShape.points = [data.pos.x, data.pos.y, data.pos.x, data.pos.y];
        if (tool === 'eraser') {
          newShape.globalCompositeOperation = 'destination-out';
          newShape.strokeWidth = strokeWidth * 2;
        }
        if (strokeStyle === 'points' && tool !== 'eraser') newShape.dash = [2, 10];
        if (strokeStyle === 'quadratic' && tool !== 'eraser') newShape.tension = 0.8;
      } else if (tool === 'line') {
        newShape.type = 'line';
        newShape.points = [data.pos.x, data.pos.y, data.pos.x, data.pos.y];
        if (strokeStyle === 'points') newShape.dash = [2, 10];
        if (strokeStyle === 'quadratic') newShape.tension = 0.8;
      } else if (tool === 'rect') {
        newShape.width = 0;
        newShape.height = 0;
        if (strokeStyle === 'points') newShape.dash = [5, 5];
      } else if (tool === 'circle') {
        newShape.radius = 0;
        if (strokeStyle === 'points') newShape.dash = [5, 5];
      }

      setLayers(prev => {
        const newLayers = prev.map(l => {
          if (l.id === activeLayerId) return { ...l, shapes: [...l.shapes, newShape] };
          return l;
        });
        pushToHistory(newLayers);
        return newLayers;
      });
      setSelectedShapeId(newShape.id);
    } else if (phase === 'MOVE' && data.pos) {
      const pos = data.pos; // Capturamos para el análisis de flujo de TS
      setLayers(prev => prev.map((l: LayerData) => {
        if (l.id === activeLayerId) {
          const shapes = [...l.shapes];
          if (shapes.length === 0) return l;
          const lastShape = { ...shapes[shapes.length - 1] };

          if (tool === 'brush' || tool === 'eraser') {
            lastShape.points = [...(lastShape.points || []), pos.x, pos.y];
          } else if (tool === 'line') {
            const px = lastShape.points ? lastShape.points[0] : (lastShape.x || 0);
            const py = lastShape.points ? lastShape.points[1] : (lastShape.y || 0);
            lastShape.points = [px, py, pos.x, pos.y];
          } else if (tool === 'rect') {
            lastShape.width = pos.x - (lastShape.x || 0);
            lastShape.height = pos.y - (lastShape.y || 0);
          } else if (tool === 'circle') {
            const dx = pos.x - (lastShape.x || 0);
            const dy = pos.y - (lastShape.y || 0);
            lastShape.radius = Math.sqrt(dx * dx + dy * dy);
          }

          shapes[shapes.length - 1] = lastShape;
          return { ...l, shapes };
        }
        return l;
      }));
    } else if (phase === 'END') {
      pushToHistory(layers);
    }
  }, [layers, activeLayerId, tool, color, strokeWidth, opacity, lineCap, strokeStyle, pushToHistory]);


  const handleChangeShape = useCallback((id: string, newAttrs: Partial<Shape>) => {
    setLayers(prev => prev.map((l: LayerData) => ({
      ...l,
      shapes: l.shapes.map((s: Shape) => s.id === id ? { ...s, ...newAttrs } : s)
    })));
  }, []);

  const openEditor = useCallback((glyph: Word) => {
    if (glyph.rawEditorData) {
      try {
        const savedLayers = JSON.parse(glyph.rawEditorData);
        if (Array.isArray(savedLayers) && savedLayers.length > 0) {
          setLayers(savedLayers);
          setActiveLayerId(savedLayers[0].id);
          return;
        }
      } catch (err) {
        // [LOG REMOVED]
      }
    }

    const initialShapes: Shape[] = [];
    if (glyph.svgPathData) {
      initialShapes.push({
        id: crypto.randomUUID(),
        type: 'path' as Shape['type'],
        data: glyph.svgPathData,
        x: 0,
        y: 0,
        stroke: 'hsl(var(--primary))',
        strokeWidth: 2,
        fill: null,
        scaleX: 1,
        scaleY: 1
      } as Shape);
    }

    setLayers([
      { id: 'layer1', name: 'Trazo Principal', visible: true, locked: false, shapes: initialShapes },
      { id: 'layer2', name: 'Guías', visible: true, locked: false, shapes: [] }
    ]);
    setActiveLayerId('layer1');
  }, []);

  const generateSVGAndCenteredLayers = useCallback(() => {
    const allShapes = layers
      .filter(l => l.visible && !l.name.toLowerCase().includes('guía'))
      .flatMap(l => l.shapes);

    if (allShapes.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxY = -Infinity, maxX = -Infinity;
    allShapes.forEach(shape => {
      const sx = shape.x || 0;
      const sy = shape.y || 0;
      if (shape.type === 'line' && shape.points) {
        for (let i = 0; i < shape.points.length; i += 2) {
          const x = (shape.points[i] || 0) + sx;
          const y = (shape.points[i + 1] || 0) + sy;
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        }
      } else if (shape.type === 'rect') {
        minX = Math.min(minX, sx); minY = Math.min(minY, sy);
        maxX = Math.max(maxX, sx + (shape.width || 0)); maxY = Math.max(maxY, sy + (shape.height || 0));
      } else if (shape.type === 'circle') {
        const r = shape.radius || 0;
        minX = Math.min(minX, sx - r); minY = Math.min(minY, sy - r);
        maxX = Math.max(maxX, sx + r); maxY = Math.max(maxY, sy + r);
      }
    });

    if (minX === Infinity) return null;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const stage = stageRef.current;
    if (!stage) return null;
    const offsetX = (stage.width() / 2) - centerX;
    const offsetY = (stage.height() / 2) - centerY;

    const centeredLayers = layers.map(l => ({
      ...l,
      shapes: l.shapes.map(s => ({
        ...s,
        x: (s.x || 0) + offsetX,
        y: (s.y || 0) + offsetY
      }))
    }));

    let svgPath = "";
    allShapes.forEach(s => {
      const ox = (s.x || 0) + offsetX;
      const oy = (s.y || 0) + offsetY;

      if (s.type === 'line' && s.points && s.points.length >= 4) {
        if (s.globalCompositeOperation === 'destination-out') return;
        svgPath += `M ${s.points[0] + ox} ${s.points[1] + oy} `;
        for (let i = 2; i < s.points.length; i += 2) {
          svgPath += `L ${s.points[i] + ox} ${s.points[i + 1] + oy} `;
        }
      } else if (s.type === 'rect') {
        const w = s.width || 0;
        const h = s.height || 0;
        svgPath += `M ${ox} ${oy} L ${ox + w} ${oy} L ${ox + w} ${oy + h} L ${ox} ${oy + h} Z `;
      } else if (s.type === 'circle') {
        const r = s.radius || 0;
        const k = 0.5522847498 * r;
        svgPath += `M ${ox} ${oy - r}
        C ${ox + k} ${oy - r} ${ox + r} ${oy - k} ${ox + r} ${oy}
        C ${ox + r} ${oy + k} ${ox + k} ${oy + r} ${ox} ${oy + r}
        C ${ox - k} ${oy + r} ${ox - r} ${oy + k} ${ox - r} ${oy}
        C ${ox - r} ${oy - k} ${ox - k} ${oy - r} ${ox} ${oy - r} Z `;
      }
    });

    return { svgPath, centeredLayers };
  }, [layers]);

  return {
    layers, setLayers,
    activeLayerId, setActiveLayerId,
    selectedShapeId, setSelectedShapeId,
    tool, setTool,
    strokeWidth, setStrokeWidth,
    color, setColor,
    opacity, setOpacity,
    lineCap, setLineCap,
    strokeStyle, setStrokeStyle,
    stageRef,
    undo, redo,
    handleDrawEnd,
    handleChangeShape,
    openEditor,
    generateSVGAndCenteredLayers
  };
};
