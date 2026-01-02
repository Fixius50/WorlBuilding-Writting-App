import React from 'react';
import { Link } from 'react-router-dom';

const getIconForType = (type) => {
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

const BibleCard = ({ item, type, linkTo, onContextMenu }) => {
    const isFolder = type === 'folder';

    return (
        <Link
            to={linkTo}
            onContextMenu={onContextMenu}
            className="group relative flex flex-col p-4 rounded-3xl bg-surface-dark border border-glass-border hover:border-primary/50 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`
                    size-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 
                    ${isFolder ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-muted group-hover:text-white'}
                `}>
                    <span className="material-symbols-outlined">
                        {isFolder ? 'folder' : getIconForType(item.tipoEspecial)}
                    </span>
                </div>

                {isFolder && (
                    <div className="px-2 py-1 rounded-lg bg-surface-light/50 border border-glass-border text-[10px] font-black text-white shadow-sm">
                        {item.itemCount || 0}
                    </div>
                )}
            </div>

            <div className="mt-auto">
                <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{item.nombre}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {isFolder ? 'Folder' : (item.tipoEspecial || 'Entity')}
                </p>
            </div>

            {/* Hover Indicator */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300">
                <span className="material-symbols-outlined text-primary text-sm">arrow_forward</span>
            </div>
        </Link>
    );
};

export default BibleCard;
