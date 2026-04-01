import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { timelineService } from '../../../database/timelineService';
import { folderService } from '../../../database/folderService';
import { entityService } from '../../../database/entityService';
import { Evento, Carpeta, Entidad } from '../../../database/types';
import Breadcrumbs from '../../../components/common/Breadcrumbs';

const DimensionEditor: React.FC = () => {
  const { projectName, folderId } = useParams<{ projectName: string; folderId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [folder, setFolder] = useState<Carpeta | null>(null);
  const [events, setEvents] = useState<Evento[]>([]);
  const [path, setPath] = useState<Carpeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!folderId) return;
    setLoading(true);
    try {
      const id = Number(folderId);
      const [fInfo, evts, breadcrumbs] = await Promise.all([
        folderService.getById(id),
        timelineService.getByTimeline(id),
        folderService.getPath(id)
      ]);

      if (fInfo) {
        setFolder(fInfo);
        setEvents(evts.sort((a, b) => (Number(a.fecha_simulada) || 0) - (Number(b.fecha_simulada) || 0)));
        setPath(breadcrumbs);
      }
    } catch (err) {
      console.error("Error loading dimension data:", err);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddEvent = async () => {
    if (!folder || !folderId) return;
    try {
      const newEvent = await timelineService.create({
        titulo: "Nuevo Evento",
        descripcion: null,
        fecha_simulada: null,
        project_id: folder.project_id,
        timeline_id: Number(folderId)
      });
      await loadData();
      setSelectedEventId(newEvent.id);
    } catch (err) {
      console.error("Failed to add event", err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-20 animate-pulse">
        <div className="text-foreground/40 font-black uppercase tracking-widest text-xs">Cargando Dimensión...</div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-foreground/60">
        <h2 className="text-xl font-bold opacity-50">Dimensión No Encontrada</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-[#0a0a0c] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between backdrop-blur-xl">
        <div className="flex flex-col gap-2">
          <Breadcrumbs path={path} currentFolder={folder} />
          <div className="flex items-center gap-4">
            <div className="size-10 bg-orange-400/20 border border-orange-400/30 flex items-center justify-center text-orange-400">
               <span className="material-symbols-outlined text-xl">lan</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">{folder.nombre}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.padre_id || ''}`)}
            className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-[10px] font-black uppercase tracking-widest transition-all border border-foreground/10"
          >
            Volver
          </button>
          <button 
            onClick={handleAddEvent}
            className="px-6 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span> Añadir Hito
          </button>
        </div>
      </header>

      {/* Vertical Canvas */}
      <div className="relative z-0 flex-1 overflow-y-auto p-12 custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent)]">
        <div className="max-w-4xl mx-auto relative min-h-full">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/60 via-indigo-500/20 to-transparent -translate-x-1/2" />

          <div className="space-y-32 relative py-20">
            {events.length === 0 && (
              <div className="text-center py-40 opacity-20">
                <span className="material-symbols-outlined text-6xl mb-4">route</span>
                <p className="font-black uppercase tracking-widest text-xs">La dimensión está vacía</p>
              </div>
            )}

            {events.map((event, index) => (
              <div key={event.id} className={`flex items-center gap-16 group ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Content Card */}
                <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className="inline-block monolithic-panel p-8 border border-white/10 hover:border-indigo-500/40 transition-all duration-700 bg-white/[0.02] group-hover:bg-indigo-500/[0.04] text-left min-w-[320px] max-w-lg shadow-2xl relative overflow-hidden group-hover:-translate-y-2">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                         <div className="size-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80">
                           {event.fecha_simulada || '0.0.0 ORIGEN'}
                         </span>
                       </div>
                       <div className="flex gap-3 opacity-20 group-hover:opacity-100 transition-all">
                         <button className="material-symbols-outlined text-sm hover:text-indigo-400 transition-colors">edit</button>
                         <button className="material-symbols-outlined text-sm hover:text-rose-400 transition-colors">delete_forever</button>
                       </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-foreground mb-4 tracking-tighter group-hover:text-indigo-200 transition-colors">{event.titulo}</h3>
                    
                    <p className="text-xs text-foreground/50 leading-relaxed font-medium">
                      {event.descripcion || "En el tejido del multiverso, este nodo representa un punto de divergencia crítica. Registra aquí los eventos, entidades involucradas y consecuencias dimensionales."}
                    </p>
                    
                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2].map(i => (
                          <div key={i} className="size-6 rounded-none border border-white/10 bg-white/5 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-crosshair">
                            <span className="material-symbols-outlined text-[10px] opacity-40">person</span>
                          </div>
                        ))}
                        <div className="size-6 rounded-none border border-white/10 bg-indigo-500/10 flex items-center justify-center text-[10px] font-black hover:bg-indigo-500/20 cursor-pointer">+</div>
                      </div>
                      <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em]">Nodo: 0x{event.id.toString(16)}</span>
                    </div>
                  </div>
                </div>

                {/* Center Node */}
                <div className="relative z-10 size-16 flex items-center justify-center">
                  <div className="size-5 bg-indigo-500 border-[6px] border-background rounded-full group-hover:scale-[1.8] transition-all duration-700 shadow-[0_0_20px_rgba(99,102,241,0.6)] cursor-pointer" />
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-pulse opacity-40" />
                </div>

                {/* Spacer for reverse layout */}
                <div className="flex-1" />
              </div>
            ))}

            {/* End of Line Indicator */}
            <div className="flex justify-center pt-10">
               <div className="size-3 bg-indigo-500/20 rounded-full border border-indigo-500/30 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionEditor;
