import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useParams } from 'react-router-dom';
import api from '../../../js/services/api';
import BibleCard from '../../components/bible/BibleCard';

const BibleGridView = () => {
    const { username, projectName } = useParams();
    const { handleCreateEntity } = useOutletContext(); // Currently undefined in Layout, need to fix Layout logic or move it here
    // Actually, Layout removed handleCreateEntity from context. We should implement creation logic here or re-expose it.
    // For now, I'll implement local creation logic or assume we can move it to a service/hook eventually.

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

    // --- Action Handlers (Re-implemented locally for Grid View context) ---
    // Ideally these should be shared, but for speed I'll put them here or use a helper.
    const handleCreateFolder = async () => {
        const name = prompt("Folder Name:");
        if (!name) return;
        try {
            await api.post('/world-bible/folders', { nombre: name, padreId: null });
            loadRoot();
        } catch (e) { alert("Error creating folder"); }
    };

    const handleCreateTypedEntity = async (type) => {
        // Can't create entity at ROOT level properly without a folder? 
        // The previous system required a folder. "World Bible" root only showed folders.
        // If user wants entities at root, backend needs to support null folderId.
        // Assuming root only folders for now, IF user wants entities they typically go in a folder.
        // User asked: "rediseñar lo de dentro de la pagina de la biblia"
        // Let's assume Root = Folders only for organization, or we force a "General" folder?
        // Let's allow creating Folder at root. 
        // For Entities, if requested at root, we might need to ask "Which folder?" or create a generic one.
        // BUT, user said "restore create timeline/maps". 
        // Use a prompt or modal to select folder? Or just simple alert "Please enter a folder first"?
        alert("Please enter a folder to create entities, timelines, or maps.");
    };

    // Wait, the previous sidebar allowed creating at ROOT level? 
    // `ArchitectLayout` had `handleCreateEntity` which used `folders[0].id` as default if no folder selected.
    // Here we can do the same if we want.
    const defaultFolderId = folders.length > 0 ? folders[0].id : null;

    const createEntityInDefault = async (type) => {
        if (!defaultFolderId) {
            alert("No folders exist. Create a folder first!");
            return;
        }
        const name = prompt(`Name for new ${type}:`);
        if (!name) return;
        try {
            const res = await api.post('/world-bible/entities', {
                nombre: name,
                carpetaId: defaultFolderId,
                tipoEspecial: type
            });
            // Navigate to it
            // window.location.href = ... use navigate
            alert("Created in first folder. Go to folder to see it (or implement nav).");
        } catch (e) { console.error(e); }
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
                    <button onClick={handleCreateFolder} className="px-4 py-2 bg-surface-light border border-glass-border hover:border-primary/50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                        <span className="material-symbols-outlined text-sm">create_new_folder</span> Folder
                    </button>
                    <div className="h-8 w-px bg-glass-border mx-2"></div>
                    <button onClick={() => createEntityInDefault('entidadindividual')} className="px-4 py-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary-light rounded-xl text-xs font-bold flex items-center gap-2 transition-all" title="Create in first folder">
                        <span className="material-symbols-outlined text-sm">person</span> Character
                    </button>
                    <button onClick={() => createEntityInDefault('map')} className="px-4 py-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary-light rounded-xl text-xs font-bold flex items-center gap-2 transition-all" title="Create in first folder">
                        <span className="material-symbols-outlined text-sm">map</span> Map
                    </button>
                    <button onClick={() => createEntityInDefault('timeline')} className="px-4 py-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary-light rounded-xl text-xs font-bold flex items-center gap-2 transition-all" title="Create in first folder">
                        <span className="material-symbols-outlined text-sm">timeline</span> Timeline
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
                        linkTo={`/${username}/${projectName}/bible/folder/${folder.id}`}
                    />
                ))}

                {/* If we allow root entities later, map them here too */}
            </div>

            {folders.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-glass-border rounded-[3rem] opacity-30 mt-8">
                    <span className="material-symbols-outlined text-6xl mb-4 text-text-muted">library_books</span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Archive Empty</h3>
                    <p className="text-text-muted mt-2">Start by creating a folder structure for your world.</p>
                    <button onClick={handleCreateFolder} className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                        Create First Folder
                    </button>
                </div>
            )}
        </div>
    );
};

export default BibleGridView;
