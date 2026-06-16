import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { useLanguage } from "@context/LanguageContext";
import { Evento } from "@domain/database";
import ConfirmationModal from "@organisms/ConfirmationModal";

// Custom Hooks & Components
import { useTimelineManager } from "../hooks/useTimelineManager";
import { useTimelineEditor } from "./useTimelineEditor";
import TimelineTrack from "../components/TimelineTrack";
import TimelineEventCard from "../components/TimelineEventCard";
import TimelineImportModal from "../components/TimelineImportModal";
import EntityPickerModal from "../components/EntityPickerModal";

const CHRONOLOGY_MAX_ITEMS = 10;
const CHRONOLOGY_ORDER_LABEL = "desc";
const CHRONOLOGY_ORDER_MULTIPLIER = -1;

const TimelineEditor: React.FC = () => {
  const { folderId } = useParams<{
    username: string;
    folderId: string;
  }>();
  const { t } = useLanguage();
  const location = useLocation();
  const isInBible = location.pathname.includes("/bible");

  // Business Logic Hook
  const {
    folder,
    lines,
    events,
    linkedEntities,
    projectEntities,
    availableDimensions,
    loading,
    calculateX,
    getYear,
    handleAddEvent,
    handleDeleteEvent,
    handleSaveEvent,
    handleToggleLinkEntity,
    handleImportDimension,
    handleRemoveDimension,
    involvedEntities,
  } = useTimelineManager(folderId);

  // UI Logic Hook
  const {
    editingId,
    setEditingId,
    editTitle,
    setEditTitle,
    editDesc,
    setEditDesc,
    editDate,
    setEditDate,
    deletingId,
    setDeletingId,
    isEntityPickerOpen,
    setIsEntityPickerOpen,
    currentEventForLinking,
    setCurrentEventForLinking,
    isImportModalOpen,
    setIsImportModalOpen,
    isExpanded,
    onEditStart,
    handleSaveEdit,
    handleConfirmDelete,
    handleAddEventAndEdit,
    getConnections,
  } = useTimelineEditor({
    t,
    events,
    linkedEntities,
    lines,
    involvedEntities,
    handleSaveEvent,
    handleDeleteEvent,
    handleAddEvent,
  });

  // Handlers
  const handleOpenInspector = (event: Evento) => {
    // Sin panel derecho: abrir edición directa del hito en el overlay local.
    onEditStart(event);
  };

  const chronologyEvents = React.useMemo(() => {
    const sortedEvents = [...events].sort((a, b) => {
      const yearA = getYear(a.fecha_simulada) ?? 0;
      const yearB = getYear(b.fecha_simulada) ?? 0;

      switch (true) {
        case yearA !== yearB:
          return (yearA - yearB) * CHRONOLOGY_ORDER_MULTIPLIER;
        default:
          return (a.id - b.id) * CHRONOLOGY_ORDER_MULTIPLIER;
      }
    });

    return sortedEvents.slice(0, CHRONOLOGY_MAX_ITEMS);
  }, [events, getYear]);

  const renderTrack = (
    entityId: number | null,
    title: string,
    isMain: boolean = false,
  ) => {
    const lineEvents = isMain
      ? events.filter((ev) => ev.linea_id === null)
      : events.filter(
          (ev) =>
            linkedEntities[ev.id]?.some((ent) => ent.id === entityId) ||
            ev.linea_id === entityId,
        );

    const sortedEvents = lineEvents.sort(
      (a, b) =>
        (getYear(a.fecha_simulada) || 0) - (getYear(b.fecha_simulada) || 0),
    );

    return (
      <TimelineTrack
        key={entityId || "main"}
        entityId={entityId}
        title={title}
        isMain={isMain}
        isExpanded={isExpanded}
        calculateX={calculateX}
        onAddEvent={handleAddEventAndEdit}
        onRemoveDimension={handleRemoveDimension}
        eventsCount={sortedEvents.length}
        firstEventDate={sortedEvents[0]?.fecha_simulada}
        lastEventDate={sortedEvents[sortedEvents.length - 1]?.fecha_simulada}
      />
    );
  };

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.5em] opacity-20">
        Iniciando Motor Temporal...
      </div>
    );

  return (
    <div className="flex-1 flex flex-col h-full bg-[hsl(var(--background))] selection:bg-[hsl(var(--primary)/0.3)] overflow-hidden">
      {!isInBible && (
        <header className="relative z-40 py-8 px-10 border-b border-[hsl(var(--divider-border))] bg-[hsl(var(--background)/0.8)] flex flex-col items-center justify-center ">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] flex items-center justify-center text-[hsl(var(--primary))] shadow-[0_0_20px_hsl(var(--primary)/0.2)] mb-2">
              <span className="material-symbols-outlined text-2xl">lan</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="text-3xl font-black tracking-[-0.04em] text-[hsl(var(--foreground))] uppercase">
                  {folder?.nombre}
                </div>
                <div className="px-4 py-1 bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-widest rounded-full">
                  {t("timeline.multiverse_tag")}
                </div>
              </div>
              <p className="text-[11px] font-black text-[hsl(var(--foreground)/0.3)] uppercase tracking-[0.4em] translate-x-[0.2em]">
                {t("timeline.multiverse")}
              </p>
            </div>
          </div>
        </header>
      )}

      <section className="relative z-30 px-6 py-5 border-b border-[hsl(var(--divider-border))] bg-[hsl(var(--background)/0.8)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[hsl(var(--foreground)/0.6)]">
              Vista Cronologica de Timeline
            </div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-[hsl(var(--foreground)/0.45)] mt-1">
              Orden: {CHRONOLOGY_ORDER_LABEL} | Max: {CHRONOLOGY_MAX_ITEMS}
            </div>
          </div>
          <button
            onClick={() => {
              handleAddEventAndEdit(null);
            }}
            className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] border border-[hsl(var(--primary)/0.4)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] transition-colors"
          >
            Nuevo Hito
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {chronologyEvents.map((evt) => (
            <button
              key={evt.id}
              onClick={() => {
                handleOpenInspector(evt);
              }}
              className="text-left border border-[hsl(var(--foreground)/0.12)] bg-[hsl(var(--background)/0.65)] p-3 hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.08)] transition-all"
            >
              <div className="text-[9px] font-black uppercase tracking-[0.15em] text-[hsl(var(--primary))] mb-2">
                {evt.fecha_simulada || "Sin fecha"}
              </div>
              <div className="text-[13px] font-black text-[hsl(var(--foreground))] mb-1 line-clamp-1">
                {evt.titulo || "Hito sin titulo"}
              </div>
              <div className="text-[11px] text-[hsl(var(--foreground)/0.65)] line-clamp-2">
                {evt.descripcion || "Sin descripcion registrada."}
              </div>
            </button>
          ))}

          {chronologyEvents.length === 0 && (
            <div className="col-span-full border border-dashed border-[hsl(var(--foreground)/0.2)] p-6 text-center text-[11px] text-[hsl(var(--foreground)/0.55)] italic">
              No hay hitos registrados todavia en este timeline.
            </div>
          )}
        </div>
      </section>

      <main className="flex-1 overflow-auto custom-scrollbar relative bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.05),transparent)]">
        {/* Tracks Layer */}
        <div className="relative z-10">
          {renderTrack(null, t("timeline.main_line"), true)}
          {lines.map((line) => renderTrack(line.id, line.nombre))}
          {involvedEntities.map((entity) =>
            renderTrack(entity.id, entity.nombre),
          )}

          {/* Import Dimension Trigger */}
          <div className="flex flex-row min-h-[150px] opacity-20 hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-transparent to-[hsl(var(--foreground)/0.02)]">
            <div className="w-[300px] flex-shrink-0 flex items-center justify-center border-r border-[hsl(var(--divider-border))]">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex flex-col items-center gap-4 group"
              >
                <div className="size-8 border border-dashed border-[hsl(var(--foreground)/0.2)] flex items-center justify-center group-hover:border-[hsl(var(--primary)/0.5)] group-hover:text-[hsl(var(--primary))] transition-all">
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:scale-125">
                    input
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-[hsl(var(--foreground))]">
                  Importar Timeline
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Connections Layer (SVG) */}
        <div
          className={`absolute top-0 left-0 right-0 pointer-events-none z-15 ${isExpanded ? "w-[4000px]" : "w-full"}`}
          style={{ minHeight: "100%" }}
        >
          <svg className="w-full h-full absolute inset-0">
            {getConnections.map((conn) => {
              if (!conn) return null;
              const x = calculateX(conn.date);
              const yStart = conn.minIdx * 450 + 225;
              const yEnd = conn.maxIdx * 450 + 225;

              return (
                <line
                  key={`conn-${conn.eventId}`}
                  x1={`${x}%`}
                  y1={yStart}
                  x2={`${x}%`}
                  y2={yEnd}
                  stroke="hsl(var(--primary) / 0.2)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>
        </div>

        {/* Events Layer (Cards) */}
        <div
          className={`absolute top-0 left-0 right-0 pointer-events-none z-20 ${isExpanded ? "w-[4000px]" : "w-full"}`}
          style={{ minHeight: "100%" }}
        >
          <div className="ml-[300px] relative h-full">
            {events.map((event) => {
              const linkedIds =
                linkedEntities[event.id]?.map((e) => e.id) || [];
              const involvedInTracks = [
                ...(event.linea_id !== undefined && event.linea_id !== null
                  ? [event.linea_id]
                  : [null]),
                ...linkedIds,
              ].filter((id, index, self) => self.indexOf(id) === index);

              return involvedInTracks.map((trackId) => {
                let lineIndex = -1;
                if (trackId === null) lineIndex = 0;
                else {
                  const lIdx = lines.findIndex((l) => l.id === trackId);
                  if (lIdx !== -1) lineIndex = lIdx + 1;
                  else {
                    const iIdx = involvedEntities.findIndex(
                      (e) => e.id === trackId,
                    );
                    if (iIdx !== -1) lineIndex = lines.length + iIdx + 1;
                  }
                }

                if (lineIndex === -1) return null;

                return (
                  <TimelineEventCard
                    key={`${event.id}-${trackId}`}
                    event={event}
                    trackId={trackId}
                    posX={calculateX(event.fecha_simulada)}
                    posY={lineIndex * 450 + 225}
                    linkedEntities={linkedEntities[event.id] || []}
                    onOpenInspector={handleOpenInspector}
                    onEditStart={onEditStart}
                    onDeleteRequest={(id) => setDeletingId(id)}
                    onLinkRequest={(id) => {
                      setCurrentEventForLinking(id);
                      setIsEntityPickerOpen(true);
                    }}
                  />
                );
              });
            })}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ConfirmationModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title={t("timeline.delete_event")}
        message={t("common.are_you_sure_delete")}
        confirmText={t("common.confirm_delete")}
        type="danger"
      />

      <TimelineImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        availableDimensions={availableDimensions}
        onImport={(dim) => {
          handleImportDimension(dim.id);
          setIsImportModalOpen(false);
        }}
      />

      <EntityPickerModal
        isOpen={isEntityPickerOpen}
        onClose={() => setIsEntityPickerOpen(false)}
        projectEntities={projectEntities}
        onToggleLink={(entId) => {
          handleToggleLinkEntity(currentEventForLinking!, entId);
          setIsEntityPickerOpen(false);
        }}
      />

      {/* Inline Editor Overlay */}
      {editingId !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85">
          <div className="w-full max-md monolithic-panel p-8 bg-[hsl(var(--background))] border border-[hsl(var(--primary)/0.3)] shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase italic">
              Editar Hito
            </h3>
            <div className="space-y-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Título"
                className="w-full monolithic-panel p-4"
              />
              <input
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                placeholder="Fecha (Año)"
                className="w-full monolithic-panel p-4"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Descripción"
                className="w-full monolithic-panel p-4 h-32 resize-none"
              />
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest opacity-60"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineEditor;
