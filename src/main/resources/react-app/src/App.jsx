import React, { useCallback, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from '@xyflow/react';

export default function App() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Custom Connect: Save to DB
    const onConnect = useCallback(
        (params) => {
            // Optimistic UI update
            setEdges((eds) => addEdge(params, eds));

            // Save to Backend
            fetch('/api/timeline/relacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventoOrigenId: params.source,
                    eventoDestinoId: params.target,
                    tipo: 'manual'
                })
            }).then(res => res.json())
                .then(data => {
                    console.log("Relacion guardada:", data);
                })
                .catch(err => console.error(err));
        },
        [setEdges],
    );

    useEffect(() => {
        // Parallel Fetch: Events + Relations
        Promise.all([
            fetch('/api/timeline/eventos').then(res => res.json()),
            fetch('/api/timeline/relaciones').then(res => res.json())
        ]).then(([eventsData, relationsData]) => {
            if (!eventsData || !Array.isArray(eventsData)) return;

            // --- PROCESAR NODOS ---
            const sortedEvents = eventsData.sort((a, b) => a.ordenCronologico - b.ordenCronologico);
            const newNodes = sortedEvents.map((evt, index) => {
                const yOffset = (index % 2 === 0) ? 0 : 150;
                return {
                    id: evt.id.toString(),
                    position: { x: index * 250, y: yOffset },
                    data: {
                        label: (
                            <div className="p-2">
                                <div className="text-xs text-slate-400 font-bold mb-1">{evt.fechaInGame}</div>
                                <div className="font-bold">{evt.titulo}</div>
                                <div className="text-[10px] opacity-70 mt-1">{evt.tipo}</div>
                            </div>
                        )
                    },
                    style: {
                        background: '#1e293b',
                        color: 'white',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        width: 180
                    },
                };
            });

            const newEdges = [];

            // 1. Implicit Chronological Edges (Optional: make them faint)
            for (let i = 0; i < sortedEvents.length - 1; i++) {
                newEdges.push({
                    id: `e-chrono-${sortedEvents[i].id}-${sortedEvents[i + 1].id}`,
                    source: sortedEvents[i].id.toString(),
                    target: sortedEvents[i + 1].id.toString(),
                    animated: false,
                    style: { stroke: '#475569', strokeWidth: 1, strokeDasharray: '4,4' }, // Faint dashed
                    type: 'smoothstep',
                    selectable: false
                });
            }

            // 2. Explicit DB Relationships
            if (Array.isArray(relationsData)) {
                relationsData.forEach(rel => {
                    newEdges.push({
                        id: `e-db-${rel.id}`,
                        source: rel.eventoOrigenId.toString(),
                        target: rel.eventoDestinoId.toString(),
                        animated: true,
                        style: { stroke: '#a855f7', strokeWidth: 2 }, // Purple strong
                        type: 'default', // Curved
                        label: 'Relación'
                    });
                });
            }

            setNodes(newNodes);
            setEdges(newEdges);

        }).catch(err => console.error("Error loading graph data:", err));

    }, [setNodes, setEdges]);

    return (
        <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                colorMode="dark"
                fitView
            >
                <Controls />
                <MiniMap nodeColor="#475569" maskColor="#020617b3" />
                <Background variant="dots" gap={12} size={1} color="#334155" />
            </ReactFlow>

            <div className="absolute top-4 left-4 z-50">
                <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
                    <h1 className="text-sm font-bold text-white font-display">Grafo Temporal</h1>
                    <p className="text-[10px] text-slate-400">Visualizando eventos</p>
                </div>
            </div>
        </div>
    );
}
