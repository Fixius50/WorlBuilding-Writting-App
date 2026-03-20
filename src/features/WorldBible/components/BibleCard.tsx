import React from 'react';
import { Link } from 'react-router-dom';
import { Entidad, Carpeta } from '../../../database/types';

interface BibleCardProps {
 item: Entidad | Carpeta;
 type: 'entity' | 'folder';
 linkTo: string;
 onContextMenu?: (e: React.MouseEvent) => void;
 onDelete: (item: any) => void;
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

const BibleCard: React.FC<BibleCardProps> = ({ item, type, linkTo, onContextMenu, onDelete }) => {
 const isFolder = type === 'folder';
 const anyItem = item as any;

 return (
 <Link
 to={linkTo}
 onContextMenu={onContextMenu}
 className="group relative flex flex-col p-4 rounded-none monolithic-panel border border-foreground/10 hover:border-indigo-500/50 hover:bg-foreground/5 transition-all duration-300 overflow-hidden"
 >
 {/* Background Image & Overlay */}
 {anyItem.iconUrl && (
 <>
 <div className="absolute inset-0 z-0">
 <img
 src={anyItem.iconUrl}
 alt=""
 className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
 />
 </div>
 <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
 </>
 )}

 <div className="relative z-10 flex items-start justify-between mb-4">
 <div className={`
 size-12 rounded-none flex items-center justify-center text-xl transition-transform group-hover:scale-110 
 ${isFolder ? 'bg-indigo-500/20 text-indigo-400' : 'bg-foreground/5 text-foreground/60 group-hover:text-foreground border border-foreground/10'}
 `}>
 <span className="material-symbols-outlined">
 {isFolder ? 'folder' : getIconForType(anyItem.tipo)}
 </span>
 </div>

 {isFolder && anyItem.itemCount > 0 && (
 <div className="px-2 py-1 rounded-none sunken-panel/50 border border-foreground/10 text-[10px] font-black text-foreground shadow-sm ">
 {anyItem.itemCount}
 </div>
 )}
 </div>

 <div className="relative z-10 mt-auto">
 <h3 className="text-sm font-bold text-foreground truncate group-hover:text-indigo-400 transition-colors drop-shadow-md">{item.nombre}</h3>
 <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
 {isFolder ? 'Folder' : (anyItem.tipo || 'Entity')}
 </p>
 </div>

 {/* Hover Indicator / Actions */}
 <div className="absolute top-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
 {onDelete && (
 <button
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item); }}
 className="p-1.5 rounded-none bg-red-500/10 hover:bg-red-500 text-destructive hover:text-foreground transition-all border border-red-500/20 shadow-lg shadow-red-500/5 group/del "
 >
 <span className="material-symbols-outlined text-sm">delete</span>
 </button>
 )}
 <span className="material-symbols-outlined text-indigo-400 text-sm transform group-hover:translate-x-1 transition-transform drop-shadow-md">arrow_forward</span>
 </div>
 </Link>
 );
};

export default BibleCard;
