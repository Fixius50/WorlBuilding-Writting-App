import React, { useState, useEffect, useRef, useCallback } from 'react';
import GraphView from '../pages/GeneralGraphView';
import EntityDatabase from './EntityDatabase';
import NotebookManager from '@features/Writing/components/NotebookManager';
import { ResponsiveBar } from '@nivo/bar';

// --- Subcomponente de Gráficos (Movido para uso interno) ---
function WritingStatsChart({ pages }: { pages: any[] }) {
  const data = pages.map((p, i) => ({
    hoja: `H${i + 1}`,
    palabras: p.contenido?.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length || 0,
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveBar
        data={data}
        keys={['palabras']}
        indexBy="hoja"
        margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={['hsl(var(--primary))']}
        enableLabel={false}
        theme={{
          text: { fontSize: 8, fontWeight: 900, fontFamily: 'monospace' },
          axis: {
            domain: { line: { stroke: 'hsl(var(--foreground) / 0.1)' } },
            ticks: { line: { stroke: 'hsl(var(--foreground) / 0.1)' }, text: { fill: 'hsl(var(--foreground) / 0.3)' } },
            legend: { text: { fill: 'hsl(var(--foreground) / 0.2)', textTransform: 'uppercase', letterSpacing: '1px' } }
          },
          grid: { line: { stroke: 'hsl(var(--foreground) / 0.05)' } },
          tooltip: {
            container: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              fontSize: '10px',
              borderRadius: '0px',
              border: '1px solid hsl(var(--foreground) / 0.1)'
            }
          }
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Hojas',
          legendPosition: 'middle',
          legendOffset: 40,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Palabras',
          legendPosition: 'middle',
          legendOffset: -50,
        }}
        role="application"
      />
    </div>
  );
}

type PanelSection = 'graph' | 'database' | 'notes' | 'stats';

interface ControlPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  projectId?: number;
  projectName?: string;
  statsData?: any;
}

const SECTIONS: { id: PanelSection; icon: string; label: string }[] = [
  { id: 'graph', icon: 'hub', label: 'Red' },
  { id: 'database', icon: 'table_chart', label: 'Datos' },
  { id: 'notes', icon: 'sticky_note_2', label: 'Notas' },
  { id: 'stats', icon: 'analytics', label: 'Estadísticas' },
];

