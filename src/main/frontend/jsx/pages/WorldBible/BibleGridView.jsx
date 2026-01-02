import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useParams } from 'react-router-dom';
import api from '../../../js/services/api';
import BibleCard from '../../components/bible/BibleCard';

const BibleGridView = () => {
    const { username, projectName } = useParams();
    const { handleOpenCreateModal } = useOutletContext();

    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRoot();
    }, [projectName]);

    const loadRoot = async () => {
        setLoading(true);
        try {
            const data = await api.get('/world-bible/folders');
            setFolders(data);
        } catch (err) {
            console.error("Error loading root:", err);
        } finally {
            setLoading(false);
        }
    };




    if (loading) return <div className="p-20 text-center animate-pulse text-text-muted">Loading World Bible...</div>;

    return (
        <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto">
            <header className="mb-8 flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary italic mb-2">
                        <span className="material-symbols-outlined text-sm">auto_stories</span>
                        World Bible
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Root Index</h1>
                    <p className="text-text-muted mt-2 max-w-lg text-sm">
                        The central archive of your world. Organize characters, locations, timelines, and maps.
                    </p>
                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenCreateModal(null)} className="px-6 py-2 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-sm">map</span> Nuevo Mapa
                    </button>
                </div>
            </header>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {folders.map(folder => (
                    <BibleCard
                        key={folder.id}
                        item={folder}
                        type="folder"
                        linkTo={`/${username}/${projectName}/bible/folder/${folder.slug || folder.id}`}
                    />
                ))}

                {/* If we allow root entities later, map them here too */}
            </div>

            {folders.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-glass-border rounded-[3rem] opacity-30 mt-8">
                    <span className="material-symbols-outlined text-6xl mb-4 text-text-muted">library_books</span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Archivo Vacío</h3>
                    <p className="text-text-muted mt-2">Comienza creando espacios para organizar tu mundo.</p>
                    <button onClick={() => handleOpenCreateModal(null)} className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                        Crear Primer Mapa
                    </button>
                </div>
            )}
        </div>
    );
};

export default BibleGridView;
