import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../../js/services/api';
import BibleCard from '../../components/bible/BibleCard';

const FolderView = () => {
    const { username, projectName, folderId } = useParams();
    const navigate = useNavigate();
    const [entities, setEntities] = useState([]);
    const [subfolders, setSubfolders] = useState([]);
    const [folder, setFolder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFolderContent();
    }, [folderId]);

    const loadFolderContent = async () => {
        setLoading(true);
        try {
            const [ents, subs, info] = await Promise.all([
                api.get(`/world-bible/folders/${folderId}/entities`),
                api.get(`/world-bible/folders/${folderId}/subfolders`),
                api.get(`/world-bible/folders/${folderId}`) // Assume we have this or can get name from list? 
                // If not, we might need a dedicated endpoint for folder details or just rely on IDs/cache.
                // Assuming we can get it:
            ]);
            setEntities(ents);
            setSubfolders(subs);
            setFolder(info || { name: 'Folder' }); // Fallback if endpoint not exact
        } catch (err) {
            console.error("Error loading folder content:", err);
            // Handle error, maybe folder deleted
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubfolder = async () => {
        const name = prompt("Subfolder Name:");
        if (!name) return;
        try {
            await api.post('/world-bible/folders', { nombre: name, padreId: folderId });
            loadFolderContent();
        } catch (e) { alert("Error creating folder"); }
    };

    const handleCreateEntity = async (type) => {
        const name = prompt(`Name for new ${type}:`);
        if (!name) return;
        try {
            await api.post('/world-bible/entities', {
                nombre: name,
                carpetaId: folderId,
                tipoEspecial: type
            });
            loadFolderContent();
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-text-muted">Loading folder...</div>;

    return (
        <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto">
            <header className="mb-8 flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link to={`/${username}/${projectName}/bible`} className="text-xs font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Root
                        </Link>
                        {/* Breadcrumbs could go here */}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl text-primary">folder_open</span>
                        <h1 className="text-4xl font-black text-white tracking-tighter">{folder?.nombre || 'Unnamed Folder'}</h1>
                    </div>

                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-2">
                    <button onClick={handleCreateSubfolder} className="px-4 py-2 bg-surface-light border border-glass-border hover:border-primary/50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                        <span className="material-symbols-outlined text-sm">create_new_folder</span> Subfolder
                    </button>
                    <div className="h-8 w-px bg-glass-border mx-2"></div>
                    <button onClick={() => handleCreateEntity('entidadindividual')} className="px-4 py-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary-light rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                        <span className="material-symbols-outlined text-sm">person</span> Character
                    </button>
                    <button onClick={() => handleCreateEntity('map')} className="px-4 py-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary-light rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                        <span className="material-symbols-outlined text-sm">map</span> Map
                    </button>
                    <button onClick={() => handleCreateEntity('timeline')} className="px-4 py-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary-light rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                        <span className="material-symbols-outlined text-sm">timeline</span> Timeline
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Subfolders */}
                {subfolders.map(sub => (
                    <BibleCard
                        key={sub.id}
                        item={sub}
                        type="folder"
                        linkTo={`/${username}/${projectName}/bible/folder/${sub.id}`}
                    />
                ))}

                {/* Entities */}
                {entities.map(entity => (
                    <BibleCard
                        key={entity.id}
                        item={entity}
                        type="entity"
                        linkTo={`/${username}/${projectName}/bible/entity/${entity.id}`} // Or helper for maps/timelines
                    />
                ))}
            </div>

            {subfolders.length === 0 && entities.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-glass-border rounded-[3rem] opacity-30 mt-8">
                    <p className="text-text-muted font-bold uppercase tracking-widest">Empty Folder</p>
                </div>
            )}
        </div>
    );
};

export default FolderView;
