import React from 'react';
import GlassPanel from '@atoms/GlassPanel';
import Button from '@atoms/Button';
import { motion } from 'framer-motion';

const AnalyticsDashboard = () => {
  // Datos simulados (en producción vendrían de una consulta SQL agregada)
  const stats = [
    { label: 'Palabras Totales', value: '42,500', sub: '+1.2k hoy', icon: 'description', color: 'text-primary' },
    { label: 'Entidades Creadas', value: '158', sub: '24 ubicaciones', icon: 'account_tree', color: 'text-purple-400' },
    { label: 'Mapas Activos', value: '12', sub: '3 en edición', icon: 'map', color: 'text-amber-400' },
    { label: 'Tiempo de Escritura', value: '84h', sub: 'Promedio 2h/día', icon: 'timer', color: 'text-emerald-400' },
  ];

  // Generación de "Heatmap" simulado (30 días)
  const heatmapData = Array.from({ length: 30 }, (_, i) => ({
    day: i,
    intensity: Math.floor(Math.random() * 5), // 0 to 4
  }));

  return (
    <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700 overflow-y-auto custom-scrollbar">
      
      <header className="mb-12 space-y-2">
        <h1 className="text-4xl lg:text-5xl font-serif font-black text-foreground italic tracking-tight">Códice de Actividad</h1>
        <p className="text-sm text-foreground/40 font-bold uppercase tracking-[0.3em]">Métricas de Esfuerzo y Evolución del Mundo</p>
      </header>

      {/* Rila de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <GlassPanel key={i} className="p-6 border-b-4 border-b-transparent hover:border-b-primary transition-all group">
            <div className="flex items-start justify-between mb-4">
              <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20 group-hover:text-primary/40 transition-colors">Ver Detalle</span>
            </div>
            <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
            <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-[9px] font-black text-primary opacity-60 uppercase">{stat.sub}</div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* HEATMAP DE CONTRIBUCIÓN */}
        <div className="lg:col-span-2">
          <GlassPanel className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/60">Mapa de Calor: Intensidad de Escritura</h3>
              <div className="flex items-center gap-2">
                 <span className="text-[8px] text-foreground/30 uppercase font-black">Menos</span>
                 <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(v => (
                       <div key={v} className={`size-3 ${v === 0 ? 'bg-foreground/5' : v === 1 ? 'bg-primary/20' : v === 2 ? 'bg-primary/40' : v === 3 ? 'bg-primary/70' : 'bg-primary'}`} />
                    ))}
                 </div>
                 <span className="text-[8px] text-foreground/30 uppercase font-black">Más</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {heatmapData.map((data, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`size-6 lg:size-8 border border-foreground/5 transition-all hover:border-primary/50 cursor-pointer ${
                    data.intensity === 0 ? 'bg-foreground/5' : 
                    data.intensity === 1 ? 'bg-primary/20' : 
                    data.intensity === 2 ? 'bg-primary/40' : 
                    data.intensity === 3 ? 'bg-primary/70' : 'bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]'
                  }`}
                  title={`Día ${i + 1}: ${data.intensity * 500} palabras`}
                />
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-foreground/5 flex justify-between items-center">
               <div className="flex gap-8">
                  <div className="flex flex-col">
                     <span className="text-xl font-black text-foreground">12 días</span>
                     <span className="text-[9px] text-foreground/40 uppercase font-bold tracking-widest">Racha Actual</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-xl font-black text-foreground">22k</span>
                     <span className="text-[9px] text-foreground/40 uppercase font-bold tracking-widest">Este mes</span>
                  </div>
               </div>
               <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Configurar Metas</button>
            </div>
          </GlassPanel>
        </div>

        {/* SESIONES RECIENTES */}
        <div className="lg:col-span-1">
          <GlassPanel className="p-8 h-full flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/60 mb-6">Sesiones Recientes</h3>
            <div className="flex-1 space-y-4">
              {[
                { name: 'Capítulo 4: El Velo', time: '1h 20m', words: '1,450' },
                { name: 'Ficha: El Archiduque', time: '45m', words: '320' },
                { name: 'Mapa: Valle Sombrío', time: '2h 10m', words: '-' },
                { name: 'Línea de Tiempo', time: '15m', words: '-' },
              ].map((session, i) => (
                <div key={i} className="p-4 bg-foreground/5 border border-foreground/10 hover:border-primary/20 transition-all flex items-center justify-between group">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors">{session.name}</span>
                    <span className="text-[9px] text-foreground/30 uppercase tracking-tighter">HACE 2 HORAS</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-black text-foreground/80">{session.time}</div>
                    <div className="text-[9px] text-primary/60 font-black">{session.words} pal.</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 mt-6 border border-dashed border-foreground/20 hover:border-primary/40 text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all">
              Ver Historial Completo
            </button>
          </GlassPanel>
        </div>

      </div>

      {/* FOOTER: Análisis Predictivo (Mock) */}
      <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 via-transparent to-transparent border-l-4 border-l-primary flex items-center gap-8">
         <span className="material-symbols-outlined text-4xl text-primary animate-pulse">insights</span>
         <div className="space-y-1">
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Análisis del Oráculo</h4>
            <p className="text-[11px] text-foreground/60 leading-relaxed max-w-2xl">
               Basado en tu ritmo actual, completarás el primer arco de tu historia en aproximadamente <strong className="text-primary italic">24 días</strong>. Tu mayor productividad ocurre durante las sesiones nocturnas con un promedio de 850 palabras/hora.
            </p>
         </div>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;
