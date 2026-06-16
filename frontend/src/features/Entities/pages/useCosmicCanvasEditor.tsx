import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityUseCase } from '@application/EntityUseCase';
import { Entidad } from '@domain/database';
import { CanvasNode, CanvasEdge } from '@components/ui/editor/UniversalCanvas';

/**
 * 🧠 useCosmicCanvasEditor
 * Logic hook for CosmicCanvasEditor.
 */
export const useCosmicCanvasEditor = (entityId: number) => {
  const navigate = useNavigate();
  
  const [entity, setEntity] = useState<Entidad | null>(null);
  const [allEntities, setAllEntities] = useState<Entidad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(entityId);
  const [selectedEntity, setSelectedEntity] = useState<Entidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<number | null>(null);

  // --- Handlers ---
  const loadSelectedEntity = useCallback(async (id: number) => {
    try {
      const data = await EntityUseCase.getById(id);
      setSelectedEntity(data);
    } catch (err) {
      console.error("Error loading selected entity:", err);
    }
  }, []);

  useEffect(() => {
    if (selectedEntityId) {
      loadSelectedEntity(selectedEntityId);
    }
  }, [selectedEntityId, loadSelectedEntity]);

  const onNodeClick = useCallback((id: string) => {
    setSelectedEntityId(Number(id));
  }, []);

  // --- Initialization ---
  const init = useCallback(async () => {
    setLoading(true);
    try {
      const current = await EntityUseCase.getById(entityId);
      setEntity(current);
      
      if (current) {
        const projectEntities = await EntityUseCase.getAllByProject(current.project_id);
        setAllEntities(projectEntities);
        
        const initialNodes: CanvasNode[] = [
          { id: String(entityId), x: 400, y: 300, label: current.nombre, tipo: current.tipo }
        ];

        const children = projectEntities.filter(e => {
           const extra = typeof e.contenido_json === 'string' ? JSON.parse(e.contenido_json) : (e.contenido_json || {});
           return e.carpeta_id === entityId || extra.padre_id === entityId;
        });

        const childNodes: CanvasNode[] = children.map((child, idx) => ({
          id: String(child.id),
          x: 400 + Math.cos(idx) * 200,
          y: 300 + Math.sin(idx) * 200,
          label: child.nombre,
          tipo: child.tipo
        }));

        const childEdges: CanvasEdge[] = children.map(child => ({
          id: `e-${entityId}-${child.id}`,
          from: String(entityId),
          to: String(child.id)
        }));

        setNodes([...initialNodes, ...childNodes]);
        setEdges(childEdges);
      }
    } catch (err) {
      console.error("Error initializing CosmicCanvas:", err);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    init();
  }, [init]);

  const addEntityToCanvas = async (toAdd: Entidad) => {
    if (nodes.find(n => n.id === String(toAdd.id))) return;

    const newNode: CanvasNode = {
      id: String(toAdd.id),
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      label: toAdd.nombre,
      tipo: toAdd.tipo
    };

    const newEdge: CanvasEdge = {
      id: `e-${entityId}-${toAdd.id}`,
      from: String(entityId),
      to: String(toAdd.id)
    };

    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, newEdge]);

    try {
        const extra = typeof toAdd.contenido_json === 'string' ? JSON.parse(toAdd.contenido_json) : (toAdd.contenido_json || {});
        extra.padre_id = entityId;
        await EntityUseCase.update(toAdd.id, { 
            contenido_json: JSON.stringify(extra) 
        });
    } catch (err) {
        console.error("Error persisting relationship:", err);
    }
  };

  const filteredEntities = useMemo(() => {
    return allEntities.filter(e => 
      e.id !== entityId && 
      (e.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
       e.tipo.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 20);
  }, [allEntities, searchQuery, entityId]);

  const handleDeleteConfirm = async () => {
    if (entityToDelete) {
      await EntityUseCase.delete(entityToDelete);
      setIsDeleteModalOpen(false);
      setEntityToDelete(null);
      setSelectedEntity(null);
      window.location.reload(); 
    }
  };

  return {
    entity,
    nodes,
    edges,
    searchQuery,
    setSearchQuery,
    filteredEntities,
    selectedEntity,
    loading,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    setEntityToDelete,
    onNodeClick,
    addEntityToCanvas,
    handleDeleteConfirm,
    navigate
  };
};
