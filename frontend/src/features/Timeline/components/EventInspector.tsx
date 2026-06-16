import React from "react";
import { useLanguage } from "@context/LanguageContext";
import ZenEditor from "@features/Editor/components/ZenEditor";
import { Hoja as HojaModel } from "@domain/database";
import Avatar from "@components/ui/Avatar";
import { useEventInspector } from "./useEventInspector";

interface EventInspectorProps {
  eventId: number;
  projectId?: number;
  onUpdate?: () => void;
  onClose?: () => void;
  onNavigateToEntity?: (entityId: number, folderId: number) => void;
}

const EventInspector: React.FC<EventInspectorProps> = ({
  eventId,
  projectId,
  onUpdate,
  onClose,
  onNavigateToEntity,
}) => {
  const { t } = useLanguage();

  const {
    event,
    linkedEntities,
    loading,
    searchTerm,
    setSearchTerm,
    searchResults,
    showResults,
    setShowResults,
    handleLinkEntity,
    handleUnlinkEntity,
    handleNotesUpdate,
  } = useEventInspector(eventId, projectId, onUpdate);

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
          Invocando Registro...
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="p-10 text-center text-rose-500 text-xs font-bold uppercase tracking-widest">
        Error: Hito no encontrado en el tejido temporal.
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      <div className="p-6 border-b border-foreground/5 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center gap-4 mb-4">
          <div className="size-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">
              event_note
            </span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">
              {event.fecha_simulada || "Fecha Desconocida"}
            </span>
            <h2 className="text-sm font-black text-foreground uppercase tracking-tight truncate">
              {event.titulo}
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-[9px] font-black uppercase tracking-widest transition-all"
          >
            Cerrar Inspector
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">
              Actores y Escenarios
            </h3>
            <span className="text-[9px] font-bold text-primary/60">
              {linkedEntities.length} Vinculados
            </span>
          </div>

          <div className="relative mb-4">
            <div className="flex items-center bg-foreground/[0.03] border border-foreground/10 focus-within:border-primary/40 transition-all">
              <span className="material-symbols-outlined text-lg text-foreground/20 ml-3">
                person_search
              </span>
              <input
                type="text"
                placeholder="Vincular personaje o lugar..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                className="w-full bg-transparent p-3 text-[11px] outline-none placeholder:text-foreground/20"
              />
            </div>

            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-editor-elevated border border-foreground/10 shadow-2xl">
                {searchResults.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => handleLinkEntity(res)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-primary/10 text-left border-b border-foreground/5 last:border-0 group"
                  >
                    <Avatar name={res.nombre} size="xs" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold group-hover:text-primary transition-colors">
                        {res.nombre}
                      </span>
                      <span className="text-[8px] font-black uppercase opacity-30">
                        {res.tipo}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {linkedEntities.map((ent) => (
              <div
                key={ent.id}
                onClick={() => onNavigateToEntity?.(ent.id, ent.carpeta_id!)}
                className="flex items-center gap-3 p-3 bg-foreground/5 border border-foreground/5 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <Avatar
                  name={ent.nombre}
                  size="sm"
                  className="rounded-none border border-foreground/10"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors block truncate">
                    {ent.nombre}
                  </span>
                  <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">
                    {ent.tipo}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnlinkEntity(ent.id);
                  }}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400/40 hover:text-red-400 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">
                    link_off
                  </span>
                </button>
              </div>
            ))}
            {linkedEntities.length === 0 && (
              <div className="p-8 text-center border border-dashed border-foreground/10 opacity-30">
                <span className="material-symbols-outlined text-3xl mb-2">
                  person_add
                </span>
                <p className="text-[9px] uppercase tracking-widest italic">
                  Víncula entidades para generar pistas en la línea temporal
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col h-[450px]">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4 px-2">
            Crónica Privada (Notas del GM)
          </h3>
          <div className="flex-1 border border-foreground/10 bg-foreground/[0.02] overflow-hidden">
            {(() => {
              const page: HojaModel = {
                id: event.id,
                titulo: event.titulo,
                contenido: event.descripcion || "",
                cuaderno_id: 0,
                orden: 0,
                created_at: "",
              };
              return (
                <ZenEditor
                  pages={[page]}
                  currentPageIndex={0}
                  onUpdate={(html) => handleNotesUpdate(html)}
                  onTitleChange={() => {}}
                  onCreatePage={() => {}}
                  onAutoDeletePage={() => {}}
                  onSnapshot={() => {}}
                  minimal={true}
                />
              );
            })()}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventInspector;
