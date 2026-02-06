import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import api from '../../../js/services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';

const TimelineView = () => {
    const { t } = useLanguage();
    // Context from ArchitectLayout
    const { setRightPanelTab, setRightOpen } = useOutletContext(); // Removed legacy props

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
        // Activate Context Mode
        if (setRightPanelTab) setRightPanelTab('CONTEXT');
        // setRightOpen(true); // Don't force open on mount

        // Poll for target node availability
        const interval = setInterval(() => {
            const temp = document.getElementById('global-right-panel-portal'); // UPDATED ID
            if (temp) {
                setPortalTarget(temp);
                clearInterval(interval);
            }
        }, 50);

        return () => {
            clearInterval(interval);
            // On Unmount, reset to default notes
            if (setRightPanelTab) setRightPanelTab('NOTEBOOKS');
        };
    }, [setRightPanelTab]);

    // --- Multiverse State ---
    const [universes, setUniverses] = useState([]);
    const [selectedUniverseId, setSelectedUniverseId] = useState(null);

    // Initial Load
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            loadMultiverse();
        }
    }, []);

    const updateTitle = (timelineName) => {
        setRightPanelTitle(
            <div className="flex flex-col">
                <span>{t('timeline.title').toUpperCase()}</span>
                {timelineName && <span className="text-[10px] text-slate-400 font-medium normal-case tracking-normal mt-0.5">{timelineName}</span>}
            </div>
        );
    };

    // Sync Title based on selection
    useEffect(() => {
        if (activeTab === 'eventos' || activeTab === 'anexos') {
            // Find current timeline name
            if (selectedTimelineId) {
                const all = universes.flatMap(u => u.lineasTemporales || []);
                const found = all.find(t => t.id === selectedTimelineId);
                updateTitle(found?.nombre);
            } else {
                updateTitle(null);
            }
        } else if (activeTab === 'universo') {
            setRightPanelTitle(t('timeline.multiverse'));
        }
    }, [selectedTimelineId, activeTab, universes]);


    const loadMultiverse = async () => {
        try {
            const data = await api.get('/multiverso/list');
            setUniverses(data);
            // Auto-select logic? Maybe don't auto-select a specific timeline, just show the tree.
            // OR select the first timeline of the first universe.
            if (!selectedTimelineId && data.length > 0) {
                const firstUni = data[0];
                if (firstUni.lineasTemporales && firstUni.lineasTemporales.length > 0) {
                    setSelectedTimelineId(firstUni.lineasTemporales[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to load multiverse", error);
        }
    };

    // ... (Existing Event Logic remains mostly same, just context changed) ...



    const loadEvents = async (lineId) => {
        try {
            const events = await api.get(`/timeline/linea/${lineId}/eventos`);
            events.sort((a, b) => (a.ordenAbsoluto || 0) - (b.ordenAbsoluto || 0));
            setEvents(events);
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
                await api.put(`/timeline/evento/${editingEvent.id}`, {
                    ...payload,
                    lineaTiempo: { id: selectedTimelineId }
                });
            } else {
                await api.post('/timeline/evento', {
                    ...payload,
                    lineaTiempo: { id: selectedTimelineId }
                });
            }
            setNewEvent({ nombre: '', descripcion: '', fechaTexto: '', ordenAbsoluto: 0 }); // Order will auto-update via effect
            setEditingEvent(null);
            loadEvents(selectedTimelineId);
        } catch (error) {
            console.error(error);
        }
    };

    // handleDeleteEvent is now handled by the unified confirmation logic below.

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
        if (!newLine.nombre || !newLine.universoId) return;
        try {
            const created = await api.post('/timeline/linea', {
                ...newLine,
                esRaiz: false,
                universo: { id: newLine.universoId }
            });
            setIsCreatingLine(false);
            setNewLine({ nombre: '', descripcion: '', universoId: null });

            // Reload Multiverse and Select
            await loadMultiverse();
            setSelectedTimelineId(created.id);
        } catch (error) {
            console.error("Error creating timeline:", error);
        }
    };

    // --- Universe CRUD ---
    const [newUniverse, setNewUniverse] = useState({ nombre: '', descripcion: '' });

    const handleCreateUniverse = async () => {
        if (!newUniverse.nombre) return;
        try {
            const created = await api.post('/multiverso/crear', newUniverse);
            setNewUniverse({ nombre: '', descripcion: '' });
            setRightOpen(false); // Close panel
            await loadMultiverse(); // Refresh tree
        } catch (e) {
            console.error("Error creating universe", e);
        }
    };

    const handleUpdateUniverse = async () => {
        if (!selectedUniverseId) return;
        // Find current data to fallback? Or assume newUniverse state is populated on select?
        // Better: use a separate state or reuse newUniverse but careful.
        // Let's reuse newUniverse logic but call it 'universeForm'.
        // For now, let's assume we bind to 'newUniverse' when opening edit mode.
        try {
            await api.put(`/multiverso/${selectedUniverseId}`, {
                nombre: newUniverse.nombre,
                descripcion: newUniverse.descripcion
            });
            setRightOpen(false);
            await loadMultiverse();
        } catch (e) {
            console.error("Error updating universe", e);
        }
    };

    const handleDeleteUniverse = async () => {
        if (!selectedUniverseId) return;
        if (!window.confirm(t('timeline.delete_universe_confirm'))) return;
        try {
            await api.delete(`/multiverso/${selectedUniverseId}`);
            setRightOpen(false);
            setSelectedUniverseId(null);
            await loadMultiverse();
        } catch (e) {
            console.error("Error deleting universe", e);
        }
    };

    // Helper to prep edit form
    const startEditUniverse = (uni) => {
        setSelectedUniverseId(uni.id);
        setNewUniverse({ nombre: uni.nombre, descripcion: uni.descripcion || '' });
        setRightPanelTitle('Universe Settings');
        setActiveTab('universe-edit');
        setRightPanelMode('CUSTOM');
        setRightOpen(true);
    };

    // Helper for create
    useEffect(() => {
        if (activeTab === 'universe-create') {
            setNewUniverse({ nombre: '', descripcion: '' });
        } else if (activeTab === 'universe-edit' && selectedUniverseId) {
            const uni = universes.find(u => u.id === selectedUniverseId);
            if (uni) setNewUniverse({ nombre: uni.nombre, descripcion: uni.descripcion || '' });
        }
    }, [activeTab, selectedUniverseId, universes]);
    // Confirmation State
    const [confirmState, setConfirmState] = useState({
        open: false,
        type: null,
        id: null,
        title: '',
        message: ''
    });

    const handleDeleteTimeline = (id, e) => {
        e.stopPropagation();
        setConfirmState({
            open: true,
            type: 'TIMELINE',
            id,
            title: t('timeline.delete_line'),
            message: t('bible.delete_folder_msg')
        });
    };

    const handleDeleteEvent = (id, e) => {
        e.stopPropagation();
        setConfirmState({
            open: true,
            type: 'EVENT',
            id,
            title: t('timeline.delete_event'),
            message: t('common.are_you_sure')
        });
    };

    const executeDeletion = async () => {
        const { type, id } = confirmState;
        if (!type || !id) return;

        try {
            if (type === 'TIMELINE') {
                await api.delete(`/timeline/linea/${id}`);
                // Verify if we deleted the active timeline
                if (selectedTimelineId === id) {
                    const allTimelines = universes.flatMap(u => u.lineasTemporales || []);
                    const remaining = allTimelines.filter(t => t.id !== id);
                    setSelectedTimelineId(remaining.length > 0 ? remaining[0].id : null);
                }
                await loadMultiverse();
            } else if (type === 'EVENT') {
                await api.delete(`/timeline/evento/${id}`);
                loadEvents(selectedTimelineId);
                if (editingEvent && editingEvent.id === id) {
                    setEditingEvent(null);
                }
            }
        } catch (error) {
            console.error(error);
            alert(t('common.error_delete'));
        }
    };

    // Right Sidebar Content (Portal)
    const sidebarContent = (
        <>
            {/* Tabs Switch */}
            <div className="p-4 border-b border-white/5">
                <div className="flex bg-black/40 rounded-lg p-1 overflow-x-auto gap-1">
                    <button
                        onClick={() => setActiveTab('eventos')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'eventos' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('timeline.events_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('anexos')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'anexos' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('timeline.annexes_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('universo')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'universo' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-amber-500/80'}`}
                    >
                        {t('timeline.multiverse')}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'eventos' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <h3 className="text-xs font-black uppercase text-primary mb-4 flex items-center justify-between">
                                {editingEvent ? t('timeline.edit_event') : t('timeline.add_event')}
                                {editingEvent && (
                                    <button onClick={() => { setEditingEvent(null); setNewEvent({ nombre: '', descripcion: '', fechaTexto: '', ordenAbsoluto: events.length + 1 }); }} className="text-[10px] text-slate-500 hover:text-white underline">
                                        {t('common.cancel').toUpperCase()}
                                    </button>
                                )}
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">{t('timeline.event_name')}</label>
                                    <input
                                        className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary"
                                        value={newEvent.nombre}
                                        onChange={e => setNewEvent({ ...newEvent, nombre: e.target.value })}
                                        placeholder={t('timeline.event_name')}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">{t('timeline.date_label')}</label>
                                        <input
                                            className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary"
                                            value={newEvent.fechaTexto}
                                            onChange={e => setNewEvent({ ...newEvent, fechaTexto: e.target.value })}
                                            placeholder="e.g. Year 500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">{t('timeline.order')}</label>
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
                                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">{t('timeline.description')}</label>
                                    <textarea
                                        className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary h-24 resize-none"
                                        value={newEvent.descripcion}
                                        onChange={e => setNewEvent({ ...newEvent, descripcion: e.target.value })}
                                        placeholder={t('timeline.description')}
                                    />
                                </div>
                                <div className="pt-2">
                                    <Button variant="primary" onClick={handleSaveEvent} className="w-full justify-center">
                                        {editingEvent ? t('timeline.save_changes') : t('timeline.create_event')}
                                    </Button>
                                </div>

                                {editingEvent && (
                                    <button
                                        onClick={(e) => handleDeleteEvent(editingEvent.id, e)}
                                        className="w-full text-center text-xs text-red-500 hover:text-red-400 py-2 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                                    >
                                        {t('timeline.delete_event_btn')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'anexos' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        {/* ... existing anexos content (implicit) ... */}
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <h3 className="text-xs font-black uppercase text-primary mb-4">{t('timeline.linked_timelines')}</h3>
                            <p className="text-xs text-slate-500 mb-4">{t('timeline.annexed_desc')}</p>

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
                                {linkedTimelines.length === 0 && <span className="text-xs text-slate-600 italic">{t('timeline.no_linked')}</span>}
                            </div>

                            <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">{t('timeline.available_to_link')}</h4>
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
                                {availableTimelines.length === 0 && <span className="text-xs text-slate-600 italic">{t('timeline.no_available')}</span>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'universo' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <h3 className="text-xs font-black uppercase text-amber-500 mb-4">{selectedUniverseId ? t('timeline.universe_settings') : t('timeline.new_universe')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">{t('timeline.universe_name')}</label>
                                    <input
                                        className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary"
                                        value={newUniverse.nombre}
                                        onChange={e => setNewUniverse({ ...newUniverse, nombre: e.target.value })}
                                        placeholder="e.g. Alternate Reality 1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Description</label>
                                    <textarea
                                        className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-primary h-24 resize-none"
                                        value={newUniverse.descripcion}
                                        onChange={e => setNewUniverse({ ...newUniverse, descripcion: e.target.value })}
                                        placeholder={t('timeline.universe_desc')}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        variant="primary"
                                        onClick={selectedUniverseId ? handleUpdateUniverse : handleCreateUniverse}
                                        className="w-full justify-center"
                                    >
                                        {selectedUniverseId ? t('common.save') : t('common.create')}
                                    </Button>
                                </div>

                                {selectedUniverseId && (
                                    <button
                                        onClick={handleDeleteUniverse}
                                        className="w-full text-center text-xs text-red-500 hover:text-red-400 py-2 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                                    >
                                        {t('common.delete')}
                                    </button>
                                )}
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

            {/* LEFT SIDEBAR: Multiverse Selector */}
            <aside className="w-64 bg-surface-dark border-r border-white/5 flex flex-col p-4 z-20 shrink-0">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary">{t('timeline.multiverse')}</h2>
                    <button onClick={() => { setRightPanelMode('CUSTOM'); setActiveTab('universo'); setSelectedUniverseId(null); setNewUniverse({ nombre: '', descripcion: '' }); setRightOpen(true); }} className="text-slate-400 hover:text-white" title="New Universe">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                </header>

                <div className="space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    {universes.map(uni => (
                        <div key={uni.id} className="space-y-2">
                            {/* Universe Header */}
                            <div className="flex items-center justify-between group">
                                <h3
                                    className={`text-[10px] font-bold uppercase pl-2 cursor-pointer ${selectedUniverseId === uni.id ? 'text-white' : 'text-slate-500'}`}
                                    onClick={() => { setSelectedUniverseId(uni.id); setNewUniverse({ nombre: uni.nombre, descripcion: uni.descripcion || '' }); setActiveTab('universo'); setRightPanelMode('CUSTOM'); setRightOpen(true); }}
                                >
                                    {uni.nombre}
                                </h3>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setNewLine({ ...newLine, universoId: uni.id }); setIsCreatingLine(true); }}
                                        className="text-slate-500 hover:text-primary"
                                        title="Add Timeline here"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                            </div>

                            {/* Quick Create Input for this Universe */}
                            {isCreatingLine && newLine.universoId === uni.id && (
                                <div className="ml-2 mb-2 p-2 bg-black/20 rounded-lg animate-in fade-in">
                                    <input
                                        className="w-full bg-transparent border-b border-white/20 text-xs p-1 outline-none focus:border-primary mb-1"
                                        placeholder="Timeline Name"
                                        value={newLine.nombre}
                                        onChange={e => setNewLine({ ...newLine, nombre: e.target.value })}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTimeline()}
                                    />
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => setIsCreatingLine(false)} className="text-[10px] text-slate-500 hover:text-white">{t('common.cancel').toUpperCase()}</button>
                                        <button onClick={handleCreateTimeline} className="text-[10px] font-bold text-primary">{t('common.create').toUpperCase()}</button>
                                    </div>
                                </div>
                            )}

                            {/* Timelines List */}
                            <div className="space-y-1 pl-2 border-l border-white/5 ml-1">
                                {uni.lineasTemporales && uni.lineasTemporales.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => { setSelectedTimelineId(t.id); setActiveTab('eventos'); setRightPanelMode('CUSTOM'); setRightOpen(true); }}
                                        className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${selectedTimelineId === t.id ? 'bg-primary/10 text-white shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]' : 'text-slate-400 hover:bg-white/5'}`}
                                    >
                                        <span className="text-xs truncate">{t.nombre}</span>
                                        <button
                                            onClick={(e) => handleDeleteTimeline(t.id, e)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-[10px]">delete</span>
                                        </button>
                                    </div>
                                ))}
                                {(!uni.lineasTemporales || uni.lineasTemporales.length === 0) && (
                                    <div className="p-2 text-[10px] italic text-slate-600">{t('timeline.no_timelines')}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* CENTER: Main Visualization */}
            <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-background-dark">
                {/* Header */}

                {/* Header */}
                <div className="h-16 border-b border-white/5 bg-background-dark/80 backdrop-blur flex items-center px-8 z-10 shrink-0">
                    <div>
                        {(() => {
                            const allTimelines = universes.flatMap(u => u.lineasTemporales || []);
                            const active = allTimelines.find(t => t.id === selectedTimelineId);
                            return (
                                <>
                                    <h1 className="text-xl font-bold flex items-center gap-2">
                                        {active?.esRaiz && <span className="text-amber-400 material-symbols-outlined">star</span>}
                                        {active?.nombre || t('timeline.select_timeline')}
                                    </h1>
                                    <p className="text-xs text-slate-500">{active?.descripcion}</p>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Timeline Graph */}
                <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar z-10">
                    <div className="max-w-2xl mx-auto relative pl-8 border-l-2 border-white/10 space-y-8 pb-32">
                        {events.length === 0 && (
                            <div className="text-center text-slate-600 italic py-20">
                                {t('timeline.no_events')}
                            </div>
                        )}

                        {events.map((event, index) => (
                            <div key={event.id} className="relative group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                                <div
                                    className="absolute top-6 -left-[41px] size-4 rounded-full bg-white/20 border-4 border-background-dark group-hover:bg-primary transition-colors cursor-pointer"
                                    onClick={() => startEditEvent(event)}
                                ></div>
                                <div className="ml-4 bg-surface-dark/50 border border-white/5 p-5 rounded-2xl hover:border-primary/30 transition-all hover:bg-surface-dark group-hover:translate-x-1 duration-300 relative group/card">
                                    <div className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity flex gap-1 bg-black/50 rounded-lg backdrop-blur-sm border border-white/5 p-1">
                                        <button onClick={() => startEditEvent(event)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Edit">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={(e) => handleDeleteEvent(event.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
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
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmState.open}
                onClose={() => setConfirmState({ ...confirmState, open: false })}
                onConfirm={executeDeletion}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={t('common.delete')}
                type="danger"
            />
        </div>
    );
};

export default TimelineView;
