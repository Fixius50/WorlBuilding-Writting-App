import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, Background, Controls, Node, Edge, Panel, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Connection, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { entityService } from '@repositories/entityService';
import { relationshipService } from '@repositories/relationshipService';
import { Entidad, Valor } from '@domain/models/database';
import DynamicAttributeForm from '../components/DynamicAttributeForm';

// Estilos personalizados para el Canvas Industrial
const nodeStyles = {
  entity: "px-6 py-4 border-2 border-primary/30 bg-black text-foreground font-mono text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]",
  map: "px-6 py-4 border-2 border-blue-500/30 bg-black text-blue-400 font-mono text-xs uppercase tracking-widest",
  timeline: "px-6 py-4 border-2 border-purple-500/30 bg-black text-purple-400 font-mono text-xs uppercase tracking-widest"
};

const CustomNode = ({ data }: any) => (
  <div className={`group relative ${nodeStyles[data.type as keyof typeof nodeStyles] || nodeStyles.entity}`}>
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-black opacity-40">{data.type}</span>
      <span className="font-black text-sm">{data.label}</span>
    </div>
    {data.isMain && (
       <div className="absolute -top-2 -right-2 size-4 bg-primary rounded-full animate-pulse flex items-center justify-center">
         <span className="material-symbols-outlined text-[10px] text-black font-black">star</span>
       </div>
    )}
  </div>
);

const nodeTypes = {
  custom: CustomNode,
};

const CosmicCanvasEditor: React.FC<{ entityId: number }> = ({ entityId }) => {
  const { username, projectName } = useParams();
  const navigate = useNavigate();
  
  const [entity, setEntity] = useState<Entidad | null>(null);
  const [allEntities, setAllEntities] = useState<Entidad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const current = await entityService.getById(entityId);
        setEntity(current);
        
        if (current) {
          const projectEntities = await entityService.getAllByProject(current.project_id);
          setAllEntities(projectEntities);
          
          // Construir nodos iniciales
          const initialNodes: Node[] = [
            {
              id: String(entityId),
              type: 'custom',
              position: { x: 400, y: 300 },
              data: { label: current.nombre, type: current.tipo, isMain: true }
            }
          ];

          // Buscar hijos o relacionados (simplificado para MVP)
          const children = projectEntities.filter(e => {
             const extra = typeof e.contenido_json === 'string' ? JSON.parse(e.contenido_json) : (e.contenido_json || {});
             return e.carpeta_id === entityId || extra.padre_id === entityId;
          });

          const childNodes = children.map((child, idx) => ({
            id: String(child.id),
            type: 'custom',
            position: { x: 400 + Math.cos(idx) * 200, y: 300 + Math.sin(idx) * 200 },
            data: { label: child.nombre, type: child.tipo }
          }));

          const childEdges = children.map(child => ({
            id: `e-${entityId}-${child.id}`,
            source: String(entityId),
            target: String(child.id),
            animated: true,
            style: { stroke: 'rgba(var(--primary-rgb), 0.3)' }
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

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    // Aquí se debería persistir la relación en la DB vía relationshipService
  }, []);

  const addEntityToCanvas = async (toAdd: Entidad) => {
    if (nodes.find(n => n.id === String(toAdd.id))) return;

    const newNode: Node = {
      id: String(toAdd.id),
      type: 'custom',
      position: { x: 100, y: 100 },
      data: { label: toAdd.nombre, type: toAdd.tipo }
    };

    const newEdge: Edge = {
      id: `e-${entityId}-${toAdd.id}`,
      source: String(entityId),
      target: String(toAdd.id),
      animated: true
    };

    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, newEdge]);

    // Persistencia: Marcar como hijo (simplificado)
    try {
        const extra = typeof toAdd.contenido_json === 'string' ? JSON.parse(toAdd.contenido_json) : (toAdd.contenido_json || {});
        extra.padre_id = entityId;
        await entityService.update(toAdd.id, { 
            ...toAdd, 
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
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
        >
          <Background color="#111" gap={20} size={1} />
          <Controls className="bg-black border border-foreground/10" />
          
          <Panel position="top-center">
            <div className="mt-4 px-6 py-2 bg-black/80 border border-primary/30 text-primary font-black text-[10px] uppercase tracking-[0.4em] backdrop-blur-md">
              MODO_DISEÑO_COSMICO: {entity.nombre}
            </div>
          </Panel>
        </ReactFlow>
      </main>

      {/* ZONA DERECHA: Atributos Flotantes */}
      <aside className="w-[320px] border-l border-foreground/10 bg-black flex flex-col z-20 overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-foreground/10 bg-[#0a0a0a] sticky top-0 z-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">settings_input_component</span>
            Telemetría de Nodo
          </h2>
        </div>
        
        <div className="p-6">
           <DynamicAttributeForm 
             entity={entity} 
             onUpdate={() => {/* Opcional: refrescar canvas si el nombre cambia */}} 
           />
        </div>
        
        <div className="mt-auto p-6 space-y-4">
           <div className="p-4 bg-primary/5 border border-primary/10 text-[9px] text-primary/60 font-mono leading-relaxed">
             [ INFO ] Todos los cambios en la telemetría y conexiones se guardan automáticamente en el núcleo de datos.
           </div>
        </div>
      </aside>
    </div>
  );
};

export default CosmicCanvasEditor;
