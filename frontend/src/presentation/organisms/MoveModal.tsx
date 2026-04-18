import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import GlassPanel from '@atoms/GlassPanel';
import Button from '@atoms/Button';
import { Carpeta } from '@domain/models/database';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetFolderId: number | null) => void;
  folders: Carpeta[];
  title: string;
  currentItemId: number;
  itemType: 'entity' | 'folder';
}

const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  folders,
  title,
  currentItemId,
  itemType
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredFolders = folders.filter(f => 
    f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !(itemType === 'folder' && f.id === currentItemId) // Prevent moving a folder into itself
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="monolithic-panel shadow-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col space-y-4 animate-in zoom-in-95 duration-300 overflow-hidden ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 text-sm">search</span>
          <input
            type="text"
            placeholder="Buscar destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-foreground/[0.03] border border-foreground/10 px-9 py-2 text-sm outline-none focus:border-primary/50 transition-all font-sans"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 min-h-[200px]">
          <button
            onClick={() => onConfirm(null)}
            className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm text-primary/60">home</span>
            Raíz del Proyecto
          </button>
          
          {filteredFolders.map(f => (
            <button
              key={f.id}
              onClick={() => onConfirm(f.id)}
              className="w-full text-left px-3 py-2 text-xs font-bold text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 flex items-center gap-2 group"
            >
              <span className="material-symbols-outlined text-sm text-foreground/30 group-hover:text-primary/60">folder</span>
              {f.nombre}
            </button>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MoveModal;
