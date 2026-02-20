import React, { useState, useEffect, useCallback, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import { useParams, useOutletContext } from 'react-router-dom';
import api from '../../../js/services/api';
import InGraphNodeWindow from '../../components/graph/InGraphNodeWindow';

// Cyto Stylesheet (Invisible Nodes, Visible Edges)
const graphStylesheet = [
    {
        selector: 'node',
        style: {
            'width': 260, // Narrower
            'height': 400, // Taller
            'shape': 'round-rectangle',
            'background-opacity': 0, // Invisible
            'border-width': 0,
            'label': '',
            'z-index': 10,
            'overlay-opacity': 0 // Hide the selection overlay for cleaner look
        }
    },
    {
        selector: 'node:selected',
        style: {
            'background-opacity': 0.05, // Subtle hint of selection
            'background-color': '#6366f1'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.3,
            'z-index': 1
        }
    },
    {
        selector: 'edge.highlighted',
        style: {
            'line-color': '#6366f1',
            'width': 4,
            'opacity': 0.8
        }
    }
];

const GeneralGraphView = () => {
    const { projectName } = useParams();
    const { setRightOpen } = useOutletContext();
    const [elements, setElements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nodePositions, setNodePositions] = useState({}); // {nodeId: {x, y, isPinned}}
    const [zoom, setZoom] = useState(1);
    const cyRef = useRef(null);

    // Hide right panel permanently for this view
    useEffect(() => {
        if (setRightOpen) setRightOpen(false);
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            if (projectName) await api.get(`/proyectos/${projectName}`);
            const graphData = await api.get('/world-bible/graph');

            const rawNodes = graphData.nodes || graphData.data?.nodes || [];
            const rawEdges = graphData.edges || graphData.data?.edges || [];

            // CRITICAL: Normalize ALL IDs to strings to avoid Cytoscape crashes
            const normalizedNodes = rawNodes.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    id: String(node.data.id)
                }
            }));

            const normalizedEdges = rawEdges.map(edge => ({
                ...edge,
                data: {
                    ...edge.data,
                    id: edge.data.id ? String(edge.data.id) : undefined,
                    source: String(edge.data.source),
                    target: String(edge.data.target)
                }
            }));

            if (normalizedNodes.length > 0) {
                setElements([...normalizedNodes, ...normalizedEdges]);
            }
        } catch (err) {
            console.error("Failed to load graph data:", err);
        } finally {
            setLoading(false);
        }
    };

    const runLayout = () => {
        if (!cyRef.current) return;
        cyRef.current.layout({
            name: 'cose',
            animate: true,
            padding: 100,
            nodeRepulsion: (node) => 8000000, // Massive repulsion for large cards
            idealEdgeLength: (edge) => 400, // Longer edges to allow space
            edgeElasticity: (edge) => 100,
            nodeOverlap: 2, // Minimal overlap allowed
            componentSpacing: 600,
            refresh: 20,
            numIter: 1500 // More iterations for better convergence
        }).run();
    };

    const syncPositions = useCallback(() => {
        if (!cyRef.current) return;
        const newPositions = {};
        const cy = cyRef.current;
        setZoom(cy.zoom());

        // We can track the active node (the one being dragged or hovered)
        const activeNode = cy.nodes(':active, :selected, :grabbed').first();
        const activeId = activeNode.length > 0 ? activeNode.id() : null;

        cy.nodes().forEach(node => {
            const pos = node.renderedPosition();
            newPositions[node.id()] = {
                x: pos.x,
                y: pos.y,
                isPinned: node.hasClass('pinned') || node.locked(),
                isActive: node.id() === activeId
            };
        });
        setNodePositions(newPositions);
    }, []);

    // Effect to handle permanent synchronization
    useEffect(() => {
        if (!cyRef.current || elements.length === 0) return;
        const cy = cyRef.current;

        const timer = setTimeout(syncPositions, 200);
        cy.on('pan zoom drag position layoutstop layoutready box', () => {
            // Throttled sync to avoid UI lag during heavy movement
            requestAnimationFrame(syncPositions);
        });

        // Native Cursor Management via Cytoscape (Universal)
        cy.on('mouseover', 'node', () => {
            // Only show grab if the node IS grabbable (not locked or handled by logic)
            document.body.style.cursor = 'grab';
        });
        cy.on('mouseout', 'node', () => { document.body.style.cursor = 'default'; });
        cy.on('grab', 'node', () => { document.body.style.cursor = 'grabbing'; });
        cy.on('free', 'node', () => { document.body.style.cursor = 'grab'; });

        // Surgical collision resolution on drag end
        cy.on('dragfree', 'node', (evt) => {
            const node = evt.target;
            node.addClass('pinned');

            const W = 260;
            const H = 400;
            let currentPos = node.position();
            const others = cy.nodes().not(node);

            let resolved = false;
            let iterations = 0;
            const maxIterations = 5;

            while (!resolved && iterations < maxIterations) {
                let collision = null;
                for (let i = 0; i < others.length; i++) {
                    const other = others[i];
                    const oPos = other.position();
                    const dx = Math.abs(currentPos.x - oPos.x);
                    const dy = Math.abs(currentPos.y - oPos.y);

                    if (dx < W && dy < H) {
                        collision = oPos;
                        break;
                    }
                }

                if (collision) {
                    const diffX = currentPos.x - collision.x;
                    const diffY = currentPos.y - collision.y;
                    const overlapX = W - Math.abs(diffX);
                    const overlapY = H - Math.abs(diffY);

                    if (overlapX < overlapY) {
                        currentPos.x += (diffX >= 0 ? overlapX + 20 : -(overlapX + 20));
                    } else {
                        currentPos.y += (diffY >= 0 ? overlapY + 20 : -(overlapY + 20));
                    }
                    iterations++;
                } else {
                    resolved = true;
                }
            }

            const persistPosition = async (n, pos) => {
                try {
                    await api.put('/world-bible/graph/positions', [{
                        id: n.id(),
                        category: n.data('category'),
                        x: pos.x,
                        y: pos.y
                    }]);
                } catch (err) {
                    console.error("Failed to persist node position:", err);
                }
            };

            if (iterations > 0) {
                node.animate({
                    position: currentPos,
                    duration: 400,
                    easing: 'ease-out-quint',
                    complete: () => {
                        syncPositions();
                        persistPosition(node, currentPos);
                    }
                });
            } else {
                syncPositions();
                persistPosition(node, currentPos);
            }
        });

        return () => {
            cy.off('pan zoom drag position layoutstop layoutready dragfree mouseover mouseout grab free', syncPositions);
            document.body.style.cursor = 'default';
        };
    }, [elements, syncPositions]);

    return (
        <div className="w-full h-full bg-[#050508] relative overflow-hidden font-display">
            {/* PERMANENT NODE WINDOWS LAYER */}
            <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                {elements.filter(el => el.group === 'nodes' || !el.data.source).map(node => {
                    const nodeId = String(node.data.id);
                    const pos = nodePositions[nodeId];
                    if (!pos) return null;

                    return (
                        <div
                            key={`win-${nodeId}`}
                            className="absolute pointer-events-none origin-center"
                            style={{
                                left: pos.x,
                                top: pos.y,
                                transform: `translate(-50%, -50%) scale(${zoom})`,
                                zIndex: pos.isActive ? 100 : 50, // Raise active card, keep others at 50
                                opacity: 1
                            }}
                        >
                            <InGraphNodeWindow
                                node={node.data}
                                elements={elements}
                                isPinned={pos.isPinned}
                                onCenter={() => {
                                    const cyNode = cyRef.current.$id(nodeId);
                                    cyRef.current.animate({ center: { eles: cyNode }, zoom: 1 });
                                }}
                                onLock={() => {
                                    const cyNode = cyRef.current.$id(nodeId);
                                    if (cyNode.hasClass('pinned')) {
                                        cyNode.removeClass('pinned');
                                        cyNode.unlock();
                                    } else {
                                        cyNode.addClass('pinned');
                                        cyNode.lock();
                                        syncPositions();
                                    }
                                    syncPositions();
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* CONTROLS OVERLAY */}
            <div className="absolute top-6 left-6 z-[60] flex flex-col gap-2">
                <button onClick={runLayout} className="p-3 bg-glass backdrop-blur-md border border-glass-border rounded-xl text-slate-400 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95" title="Reordenar Arcanos">
                    <span className="material-symbols-outlined text-sm">auto_graph</span>
                </button>
                <button onClick={() => cyRef.current?.fit(150)} className="p-3 bg-glass backdrop-blur-md border border-glass-border rounded-xl text-slate-400 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95" title="Encuadre Divino">
                    <span className="material-symbols-outlined text-sm">fit_screen</span>
                </button>
            </div>

            <CytoscapeComponent
                elements={elements}
                stylesheet={graphStylesheet}
                style={{ width: '100%', height: '100%' }}
                cy={(cy) => { cyRef.current = cy; }}
                minZoom={0.05}
                maxZoom={2}
                wheelSensitivity={0.3}
                className="bg-[#050508]"
            />
        </div>
    );
};

export default GeneralGraphView;
