import React from 'react';
import { Link } from 'react-router-dom';
import { getHierarchyVisuals } from '@presentation/utils/hierarchyVisuals';

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

const BibleCard: React.FC<BibleCardProps> = ({ item, type, linkTo, onContextMenu, onDelete, onRename, onMove }) => {
  const isFolder = type === 'folder';
  const visuals = getHierarchyVisuals(item.tipo || (isFolder ? 'FOLDER' : 'UNIVERSE'));

  return (
    <Link
      to={linkTo}
      onContextMenu={onContextMenu}
      className="group relative flex flex-col p-6 rounded-none bg-foreground/[0.01] border border-foreground/10 hover:border-primary/40 hover:bg-foreground/[0.03] transition-all duration-500 overflow-hidden min-h-[220px]"
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
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </>
      )}

      <div className="relative z-10">
        <div className={`
          size-14 rounded-none flex items-center justify-center text-2xl transition-all duration-500
          ${isFolder ? 'bg-primary/5 border border-primary/10' : 'bg-foreground/[0.03] border border-foreground/10'}
          ${visuals.color}
        `}>
          <span className="material-symbols-outlined">
            {visuals.icon}
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-auto flex justify-between items-end">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-md font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{item.nombre}</h3>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 group-hover:text-foreground/60 transition-colors">
            {isFolder 
              ? (item.tipo === 'TIMELINE' ? 'Dimensión' : 'Carpeta') 
              : (item.tipo || 'Entidad')}
          </p>
        </div>

        {/* Item Counter Badge */}
        {isFolder && (item.itemCount || 0) > 0 && (
          <div className="size-6 bg-foreground/[0.03] border border-foreground/10 flex items-center justify-center rounded-full text-[9px] font-black text-foreground/40 group-hover:border-primary/30 group-hover:text-primary transition-all">
            {item.itemCount}
          </div>
        )}
      </div>

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
