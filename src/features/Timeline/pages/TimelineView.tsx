import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useOutletContext, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { timelineService } from '../../../database/timelineService';
import { folderService } from '../../../database/folderService';
import { entityService } from '../../../database/entityService';
import { Evento, Carpeta, Entidad } from '../../../database/types';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import GlassPanel from '../../../components/common/GlassPanel';
import Button from '../../../components/common/Button';
import TimelineEventCard from '../components/TimelineEventCard';
import '../../../assets/TimelineView.css';

import { TimelineLine, UniverseExtended } from '../../../types/timeline';

const TimelineView = () => {
 const { t } = useLanguage();
 // Context from ArchitectLayout
 const { setRightPanelTab, setRightOpen, setRightPanelTitle, setRightPanelMode } = useOutletContext<any>();
 const { projectId } = useOutletContext<{ projectId: number }>();
 const { username, projectName } = useParams();

 const [universes, setUniverses] = useState<UniverseExtended[]>([]);
 const [selectedUniverseId, setSelectedUniverseId] = useState<number | null>(null);
 const [selectedTimelineId, setSelectedTimelineId] = useState<number | null>(null);
 const [events, setEvents] = useState<Evento[]>([]);
 const [loading, setLoading] = useState(true);

 // Creation State
 const [isCreatingEvent, setIsCreatingEvent] = useState(false);
 const [isCreatingLine, setIsCreatingLine] = useState(false);

 const [newEvent, setNewEvent] = useState({ titulo: '', descripcion: '', fecha_simulada: '', ordenAbsoluto: 0 });
 const [newLine, setNewLine] = useState({ nombre: '', descripcion: '', universoId: null as number | null });

 const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
 const [editingTimeline, setEditingTimeline] = useState<TimelineLine | null>(null);

 // New State for Right Panel
 const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
 const [eventAnexos, setEventAnexos] = useState<any[]>([]);
 const [entitySearch, setEntitySearch] = useState('');
 const [searchResults, setSearchResults] = useState<Entidad[]>([]);
 const [activeTab, setActiveTab] = useState('eventos'); // 'eventos' | 'anexos' | 'universo'

 const selectedEvent = events.find(e => e.id === selectedEventId);

 // Portal Target Node
 const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

 const initialized = React.useRef(false);
 const timelineRef = useRef<HTMLDivElement>(null);

 const scrollLeft = () => {
 if (timelineRef.current) {
 timelineRef.current.scrollBy({ left: -300, behavior: 'smooth' });
 }
 };

 const scrollRight = () => {
 if (timelineRef.current) {
 timelineRef.current.scrollBy({ left: 300, behavior: 'smooth' });
 }
 };

 // Logic wrappers
 const refreshLinks = async (currentId: number, allTimelines: TimelineLine[]) => {
 // TODO: Implementar relaciones en DB local
 console.log('Refresh links not implemented in local-first yet', currentId, allTimelines);
 };

 const handleLinkTimeline = async (targetId: number) => {
 // TODO: Implementar relaciones en DB local
 console.log('Link timeline not implemented in local-first yet', targetId);
 };

 const handleUnlinkTimeline = async (targetId: number) => {
 // TODO: Implementar relaciones en DB local
 console.log('Unlink timeline not implemented in local-first yet', targetId);
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
 console.log('[TimelineView] Cleanup: unmounting, clearing portal');
 clearInterval(interval);
 // Clean up portal content manually
 const temp = document.getElementById('global-right-panel-portal');
 if (temp) {
 console.log('[TimelineView] Portal found, clearing innerHTML');
 temp.innerHTML = ''; // Clear any residual content
 } else {
 console.log('[TimelineView] Portal NOT found');
 }
 // CRITICAL: Clear the panel title to prevent persistence across pages
 if (setRightPanelTitle) setRightPanelTitle(null);
 // On Unmount, reset to default notes
 if (setRightPanelTab) setRightPanelTab('NOTEBOOKS');
 };
 }, [setRightPanelTab]);

 // --- Multiverse State ---
 // (Already declared at the top)

 // Initial Load
 useEffect(() => {
 if (!initialized.current) {
 initialized.current = true;
 loadMultiverse();
 }
 }, []);

 const updateTitle = (timelineName: string | null | undefined) => {
 setRightPanelTitle(
 <div className="flex flex-col">
 <span>{t('timeline.title').toUpperCase()}</span>
 {timelineName && <span className="text-[10px] text-foreground/60 font-medium normal-case tracking-normal mt-0.5">{timelineName}</span>}
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
 if (!projectId) return;
 try {
 const allFolders = await folderService.getByProject(projectId);
 const timelineFolders = allFolders.filter(f => f.tipo === 'TIMELINE');
 
 // Map folders to the expected nested structure
 const rootUniverses = timelineFolders.filter(f => f.padre_id === null);
 const extendedUniverses: UniverseExtended[] = rootUniverses.map(uni => ({
 ...uni,
 lineasTemporales: timelineFolders.filter(f => f.padre_id === uni.id) as TimelineLine[]
 }));

 setUniverses(extendedUniverses);
 if (!selectedTimelineId && extendedUniverses.length > 0) {
 const firstUni = extendedUniverses[0];
 if (firstUni.lineasTemporales.length > 0) {
 setSelectedTimelineId(firstUni.lineasTemporales[0].id);
 }
 }
 } catch (error) {
 console.error("Failed to load multiverse", error);
 }
 };

 // Load events when timeline selection changes
 useEffect(() => {
 if (selectedTimelineId) {
 loadEvents(selectedTimelineId);
 } else {
 setEvents([]);
 }
 }, [selectedTimelineId]);

 // ... (Existing Event Logic remains mostly same, just context changed) ...



 const loadEvents = async (lineId: number) => {
 try {
 const eventsData = await timelineService.getByTimeline(lineId);
 setEvents(eventsData);
 } catch (error) {
 console.error("Failed to load events", error);
 }
 };

 const handleSaveEvent = async () => {
 if (!selectedTimelineId || !newEvent.titulo || !projectId) return;

 try {
 if (editingEvent) {
 await timelineService.update(editingEvent.id, {
 titulo: newEvent.titulo,
 descripcion: newEvent.descripcion,
 fecha_simulada: newEvent.fecha_simulada,
 timeline_id: selectedTimelineId
 });
 } else {
 await timelineService.create({
 titulo: newEvent.titulo,
 descripcion: newEvent.descripcion,
 fecha_simulada: newEvent.fecha_simulada,
 project_id: projectId,
 timeline_id: selectedTimelineId
 });
 }
 setNewEvent({ titulo: '', descripcion: '', fecha_simulada: '', ordenAbsoluto: 0 }); 
 setEditingEvent(null);
 loadEvents(selectedTimelineId);
 } catch (error) {
 console.error(error);
 }
 };

 // handleDeleteEvent is now handled by the unified confirmation logic below.

 const startEditEvent = (event: Evento) => {
 setEditingEvent(event);
 setSelectedEventId(event.id); // Also select it
 setNewEvent({
 titulo: event.titulo,
 descripcion: event.descripcion || '',
 fecha_simulada: event.fecha_simulada || '',
 ordenAbsoluto: 0 // Local order not in Evento interface yet
 });
 setActiveTab('eventos');
 setRightOpen(true);
 loadEventAnexos(event.id);
 };

 const loadEventAnexos = async (eventId: number) => {
 try {
 // TODO: Implementar anexos en DB local
 console.log('Load event anexos not implemented in local-first yet', eventId);
 setEventAnexos([]);
 } catch (e) { console.error(e); }
 };

 const handleSearchEntities = async (val: string) => {
 setEntitySearch(val);
 if (val.length < 2 || !projectId) { setSearchResults([]); return; }
 try {
 const all = await entityService.getAllByProject(projectId);
 const filtered = all.filter(e =>
 e.nombre.toLowerCase().includes(val.toLowerCase())
 ).slice(0, 5);
 setSearchResults(filtered);
 } catch (e) { console.error(e); }
 };

 const handleCreateTimeline = async () => {
 if (!newLine.nombre || !projectId || !newLine.universoId) return;
 try {
 await folderService.create(newLine.nombre, projectId, newLine.universoId, 'TIMELINE');
 setIsCreatingLine(false);
 setNewLine({ nombre: '', descripcion: '', universoId: null });
 await loadMultiverse();
 } catch (error) {
 console.error("Error creating timeline:", error);
 }
 };

 const handleAttachEntity = async (entity: Entidad) => {
 if (!selectedEventId) return;
 // TODO: Implementar anexos en DB local
 console.log('Attach entity not implemented in local-first yet', entity);
 };

 const handleRemoveAnexo = async (relId: number) => {
 // TODO: Implementar anexos en DB local
 console.log('Remove anexo not implemented in local-first yet', relId);
 };


 // --- Universe CRUD ---
 const [newUniverse, setNewUniverse] = useState({ nombre: '', descripcion: '' });

 const handleCreateUniverse = async () => {
 if (!newUniverse.nombre || !projectId) return;
 try {
 await folderService.create(newUniverse.nombre, projectId, null, 'TIMELINE');
 setNewUniverse({ nombre: '', descripcion: '' });
 setRightOpen(false); // Close panel
 await loadMultiverse(); // Refresh tree
 } catch (e) {
 console.error("Error creating universe", e);
 }
 };

 const handleUpdateUniverse = async () => {
 if (!selectedUniverseId) return;
 try {
 await folderService.update(selectedUniverseId, newUniverse.nombre);
 setRightOpen(false);
 await loadMultiverse();
 } catch (e) {
 console.error("Error updating universe", e);
 }
 };

 const handleDeleteUniverse = async () => {
 if (!selectedUniverseId) return;
 // Confirmation is now handled by modal
 setConfirmState({
 open: true,
 type: 'universe',
 id: selectedUniverseId,
 title: t('timeline.delete_universe'),
 message: t('timeline.delete_universe_confirm')
 });
 };

 // Helper to prep edit form
 const startEditUniverse = (uni: UniverseExtended) => {
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
 const [confirmState, setConfirmState] = useState<{
 open: boolean;
 type: 'TIMELINE' | 'EVENT' | 'universe' | null;
 id: number | null;
 title: string;
 message: string;
 }>({
 open: false,
 type: null,
 id: null,
 title: '',
 message: ''
 });

 const handleDeleteTimeline = (id: number, e: React.MouseEvent) => {
 e.stopPropagation();
 setConfirmState({
 open: true,
 type: 'TIMELINE',
 id,
 title: t('timeline.delete_line'),
 message: t('bible.delete_folder_msg')
 });
 };

 const handleDeleteEvent = (id: number, e: React.MouseEvent) => {
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
 await folderService.delete(id);
 if (selectedTimelineId === id) {
 setSelectedTimelineId(null);
 }
 await loadMultiverse();
 } else if (type === 'EVENT') {
 await timelineService.delete(id);
 loadEvents(selectedTimelineId!);
 if (editingEvent && editingEvent.id === id) {
 setEditingEvent(null);
 }
 } else if (type === 'universe') {
 await folderService.delete(id);
 setRightOpen(false);
 setSelectedUniverseId(null);
 await loadMultiverse();
 }
 setConfirmState({ ...confirmState, open: false });
 } catch (error) {
 console.error(error);
 alert(t('common.error_delete'));
 }
 };

 // Right Sidebar Content (Portal)
 const sidebarContent = (
 <>
 {/* Tabs Switch */}
 <div className="p-4 border-b border-foreground/10">
 <div className="flex bg-background/40 rounded-none p-1 overflow-x-auto gap-1">
 <button
 onClick={() => setActiveTab('universo')}
 className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-all ${activeTab === 'universo' ? 'bg-amber-600 text-foreground shadow-lg' : 'text-foreground/60 hover:text-amber-500/80'}`}
 >
 {t('timeline.multiverse')}
 </button>
 <button
 onClick={() => setActiveTab('linea')}
 className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-all ${activeTab === 'linea' ? 'bg-indigo-600 text-foreground shadow-lg' : 'text-foreground/60 hover:text-indigo-500/80'}`}
 >
 LÍNEA
 </button>
 <button
 onClick={() => setActiveTab('eventos')}
 className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-all ${activeTab === 'eventos' || activeTab === 'anexos' ? 'bg-primary text-foreground shadow-lg' : 'text-foreground/60 hover:text-foreground/60'}`}
 >
 {t('timeline.events_tab')}
 </button>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
 {activeTab === 'eventos' && (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
 <div className="bg-background/20 rounded-none p-4 border border-foreground/10">
 <h3 className="text-xs font-black uppercase text-primary mb-4 flex items-center justify-between">
 {editingEvent ? t('timeline.edit_event') : t('timeline.add_event')}
 {editingEvent && (
 <button onClick={() => { setEditingEvent(null); setNewEvent({ titulo: '', descripcion: '', fecha_simulada: '', ordenAbsoluto: events.length + 1 }); }} className="text-[10px] text-foreground/60 hover:text-foreground underline">
 {t('common.cancel').toUpperCase()}
 </button>
 )}
 </h3>

 <div className="space-y-3">
 <div>
 <label className="text-[10px] text-foreground/60 uppercase font-bold mb-1 block">{t('timeline.event_name')}</label>
 <input
 className="w-full bg-background border border-foreground/40 rounded-none p-2 text-sm text-foreground outline-none focus:border-primary"
 value={newEvent.titulo}
 onChange={e => setNewEvent({ ...newEvent, titulo: e.target.value })}
 placeholder={t('timeline.event_name')}
 />
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] text-foreground/60 uppercase font-bold mb-1 block">{t('timeline.date_label')}</label>
 <input
 className="w-full bg-background border border-foreground/40 rounded-none p-2 text-sm text-foreground outline-none focus:border-primary"
 value={newEvent.fecha_simulada}
 onChange={e => setNewEvent({ ...newEvent, fecha_simulada: e.target.value })}
 placeholder="e.g. Year 500"
 />
 </div>
 <div>
 <label className="text-[10px] text-foreground/60 uppercase font-bold mb-1 block">{t('timeline.order')}</label>
 <input
 type="text"
 className="w-full bg-background border border-foreground/40 rounded-none p-2 text-sm text-foreground outline-none focus:border-primary"
 value={newEvent.ordenAbsoluto}
 onChange={e => {
 const val = e.target.value;
 if (/^[-+]?\d*$/.test(val)) setNewEvent({ ...newEvent, ordenAbsoluto: parseInt(val) || 0 });
 }}
 placeholder="+/- Num"
 />
 </div>
 </div>
 <div>
 <label className="text-[10px] text-foreground/60 uppercase font-bold mb-1 block">{t('timeline.description')}</label>
 <textarea
 className="w-full bg-background border border-foreground/40 rounded-none p-2 text-sm text-foreground outline-none focus:border-primary h-24 resize-none"
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
 className="w-full text-center text-xs text-destructive hover:text-red-400 py-2 border border-red-500/20 rounded-none hover:bg-red-500/10 transition-colors"
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
 {!selectedEventId ? (
 <div className="p-10 text-center opacity-30 italic text-xs">
 Selecciona un evento para ver sus anexos.
 </div>
 ) : (
 <div className="space-y-6">
 <div className="bg-background/20 rounded-none p-4 border border-foreground/10">
 <h3 className="text-xs font-black uppercase text-primary mb-4">Anexar Entidades</h3>
 <div className="relative mb-4">
 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 text-sm">search</span>
 <input
 className="w-full bg-background border border-foreground/40 rounded-none pl-9 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
 placeholder="Buscar personaje, lugar..."
 value={entitySearch}
 onChange={e => handleSearchEntities(e.target.value)}
 />
 {searchResults.length > 0 && (
 <div className="absolute top-full left-0 right-0 mt-1 monolithic-panel border border-foreground/40 rounded-none shadow-2xl z-50 overflow-hidden">
 {searchResults.map(res => (
 <button
 key={res.id}
 onClick={() => handleAttachEntity(res)}
 className="w-full px-4 py-2 hover:bg-primary/20 text-left text-[10px] font-bold text-foreground/70 hover:text-foreground flex items-center justify-between"
 >
 <span>{res.nombre}</span>
 <span className="text-[8px] opacity-40 uppercase">{res.tipo}</span>
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="space-y-2">
 {eventAnexos.map(anexo => (
 <div key={anexo.id} className="flex items-center justify-between p-2 bg-foreground/5 rounded-none border border-foreground/10 group">
 <div className="flex items-center gap-2">
 <span className="material-symbols-outlined text-xs text-primary/50">link</span>
 <span className="text-xs font-bold text-foreground/60">{anexo.nombre}</span>
 </div>
 <button onClick={() => handleRemoveAnexo(anexo.relId)} className="opacity-0 group-hover:opacity-100 text-foreground/60 hover:text-destructive transition-opacity">
 <span className="material-symbols-outlined text-sm">link_off</span>
 </button>
 </div>
 ))}
 {eventAnexos.length === 0 && (
 <p className="text-[10px] text-foreground/60 italic">No hay entidades anexadas a este evento.</p>
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 )}

 {activeTab === 'linea' && selectedTimelineId && (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
 <div className="bg-background/20 rounded-none p-4 border border-foreground/10">
 <h3 className="text-xs font-black uppercase text-indigo-500 mb-4">Ajustes de Línea Temporal</h3>
 <div className="space-y-4">
 <div>
 <label className="text-[10px] text-foreground/60 uppercase font-bold mb-1 block">Renombrar Línea</label>
 <input
 className="w-full bg-background border border-foreground/40 rounded-none p-2 text-sm text-foreground outline-none focus:border-primary"
 placeholder="Nuevo nombre de línea"
 value={editingTimeline?.nombre || ''}
 onChange={e => setEditingTimeline(prev => prev ? { ...prev, nombre: e.target.value } : { id: selectedTimelineId, nombre: e.target.value } as any)}
 />
 </div>
 <div className="pt-2">
 <Button
 variant="primary"
 onClick={async () => {
 if (selectedTimelineId && editingTimeline?.nombre) {
 await folderService.update(selectedTimelineId, editingTimeline.nombre);
 await loadMultiverse();
 }
 }}
 className="w-full justify-center"
 >
 {t('common.save')}
 </Button>
 </div>
 {selectedTimelineId && (
 <button
 onClick={(e) => handleDeleteTimeline(selectedTimelineId, e)}
 className="w-full text-center text-xs text-destructive hover:text-red-400 py-2 border border-red-500/20 rounded-none hover:bg-red-500/10 transition-colors"
 >
 {t('common.delete')}
 </button>
 )}
 </div>
 </div>
 </div>
 )}

 {activeTab === 'universo' && (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
 <div className="bg-background/20 rounded-none p-4 border border-foreground/10">
 <h3 className="text-xs font-black uppercase text-amber-500 mb-4">{selectedUniverseId ? t('timeline.universe_settings') : t('timeline.new_universe')}</h3>
 <div className="space-y-4">
 <div>
 <label className="text-[10px] text-foreground/60 uppercase font-bold mb-1 block">{t('timeline.universe_name')}</label>
 <input
 className="w-full bg-background border border-foreground/40 rounded-none p-2 text-sm text-foreground outline-none focus:border-primary"
 value={newUniverse.nombre}
 onChange={e => setNewUniverse({ ...newUniverse, nombre: e.target.value })}
 placeholder="e.g. Alternate Reality 1"
 />
 </div>
 <div>
 <label className="text-[10px] text-foreground/60 uppercase font-bold mb-1 block">Description</label>
 <textarea
 className="w-full bg-background border border-foreground/40 rounded-none p-2 text-sm text-foreground outline-none focus:border-primary h-24 resize-none"
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
 className="w-full text-center text-xs text-destructive hover:text-red-400 py-2 border border-red-500/20 rounded-none hover:bg-red-500/10 transition-colors"
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
 <div className="flex h-screen bg-background text-foreground overflow-hidden">
 {/* Render Portal if Target Found */}
 {portalTarget && createPortal(sidebarContent, portalTarget)}

 {/* LEFT SIDEBAR: Multiverse Selector */}
 <aside className="w-64 monolithic-panel border-r border-foreground/10 flex flex-col p-4 z-20 shrink-0">
 <header className="flex justify-center gap-12 text-center items-center mb-6">
 <h2 className="text-xs font-black uppercase tracking-widest text-primary">{t('timeline.multiverse')}</h2>
 <button onClick={() => { setRightPanelMode('CUSTOM'); setActiveTab('universo'); setSelectedUniverseId(null); setNewUniverse({ nombre: '', descripcion: '' }); setRightOpen(true); }} className="text-foreground/60 hover:text-foreground" title="New Universe">
 <span className="material-symbols-outlined">add_circle</span>
 </button>
 </header>

 <div className="space-y-6 overflow-y-auto flex-1 custom-scrollbar">
 {universes.map(uni => (
 <div key={uni.id} className="space-y-2">
 {/* Universe Header */}
 <div className="flex items-center justify-between group">
 <h3
 className={`text-[10px] font-bold uppercase pl-2 cursor-pointer ${selectedUniverseId === uni.id ? 'text-foreground' : 'text-foreground/60'}`}
 onClick={() => { setSelectedUniverseId(uni.id); setNewUniverse({ nombre: uni.nombre, descripcion: uni.descripcion || '' }); setActiveTab('universo'); setRightPanelMode('CUSTOM'); setRightOpen(true); }}
 >
 {uni.nombre}
 </h3>
 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <button
 onClick={() => { setNewLine({ ...newLine, universoId: uni.id }); setIsCreatingLine(true); }}
 className="text-foreground/60 hover:text-primary"
 title="Add Timeline here"
 >
 <span className="material-symbols-outlined text-sm">add</span>
 </button>
 </div>
 </div>

 {/* Quick Create Input for this Universe */}
 {isCreatingLine && newLine.universoId === uni.id && (
 <div className="ml-2 mb-2 p-2 bg-background/20 rounded-none animate-in fade-in">
 <input
 className="w-full bg-transparent border-b border-foreground/40 text-xs p-1 outline-none focus:border-primary mb-1"
 placeholder="Timeline Name"
 value={newLine.nombre}
 onChange={e => setNewLine({ ...newLine, nombre: e.target.value })}
 autoFocus
 onKeyDown={(e) => e.key === 'Enter' && handleCreateTimeline()}
 />
 <div className="flex justify-end gap-1">
 <button onClick={() => setIsCreatingLine(false)} className="text-[10px] text-foreground/60 hover:text-foreground">{t('common.cancel').toUpperCase()}</button>
 <button onClick={handleCreateTimeline} className="text-[10px] font-bold text-primary">{t('common.create').toUpperCase()}</button>
 </div>
 </div>
 )}

 {/* Timelines List */}
 <div className="space-y-1 pl-2 border-l border-foreground/10 ml-1">
 {uni.lineasTemporales && uni.lineasTemporales.map(t => (
 <div
 key={t.id}
 onClick={() => { setSelectedTimelineId(t.id); setActiveTab('eventos'); setRightPanelMode('CUSTOM'); setRightOpen(true); }}
 className={`group flex items-center justify-between p-2 rounded-none cursor-pointer transition-all ${selectedTimelineId === t.id ? 'bg-primary/10 text-foreground shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]' : 'text-foreground/60 hover:bg-foreground/5'}`}
 >
 <span className="text-xs truncate">{t.nombre}</span>
 <button
 onClick={(e) => handleDeleteTimeline(t.id, e)}
 className="opacity-0 group-hover:opacity-100 text-foreground/60 hover:text-destructive transition-opacity"
 >
 <span className="material-symbols-outlined text-[10px]">delete</span>
 </button>
 </div>
 ))}
 {(!uni.lineasTemporales || uni.lineasTemporales.length === 0) && (
 <div className="p-2 text-[10px] italic text-foreground/60">{t('timeline.no_timelines')}</div>
 )}
 </div>
 </div>
 ))}
 </div>
 </aside>

 {/* CENTER: Main Visualization */}
 <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-background">
 {/* Header */}
 <div className="h-16 border-b border-foreground/10 bg-background/80 flex items-center px-8 z-10 shrink-0">
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
 <p className="text-xs text-foreground/60">{active?.descripcion}</p>
 </>
 );
 })()}
 </div>
 </div>

 {/* Timeline Graph - Interactive Horizontal Version */}
 <div className="flex-1 relative z-10 overflow-hidden flex flex-col justify-center">
 {events.length === 0 ? (
 <div className="text-center text-foreground/60 italic py-20">
 {t('timeline.no_events')}
 </div>
 ) : (
 <div className="visual-timeline-wrapper animate-in fade-in duration-700">
 <button className="scroll-btn left" onClick={scrollLeft}>
 <span className="material-symbols-outlined">chevron_left</span>
 </button>

 <div className="visual-timeline-container custom-scrollbar" ref={timelineRef}>
 <div className="timeline-axis"></div>
 <div className="events-track">
 {events.map((event, index) => (
 <div
 key={event.id}
 className={`event-wrapper ${index % 2 === 0 ? 'top' : 'bottom'} animate-in zoom-in-50 duration-500`}
 style={{ animationDelay: `${index * 100}ms` }}
 >
 <TimelineEventCard
 event={{
 title: event.titulo,
 date: event.fecha_simulada || '',
 description: event.descripcion || '',
 type: 'GENERAL' // Por ahora genérico, se puede ampliar
 }}
 onClick={() => startEditEvent(event)}
 />
 </div>
 ))}
 </div>
 </div>

 <button className="scroll-btn right" onClick={scrollRight}>
 <span className="material-symbols-outlined">chevron_right</span>
 </button>
 </div>
 )}
 </div>

 {/* Optional: Summary list at bottom if many events */}
 {events.length > 5 && (
 <div className="h-24 border-t border-foreground/10 bg-background/30 px-8 flex items-center gap-4 overflow-x-auto custom-scrollbar z-20">
 {events.map(event => (
 <div
 key={event.id}
 onClick={() => startEditEvent(event)}
 className={`shrink-0 px-3 py-1.5 rounded-none border text-[10px] font-bold cursor-pointer transition-all ${selectedEventId === event.id ? 'bg-primary/20 border-primary text-foreground' : 'bg-foreground/5 border-foreground/10 text-foreground/60 hover:text-foreground/60'}`}
 >
 {event.titulo}
 </div>
 ))}
 </div>
 )}
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
