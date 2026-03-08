import React from 'react';
import { Link, useParams } from 'react-router-dom';

const Breadcrumbs = ({ path, currentFolder }) => {
    const { username, projectName } = useParams();
    const baseUrl = `/${username}/${projectName}/bible`;

    if (!path && !currentFolder) return null;

    return (
        <nav className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link to={baseUrl} className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">home</span>
                Bible
            </Link>

            {path && path.map((item, index) => (
                <React.Fragment key={item.id}>
                    <span className="text-slate-700">/</span>
                    <Link
                        to={`${baseUrl}/folder/${item.slug || item.id}`}
                        className="hover:text-primary transition-colors"
                    >
                        {item.nombre}
                    </Link>
                </React.Fragment>
            ))}

            {currentFolder && (
                <>
                    <span className="text-slate-700">/</span>
                    <span className="text-white bg-white/5 px-2 py-0.5 rounded">{currentFolder.nombre}</span>
                </>
            )}
        </nav>
    );
};

export default Breadcrumbs;
