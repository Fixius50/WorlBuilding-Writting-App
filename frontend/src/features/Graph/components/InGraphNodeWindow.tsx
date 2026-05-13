import React from 'react';
import { useInGraphNodeWindow } from './useInGraphNodeWindow';

type GraphNode = { id: string; group?: string; data: Record<string, unknown>; label?: string; nombre?: string; category?: string; isFull?: boolean; isStub?: boolean; };

const InGraphNodeWindow = ({ node, elements, onClose, onCenter, onLock, isPinned }: { node: GraphNode | null, elements: GraphNode[], onClose?: () => void, onCenter?: () => void, onLock?: () => void, isPinned?: boolean }) => {
  const {
    activeTab,
    setActiveTab,
    details,
    loading,
    data,
    attributes,
    relations,
    categoryConfig
  } = useInGraphNodeWindow(node, elements);

  if (!node) return null;

  return (
    <div className={`w-[260px] flex flex-col shadow-2xl border-t-4 ${categoryConfig.color} bg-foreground/5 border border-foreground/40 pointer-events-none overflow-hidden transition-all duration-300`}>
      {/* Header - Transparent to clicks for drag passthrough */}
      <div className={`p-3 border-b border-foreground/10 flex items-center justify-between pointer-events-none text-drag-handle bg-foreground/5 select-none`}>
        <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
          <span className={`material-symbols-outlined text-[14px] ${categoryConfig.color.replace('border-', 'text-')}`}>
            {categoryConfig.icon}
          </span>
          <h3 className={`text-[10px] font-serif font-black truncate uppercase tracking-tight text-foreground`}>{node.label || node.nombre}</h3>
        </div>
        <div className="flex gap-1">
          <button onClick={onCenter} className="p-1 hover:bg-foreground/10 rounded-none text-foreground/60 transition-colors pointer-events-auto" title="Centrar Arcano">
            <span className="material-symbols-outlined text-xs">center_focus_strong</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs - Interactive */}
      <div className="flex bg-foreground/5 text-[8px] font-black uppercase tracking-widest border-b border-foreground/10 pointer-events-auto">
        {['ESENCIA', 'RELACIONES', 'CRÓNICA'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 transition-all ${activeTab === tab ? 'bg-foreground/5 text-primary border-b border-primary' : 'text-foreground/60 hover:text-foreground/60'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area - Narrower and Taller */}
      <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar bg-foreground/5 pointer-events-auto">
        {loading && !details ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-20">
            <div className="size-4 border-2 border-primary border-t-transparent animate-spin rounded-full mb-2"></div>
            <span className="text-[8px] uppercase tracking-widest font-bold">Invocando datos...</span>
          </div>
        ) : (
          <>
            {activeTab === 'ESENCIA' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-foreground/60 tracking-widest">Resumen Etéreo</span>
                  <p className="text-xs text-foreground/60 leading-relaxed italic border-l border-foreground/40 pl-3">
                    {data.description ? String(data.description) : (data.summary ? String(data.summary) : "Ningún cronista ha registrado detalles sobre esta entidad.")}
                  </p>
                </div>

                {attributes.length > 0 && (
                  <div className="grid grid-cols-1 gap-1.5 pt-2">
                    {attributes.map(([key, value]) => {
                      const displayValue = String(value);
                      return (
                        <div key={key} className="flex justify-between items-center p-2 rounded bg-background border border-foreground/10">
                          <span className="text-[8px] font-bold text-foreground/60 uppercase">{key.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-foreground/60 truncate ml-4 font-medium" title={displayValue}>
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'RELACIONES' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                {relations.length === 0 ? (
                  <p className="text-[10px] text-foreground/60 italic py-8 text-center">Sin hilos de causalidad activos.</p>
                ) : (
                  relations.map(rel => (
                    <div key={rel.id} className="flex items-center justify-between p-2.5 rounded bg-background border border-foreground/10 group/rel">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="size-1 rounded-full bg-primary/40 group-hover/rel:bg-primary transition-colors"></span>
                        <span className="text-[10px] text-foreground/60 font-medium truncate">{rel.otherLabel}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[7px] font-black uppercase tracking-tighter shrink-0">
                        {rel.edgeLabel}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'CRÓNICA' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex flex-col items-center justify-center py-12 opacity-30 text-foreground/60">
                  <span className="material-symbols-outlined text-3xl mb-2">history_edu</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">Cronología sellada</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-2 bg-background/30 border-t border-foreground/10 flex gap-2 pointer-events-auto">
        <button className="flex-1 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded text-[9px] font-black uppercase tracking-widest transition-all">
          Abrir en Archivador
        </button>
      </div>
    </div>
  );
};

export default React.memo(InGraphNodeWindow);