const ControlPanel: React.FC<ControlPanelProps> = ({ isOpen, onToggle, projectId, projectName, statsData }) => {
  const [heightVH, setHeightVH] = useState(65);
  const [activeSection, setActiveSection] = useState<PanelSection>('graph');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const isResizing = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    if (!isResizing.current) return;
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newHeightPx = window.innerHeight - e.clientY;
    const newHeightVH = (newHeightPx / window.innerHeight) * 100;
    if (newHeightVH > 20 && newHeightVH < 90) {
      setHeightVH(newHeightVH);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <>
      {/* ── Toggle button — siempre visible, flotante en la misma posición ── */}
      <button
        onClick={onToggle}
        className={`
          fixed bottom-6 left-1/2 -translate-x-1/2 z-[110]
          flex items-center gap-2 px-5 py-2
          border transition-all duration-300 shadow-2xl group
          font-black text-[0.65rem] uppercase tracking-widest
          ${isOpen
            ? 'bg-primary/10 border-primary/50 text-primary hover:bg-primary/20 shadow-primary/20'
            : 'bg-background border-foreground/10 text-foreground/60 hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-400'
          }
        `}
        title={isOpen ? 'Cerrar Panel de Control' : 'Abrir Panel de Control'}
      >
        <span className={`material-symbols-outlined text-[1.125rem] transition-transform duration-300 ${isOpen ? 'text-primary rotate-180' : 'text-indigo-500 group-hover:drop-shadow-[0_0_0.5rem_rgba(99,102,241,0.6)]'}`}>
          {isOpen ? 'expand_more' : 'dashboard'}
        </span>
        <span>{isOpen ? 'Cerrar Panel' : 'Panel de Control'}</span>

        {/* Indicador de sección activa cuando está abierto */}
        {isOpen && (
          <span className="flex items-center gap-1 pl-2 border-l border-primary/30 text-primary/60">
            <span className="material-symbols-outlined text-xs">
              {SECTIONS.find(s => s.id === activeSection)?.icon}
            </span>
            <span>{SECTIONS.find(s => s.id === activeSection)?.label}</span>
          </span>
        )}
      </button>

      {/* ── Panel drawer ── */}
      <div
        style={{ height: isOpen ? `${heightVH}vh` : '0vh' }}
        className={`
          fixed bottom-0 left-0 right-0 z-[100]
          bg-background border-t border-foreground/10
          shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]
          flex flex-col
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* Resize handle */}
        <div
          onMouseDown={startResizing}
          className="absolute -top-1.5 left-0 right-0 h-3 cursor-ns-resize z-[110] hover:bg-primary/10 transition-colors group"
          title="Arrastra para redimensionar"
        >
          {/* Indicador visual del handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-foreground/20 rounded-full group-hover:bg-primary/40 transition-colors" />
        </div>

        {/* ── Header con tabs de sección ── */}
        <div className="shrink-0 h-12 flex items-stretch border-b border-foreground/10 bg-foreground/[0.02] relative">
          {/* Título izquierda */}
          <div className="flex items-center gap-2 px-5 border-r border-foreground/10 shrink-0">
            <span className="material-symbols-outlined text-sm text-primary">dashboard</span>
            <span className="text-[0.65rem] font-black uppercase tracking-widest text-foreground/60">Panel de Control</span>
          </div>

          {/* Tabs de sección */}
          <div className="flex items-stretch flex-1">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  relative flex items-center gap-1.5 px-5 text-[0.65rem] font-black uppercase tracking-widest
                  transition-all duration-200 border-r border-foreground/[0.06]
                  ${activeSection === section.id
                    ? 'text-primary bg-primary/5'
                    : 'text-foreground/40 hover:text-foreground/80 hover:bg-foreground/5'
                  }
                `}
              >
                <span className="material-symbols-outlined text-sm">{section.icon}</span>
                <span className="hidden sm:inline">{section.label}</span>
                {activeSection === section.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Proyecto info derecha */}
          {projectName && (
            <div className="hidden md:flex items-center gap-2 px-5 border-l border-foreground/10 shrink-0 text-foreground/30">
              <span className="material-symbols-outlined text-xs">auto_stories</span>
              <span className="text-[0.6rem] font-bold truncate max-w-[10rem]">{projectName}</span>
            </div>
          )}
        </div>

        {/* ── Contenido de sección ── */}
        <div className="flex-1 relative overflow-hidden bg-background">
          {/* GRAFO */}
          <div className={`absolute inset-0 transition-opacity duration-200 ${activeSection === 'graph' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            {isOpen && <GraphView projectId={projectId} projectName={projectName} />}
          </div>

          {/* BASE DE DATOS */}
          <div className={`absolute inset-0 transition-opacity duration-200 ${activeSection === 'database' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            {isOpen && activeSection === 'database' && (
              <EntityDatabase projectId={projectId} />
            )}
          </div>

          {/* NOTAS */}
          <div className={`absolute inset-0 transition-opacity duration-200 ${activeSection === 'notes' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            {isOpen && activeSection === 'notes' && (
              <NotebookManager projectId={projectId ?? null} />
            )}
          </div>

          {/* ESTADÍSTICAS */}
          <div className={`absolute inset-0 transition-opacity duration-200 ${activeSection === 'stats' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            {isOpen && activeSection === 'stats' && (
              <div className="flex flex-col h-full bg-[#0a0a0a] p-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                  
                  {/* Columna Reloj y Estado */}
                  <div className="flex flex-col space-y-6">
                    <div className="p-8 bg-foreground/[0.03] border border-foreground/10 flex flex-col items-center justify-center space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Hora Actual</span>
                      <span className="text-5xl font-black tracking-tighter text-foreground tabular-nums">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest pt-2">
                        {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-foreground/[0.02] border border-foreground/5 flex flex-col space-y-1">
                        <span className="text-[8px] font-black uppercase text-foreground/40 tracking-widest">Palabras Hoy</span>
                        <span className="text-xl font-black text-foreground tabular-nums">{statsData?.wordsToday || 0}</span>
                      </div>
                      <div className="p-4 bg-foreground/[0.02] border border-foreground/5 flex flex-col space-y-1">
                        <span className="text-[8px] font-black uppercase text-foreground/40 tracking-widest">Páginas Totales</span>
                        <span className="text-xl font-black text-foreground tabular-nums">{statsData?.totalPages || 0}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/20 flex items-center gap-3">
                      <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">Sesión de Escritura Activa</span>
                    </div>
                  </div>

                  {/* Columna Gráfica Distribución */}
                  <div className="lg:col-span-2 flex flex-col space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">bar_chart</span>
                        Distribución por Hojas
                      </h3>
                      <span className="text-[9px] font-bold text-foreground/30 font-mono">PROYECTO: {projectName}</span>
                    </div>
                    
                    <div className="flex-1 bg-foreground/[0.01] border border-foreground/5 p-4 min-h-[300px]">
                      {statsData?.pages ? (
                        <WritingStatsChart pages={statsData.pages} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-foreground/20 space-y-2">
                          <span className="material-symbols-outlined text-4xl">edit_note</span>
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Abre un cuaderno para ver analíticas</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
