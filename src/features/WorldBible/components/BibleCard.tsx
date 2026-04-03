import React from 'react';
import { Link } from 'react-router-dom';
import { Entidad, Carpeta } from '../../../database/types';

interface BibleCardItem {
  id: number | string;
  nombre: string;
  tipo?: string;
  iconUrl?: string;
  itemCount?: number;
}

interface BibleCardProps {
  item: BibleCardItem;
  type: 'entity' | 'folder';
  linkTo: string;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDelete: (item: BibleCardItem) => void;
  onRename?: (item: BibleCardItem) => void;
  onMove?: (item: BibleCardItem) => void;
}

const getIconForType = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'text': return 'notes';
    case 'short_text': return 'short_text';
    case 'number': return 'pin';
    case 'date': return 'calendar_today';
    case 'select': return 'list';
    case 'boolean': return 'check_box';
    case 'map': return 'map';
    case 'timeline': return 'timeline';
    case 'character': case 'entidadindividual': return 'person';
    case 'location': case 'zona': case 'construccion': return 'location_on';
    case 'culture': case 'entidadcolectiva': return 'groups';
    case 'universe': case 'galaxy': case 'system': case 'planet': return 'public';
    case 'entity_link': return 'link';
    default: return 'description';
  }
};

const BibleCard: React.FC<BibleCardProps> = ({ item, type, linkTo, onContextMenu, onDelete, onRename, onMove }) => {
  const isFolder = type === 'folder';

  return (
    <Link
      to={linkTo}
      onContextMenu={onContextMenu}
      className="group relative flex flex-col p-4 rounded-none monolithic-panel border border-foreground/10 hover:border-indigo-500/50 hover:bg-foreground/5 transition-all duration-300 overflow-hidden min-h-[160px]"
    >
      {/* Background Image & Overlay */}
      {item.iconUrl && (
        <>
          <div className="absolute inset-0 z-0">
            <img
              src={item.iconUrl}
              alt=""
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
        </>
      )}

      <div className="relative z-10 flex items-start justify-between mb-2">
        <div className={`
          size-12 rounded-none flex items-center justify-center text-xl transition-transform group-hover:scale-110 
          ${isFolder ? 'bg-indigo-500/20 text-indigo-400' : 'bg-foreground/5 text-foreground/60 group-hover:text-foreground border border-foreground/10'}
        `}>
          <span className="material-symbols-outlined">
            {isFolder 
              ? (item.tipo === 'TIMELINE' ? 'lan' : 'folder') 
              : getIconForType(item.tipo)}
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <h3 className="text-sm font-bold text-foreground truncate group-hover:text-indigo-400 transition-colors drop-shadow-md">{item.nombre}</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {isFolder 
            ? (item.tipo === 'TIMELINE' ? 'Dimensión' : 'Carpeta') 
            : (item.tipo || 'Entidad')}
        </p>
      </div>

      {/* Item Counter - Premium Glassmorphism Badge */}
      {isFolder && (item.itemCount || 0) > 0 && (
        <div className="absolute bottom-4 right-4 px-2 py-0.5 bg-white/[0.03] backdrop-blur-md border border-white/10 text-[9px] font-black text-foreground/50 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.5)] z-10 transition-all group-hover:border-indigo-500/30 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 uppercase tracking-tighter">
          {item.itemCount}
        </div>
      )}

      {/* Hover Indicator / Actions */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {onRename && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename(item); }}
            className="p-1.5 rounded-none bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-foreground transition-all border border-indigo-500/20 shadow-lg shadow-indigo-500/5"
            title="Rename"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        )}
        {onMove && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMove(item); }}
            className="p-1.5 rounded-none bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-foreground transition-all border border-indigo-500/20 shadow-lg shadow-indigo-500/5"
            title="Move"
          >
            <span className="material-symbols-outlined text-sm">drive_file_move</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item); }}
            className="p-1.5 rounded-none bg-red-500/10 hover:bg-red-500 text-destructive hover:text-foreground transition-all border border-red-500/20 shadow-lg shadow-red-500/5 group/del "
            title="Delete"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        )}
        <div className="ml-1 flex items-center justify-center size-7 bg-foreground/5 border border-foreground/10 text-indigo-400">
          <span className="material-symbols-outlined text-sm transform group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
        </div>
      </div>
    </Link>
  );
};

export default BibleCard;
