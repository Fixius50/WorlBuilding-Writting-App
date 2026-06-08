import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import UniversalCanvas, { CanvasNode, CanvasEdge } from '@presentation/organisms/editor/UniversalCanvas';
import { entityService } from '@repositories/entityService';
import { relationshipService } from '@repositories/relationshipService';
import { Entidad, Relacion } from '@domain/models/database';

/**
 * 🌳 GenealogyView
 * View that displays the Lineage Tree using drag-and-drop of Bible elements.
 */
const GenealogyView: React.FC = () => {
  const outletCtx = useOutletContext<{
    projectId?: number;
    projectName?: string;
  } | null>();
  const projectId = outletCtx?.projectId;

  // Estados del Canvas
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [canvasEdges, setCanvasEdges] = useState<CanvasEdge[]>([]);

  // Base de datos local cargada en memoria
  const [allEntities, setAllEntities] = useState<Entidad[]>([]);
  const [allRelationships, setAllRelationships] = useState<Relacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar todos los elementos de la Biblia y relaciones del proyecto
  const loadData = useCallback(async () => {
    const hasProject = !!projectId;
    switch (hasProject) {
      case true: {
        setLoading(true);
        try {
          const [entitiesList, relationshipsList] = await Promise.all([
            entityService.getAllByProject(projectId!),
            relationshipService.getByProject(projectId!)
          ]);
          setAllEntities(entitiesList);
          setAllRelationships(relationshipsList);
        } catch (error) {
          console.error('Error al cargar datos en GenealogyView:', error);
        } finally {
          setLoading(false);
        }
        break;
      }
      default:
        break;
    }
  }, [projectId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Mapear entidades cargadas al formato de arrastre para el canvas
  const draggableEntities = useMemo(() => {
    return allEntities.map(ent => ({
      id: ent.id.toString(),
      label: ent.nombre,
      tipo: ent.tipo
    }));
  }, [allEntities]);

  // Manejador del drag-and-drop de un elemento de la lista al lienzo
  const handleDropNode = useCallback((entityIdStr: string, x: number, y: number) => {
    const entityId = Number(entityIdStr);
    const mainEntity = allEntities.find(ent => Number(ent.id) === entityId);
    
    switch (!!mainEntity) {
      case true: {
        // Encontrar relaciones directas en las que participa la entidad arrastrada
        const directRels = allRelationships.filter(
          rel => Number(rel.origen_id) === entityId || Number(rel.destino_id) === entityId
        );

        // Reunir IDs de entidades conectadas directamente (vecinos)
        const neighborIds = new Set<number>();
        directRels.forEach(rel => {
          const neighborId = Number(rel.origen_id) === entityId ? Number(rel.destino_id) : Number(rel.origen_id);
          neighborIds.add(neighborId);
        });

        // Crear/Actualizar la lista de nodos
        const newNodes = [...canvasNodes];

        // Añadir el nodo principal si no existe
        const hasMainNode = newNodes.some(n => Number(n.id) === entityId);
        if (!hasMainNode) {
          newNodes.push({
            id: entityId.toString(),
            x,
            y,
            label: mainEntity!.nombre,
            tipo: mainEntity!.tipo
          });
        }

        // Añadir los vecinos en una espiral muy apretada cerca de la posición del drop (x, y)
        let neighborIndex = 0;
        neighborIds.forEach(nId => {
          const neighborEntity = allEntities.find(ent => Number(ent.id) === nId);
          if (neighborEntity) {
            const hasNeighborNode = newNodes.some(n => Number(n.id) === nId);
            if (!hasNeighborNode) {
              const angle = neighborIndex * 1.2;
              const radius = 200 + Math.floor(neighborIndex / 3) * 200;

              newNodes.push({
                id: nId.toString(),
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                label: neighborEntity.nombre,
                tipo: neighborEntity.tipo
              });
              neighborIndex++;
            }
          }
        });

        // Computar las relaciones (aristas) entre todos los nodos presentes en el lienzo
        const activeNodeIds = new Set(newNodes.map(n => Number(n.id)));
        const newEdges: CanvasEdge[] = [];
        allRelationships.forEach(rel => {
          if (activeNodeIds.has(Number(rel.origen_id)) && activeNodeIds.has(Number(rel.destino_id))) {
            newEdges.push({
              id: rel.id.toString(),
              from: rel.origen_id.toString(),
              to: rel.destino_id.toString(),
              relation: rel.tipo
            });
          }
        });

        setCanvasNodes(newNodes);
        setCanvasEdges(newEdges);
        break;
      }
      default:
        break;
    }
  }, [allEntities, allRelationships, canvasNodes]);

  // Actualizar posiciones de los nodos al arrastrarlos en el lienzo
  const handleNodeDragEnd = useCallback((id: string, x: number, y: number) => {
    setCanvasNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  }, []);

  // Limpiar todos los nodos y aristas del lienzo
  const handleClearCanvas = useCallback(() => {
    setCanvasNodes([]);
    setCanvasEdges([]);
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-foreground/50">
        Cargando genealogía...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-background">
      <UniversalCanvas
        initialNodes={canvasNodes}
        initialEdges={canvasEdges}
        onNodeDragEnd={handleNodeDragEnd}
        onDropNode={handleDropNode}
        draggableEntities={draggableEntities}
        onClearCanvas={handleClearCanvas}
      />
    </div>
  );
};

export default GenealogyView;
