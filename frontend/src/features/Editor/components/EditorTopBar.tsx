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
}

const EditorTopBar: React.FC<EditorTopBarProps> = ({
  title,
  onTitleChange,
  wordCount,
  wordGoal,
  saving,
  onManualSnapshot,
  snapshots,
  onRestoreSnapshot
}) => {
  const progress = Math.min((wordCount / wordGoal) * 100, 100);
  const [showSnapshots, setShowSnapshots] = React.useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-background/40 border-b border-foreground/10 backdrop-blur-md select-none shrink-0 z-50">
      {/* LADO IZQUIERDO: Título */}
      <div className="flex items-center gap-4 flex-1">
        <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-transparent border-none text-foreground font-serif font-black text-lg outline-none focus:ring-0 w-full max-w-md placeholder:text-foreground/20"
          placeholder="Sin título..."
        />
      </div>

      {/* CENTRO: Snapshots */}
      <div className="relative">
        <button
          onClick={() => setShowSnapshots(!showSnapshots)}
          className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all text-[10px] font-black uppercase tracking-widest text-foreground/60"
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

      {/* LADO DERECHO: Meta de Palabras */}
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
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] font-black text-foreground leading-none">
              {wordCount.toLocaleString()} <span className="text-foreground/40 text-[9px] font-bold">/ {wordGoal.toLocaleString()}</span>
            </div>
            <div className="text-[9px] font-bold text-foreground/30 uppercase tracking-tighter">Palabras</div>
          </div>
          <div className="relative size-10">
             <svg className="size-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-foreground/10" strokeWidth="3" />
                <motion.circle 
                  cx="18" cy="18" r="16" fill="none" 
                  className="stroke-primary" 
                  strokeWidth="3" 
                  strokeDasharray="100, 100"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - progress }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  transform="rotate(-90 18 18)"
                />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-black text-primary">{Math.round(progress)}%</span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EditorTopBar;
