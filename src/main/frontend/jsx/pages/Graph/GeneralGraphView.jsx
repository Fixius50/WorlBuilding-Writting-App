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
    const { setRightPanelTab, setRightOpen } = useOutletContext();
    const navigate = useNavigate();

    const [elements, setElements] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const cyRef = useRef(null);

    // Portal Target
    const [portalRef, setPortalRef] = useState(null);

    useEffect(() => {
        if (setRightPanelTab) setRightPanelTab('CONTEXT');
        loadData();
    }, []);

    // Find portal target
    useEffect(() => {
        const checkPortal = setInterval(() => {
            const el = document.getElementById('global-right-panel-portal'); // UPDATED ID
            if (el) {
                setPortalRef(el);
                clearInterval(checkPortal);
            }
        }, 100);
        return () => {
            clearInterval(checkPortal);
            if (setRightPanelTab) setRightPanelTab('NOTEBOOKS');
        };
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const graphData = await api.get('/world-bible/graph');
            if (graphData && graphData.nodes) {
                setElements([...graphData.nodes, ...graphData.edges]);
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
            cyRef.current.on('select', 'node', (evt) => {
                const node = evt.target;
                setSelectedNode(node.data());
                setRightOpen(true);
            });

            cyRef.current.on('unselect', 'node', () => {
                setSelectedNode(null);
            });
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
                cy.elements().not(matches).addClass('faded');
                matches.addClass('highlighted');
                cy.animate({ fit: { eles: matches, padding: 50 } });
            }
        }
    };

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
                        <div className="flex flex-wrap gap-2 text-[8px] uppercase font-black text-slate-500">
                            <div className="flex items-center gap-1"><div className="size-1.5 rounded-full bg-indigo-500"></div> IND</div>
                            <div className="flex items-center gap-1"><div className="size-1.5 rounded-full bg-emerald-500"></div> LOC</div>
                            <div className="flex items-center gap-1"><div className="size-1.5 rounded-full bg-purple-500"></div> GRP</div>
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
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={`size-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${selectedNode.category === 'Individual' ? 'bg-indigo-600 shadow-indigo-500/20' :
                                selectedNode.category === 'Location' ? 'bg-emerald-600 shadow-emerald-500/20' :
                                    'bg-purple-600 shadow-purple-500/20'
                                }`}>
                                <span className="material-symbols-outlined">{
                                    selectedNode.category === 'Individual' ? 'person' :
                                        selectedNode.category === 'Location' ? 'location_on' : 'groups'
                                }</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-serif font-bold text-white leading-tight">{selectedNode.label}</h3>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{selectedNode.category}</span>
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 font-serif leading-relaxed italic opacity-80">
                            {selectedNode.summary || "No description available for this cosmic entity."}
                        </p>

                        <div className="pt-6 border-t border-white/5 space-y-3">
                            <button
                                onClick={() => navigate(`/${username}/${projectName}/entities/${selectedNode.type || 'individual'}/${selectedNode.id}`)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                <span>Open Bible Entry</span>
                            </button>

                            <button
                                onClick={() => {
                                    if (!cyRef.current) return;
                                    const node = cyRef.current.$id(selectedNode.id);
                                    cyRef.current.animate({ center: { eles: node }, zoom: 2 });
                                }}
                                className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-300 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">center_focus_strong</span>
                                <span>Focus on Graph</span>
                            </button>
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
