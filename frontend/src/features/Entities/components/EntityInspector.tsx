import React from 'react';
import { Avatar } from "@components";
import { useLanguage } from '@context/LanguageContext';
import { useEntityInspector } from '../hooks/useEntityInspector';

interface EntityInspectorProps {
  entityId: number | string;
}

const EntityInspector: React.FC<EntityInspectorProps> = ({ entityId }) => {
  const { t } = useLanguage();
  const { entity, values, loading, handleNavigate } = useEntityInspector(entityId);

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="size-20 bg-foreground/10 mx-auto" />
        <div className="h-4 bg-foreground/10 w-2/3 mx-auto" />
        <div className="h-20 bg-foreground/5 w-full" />
      </div>
    );
  }

  if (!entity) return <div className="p-8 text-center opacity-40">Entidad no encontrada</div>;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Compacto */}
      <div className="p-6 border-b border-foreground/10 bg-foreground/[0.02]">
        <div className="flex flex-col items-center text-center gap-4">
          <Avatar name={entity.nombre} size="lg" className="rounded-none border border-primary/20 shadow-xl" />
          <div>
            <h2 className="text-lg font-serif italic font-black text-foreground leading-tight">{entity.nombre}</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 border border-primary/20 mt-1 inline-block">
              {entity.tipo}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Descripción Rápida */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">description</span>
            Resumen del Arcano
          </h3>
          <p className="text-xs text-foreground/70 leading-relaxed italic border-l-2 border-foreground/10 pl-4">
            {entity.descripcion || "Sin descripción disponible."}
          </p>
        </section>

        {/* Atributos Clave */}
        {values.length > 0 && (
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">inventory_2</span>
              Atributos de Campo
            </h3>
            <div className="space-y-2">
              {values.map(v => (
                <div key={v.id} className="flex justify-between items-center p-2 bg-foreground/[0.02] border border-foreground/5">
                  <span className="text-[9px] font-bold text-foreground/30 uppercase">{v.plantilla?.nombre}</span>
                  <span className="text-[10px] font-mono text-foreground/80">{v.valor}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Acciones */}
        <div className="pt-4 flex flex-col gap-2">
           <button 
             className="w-full py-3 bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
             onClick={handleNavigate}
           >
             Ver Perfil Completo
           </button>
        </div>
      </div>
    </div>
  );
};

export default EntityInspector;




