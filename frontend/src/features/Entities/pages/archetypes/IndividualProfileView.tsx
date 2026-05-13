import React from 'react';
import { useIndividualProfile } from './useIndividualProfile';
import SecondaryTabs from '@presentation/molecules/SecondaryTabs';
import DynamicAttributeForm from '@features/Entities/components/DynamicAttributeForm';
import MiniGraph from '@features/Entities/components/MiniGraph';

const IndividualProfileView: React.FC<{ entityId?: string | number }> = ({ entityId: propEntityId }) => {
  const {
    entity,
    loading,
    confirmDelete,
    activeTab,
    setActiveTab,
    handleDelete,
    projectName,
    username,
    navigate
  } = useIndividualProfile(propEntityId);

  const tabs = [
    { id: 'REGISTRO', label: 'REGISTRO', icon: 'menu_book' },
    { id: 'RED_DE_CONTACTOS', label: 'RED DE CONTACTOS / LINAJE', icon: 'hub' },
    { id: 'DATOS_TÉCNICOS', label: 'DATOS TÉCNICOS', icon: 'bar_chart' }
  ];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-foreground/20 font-black tracking-[0.4em] text-[10px] animate-pulse">
        SINCRONIZANDO REGISTRO...
      </div>
    </div>
  );

  if (!entity) return <div className="p-20 text-center text-destructive bg-background h-full font-black uppercase tracking-widest">404: ENTIDAD NO ENCONTRADA</div>;

  return (
    <div className="flex-1 bg-background flex flex-col h-full w-full animate-in fade-in duration-1000">
      <header className="bg-background border-b border-foreground/5 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
           <h1 className="text-lg font-black text-foreground tracking-tighter uppercase">
             {entity.nombre}
           </h1>
           <div className="px-3 py-1 bg-foreground/[0.03] border border-foreground/5 text-[9px] font-black uppercase tracking-widest text-foreground/20">
             {entity.tipo}
           </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
              onClick={handleDelete}
              className={`px-4 py-2 border transition-all text-[9px] font-black uppercase tracking-widest ${
                confirmDelete 
                ? 'bg-destructive text-white border-destructive animate-pulse' 
                : 'border-destructive/20 text-destructive/40 hover:bg-destructive hover:text-white'
              }`}
            >
               {confirmDelete ? '¿CONFIRMAR?' : 'ELIMINAR'}
            </button>

            <button 
              onClick={() => navigate(`/${username || 'local'}/${projectName}/bible`)}
              className="px-4 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all"
            >
               GUARDAR
            </button>

            <div className="h-4 w-px bg-foreground/10 mx-1" />

            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-foreground/10 text-foreground/40 text-[9px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
            >
               VOLVER / CANCELAR
            </button>
        </div>
      </header>

      <SecondaryTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="bg-foreground/[0.01] border-b border-foreground/5 shrink-0" />

      <div className={`flex-1 relative ${activeTab === 'RED_DE_CONTACTOS' ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'}`}>
        {activeTab === 'REGISTRO' && (
          <main className="p-12 lg:p-24 space-y-24 max-w-6xl mx-auto w-full">
            <section className="space-y-12">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] border-b border-primary/40 pb-2">CRÓNICA Y BIOGRAFÍA</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Identificador</label>
                    <div className="text-xs font-bold text-foreground/60 tabular-nums">#{entity.id}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Clasificación</label>
                    <div className="text-xs font-bold text-foreground/60 uppercase">{entity.tipo}</div>
                  </div>
                </div>
                <div className="text-lg text-foreground/80 leading-relaxed font-light italic first-letter:text-4xl first-letter:font-black first-letter:text-primary first-letter:mr-1 first-letter:float-left">
                  {entity.descripcion || "Sin descripción."}
                </div>
              </div>
            </section>
            {entity.images && entity.images.length > 0 && (
              <section className="space-y-12 pt-12 border-t border-foreground/5">
                <div className="flex flex-col items-center gap-4">
                  <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">REGISTROS VISUALES</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {entity.images.map((img, idx) => (
                    <div key={idx} className="aspect-video bg-foreground/[0.02] border border-foreground/5 overflow-hidden group transition-all">
                      <img src={img} alt={`Evidence ${idx}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                  ))}
                </div>
              </section>
            )}

          </main>
        )}

        {activeTab === 'RED_DE_CONTACTOS' && (
          <div className="w-full h-full relative bg-background">
            <MiniGraph entityId={Number(entity.id)} />
          </div>
        )}

        {activeTab === 'DATOS_TÉCNICOS' && (
          <div className="p-12 lg:p-24 max-w-5xl mx-auto">
            <DynamicAttributeForm entity={entity} />
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualProfileView;

