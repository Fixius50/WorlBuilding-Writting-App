import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UniversalCanvas, { CanvasNode, CanvasEdge } from '@presentation/organisms/editor/UniversalCanvas';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { Entidad } from '@domain/models/database';
import DynamicAttributeForm from '../components/DynamicAttributeForm';

const CosmicCanvasEditor: React.FC<{ entityId: number }> = ({ entityId }) => {
  const navigate = useNavigate();
  
  const [entity, setEntity] = useState<Entidad | null>(null);
  const [allEntities, setAllEntities] = useState<Entidad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(entityId);
  const [selectedEntity, setSelectedEntity] = useState<Entidad | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar entidad seleccionada para el panel derecho
  useEffect(() => {
    if (selectedEntityId) {
      loadSelectedEntity(selectedEntityId);
    }
  }, [selectedEntityId]);

  const loadSelectedEntity = async (id: number) => {
    try {
      const data = await EntityUseCase.getById(id);
      setSelectedEntity(data);
    } catch (err) {
      console.error("Error loading selected entity:", err);
    }
  };

  const onNodeClick = useCallback((id: string) => {
    setSelectedEntityId(Number(id));
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const init = async () => {
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

          // Buscar hijos o relacionados
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
    };
    init();
  }, [entityId]);

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

    // Persistencia: Marcar como hijo
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

  if (loading || !entity) return null;

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden font-mono">
      
      {/* ZONA IZQUIERDA: Inyector de Entidades */}
      <aside className="w-[280px] border-r border-foreground/10 bg-black flex flex-col z-20">
        <div className="p-6 border-b border-foreground/10 bg-[#0a0a0a]">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">database</span>
            Inyector de Nodos
          </h2>
          <div className="relative">
            <input 
              type="text"
              placeholder="BUSCAR_ENTIDAD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-foreground/20 p-3 text-[10px] text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredEntities.map(e => (
            <div 
              key={e.id}
              className="group p-3 border border-transparent hover:border-foreground/10 hover:bg-foreground/[0.02] flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground/80 truncate max-w-[150px] uppercase">{e.nombre}</span>
                <span className="text-[8px] text-foreground/30 uppercase">{e.tipo}</span>
              </div>
              <button 
                onClick={() => addEntityToCanvas(e)}
                className="size-8 flex items-center justify-center bg-foreground/5 hover:bg-primary hover:text-black transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-primary/5 border-t border-primary/10">
           <button 
             onClick={() => navigate(-1)}
             className="w-full h-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-colors"
           >
             <span className="material-symbols-outlined text-sm">keyboard_return</span>
             SALIR_EDITOR
           </button>
        </div>
      </aside>

      {/* ZONA CENTRAL: Canvas Visual */}
      <main className="flex-1 relative bg-black">
        <UniversalCanvas 
          initialNodes={nodes} 
          initialEdges={edges} 
          onNodeClick={onNodeClick}
        />
        <div className="absolute top-4 px-6 w-full pointer-events-none flex justify-center">
            <div className="px-6 py-2 bg-black/80 border border-primary/30 text-primary font-black text-[10px] uppercase tracking-[0.4em] backdrop-blur-md">
              MODO_DISEÑO_COSMICO: {entity.nombre}
            </div>
        </div>
      </main>

      {/* ZONA DERECHA: Atributos Flotantes */}
      <aside className="w-[320px] border-l border-foreground/10 bg-[#0a0a0a] flex flex-col z-20">
        {selectedEntity ? (
          <>
            <div className="p-6 border-b border-foreground/10 bg-black">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/50 mb-2 block">
                NODO_SELECCIONADO // {selectedEntity.tipo}
              </span>
              <h2 className="text-xl font-black text-foreground truncate uppercase">{selectedEntity.nombre}</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <DynamicAttributeForm entity={selectedEntity} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
              SELECCIONA_UN_NODO_PARA_EDITAR
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CosmicCanvasEditor;
