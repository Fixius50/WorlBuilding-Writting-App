import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { calendarService, Calendario } from '@repositories/calendarService';
import Button from '@atoms/Button';
import GlassPanel from '@atoms/GlassPanel';
import { useLanguage } from '@context/LanguageContext';

const CalendarManagerView: React.FC = () => {
  const { t } = useLanguage();
  const { projectId } = useOutletContext<{ projectId: number }>();
  const [calendars, setCalendars] = useState<Calendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCalendar, setEditingCalendar] = useState<Partial<Calendario> | null>(null);

  const loadCalendars = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await calendarService.getByProject(projectId);
    setCalendars(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadCalendars();
  }, [loadCalendars]);

  const handleCreate = () => {
    setEditingCalendar({
      nombre: 'Nuevo Calendario',
      meses_json: JSON.stringify([{ nombre: 'Mes 1', dias: 30 }]),
      dias_semana_json: JSON.stringify(['Día 1', 'Día 2', 'Día 3']),
      fecha_inicio_json: JSON.stringify({ anio: 1, mes: 1, dia: 1 })
    });
  };

  const handleSave = async () => {
    if (!editingCalendar || !projectId) return;

    if (editingCalendar.id) {
        await calendarService.update(editingCalendar.id, editingCalendar);
    } else {
        await calendarService.create({
            nombre: editingCalendar.nombre!,
            project_id: projectId,
            meses_json: editingCalendar.meses_json!,
            dias_semana_json: editingCalendar.dias_semana_json!,
            fecha_inicio_json: editingCalendar.fecha_inicio_json!
        });
    }
    setEditingCalendar(null);
    loadCalendars();
  };

  return (
    <div className="h-full w-full p-8 overflow-y-auto no-scrollbar bg-background">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">
              Gestor de Tiempo
            </h1>
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
                {calendars.map(cal => (
                    <GlassPanel key={cal.id} className="p-6 group hover:border-primary/30 transition-all cursor-pointer" onClick={() => setEditingCalendar(cal)}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors">calendar_month</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">ID: {cal.id}</span>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tighter mb-2">{cal.nombre}</h3>
                        <div className="space-y-2 pt-4 border-t border-foreground/5">
                            <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest text-foreground/40">
                                <span>Meses</span>
                                <span className="text-foreground/60">{JSON.parse(cal.meses_json).length}</span>
                            </div>
                            <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest text-foreground/40">
                                <span>Días/Semana</span>
                                <span className="text-foreground/60">{JSON.parse(cal.dias_semana_json).length}</span>
                            </div>
                        </div>
                    </GlassPanel>
                ))}
            </div>
        )}

        {editingCalendar && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                <GlassPanel className="w-full max-w-2xl p-8 shadow-2xl border-primary/20">
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">edit_calendar</span>
                        Configurar Calendario
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Nombre del Calendario</label>
                            <input 
                                type="text" 
                                value={editingCalendar.nombre}
                                onChange={(e) => setEditingCalendar({ ...editingCalendar, nombre: e.target.value })}
                                className="w-full bg-foreground/5 border border-foreground/10 px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* EDITOR DE MESES */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Meses del Año</h4>
                                    <button 
                                        onClick={() => {
                                            const months = JSON.parse(editingCalendar.meses_json || '[]');
                                            months.push({ nombre: `Mes ${months.length + 1}`, dias: 30 });
                                            setEditingCalendar({ ...editingCalendar, meses_json: JSON.stringify(months) });
                                        }}
                                        className="size-5 bg-primary/20 text-primary rounded-full flex items-center justify-center hover:bg-primary/40 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xs">add</span>
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                                    {JSON.parse(editingCalendar.meses_json || '[]').map((m: any, idx: number) => (
                                        <div key={idx} className="flex gap-2 items-center bg-foreground/[0.03] p-2 border border-foreground/5">
                                            <input 
                                                type="text" value={m.nombre}
                                                onChange={(e) => {
                                                    const months = JSON.parse(editingCalendar.meses_json!);
                                                    months[idx].nombre = e.target.value;
                                                    setEditingCalendar({ ...editingCalendar, meses_json: JSON.stringify(months) });
                                                }}
                                                className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none"
                                            />
                                            <input 
                                                type="number" value={m.dias}
                                                onChange={(e) => {
                                                    const months = JSON.parse(editingCalendar.meses_json!);
                                                    months[idx].dias = parseInt(e.target.value) || 0;
                                                    setEditingCalendar({ ...editingCalendar, meses_json: JSON.stringify(months) });
                                                }}
                                                className="w-12 bg-foreground/5 text-center text-[10px] font-mono py-1 outline-none"
                                            />
                                            <button 
                                                onClick={() => {
                                                    const months = JSON.parse(editingCalendar.meses_json!);
                                                    months.splice(idx, 1);
                                                    setEditingCalendar({ ...editingCalendar, meses_json: JSON.stringify(months) });
                                                }}
                                                className="material-symbols-outlined text-xs text-red-400/40 hover:text-red-400 transition-colors"
                                            >
                                                delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* EDITOR DE DÍAS DE SEMANA */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Días de la Semana</h4>
                                    <button 
                                        onClick={() => {
                                            const days = JSON.parse(editingCalendar.dias_semana_json || '[]');
                                            days.push(`Día ${days.length + 1}`);
                                            setEditingCalendar({ ...editingCalendar, dias_semana_json: JSON.stringify(days) });
                                        }}
                                        className="size-5 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center hover:bg-indigo-500/40 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xs">add</span>
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                                    {JSON.parse(editingCalendar.dias_semana_json || '[]').map((d: string, idx: number) => (
                                        <div key={idx} className="flex gap-2 items-center bg-foreground/[0.03] p-2 border border-foreground/5">
                                            <input 
                                                type="text" value={d}
                                                onChange={(e) => {
                                                    const days = JSON.parse(editingCalendar.dias_semana_json!);
                                                    days[idx] = e.target.value;
                                                    setEditingCalendar({ ...editingCalendar, dias_semana_json: JSON.stringify(days) });
                                                }}
                                                className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none"
                                            />
                                            <button 
                                                onClick={() => {
                                                    const days = JSON.parse(editingCalendar.dias_semana_json!);
                                                    days.splice(idx, 1);
                                                    setEditingCalendar({ ...editingCalendar, dias_semana_json: JSON.stringify(days) });
                                                }}
                                                className="material-symbols-outlined text-xs text-red-400/40 hover:text-red-400 transition-colors"
                                            >
                                                delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-10">
                        <Button variant="ghost" onClick={() => setEditingCalendar(null)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSave}>Guardar Calendario</Button>
                    </div>
                </GlassPanel>
            </div>
        )}
      </div>
    </div>
  );
};

export default CalendarManagerView;
