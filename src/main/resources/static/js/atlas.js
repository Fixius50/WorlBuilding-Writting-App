// atlas.js - React Flow Implementation via Babel/Standalone

const { useState, useCallback, useEffect } = React;
const ReactFlow = window.ReactFlow.default || window.ReactFlow;
const { Controls, Background, addEdge, applyNodeChanges, applyEdgeChanges } = window.ReactFlow;

// V10 uses useNodesState/useEdgesState from react-flow-renderer? No, they might not exist in 10.
// In V10 we manage state manually or use useNodesState if available (added inv 10.1?).
// Let's use simple useState for V10 compatibility.

const initialNodes = [
    { id: '1', position: { x: 300, y: 300 }, data: { label: 'Reino Central' }, type: 'input' },
    { id: '2', position: { x: 500, y: 100 }, data: { label: 'Montañas del Norte' } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true }];

function AtlasEditor() {
    // Try to load from localStorage
    const savedGraph = JSON.parse(localStorage.getItem('wb_atlas_graph') || 'null');

    const [nodes, setNodes, onNodesChange] = useNodesState(savedGraph ? savedGraph.nodes : initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(savedGraph ? savedGraph.edges : initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    // Expose function to global scope to be called by HTML buttons
    // (A bit hacky but works for no-build interactions)
    useEffect(() => {
        window.addAtlasNode = () => {
            const id = Math.random().toString();
            const newNode = {
                id,
                position: { x: Math.random() * window.innerWidth * 0.5, y: Math.random() * window.innerHeight * 0.5 },
                data: { label: `Nuevo Lugar ${Math.floor(Math.random() * 100)}` },
            };
            setNodes((nds) => nds.concat(newNode));
        };

        window.saveAtlas = () => {
            const graph = { nodes, edges };
            localStorage.setItem('wb_atlas_graph', JSON.stringify(graph));
            alert('Mapa guardado localmente.');
        };
    }, [nodes, edges, setNodes]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Background gap={16} color="#475569" />
                <Controls />
            </ReactFlow>
        </div>
    );
}

// Initial Render
const container = document.getElementById('atlas-root');
if (container) {
    // Wait for ESM to load
    const checkLoaded = setInterval(() => {
        if (window.createRoot && window.ReactFlow) {
            clearInterval(checkLoaded);
            const root = window.createRoot(container);
            root.render(<AtlasEditor />);
        }
    }, 100);
}
