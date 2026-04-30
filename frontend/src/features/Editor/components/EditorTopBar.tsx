import React from 'react';
import { motion } from 'framer-motion';
import GlassPanel from '@atoms/GlassPanel';
import Button from '@atoms/Button';

interface EditorTopBarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  wordCount: number;
  wordGoal: number;
  saving: boolean;
  onManualSnapshot: () => void;
  snapshots: { id: number; timestamp: string }[];
  onRestoreSnapshot: (id: number) => void;
  minimal?: boolean;
}

const EditorTopBar: React.FC<EditorTopBarProps> = ({
  title,
  onTitleChange,
  wordCount,
  wordGoal,
  saving,
  onManualSnapshot,
  snapshots,
  onRestoreSnapshot,
  minimal = false,
}) => {
  const progress = Math.min((wordCount / wordGoal) * 100, 100);
  const [showSnapshots, setShowSnapshots] = React.useState(false);

  return (
    <header className={`${minimal ? 'h-12 px-4' : 'h-16 px-8'} flex items-center justify-between bg-background/40 border-b border-foreground/10 backdrop-blur-md select-none shrink-0 z-50`}>
      {/* LADO IZQUIERDO: Título */}
      <div className="flex items-center gap-3 flex-1">
        <span className={`material-symbols-outlined text-primary ${minimal ? 'text-lg' : 'text-xl'}`}>edit_note</span>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`bg-transparent border-none text-foreground font-serif font-black outline-none focus:ring-0 w-full max-w-md placeholder:text-foreground/20 ${minimal ? 'text-sm' : 'text-lg'}`}
          placeholder="Sin título..."
        />
      </div>

      {!minimal && (
        <>
          {/* CENTRO: Palabras, Reloj y Snapshots */}
          <div className="flex items-center gap-10">
            {/* RELOJ */}
            <Clock />

            <div className="flex flex-col items-center">
               <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[14px] font-serif font-black text-foreground leading-none">
                      {wordCount.toLocaleString()} <span className="text-foreground/40 text-[10px] font-bold italic">palabras</span>
                    </div>
                  </div>
                  
                  <div className="relative size-8">
                     <svg className="size-full" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-foreground/10" strokeWidth="4" />
                        <motion.circle 
                          cx="18" cy="18" r="16" fill="none" 
                          className="stroke-primary" 
                          strokeWidth="4" 
                          strokeDasharray="100, 100"
                          strokeLinecap="round"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 100 - progress }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          transform="rotate(-90 18 18)"
                        />
                     </svg>
                  </div>
               </div>
            </div>

            {/* SNAPSHOTS */}
            <div className="relative">
              <button
                onClick={() => setShowSnapshots(!showSnapshots)}
                className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary group"
              >
                <span className="material-symbols-outlined text-sm">history</span>
                <span>Snapshots</span>
                <span className="material-symbols-outlined text-sm transition-transform duration-300" style={{ transform: showSnapshots ? 'rotate(180deg)' : 'rotate(0)' }}>expand_more</span>
              </button>

              {showSnapshots && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSnapshots(false)} />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-background border border-foreground/10 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-foreground/5 flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Versiones Disponibles</span>
                      <button 
                        onClick={() => { onManualSnapshot(); setShowSnapshots(false); }}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Crear Snapshot ahora"
                      >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {snapshots.length === 0 ? (
                        <div className="p-4 text-center text-[10px] text-foreground/30 italic">No hay capturas previas</div>
                      ) : (
                        snapshots.map((snap) => (
                          <button
                            key={snap.id}
                            onClick={() => { onRestoreSnapshot(snap.id); setShowSnapshots(false); }}
                            className="w-full text-left p-3 hover:bg-primary/10 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex flex-col">
                              <span className="text-[10px] text-foreground font-bold">{new Date(snap.timestamp).toLocaleString()}</span>
                              <span className="text-[9px] text-foreground/40">ID: {snap.id}</span>
                            </div>
                            <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 text-primary transition-opacity">restore</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* LADO DERECHO: Guardado */}
          <div className="flex items-center gap-6 flex-1 justify-end">
            {saving && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-primary"
              >
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                <span className="text-[9px] font-black uppercase tracking-widest">Sincronizando...</span>
              </motion.div>
            )}
          </div>
        </>
      )}
    </header>
  );
};

function Clock() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center">
       <span className="text-[12px] font-black text-foreground/80 tracking-widest font-mono">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
       </span>
       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/20">Cronos Local</span>
    </div>
  );
}

export default EditorTopBar;
