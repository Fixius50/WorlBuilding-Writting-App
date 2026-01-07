import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import api from '../../../js/services/api';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';

const TimelineView = () => {
    // Context from ArchitectLayout
    const { setRightPanelMode, setRightOpen, setRightPanelTitle } = useOutletContext();

    const [timelines, setTimelines] = useState([]);
    const [selectedTimelineId, setSelectedTimelineId] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Creation State
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [isCreatingLine, setIsCreatingLine] = useState(false);

    const [newEvent, setNewEvent] = useState({ nombre: '', descripcion: '', fechaTexto: '', ordenAbsoluto: 0 });
    const [newLine, setNewLine] = useState({ nombre: '', descripcion: '' });

    const [editingEvent, setEditingEvent] = useState(null);
    const [editingTimeline, setEditingTimeline] = useState(null);

    // New State for Right Panel
    const [activeTab, setActiveTab] = useState('eventos'); // 'eventos' | 'anexos'
    const [linkedTimelines, setLinkedTimelines] = useState([]);
    const [availableTimelines, setAvailableTimelines] = useState([]);

    // Portal Target Node
    const [portalTarget, setPortalTarget] = useState(null);

    const initialized = React.useRef(false);

    // Load Linked Timelines
    const loadLinkedTimelines = async (currentId) => {
        try {
            const allRels = await api.get('/bd/relacion');
            const relevant = allRels.filter(r =>
                (r.tipoOrigen === 'lineatiempo' && r.idOrigen === currentId) ||
                (r.tipoDestino === 'lineatiempo' && r.idDestino === currentId)
            );
            const linkedIds = relevant.map(r => r.idOrigen === currentId ? r.idDestino : r.idOrigen);
            return linkedIds;
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    // Logic wrappers
    const refreshLinks = async (currentId, allTimelines) => {
        const linkedIds = await loadLinkedTimelines(currentId);
        const linked = allTimelines.filter(t => linkedIds.includes(t.id));
        setLinkedTimelines(linked);
        const available = allTimelines.filter(t => t.id !== currentId && !linkedIds.includes(t.id));
        setAvailableTimelines(available);
    };

    const handleLinkTimeline = async (targetId) => {
        if (!selectedTimelineId || !targetId) return;
        try {
            await api.put('/bd/insertar', {
                tipoEntidad: 'relacion',
                tipoOrigen: 'lineatiempo',
                idOrigen: selectedTimelineId,
                tipoDestino: 'lineatiempo',
                idDestino: targetId,
                descripcion: 'Anexo de línea de tiempo'
            });
            refreshLinks(selectedTimelineId, timelines);
        } catch (e) { console.error(e); }
    };

    const handleUnlinkTimeline = async (targetId) => {
        const allRels = await api.get('/bd/relacion');
        const rel = allRels.find(r =>
            (r.tipoOrigen === 'lineatiempo' && r.idOrigen === selectedTimelineId && r.idDestino === targetId) ||
            (r.tipoDestino === 'lineatiempo' && r.idDestino === selectedTimelineId && r.idOrigen === targetId)
        );
        if (rel) {
            await api.delete(`/bd/relacion/${rel.id}`);
            refreshLinks(selectedTimelineId, timelines);
        }
    };

    // Portal Setup
    useEffect(() => {
        // Activate Custom Mode
        setRightPanelMode('CUSTOM');
        setRightPanelTitle('Línea de Tiempo');
        setRightOpen(true);

        // Poll for target node availability
        const interval = setInterval(() => {
            const temp = document.getElementById('architect-right-panel-portal');
            if (temp) {
                setPortalTarget(temp);
                clearInterval(interval);
            }
        }, 50);

        return () => {
            clearInterval(interval);
            // On Unmount, reset to default notes
            setRightPanelMode('NOTES');
            setRightPanelTitle('');
            // setRightOpen(false); // Optional: keep open if user navigates? No, close or reset.
        };
    }, []);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            loadTimelines();
        }
    }, []);

    useEffect(() => {
        if (selectedTimelineId) {
            loadEvents(selectedTimelineId);
            refreshLinks(selectedTimelineId, timelines);
            setEditingEvent(null);
            setNewEvent({ nombre: '', descripcion: '', fechaTexto: '', ordenAbsoluto: 0 });
        } else {
            setEvents([]);
        }
    }, [selectedTimelineId]);

    // Update auto-order effect
    useEffect(() => {
        if (activeTab === 'eventos' && !editingEvent) {
            const maxOrder = events.reduce((max, e) => Math.max(max, e.ordenAbsoluto || 0), 0);
            setNewEvent(prev => ({ ...prev, ordenAbsoluto: maxOrder + 1 }));
        }
    }, [activeTab, events, editingEvent]);

    const loadTimelines = async () => {
        setLoading(true);
        try {
            const all = await api.get('/bd/lineatiempo');
            const unique = [...new Map(all.map(item => [item.id, item])).values()];
            const root = unique.find(t => t.esRaiz);

            if (unique.length === 0) {
                console.log("No timelines found. Creating Root...");
                const newRoot = await api.put('/bd/insertar', {
                    tipoEntidad: 'lineatiempo',
                    nombre: 'Línea Principal',
                    descripcion: 'La línea de tiempo principal del mundo.',
                    esRaiz: true
                });
                const created = newRoot.entidad || newRoot;
                setTimelines([created]);
                setSelectedTimelineId(created.id);
            } else {
                setTimelines(unique);
                if (!selectedTimelineId) {
                    if (root) setSelectedTimelineId(root.id);
                    else setSelectedTimelineId(unique[0].id);
                }
            }
            // Cleanup duplicates
            const roots = unique.filter(t => t.esRaiz);
            if (roots.length > 1) {
                roots.sort((a, b) => a.id - b.id);
                const toKeep = roots[0];
                const toDelete = roots.slice(1);
                toDelete.forEach(d => api.delete(`/bd/lineatiempo/${d.id}`).catch(console.error));
                const cleaned = unique.filter(t => t.id === toKeep.id || !toDelete.find(d => d.id === t.id));
                setTimelines(cleaned);
                if (!selectedTimelineId) setSelectedTimelineId(toKeep.id);
            }
        } catch (error) {
            console.error("Failed to load timelines", error);
        } finally {
            setLoading(false);
        }
    };

    const loadEvents = async (lineId) => {
        try {
            const allEvents = await api.get('/bd/eventotiempo');
            const filtered = allEvents.filter(e => e.lineaTiempo && e.lineaTiempo.id === parseInt(lineId));
            filtered.sort((a, b) => (a.ordenAbsoluto || 0) - (b.ordenAbsoluto || 0));
            setEvents(filtered);
        } catch (error) {
            console.error("Failed to load events", error);
        }
    };

    const handleSaveEvent = async () => {
        if (!selectedTimelineId || !newEvent.nombre) return;

        const payload = {
            ...newEvent,
            ordenAbsoluto: parseInt(newEvent.ordenAbsoluto) || 0
        };

        try {
            if (editingEvent) {
                await api.patch('/bd/modificar', {
                    tipoEntidad: 'eventotiempo',
                    id: editingEvent.id,
                    ...payload,
                    lineaTiempoId: selectedTimelineId
                });
            } else {
                await api.put('/bd/insertar', {
                    tipoEntidad: 'eventotiempo',
                    ...payload,
                    lineaTiempoId: selectedTimelineId
                });
            }
            setNewEvent({ nombre: '', descripcion: '', fechaTexto: '', ordenAbsoluto: 0 }); // Order will auto-update via effect
            setEditingEvent(null);
            loadEvents(selectedTimelineId);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteEvent = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Delete this event?")) return;
        try {
            await api.delete(`/bd/eventotiempo/${id}`);
            loadEvents(selectedTimelineId);
            if (editingEvent && editingEvent.id === id) {
                setEditingEvent(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const startEditEvent = (event) => {
        setEditingEvent(event);
        setNewEvent({
            nombre: event.nombre,
            descripcion: event.descripcion,
            fechaTexto: event.fechaTexto,
            ordenAbsoluto: event.ordenAbsoluto || 0
        });
        setActiveTab('eventos');
        setRightOpen(true);
    };

    const handleCreateTimeline = async () => {
        if (!newLine.nombre) return;
        try {
            const res = await api.put('/bd/insertar', {
                tipoEntidad: 'lineatiempo',
                ...newLine,
                esRaiz: false
            });
            setIsCreatingLine(false);
            setNewLine({ nombre: '', descripcion: '' });
            loadTimelines();
            const created = res.entidad || res;
            if (created && created.id) setSelectedTimelineId(created.id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTimeline = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Delete this timeline? events will be lost.")) return;
        try {
            await api.delete(`/bd/lineatiempo/${id}`);
            if (selectedTimelineId === id) setSelectedTimelineId(null);
            loadTimelines();
        } catch (error) {
            console.error(error);
        }
    };

    // Right Sidebar Content (Portal)
    const sidebarContent = (
        <>
            {/* Tabs Switch */}
            <div className="p-4 border-b border-white/5">
                <div className="flex bg-black/40 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('eventos')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'eventos' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Eventos
                    </button>
                    <button
                        onClick={() => setActiveTab('anexos')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'anexos' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Anexos
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'eventos' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <h3 className="text-xs font-black uppercase text-primary mb-4 flex items-center justify-between">
                                {editingEvent ? 'Edit Event' : 'New Event'}
                                {editingEvent && (
                                    <button onClick={() => { setEditingEvent(null); setNewEvent({ nombre: '', descripcion: '', fechaTexto: '', ordenAbsoluto: events.length + 1 }); }} className="text-[10px] text-slate-500 hover:text-white underline">
                                        CANCEL
                                    </button>
                                )}
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Title</label>
                                    <input
                                        className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary"
                                        value={newEvent.nombre}
                                        onChange={e => setNewEvent({ ...newEvent, nombre: e.target.value })}
                                        placeholder="Event Name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Date Label</label>
                                        <input
                                            className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary"
                                            value={newEvent.fechaTexto}
                                            onChange={e => setNewEvent({ ...newEvent, fechaTexto: e.target.value })}
                                            placeholder="e.g. Year 500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Order (Sort)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary"
                                            value={newEvent.ordenAbsoluto}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (/^[-+]?\d*$/.test(val)) setNewEvent({ ...newEvent, ordenAbsoluto: val });
                                            }}
                                            placeholder="+/- Num"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Description</label>
                                    <textarea
                                        className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary h-24 resize-none"
                                        value={newEvent.descripcion}
                                        onChange={e => setNewEvent({ ...newEvent, descripcion: e.target.value })}
                                        placeholder="Describe what happened..."
                                    />
                                </div>
                                <div className="pt-2">
                                    <Button variant="primary" onClick={handleSaveEvent} className="w-full justify-center">
                                        {editingEvent ? 'Save Changes' : 'Create Event'}
                                    </Button>
                                </div>

                                {editingEvent && (
                                    <button
                                        onClick={(e) => handleDeleteEvent(editingEvent.id, e)}
                                        className="w-full text-center text-xs text-red-500 hover:text-red-400 py-2 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                                    >
                                        Delete Event
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'anexos' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <h3 className="text-xs font-black uppercase text-primary mb-4">Annexed Timelines</h3>
                            <p className="text-xs text-slate-500 mb-4">Link other localized timelines to this one to verify chronological consistency.</p>

                            <div className="space-y-2 mb-6">
                                {linkedTimelines.map(lt => (
                                    <div key={lt.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-xs text-slate-400">timeline</span>
                                            <span className="text-xs font-bold text-slate-300">{lt.nombre}</span>
                                        </div>
                                        <button onClick={() => handleUnlinkTimeline(lt.id)} className="text-slate-500 hover:text-red-500">
                                            <span className="material-symbols-outlined text-sm">link_off</span>
                                        </button>
                                    </div>
                                ))}
                                {linkedTimelines.length === 0 && <span className="text-xs text-slate-600 italic">No linked timelines.</span>}
                            </div>

                            <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Available to Link</h4>
                            <div className="space-y-1">
                                {availableTimelines.map(at => (
                                    <button
                                        key={at.id}
                                        onClick={() => handleLinkTimeline(at.id)}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-left transition-colors group"
                                    >
                                        <span className="material-symbols-outlined text-xs text-green-500/50 group-hover:text-green-500">add_link</span>
                                        <span className="text-xs text-slate-400 group-hover:text-white">{at.nombre}</span>
                                    </button>
                                ))}
                                {availableTimelines.length === 0 && <span className="text-xs text-slate-600 italic">No other timelines available.</span>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-background-dark text-white overflow-hidden">
            {/* Render Portal if Target Found */}
            {portalTarget && createPortal(sidebarContent, portalTarget)}

            {/* LEFT SIDEBAR: Timeline Selector */}
            <aside className="w-64 bg-surface-dark border-r border-white/5 flex flex-col p-4 z-20 shrink-0">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary">Timelines</h2>
                    <button onClick={() => setIsCreatingLine(!isCreatingLine)} className="text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </header>

                {isCreatingLine && (
                    <div className="mb-4 p-3 bg-black/20 rounded-xl space-y-2 border border-white/10 animate-in fade-in slide-in-from-left-2">
                        <input
                            className="w-full bg-transparent border-b border-white/20 text-sm p-1 outline-none focus:border-primary"
                            placeholder="Name"
                            value={newLine.nombre}
                            onChange={e => setNewLine({ ...newLine, nombre: e.target.value })}
                        />
                        <div className="flex justify-end">
                            <button onClick={handleCreateTimeline} className="text-xs font-bold text-primary">CREATE</button>
                        </div>
                    </div>
                )}

                <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                    {timelines.map(t => (
                        <div
                            key={t.id}
                            onClick={() => setSelectedTimelineId(t.id)}
                            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${selectedTimelineId === t.id ? 'bg-primary/10 border-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : 'bg-transparent border-transparent hover:bg-white/5 text-slate-400'}`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <span className={`material-symbols-outlined text-sm shrink-0 ${t.esRaiz ? 'text-amber-400' : ''}`}>
                                    {t.esRaiz ? 'public' : 'timeline'}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wide truncate">{t.nombre}</span>
                            </div>
                            {!t.esRaiz && (
                                <button
                                    onClick={(e) => handleDeleteTimeline(t.id, e)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* CENTER: Main Visualization */}
            <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-background-dark/95">
                {/* CSS Pattern Background */}
                <div className="absolute inset-0 z-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(255, 255, 255, 0.1) 1px, transparent 0)',
                    backgroundSize: '30px 30px'
                }}></div>

                {/* Header */}
                <div className="h-16 border-b border-white/5 bg-background-dark/80 backdrop-blur flex items-center px-8 z-10 shrink-0">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {timelines.find(t => t.id === selectedTimelineId)?.esRaiz && <span className="text-amber-400 material-symbols-outlined">star</span>}
                            {timelines.find(t => t.id === selectedTimelineId)?.nombre || 'Select Timeline'}
                        </h1>
                        <p className="text-xs text-slate-500">{timelines.find(t => t.id === selectedTimelineId)?.descripcion}</p>
                    </div>
                </div>

                {/* Timeline Graph */}
                <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar z-10">
                    <div className="max-w-2xl mx-auto relative pl-8 border-l-2 border-white/10 space-y-8 pb-32">
                        {events.length === 0 && (
                            <div className="text-center text-slate-600 italic py-20">
                                No events yet. Use the right panel to add one.
                            </div>
                        )}

                        {events.map((event, index) => (
                            <div key={event.id} className="relative group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                                <div
                                    className="absolute top-6 -left-[41px] size-4 rounded-full bg-white/20 border-4 border-background-dark group-hover:bg-primary transition-colors cursor-pointer"
                                    onClick={() => startEditEvent(event)}
                                ></div>
                                <div className="ml-4 bg-surface-dark/50 border border-white/5 p-5 rounded-2xl hover:border-primary/30 transition-all hover:bg-surface-dark group-hover:translate-x-1 duration-300 relative group/card">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex flex-col mb-1">
                                                <h3 className="text-lg font-bold text-white">{event.nombre}</h3>
                                                <span className="text-xs font-mono font-bold text-primary opacity-80">
                                                    {event.fechaTexto}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed">{event.descripcion}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TimelineView;
