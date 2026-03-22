import React, { useState, useEffect, useRef, useCallback } from 'react';
import GraphView from '../pages/GeneralGraphView'; // Import the graph component to render

interface BottomGraphDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const BottomGraphDrawer: React.FC<BottomGraphDrawerProps> = ({ isOpen, onClose }) => {
  const [heightVH, setHeightVH] = useState(70); // Default to 70vh
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    
    const newHeightPx = window.innerHeight - e.clientY;
    const newHeightVH = (newHeightPx / window.innerHeight) * 100;
    
    // Constraints: min 20vh, max 95vh
    if (newHeightVH > 20 && newHeightVH < 95) {
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
    <div
      style={{ height: isOpen ? `${heightVH}vh` : '0vh' }}
      className={`
        fixed bottom-0 left-0 right-0 z-[100] bg-background border-t border-foreground/10
        shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]
        flex flex-col
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
      `}
    >
      {/* Draggable Handle (The actual resize area) */}
      <div 
        onMouseDown={startResizing}
        className="absolute -top-1.5 left-0 right-0 h-3 cursor-ns-resize z-[110] hover:bg-foreground/5 transition-colors"
        title="Arrastra para redimensionar"
      />

      {/* Header Area */}
      <div className="h-14 shrink-0 flex items-center justify-center px-8 border-b border-foreground/10 relative bg-background">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-none bg-foreground/5 flex items-center justify-center text-foreground border border-foreground/10">
            <span className="material-symbols-outlined text-sm font-light">hub</span>
          </div>
          <h3 className="text-sm font-sans font-bold uppercase tracking-widest text-foreground/80">Red de Entidades</h3>
        </div>

        {/* Handle integrated into the panel line as the close button */}
        <button 
          className="absolute left-1/2 -top-6 -translate-x-1/2 w-12 h-6 flex items-center justify-center group z-[120] bg-background border border-b-0 border-foreground/10 hover:border-indigo-500/30 transition-all duration-300"
          onClick={onClose}
          title="Cerrar Grafo"
        >
          <span className="material-symbols-outlined text-sm text-foreground/40 group-hover:text-indigo-400 transition-colors group-hover:translate-y-0.5">expand_more</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 relative overflow-hidden bg-background sunken-panel">
        {isOpen && <GraphView />}
      </div>
    </div>
  );
};

export default BottomGraphDrawer;
