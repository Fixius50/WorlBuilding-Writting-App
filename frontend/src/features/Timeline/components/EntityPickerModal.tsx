import React from 'react';
import { Entidad } from '@domain/models/database';
import { useLanguage } from '@context/LanguageContext';
import { useEntityPickerModal } from './useEntityPickerModal';

interface EntityPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectEntities: Entidad[];
  onToggleLink: (entityId: number) => void;
}

const EntityPickerModal: React.FC<EntityPickerModalProps> = ({
  isOpen, onClose, projectEntities, onToggleLink
}) => {
  const { t } = useLanguage();
  const { handleToggleSelect } = useEntityPickerModal(onToggleLink, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 animate-in fade-in duration-300">
       <div className="w-full max-w-xl monolithic-panel p-10 bg-[hsl(var(--background))] border border-[hsl(var(--panel-border))] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--primary))]" />
          <div className="flex items-center justify-between mb-8">
             <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-[hsl(var(--foreground))]">{t('timeline.link_entity')}</h2>
                <p className="text-[10px] text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest mt-2">Vincular personaje o lugar</p>
             </div>
             <button onClick={onClose} className="size-10 flex items-center justify-center bg-[hsl(var(--foreground)/0.05)] hover:bg-rose-500 hover:text-white transition-all shadow-inner">
                <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          <div className="max-h-[450px] overflow-y-auto pr-4 space-y-3 custom-scrollbar">
             {projectEntities.map(ent => (
                <button 
                  key={ent.id}
                  onClick={() => handleToggleSelect(ent.id)}
                  className="w-full p-5 bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--divider-border))] hover:border-[hsl(var(--primary)/0.5)] flex items-center justify-between group transition-all hover:bg-[hsl(var(--primary)/0.03)]"
                >
                  <div className="flex items-center gap-5">
                     <div className="size-10 bg-[hsl(var(--foreground)/0.05)] flex items-center justify-center group-hover:text-[hsl(var(--primary))] transition-all">
                        <span className="material-symbols-outlined">person</span>
                     </div>
                     <div className="text-left">
                        <div className="text-[13px] font-black text-[hsl(var(--foreground))]">{ent.nombre}</div>
                        <div className="text-[9px] text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest font-bold">{ent.tipo}</div>
                     </div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 transition-opacity">add_link</span>
                </button>
             ))}
          </div>
          <div className="mt-10 pt-8 border-t border-[hsl(var(--divider-border))] text-right">
             <button onClick={onClose} className="px-8 py-3 bg-[hsl(var(--foreground)/0.02)] text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.3)] hover:text-[hsl(var(--foreground))] transition-colors">{t('common.cancel')}</button>
          </div>
       </div>
    </div>
  );
};

export default EntityPickerModal;

