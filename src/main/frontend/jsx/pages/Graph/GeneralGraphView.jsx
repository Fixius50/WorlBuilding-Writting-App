import React, { useState, useEffect, useCallback, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import api from '../../../js/services/api';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

// Cyto Stylesheet (Arcane Void Theme)
const graphStylesheet = [
    {
        selector: 'node',
        style: {
            'background-color': '#1f2937',
            'label': 'data(label)',
            'color': '#cbd5e1',
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
            'background-color': 'rgba(49, 46, 129, 0.9)',
            'border-color': '#6366f1',
            'shape': 'ellipse',
            'width': 50,
            'height': 50
        }
    },
    {
        selector: 'node[category="Location"]',
        style: {
            'background-color': 'rgba(6, 78, 59, 0.9)',
            'border-color': '#10b981',
            'shape': 'hexagon',
            'width': 60,
            'height': 60
        }
    },
    {
        selector: 'node[category="Group"]',
        style: {
            'background-color': 'rgba(88, 28, 135, 0.9)',
            'border-color': '#a855f7',
            'shape': 'round-rectangle'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
        }
    },
    {
        selector: '.faded',
        style: {
            'opacity': 0.1,
            'text-opacity': 0,
            'events': 'no'
        }
    },
    {
        selector: '.highlighted',
        style: {
            'border-width': 4,
            'border-color': '#6366f1',
            'width': 70,
            'height': 70,
            'z-index': 9999
        }
    }
];

const GeneralGraphView = () => {
    const { username, projectName } = useParams();
    const { setRightPanelTab, setRightOpen } = useOutletContext();
    const navigate = useNavigate();

    const [elements, setElements] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL'); // NEW: Category Filter
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // NEW: Edit Mode
    const [editData, setEditData] = useState({}); // NEW: Data being edited
    const cyRef = useRef(null);

    // Portal Target
    const [portalRef, setPortalRef] = useState(null);

    useEffect(() => {
        if (setRightPanelTab) setRightPanelTab('CONTEXT');
        loadData();

        // Listen for relationship updates
        const handleRelationshipUpdate = () => {
            console.log('>>> Relationships updated, reloading graph data...');
            loadData();
        };

        window.addEventListener('relationships-update', handleRelationshipUpdate);

        return () => {
            window.removeEventListener('relationships-update', handleRelationshipUpdate);
        };
    }, []);

    // Find portal target and force CONTEXT tab
    useEffect(() => {
        // Force CONTEXT tab so portal content is visible
        if (setRightPanelTab) setRightPanelTab('CONTEXT');

        const checkPortal = setInterval(() => {
            const el = document.getElementById('global-right-panel-portal'); // UPDATED ID
            if (el) {
                console.log('[GeneralGraphView] Portal found, clearing before use');
                el.innerHTML = ''; // Clear any residual content
                setPortalRef(el);
                clearInterval(checkPortal);
            }
        }, 100);
        return () => {
            clearInterval(checkPortal);
            console.log('[GeneralGraphView] Cleanup: clearing portal');
            const el = document.getElementById('global-right-panel-portal');
            if (el) el.innerHTML = '';
            if (setRightPanelTab) setRightPanelTab('NOTEBOOKS');
        };
    }, []);

    const handleStartEdit = () => {
        setEditData({ ...selectedNode });
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            await api.put(`/world-bible/entities/${selectedNode.id}`, editData);
            setSelectedNode({ ...editData, isFull: true });
            setIsEditing(false);
            // Refresh graph elements to update label if changed
            loadData();
        } catch (err) {
            console.error("Failed to save entity changes", err);
            alert("Error al guardar los cambios.");
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const graphData = await api.get('/world-bible/graph');
            if (graphData && graphData.nodes) {
                // Normalize data to ensure proper group assignment
                const normalizedNodes = graphData.nodes.map(node => ({
                    ...node,
                    group: 'nodes' // Ensure nodes have group property
                }));
                const normalizedEdges = graphData.edges.map(edge => ({
                    ...edge,
                    group: 'edges' // Ensure edges have group property
                }));

                console.log('Loaded graph:', normalizedNodes.length, 'nodes,', normalizedEdges.length, 'edges');
                setElements([...normalizedNodes, ...normalizedEdges]);
            }
        } catch (err) {
            console.error("Failed to load graph data", err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const runLayout = () => {
        if (!cyRef.current) return;
        const layout = cyRef.current.layout({
            name: 'cose',
            animate: true,
            padding: 50,
            fit: true,
            nodeOverlap: 20,
            componentSpacing: 100,
        });
        layout.run();
    };

    useEffect(() => {
        if (cyRef.current) {
            runLayout();

            // Listen for selection
            cyRef.current.on('select', 'node', async (evt) => {
                const node = evt.target;
                const basicData = node.data();
                setSelectedNode(basicData); // Immediate feedback
                setIsEditing(false); // Reset edit mode on new selection
                setRightOpen(true);

                try {
                    // Fetch FULL details
                    const fullDetails = await api.get(`/world-bible/entities/${basicData.id}`);
                    setSelectedNode(prev => ({ ...prev, ...fullDetails, isFull: true }));
                } catch (e) {
                    console.error("Error fetching full node details", e);
                }
            });

            cyRef.current.on('unselect', 'node', () => {
                setSelectedNode(null);
                setIsEditing(false);
            });
        }
    }, [elements]);

    const handleSearch = (query, filter = activeFilter) => {
        if (!cyRef.current) return;
        const cy = cyRef.current;

        cy.batch(() => {
            cy.elements().removeClass('highlighted faded');

            if (!query && filter === 'ALL') {
                cy.animate({ fit: { padding: 50 }, duration: 500 });
                return;
            }

            const nodes = cy.nodes();
            const matches = nodes.filter(node => {
                const labelMatch = !query || node.data('label').toLowerCase().includes(query.toLowerCase());
                const categoryMatch = filter === 'ALL' || node.data('category') === filter;
                return labelMatch && categoryMatch;
            });

            if (matches.length > 0) {
                cy.elements().not(matches).addClass('faded');
                matches.addClass('highlighted');
                // Also highlight edges between matches
                matches.connectedEdges().addClass('highlighted');

                if (query) {
                    cy.animate({ fit: { eles: matches, padding: 80 }, duration: 500 });
                }
            } else {
                cy.elements().addClass('faded');
            }
        });
    };

    // Reactive search
    useEffect(() => {
        handleSearch(searchQuery, activeFilter);
    }, [searchQuery, activeFilter]);

    const renderInspector = () => {
        return (
            <div className="p-6 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                {/* Global Controls & Search */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary-foreground text-sm">hub</span>
                        </div>
                        <h2 className="font-bold text-sm tracking-tight uppercase">Network Controls</h2>
                    </div>

                    <div className="flex gap-2">
                        <input
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs w-full outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-600 text-slate-200"
                            placeholder="Find cosmic entity..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} className="px-4 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-primary transition-colors">
                            <span className="material-symbols-outlined text-base">search</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2">
                            <button onClick={runLayout} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors border border-white/5" title="Re-simulate Gravity">
                                <span className="material-symbols-outlined text-sm">refresh</span>
                            </button>
                            <button onClick={() => cyRef.current?.fit()} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors border border-white/5" title="Fit View">
                                <span className="material-symbols-outlined text-sm">fit_screen</span>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[8px] uppercase font-black">
                            {[
                                { id: 'ALL', color: 'bg-slate-500', label: 'All' },
                                { id: 'Individual', color: 'bg-indigo-500', label: 'IND' },
                                { id: 'Location', color: 'bg-emerald-500', label: 'LOC' },
                                { id: 'Group', color: 'bg-purple-500', label: 'GRP' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveFilter(f.id)}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all ${activeFilter === f.id ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}
                                >
                                    <div className={`size-1.5 rounded-full ${f.color} ${activeFilter === f.id ? 'ring-2 ring-white/20 shadow-[0_0_5px_rgba(255,255,255,0.2)]' : ''}`}></div>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/5"></div>

                {/* Node Inspector */}
                {!selectedNode ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center opacity-40 py-12">
                        <span className="material-symbols-outlined text-4xl mb-4">touch_app</span>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
                            Select a node<br />to reveal its secrets
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                        {/* Header Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={`size-14 rounded-2xl flex items-center justify-center text-white shadow-2xl ${selectedNode.category === 'Individual' ? 'bg-indigo-600 shadow-indigo-500/20' :
                                    selectedNode.category === 'Location' ? 'bg-emerald-600 shadow-emerald-500/20' :
                                        'bg-purple-600 shadow-purple-500/20'
                                    }`}>
                                    <span className="material-symbols-outlined text-2xl">{
                                        selectedNode.category === 'Individual' ? 'person' :
                                            selectedNode.category === 'Location' ? 'location_on' : 'groups'
                                    }</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                        <input
                                            className="w-full bg-white/5 border-b border-primary/50 text-xl font-serif font-black text-white outline-none"
                                            value={editData.nombre || ''}
                                            onChange={e => setEditData({ ...editData, nombre: e.target.value })}
                                        />
                                    ) : (
                                        <h3 className="text-2xl font-serif font-black text-white leading-tight truncate">{selectedNode.label || selectedNode.nombre}</h3>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{selectedNode.category}</span>
                                        <div className="size-1 rounded-full bg-slate-700"></div>
                                        <span className="text-[10px] font-bold text-primary">ID: {selectedNode.id}</span>
                                    </div>
                                </div>
                            </div>

                            {isEditing ? (
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-400 font-serif outline-none h-24 focus:border-primary/50"
                                    value={editData.descripcion || ''}
                                    onChange={e => setEditData({ ...editData, descripcion: e.target.value })}
                                />
                            ) : (
                                <p className="text-sm text-slate-400 font-serif leading-relaxed italic opacity-80 border-l-2 border-white/5 pl-4">
                                    {selectedNode.description || selectedNode.summary || "No description available for this cosmic entity."}
                                </p>
                            )}
                        </div>

                        {/* Relationships Section - Always visible when node selected */}
                        {!isEditing && (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">account_tree</span> Conexiones Activas
                                </h4>
                                <div className="space-y-2">
                                    {(() => {
                                        // Convert selectedNode.id to string to match edge source/target types
                                        const nodeIdStr = String(selectedNode.id);
                                        const nodeRelations = elements.filter(e => e.group === 'edges' && (e.data.source === nodeIdStr || e.data.target === nodeIdStr));
                                        const renderedRelations = nodeRelations.slice(0, 5).map(edge => {
                                            const otherId = edge.data.source === nodeIdStr ? edge.data.target : edge.data.source;
                                            const otherNode = elements.find(n => String(n.data.id) === String(otherId));
                                            return (
                                                <div key={edge.data.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group/rel">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-1.5 rounded-full bg-primary/40 group-hover/rel:bg-primary transition-colors"></span>
                                                        <span className="text-xs text-slate-300 font-medium">{otherNode?.data.label || 'Unknown'}</span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter">
                                                        {edge.data.label || 'Vínculo'}
                                                    </span>
                                                </div>
                                            );
                                        });
                                        return renderedRelations;
                                    })()}
                                    {elements.filter(e => e.group === 'edges' && (String(e.data.source) === String(selectedNode.id) || String(e.data.target) === String(selectedNode.id))).length === 0 && (
                                        <p className="text-xs text-slate-500 italic text-center py-4">No hay conexiones activas</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Full Entity Details (if loaded) */}
                        {selectedNode.isFull && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                {/* Attributes Grid */}
                                {selectedNode.attributes && Object.keys(selectedNode.attributes).length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-xs">list</span> Atributos
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {Object.entries(isEditing ? editData.attributes : selectedNode.attributes).map(([key, value]) => (
                                                typeof value !== 'object' && (
                                                    <div key={key} className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                                                        {isEditing ? (
                                                            <input
                                                                className="w-full bg-transparent border-none text-xs text-slate-200 outline-none"
                                                                value={String(value)}
                                                                onChange={e => {
                                                                    const newAttrs = { ...editData.attributes, [key]: e.target.value };
                                                                    setEditData({ ...editData, attributes: newAttrs });
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-slate-200 font-medium truncate max-w-full" title={String(value)}>
                                                                {String(value).length > 100 ? String(value).substring(0, 100) + '...' : String(value)}
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-6 border-t border-white/5 space-y-3">
                            {isEditing ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all border border-white/5"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="flex-[2] py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleStartEdit}
                                        className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20"
                                    >
                                        <span className="material-symbols-outlined text-base">edit</span>
                                        <span>Editar Nodo</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (!cyRef.current) return;
                                            const node = cyRef.current.$id(selectedNode.id);
                                            cyRef.current.animate({ center: { eles: node }, zoom: 2 });
                                        }}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-base">center_focus_strong</span>
                                        <span>Centrar en Mapa</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex bg-background-dark relative overflow-hidden font-display text-foreground">
            {portalRef && createPortal(renderInspector(), portalRef)}

            {elements.length === 0 && !loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="text-muted text-lg font-serif italic text-slate-600">The void is empty. Document your world in the Bible.</div>
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
