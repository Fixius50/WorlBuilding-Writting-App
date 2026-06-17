import React from "react";
import { Evento } from "@domain/database";
import { useMiniTimeline } from "../hooks/useMiniTimeline";

type ChronologyOrder = "asc" | "desc";

interface TimelineChronologyStripProps {
  entityId: number;
  title?: string;
  maxItems?: number;
  order?: ChronologyOrder;
  onOpenEvent?: (event: Evento) => void;
}

const extractYear = (value: string | null): number | null => {
  if (!value || value === "?") return null;
  const match = value.match(/-?\d+/);
  return match ? parseInt(match[0], 10) : null;
};

const TimelineChronologyStrip: React.FC<TimelineChronologyStripProps> = ({
  entityId,
  title = "Cronologia de Timeline",
  maxItems = 10,
  order = "desc",
  onOpenEvent,
}) => {
  const { events, loading } = useMiniTimeline(entityId);

  const chronologyEvents = React.useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      const yearA = extractYear(a.fecha_simulada);
      const yearB = extractYear(b.fecha_simulada);

      if (yearA === null && yearB === null) return a.id - b.id;
      if (yearA === null) return 1;
      if (yearB === null) return -1;

      if (order === "asc") {
        if (yearA !== yearB) return yearA - yearB;
        return a.id - b.id;
      }

      if (yearA !== yearB) return yearB - yearA;
      return b.id - a.id;
    });

    return sorted.slice(0, Math.max(1, maxItems));
  }, [events, maxItems, order]);

  return (
    <section className="border border-[hsl(var(--foreground)/0.15)] bg-[hsl(var(--background)/0.75)] p-4">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground)/0.6)] mb-3">
        {title}
      </div>

      {loading && (
        <div className="text-[10px] text-[hsl(var(--foreground)/0.5)] italic py-4">
          Cargando cronologia...
        </div>
      )}

      {!loading && chronologyEvents.length === 0 && (
        <div className="text-[10px] text-[hsl(var(--foreground)/0.5)] italic py-4">
          No hay hitos registrados para esta entidad.
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {chronologyEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => {
              if (onOpenEvent) onOpenEvent(event);
            }}
            className="text-left border border-[hsl(var(--foreground)/0.12)] px-3 py-2 hover:border-[hsl(var(--primary)/0.45)] hover:bg-[hsl(var(--primary)/0.08)] transition-colors"
          >
            <div className="text-[9px] font-black uppercase tracking-[0.12em] text-[hsl(var(--primary))]">
              {event.fecha_simulada || "Sin fecha"}
            </div>
            <div className="text-[11px] font-black text-[hsl(var(--foreground))] line-clamp-1">
              {event.titulo || "Hito sin titulo"}
            </div>
            <div className="text-[10px] text-[hsl(var(--foreground)/0.62)] line-clamp-2">
              {event.descripcion || "Sin descripcion registrada."}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default TimelineChronologyStrip;

