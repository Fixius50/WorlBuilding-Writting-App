import React, { useState, useCallback, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useOutletContext, useParams } from 'react-router-dom';
import { pizarraService } from '@repositories/pizarraService';
import StickyNoteNode from '../components/StickyNoteNode';
import ImageNode from '../components/ImageNode';
import { useLanguage } from '@context/LanguageContext';

const nodeTypes = {
  stickyNote: StickyNoteNode,
  imageNode: ImageNode,
};

const WhiteboardView: React.FC = () => {
  const { t } = useLanguage();
  const { pizarraId } = useParams<{ pizarraId: string }>();
  const { projectId, setRightPanelContent, setRightOpen, setRightPanelTitle } = useOutletContext<any>();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [title, setTitle] = useState('Nueva Pizarra');
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Cargar datos
  useEffect(() => {
    const loadPizarra = async () => {
      if (!pizarraId) {
        setLoading(false);
        return;
      }
      
      const data = await pizarraService.getById(parseInt(pizarraId));
      if (data) {
        setTitle(data.titulo);
        setNodes(JSON.parse(data.nodos_json));
        setEdges(JSON.parse(data.aristas_json));
      }
      setLoading(false);
    };
    loadPizarra();
  }, [pizarraId, setNodes, setEdges]);

  // Guardado automático (Debounced)
  useEffect(() => {
    if (loading || !projectId) return;

    const timer = setTimeout(async () => {
      const payload = {
        titulo: title,
        project_id: projectId,
        carpeta_id: null,
        nodos_json: JSON.stringify(nodes),
        aristas_json: JSON.stringify(edges),
        viewport_json: JSON.stringify({ zoom: 1, x: 0, y: 0 })
      };

      if (pizarraId) {
        await pizarraService.update(parseInt(pizarraId), payload);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [nodes, edges, title, pizarraId, projectId, loading]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const updateNodeData = useCallback((nodeId: string, updates: any) => {
    setNodes((nds) => nds.map((n) => {
        if (n.id === nodeId) {
            return { ...n, data: { ...n.data, ...updates } };
        }
        return n;
    }));
  }, [setNodes]);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    if (deleted.some(n => n.id === selectedNodeId)) {
        setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    if (selectedNodes.length === 1) {
        setSelectedNodeId(selectedNodes[0].id);
        setRightOpen(true);
    } else {
        setSelectedNodeId(null);
    }
  }, [setRightOpen]);

  const addStickyNote = useCallback(() => {
    const id = `sticky-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'stickyNote',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        text: '',
        color: '#fef08a',
        width: 200,
        height: 200,
        onChange: (val: string) => updateNodeData(id, { text: val })
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, updateNodeData]);

  const addImageNode = useCallback(() => {
    const id = `image-${Date.now()}`;
    const newNode: Node = {
        id,
        type: 'imageNode',
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: { 
          url: '',
          width: 300,
          height: 200,
          onUpdate: (updates: any) => updateNodeData(id, updates)
        },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, updateNodeData]);

  // Inyectar controles en el Right Panel
  useEffect(() => {
    setRightPanelTitle("Centro de Estrategia");
    
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    
    setRightPanelContent(
        <div className="flex flex-col h-full space-y-8 p-4 overflow-y-auto no-scrollbar">
            {/* Controles Globales */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 border-b border-primary/20 pb-2 flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm">settings</span>
                   Gestión de Pizarra
                </h4>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-foreground/40">Nombre de la Pizarra</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-foreground/[0.03] border border-foreground/10 px-3 py-2 text-xs font-bold outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <button 
                        onClick={addStickyNote}
                        className="flex flex-col items-center justify-center p-4 bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all gap-2 group"
                    >
                        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">sticky_note_2</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary">Añadir Nota</span>
                    </button>
                    <button 
                        onClick={addImageNode}
                        className="flex flex-col items-center justify-center p-4 bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-all gap-2 group"
                    >
                        <span className="material-symbols-outlined text-foreground/60 group-hover:scale-110 transition-transform">image</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-foreground/60">Añadir Imagen</span>
                    </button>
                </div>
            </div>

            {/* Controles de Nodo Seleccionado */}
            {selectedNode && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 border-b border-indigo-500/20 pb-2 flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm">edit_square</span>
                       Propiedades del Nodo
                    </h4>
                    
                    {selectedNode.type === 'stickyNote' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-foreground/40">Personalización de Color</label>
                                <div className="flex items-center gap-3 bg-foreground/5 p-3 border border-foreground/10">
                                    <input 
                                        type="color" 
                                        value={(selectedNode.data as any).color || '#fef08a'}
                                        onChange={(e) => updateNodeData(selectedNode.id, { color: e.target.value })}
                                        className="size-10 bg-transparent border-none cursor-pointer"
                                    />
                                    <input 
                                        type="text"
                                        value={(selectedNode.data as any).color || '#fef08a'}
                                        onChange={(e) => updateNodeData(selectedNode.id, { color: e.target.value })}
                                        className="flex-1 bg-transparent border-none text-xs font-mono font-bold outline-none uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => {
                            setNodes(nds => nds.filter(n => n.id !== selectedNodeId));
                            setSelectedNodeId(null);
                        }}
                        className="w-full py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                    >
                        Eliminar Nodo
                    </button>
                </div>
            )}
        </div>
    );
  }, [nodes, selectedNodeId, title, addStickyNote, addImageNode, updateNodeData, setNodes, setRightPanelContent, setRightPanelTitle]);

  if (loading) {
      return (
          <div className="h-full w-full flex items-center justify-center bg-background">
              <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
      );
  }

  return (
    <div className="h-full w-full relative bg-background/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes as any}
        fitView
        colorMode="dark"
        className="whiteboard-canvas"
      >
        <Background variant={BackgroundVariant.Lines} color="rgba(255,255,255,0.05)" gap={40} />
        <Controls />
        <MiniMap 
            nodeColor="rgba(255,255,255,0.1)"
            maskColor="rgba(0,0,0,0.5)"
            style={{ backgroundColor: 'transparent' }}
        />
      </ReactFlow>
    </div>
  );
};

export default WhiteboardView;
