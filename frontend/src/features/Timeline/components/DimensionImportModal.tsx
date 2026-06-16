import React from 'react';
import { Entidad } from '@domain/database';
import { useLanguage } from '@context/LanguageContext';
import { useDimensionImportModal } from './useDimensionImportModal';

interface DimensionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDimensions: Entidad[];
  onImport: (entity: Entidad) => void;
}

const DimensionImportModal: React.FC<DimensionImportModalProps> = ({
  isOpen, onClose, availableDimensions, onImport
}) => {
  const { t } = useLanguage();
  const { handleImportSelect } = useDimensionImportModal(onImport, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 animate-in fade-in duration-300">
       <div className="w-full max-w-lg monolithic-panel p-12 bg-[hsl(var(--background))] border border-[hsl(var(--panel-border))] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
          <div className="mb-10 text-center">
             <h2 className="text-3xl font-black uppercase tracking-tighter text-[hsl(var(--foreground))] mb-3">Importar Dimensión</h2>
          </div>
          <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
             {availableDimensions.map(dim => (
                <button 
                  key={dim.id}
                  onClick={() => handleImportSelect(dim)}
                  className="w-full p-5 bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--divider-border))] hover:border-[hsl(var(--primary)/0.5)] flex items-center justify-between group transition-all"
                >
                  <div className="text-left">
                     <div className="text-[13px] font-black text-[hsl(var(--foreground))]">{dim.nombre}</div>
                     <div className="text-[9px] text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest">Dimension</div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100">add_circle</span>
                </button>
             ))}
             {availableDimensions.length === 0 && (
                <div className="py-10 text-center opacity-30 italic text-xs">No hay dimensiones disponibles para importar.</div>
             )}
          </div>
          <div className="mt-10 pt-8 border-t border-[hsl(var(--divider-border))] text-right">
             <button onClick={onClose} className="px-8 py-3 bg-[hsl(var(--foreground)/0.02)] text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.3)] hover:text-[hsl(var(--foreground))] transition-colors">{t('common.cancel')}</button>
          </div>
       </div>
    </div>
  );
};

export default DimensionImportModal;

