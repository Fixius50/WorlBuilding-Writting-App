import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrashUseCase, TrashItem } from '@application/useCases/TrashUseCase';
import { useLanguage } from '@context/LanguageContext';

interface OutletContext {
  projectId: number | null;
  projectName: string;
}

export default function TrashView() {
  const { projectId, projectName } = useOutletContext<OutletContext>();
  const { t } = useLanguage();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadItems();
    }
  }, [projectId]);

  const loadItems = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await TrashUseCase.getDeletedItems(projectId);
      setItems(data);
      setError(null);
    } catch (err) {
      // [LOG REMOVED]
      setError(t("trash.error_loading"));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (tipo: string, itemId: number) => {
    try {
      await TrashUseCase.restoreItem(tipo, itemId);
      loadItems(); 
    } catch (err) {
      // [LOG REMOVED]
    }
  };

  const handleDelete = async (tipo: string, itemId: number) => {
    try {
      await TrashUseCase.purgeItem(tipo, itemId);
      loadItems();
    } catch (err) {
      // [LOG REMOVED]
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-primary animate-pulse">
          {t("trash.loading_items")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden animate-in fade-in duration-700">
      {/* Header Zen */}
      <div className="px-8 lg:px-12 py-10 border-b border-foreground/5 bg-gradient-to-b from-foreground/[0.02] to-transparent">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-[1.25rem]">delete_outline</span>
              <h1 className="text-[0.75rem] font-black uppercase tracking-[0.3em] text-foreground/40">
                {t("trash.system_recovery")} / <span className="text-foreground">{t("trash.title")}</span>
              </h1>
            </div>
            <p className="text-[1.5rem] font-light text-foreground/90 tracking-tight">
              {t("trash.deleted_elements_of")} <span className="font-bold text-primary">{projectName}</span>
            </p>
          </div>
          <div className="text-right">
             <div className="text-[0.625rem] font-bold uppercase tracking-widest text-foreground/30 mb-1">Estado del Depósito</div>
             <div className="text-[0.75rem] font-mono text-primary/60">{items.length} {t("trash.objects_detected")}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/5 border border-red-500/20 p-4 mb-8 flex items-center gap-4">
             <span className="material-symbols-outlined text-red-500">warning</span>
             <span className="text-[0.75rem] text-red-400 font-medium uppercase tracking-wider">{error}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 grayscale">
            <div className="size-24 rounded-full border border-dashed border-foreground/40 flex items-center justify-center mb-6">
               <span className="material-symbols-outlined text-4xl">inventory_2</span>
            </div>
            <p className="text-[0.75rem] font-black uppercase tracking-[0.3em]">{t("trash.empty_state")}</p>
            <p className="text-[0.625rem] mt-2 font-medium">{t("trash.no_items_to_restore")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) => (
              <div 
                key={`${item.item_tipo}-${item.id}`}
                className="group relative bg-foreground/[0.02] border border-foreground/5 hover:border-primary/30 p-6 transition-all duration-500 hover:translate-y-[-2px]"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[3rem] font-black text-foreground/5 pointer-events-none select-none tracking-tighter italic">
                     {item.item_tipo === 'FOLDER' ? 'DIR' : 'ENT'}
                   </span>
                </div>

                <div className="flex items-start justify-between mb-6">
                  <div className={`size-10 flex items-center justify-center border ${item.item_tipo === 'FOLDER' ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' : 'border-indigo-500/20 bg-indigo-500/5 text-indigo-500'}`}>
                    <span className="material-symbols-outlined text-[1.25rem]">
                      {item.item_tipo === 'FOLDER' ? 'folder' : 'description'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.5rem] font-black uppercase tracking-widest text-foreground/30 mb-1">Eliminado</div>
                    <div className="text-[0.625rem] font-mono text-foreground/50">
                      {item.deleted_date ? new Date(item.deleted_date).toLocaleDateString() : t("trash.unknown_date")}
                    </div>
                  </div>
                </div>

                <h3 className="text-[1rem] font-bold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                  {item.nombre || "Sin Nombre"}
                </h3>
                <p className="text-[0.625rem] font-black uppercase tracking-widest text-foreground/40 mb-8 flex items-center gap-2">
                  <span className="size-1 rounded-full bg-foreground/20"></span>
                  {item.item_tipo === 'FOLDER' ? 'Carpeta del Sistema' : 'Entidad del Codex'}
                </p>

                <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(item.item_tipo, item.id)}
                    className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[0.625rem] font-black uppercase tracking-[0.15em] transition-all border border-emerald-500/20"
                  >
                    Restaurar
                  </button>
                  <button
                    onClick={() => handleDelete(item.item_tipo, item.id)}
                    className="flex-1 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[0.625rem] font-black uppercase tracking-[0.15em] transition-all border border-red-500/20"
                  >
                    Purgar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-8 lg:px-12 py-6 border-t border-foreground/5 bg-foreground/[0.01]">
         <p className="text-[0.5625rem] text-foreground/30 font-bold uppercase tracking-[0.2em] text-center">
           Los elementos restaurados volverán a su ubicación original en la jerarquía del Codex
         </p>
      </div>
    </div>
  );
}
