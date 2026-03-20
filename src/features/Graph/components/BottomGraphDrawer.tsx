import React, { useState, useEffect, useRef, useCallback } from 'react';
import GraphView from '../pages/GraphView'; // Import the graph component to render

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
 transition-all duration-300 ease-out shadow-2xl
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
 <div className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-foreground/10 relative bg-background">
 <div className="flex items-center gap-3">
 <div className="size-8 rounded-none bg-foreground/5 flex items-center justify-center text-foreground border border-foreground/10">
 <span className="material-symbols-outlined text-sm font-light">hub</span>
 </div>
 <h3 className="text-sm font-sans font-bold uppercase tracking-widest text-foreground/80">Red de Entidades</h3>
 </div>

 {/* Draggable indicator center */}
 <div 
 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-10 flex items-center justify-center cursor-pointer group"
 onClick={onClose}
 title="Cerrar Grafo"
 >
 <div className="w-12 h-1.5 rounded-none bg-foreground/10 group-hover:bg-foreground/30 transition-colors"></div>
 </div>

 <div className="flex items-center gap-2">
 <button 
 onClick={onClose}
 className="size-8 flex items-center justify-center rounded-none hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
 >
 <span className="material-symbols-outlined text-[18px]">close</span>
 </button>
 </div>
 </div>

 {/* Content Body */}
 <div className="flex-1 relative overflow-hidden bg-background sunken-panel">
 {isOpen && <GraphView />}
 </div>
 </div>
 );
};

export default BottomGraphDrawer;
