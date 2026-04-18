import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Carpeta } from '@domain/models/database';

interface BreadcrumbsProps {
 path?: Carpeta[];
 currentFolder?: Carpeta | null;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path, currentFolder }) => {
 const { projectName } = useParams();
 // In local-first, we use /local/ProjectName
 const baseUrl = `/local/${projectName}/bible`;

 if (!path && !currentFolder) return null;

 return (
 <nav className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-foreground/60 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap py-2">
 <Link to={baseUrl} className="hover:text-indigo-400 transition-all flex items-center gap-2 group">
 <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100">home_storage</span>
 <span>Biblioteca</span>
 </Link>

 {path && path.map((item) => (
 <React.Fragment key={item.id}>
 <span className="text-foreground/10 font-thin">|</span>
 <Link
 to={`${baseUrl}/folder/${item.id}`}
 className="hover:text-indigo-400 transition-all"
 >
 {item.nombre}
 </Link>
 </React.Fragment>
 ))}

 {currentFolder && (
 <>
 <span className="text-foreground/10 font-thin">|</span>
 <span className="text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">{currentFolder.nombre}</span>
 </>
 )}
 </nav>
 );
};

export default Breadcrumbs;
