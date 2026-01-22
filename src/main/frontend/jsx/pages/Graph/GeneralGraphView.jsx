import React, { useState, useEffect, useCallback, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import { useParams } from 'react-router-dom';
import api from '../../../js/services/api';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

// Cyto Stylesheet (Arcane Void Theme)
const graphStylesheet = [
    {
        selector: 'node',
        style: {
            'background-color': '#1f2937', // Default dark
            'label': 'data(label)',
            'color': '#cbd5e1', // slate-300
            'font-family': 'Outfit, sans-serif',
            'font-size': '12px',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'width': 40,
            'height': 40,
            'border-width': 2,
            'border-color': '#475569',
            'text-outline-width': 2,
            'text-outline-color': '#050508',
            'overlay-padding': 6,
            'z-index': 10
        }
    },
    {
        selector: 'node[category="Individual"]',
        style: {
            'background-color': 'rgba(49, 46, 129, 0.9)', // Indigo-900
            'border-color': '#6366f1', // Indigo-500
            'shape': 'ellipse',
            'width': 50,
            'height': 50
        }
    },
    {
        selector: 'node[category="Location"]',
        style: {
            'background-color': 'rgba(6, 78, 59, 0.9)', // Emerald-900
            'border-color': '#10b981', // Emerald-500
            'shape': 'hexagon',
            'width': 60,
            'height': 60
        }
    },
    {
        selector: 'node[category="Group"]',
        style: {
            'background-color': 'rgba(88, 28, 135, 0.9)', // Purple-900
            'border-color': '#a855f7', // Purple-500
            'shape': 'round-rectangle'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 2,
            'line-color': '#334155', // slate-700
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
        }
    },
    {
        selector: ':selected',
        style: {
            'border-width': 4,
            'border-color': '#fafafa',
            'line-color': '#fafafa',
            'target-arrow-color': '#fafafa',
            'z-index': 999
        }
    }
];

const GeneralGraphView = () => {
    const { username, projectName } = useParams();
    const [elements, setElements] = useState([]);
    const [entities, setEntities] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const cyRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const allEntities = await api.get('/world-bible/entities');
            setEntities(allEntities);
            generateGraph(allEntities);
        } catch (err) {
            console.error("Failed to load graph data", err);
        } finally {
            setLoading(false);
        }
    };

    const generateGraph = (data) => {
        const nodes = data.map(ent => ({
            data: {
                id: ent.id.toString(),
                label: ent.nombre,
                category: ent.categoria || 'Generic',
                type: ent.tipoEspecial
            }
        }));

        const edges = [];
        data.forEach(ent => {
            // Check legacy 'valores' link
            if (ent.valores && Array.isArray(ent.valores)) {
                ent.valores.forEach(val => {
                    // Check logic for 'entity_link' type. 
                    // Assuming value is the ID of target
                    if (val.plantilla?.tipo === 'entity_link' && val.valor) {
                        edges.push({
                            data: { source: ent.id.toString(), target: val.valor.toString() }
                        });
                    }
                });
            }

            // TODO: Check new 'json_attributes' for links when implemented
        });

        setElements([...nodes, ...edges]);
    };

    const runLayout = () => {
        if (!cyRef.current) return;
        const layout = cyRef.current.layout({
            name: 'cose',
            animate: true,
            padding: 50,
            nodeOverlap: 20,
            componentSpacing: 100,
        });
        layout.run();
    };

    useEffect(() => {
        if (cyRef.current) {
            runLayout();
        }
    }, [elements]);

    const handleSearch = () => {
        if (!cyRef.current || !searchQuery) return;
        const cy = cyRef.current;

        cy.elements().removeClass('highlighted faded');

        if (searchQuery.length > 0) {
            const matches = cy.nodes().filter(node =>
                node.data('label').toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (matches.length > 0) {
                cy.elements().not(matches).addClass('faded'); // Define class if needed or use opacity
                matches.addClass('highlighted');
                cy.animate({
                    fit: { eles: matches, padding: 50 }
                });
            }
        }
    };

    return (
        <div className="w-full h-full flex bg-background-dark relative overflow-hidden font-display text-foreground">
            {/* Sidebar Overlay */}
            <div className="absolute top-4 left-4 z-20 w-80 pointer-events-none">
                <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-2xl pointer-events-auto space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-8 rounded bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary-foreground">hub</span>
                        </div>
                        <h2 className="font-bold text-lg tracking-tight">Graph View</h2>
                    </div>

                    <div className="flex gap-2">
                        <input
                            className="bg-accent/50 border border-input rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Find node..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-md px-3 transition-colors">
                            <span className="material-symbols-outlined text-sm">search</span>
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold text-muted-foreground pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-indigo-500"></div> Individual</div>
                        <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-emerald-500"></div> Location</div>
                        <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-purple-500"></div> Group</div>
                    </div>

                    <div className="pt-2">
                        <Button onClick={runLayout} size="sm" variant="outline" className="w-full text-xs">
                            <span className="material-symbols-outlined text-sm mr-2">refresh</span>
                            Re-Layout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Helper text if empty */}
            {elements.length === 0 && !loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="text-muted text-lg">No entities found. Create some in the Bible!</div>
                </div>
            )}

            <CytoscapeComponent
                elements={elements}
                stylesheet={graphStylesheet}
                style={{ width: '100%', height: '100%' }}
                cy={(cy) => { cyRef.current = cy; }}
                minZoom={0.2}
                maxZoom={3}
                wheelSensitivity={0.3}
                className="bg-background-dark"
            />
        </div>
    );
};

export default GeneralGraphView;
