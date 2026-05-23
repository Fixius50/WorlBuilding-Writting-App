import React from "react";
import { useOutletContext } from "react-router-dom";
import Button from "@atoms/Button";
import MonolithicPanel from "@atoms/MonolithicPanel";
import { useCalendarManager } from "./useCalendarManager";

const CalendarManagerView: React.FC = () => {
  const { projectId } = useOutletContext<{ projectId: number }>();

  const {
    calendars,
    loading,
    editingCalendar,
    setEditingCalendar,
    handleCreate,
    handleSave,
    handleAddMonth,
    handleRemoveMonth,
    handleUpdateMonth,
    handleAddDay,
    handleRemoveDay,
    handleUpdateDay,
    updateEditingCalendar,
  } = useCalendarManager(projectId);

  return (
    <div className="h-full w-full p-8 overflow-y-auto no-scrollbar bg-background">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <p className="text-xs text-foreground/40 font-bold uppercase tracking-[0.2em] mt-2 italic">
              Configuración de calendarios fantásticos y cronologías paralelas
            </p>
          </div>
          <Button variant="primary" icon="add" onClick={handleCreate}>
            Crear Calendario
          </Button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calendars.map((cal) => (
              <MonolithicPanel
                key={cal.id}
                className="p-6 group hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => setEditingCalendar(cal)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors">
                    calendar_month
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                    ID: {cal.id}
                  </span>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">
                  {cal.nombre}
                </h3>
                <div className="space-y-2 pt-4 border-t border-foreground/5">
                  <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest text-foreground/40">
                    <span>Meses</span>
                    <span className="text-foreground/60">
                      {JSON.parse(cal.meses_json || "[]").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest text-foreground/40">
                    <span>Días/Semana</span>
                    <span className="text-foreground/60">
                      {JSON.parse(cal.dias_semana_json || "[]").length}
                    </span>
                  </div>
                </div>
              </MonolithicPanel>
            ))}
          </div>
        )}

        {editingCalendar && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80  animate-in fade-in duration-300">
            <MonolithicPanel className="w-full max-w-2xl p-8 shadow-2xl border-primary/20">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  edit_calendar
                </span>
                Configurar Calendario
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">
                    Nombre del Calendario
                  </label>
                  <input
                    type="text"
                    value={editingCalendar.nombre}
                    onChange={(e) =>
                      updateEditingCalendar({ nombre: e.target.value })
                    }
                    className="w-full bg-foreground/5 border border-foreground/10 px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* EDITOR DE MESES */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">
                        Meses del Año
                      </h4>
                      <button
                        onClick={handleAddMonth}
                        className="size-5 bg-primary/20 text-primary rounded-full flex items-center justify-center hover:bg-primary/40 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xs">
                          add
                        </span>
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                      {JSON.parse(editingCalendar.meses_json || "[]").map(
                        (m: { nombre: string; dias: number }, idx: number) => (
                          <div
                            key={idx}
                            className="flex gap-2 items-center bg-foreground/[0.03] p-2 border border-foreground/5"
                          >
                            <input
                              type="text"
                              value={m.nombre}
                              onChange={(e) =>
                                handleUpdateMonth(idx, {
                                  nombre: e.target.value,
                                })
                              }
                              className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none"
                            />
                            <input
                              type="number"
                              value={m.dias}
                              onChange={(e) =>
                                handleUpdateMonth(idx, {
                                  dias: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-12 bg-foreground/5 text-center text-[10px] font-mono py-1 outline-none"
                            />
                            <button
                              onClick={() => handleRemoveMonth(idx)}
                              className="material-symbols-outlined text-xs text-red-400/40 hover:text-red-400 transition-colors"
                            >
                              delete
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* EDITOR DE DÍAS DE SEMANA */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        Días de la Semana
                      </h4>
                      <button
                        onClick={handleAddDay}
                        className="size-5 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center hover:bg-indigo-500/40 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xs">
                          add
                        </span>
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                      {JSON.parse(editingCalendar.dias_semana_json || "[]").map(
                        (d: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex gap-2 items-center bg-foreground/[0.03] p-2 border border-foreground/5"
                          >
                            <input
                              type="text"
                              value={d}
                              onChange={(e) =>
                                handleUpdateDay(idx, e.target.value)
                              }
                              className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none"
                            />
                            <button
                              onClick={() => handleRemoveDay(idx)}
                              className="material-symbols-outlined text-xs text-red-400/40 hover:text-red-400 transition-colors"
                            >
                              delete
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-10">
                <Button
                  variant="ghost"
                  onClick={() => setEditingCalendar(null)}
                >
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Guardar Calendario
                </Button>
              </div>
            </MonolithicPanel>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarManagerView;
