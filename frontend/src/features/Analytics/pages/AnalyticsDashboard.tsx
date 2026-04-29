import React, { useEffect } from 'react';
import GlassPanel from '@atoms/GlassPanel';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { useDashboardStore } from '@store/useDashboardStore';
import { ResponsivePie } from '@nivo/pie';
import StatCard from '../components/StatCard';

const AnalyticsDashboard = () => {
  const { projectId } = useOutletContext<{ projectId: number }>();
  const { stats, isLoading, loadStats } = useDashboardStore();

  useEffect(() => {
    if (projectId) {
      loadStats(projectId);
    }
  }, [projectId, loadStats]);

  const cards = [
    { label: 'Palabras Totales', value: stats.wordCount.toLocaleString(), icon: 'description', color: 'text-primary' },
    { label: 'Entidades Creadas', value: stats.entityCount, icon: 'account_tree', color: 'text-purple-400' },
    { label: 'Hojas de Archivador', value: stats.pageCount, icon: 'auto_stories', color: 'text-amber-400' },
    { label: 'Archivadores Activos', value: stats.notebookCount, icon: 'folder_open', color: 'text-emerald-400' },
  ];

  return (
    <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700 overflow-y-auto custom-scrollbar">
      
      <header className="mb-12 space-y-2">
        <h1 className="text-4xl lg:text-5xl font-serif font-black text-foreground italic tracking-tight">Códice de Actividad</h1>
        <p className="text-sm text-foreground/40 font-bold uppercase tracking-[0.3em]">Métricas Reales de tu Universo</p>
      </header>

      {/* Rila de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((stat, i) => (
          <StatCard 
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* DISTRIBUCIÓN DE ENTIDADES (Real) */}
        <GlassPanel className="p-8 h-[450px] flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/60 mb-8">Distribución por Tipo de Entidad</h3>
          <div className="flex-1 min-h-0">
            {stats.entitiesByType.length > 0 ? (
              <ResponsivePie
                data={stats.entitiesByType}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.6}
                padAngle={2}
                cornerRadius={8}
                colors={{ scheme: 'nivo' }}
                borderWidth={0}
                theme={{
                  tooltip: { container: { background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', fontSize: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' } },
                  labels: { text: { fontSize: 10, fontWeight: 800, fill: 'hsl(var(--foreground))' } }
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-foreground/20 italic text-sm">
                 <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                 No hay entidades registradas aún
              </div>
            )}
          </div>
        </GlassPanel>

        {/* ANÁLISIS DE ACTIVIDAD (Heatmap) */}
        <GlassPanel className="p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/60">Consistencia Cronológica</h3>
            <div className="flex items-center gap-1">
               <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               <span className="text-[9px] text-emerald-500 font-black uppercase">En Línea</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
             <p className="text-2xl font-serif italic text-foreground/80 mb-6 leading-tight">
                "El ritmo del creador es el pulso de su mundo."
             </p>
             
             <div className="space-y-6">
                <div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">
                      <span>Progreso del Códice</span>
                      <span>{Math.min(100, Math.round((stats.entityCount / 50) * 100))}%</span>
                   </div>
                   <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min(100, (stats.entityCount / 50) * 100)}%` }}
                         className="h-full bg-primary"
                      />
                   </div>
                </div>
                
                <div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">
                      <span>Volumen de Crónicas</span>
                      <span>{Math.min(100, Math.round((stats.wordCount / 10000) * 100))}% de la meta</span>
                   </div>
                   <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min(100, (stats.wordCount / 10000) * 100)}%` }}
                         className="h-full bg-amber-500"
                      />
                   </div>
                </div>
             </div>
          </div>
        </GlassPanel>

      </div>

      {/* FOOTER: Análisis Predictivo */}
      <div className="p-8 bg-foreground/[0.02] border border-foreground/10 rounded-none flex items-center gap-8 relative overflow-hidden">
         <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
         <span className="material-symbols-outlined text-4xl text-primary opacity-50">insights</span>
         <div className="space-y-1 relative z-10">
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Resumen del Arquitecto</h4>
            <p className="text-[11px] text-foreground/60 leading-relaxed max-w-3xl">
               Has documentado un total de <strong className="text-foreground">{stats.entityCount} entidades</strong> y tejido <strong className="text-foreground">{stats.wordCount} palabras</strong> en tus crónicas. 
               La mayor densidad de conocimiento se concentra en la categoría <strong className="text-primary italic">{stats.entitiesByType[0]?.label || 'General'}</strong>. 
               Sigue esculpiendo el vacío; cada entrada fortalece la coherencia de tu universo.
            </p>
         </div>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;
