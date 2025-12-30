import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../js/services/api';
import GlassPanel from '../../components/common/GlassPanel';

const FolderView = () => {
    const { id, folderId } = useParams();
    const [entities, setEntities] = useState([]);
    const [subfolders, setSubfolders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFolderContent();
    }, [folderId]);

    const loadFolderContent = async () => {
        setLoading(true);
        try {
            const [ents, subs] = await Promise.all([
                api.get(`/world-bible/folders/${folderId}/entities`),
                api.get(`/world-bible/folders/${folderId}/subfolders`)
            ]);
            setEntities(ents);
            setSubfolders(subs);
        } catch (err) {
            console.error("Error loading folder content:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-text-muted">Loading archive...</div>;

    return (
        <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
            <header className="mb-12">
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary italic mb-2">
                    <span className="material-symbols-outlined text-sm">folder_open</span>
                    Archive Explorer
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter">Directory Content</h1>
            </header>

            <div className="space-y-12">
                {/* Subfolders Section */}
                {subfolders.length > 0 && (
                    <section>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 flex items-center gap-4">
                            Subdirectories
                            <div className="flex-1 h-px bg-glass-border"></div>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subfolders.map(sub => (
                                <Link
                                    key={sub.id}
                                    to={`/project/${id}/bible/folder/${sub.id}`}
                                    className="p-4 rounded-2xl bg-surface-light border border-glass-border hover:border-primary/40 transition-all flex items-center gap-4 group"
                                >
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">folder</span>
                                    </div>
                                    <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{sub.nombre}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Entities Section */}
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6 flex items-center gap-4">
                        Entities & Records
                        <div className="flex-1 h-px bg-glass-border"></div>
                    </h3>

                    {entities.length === 0 ? (
                        <div className="p-20 text-center border-2 border-dashed border-glass-border rounded-[40px] opacity-20">
                            <span className="material-symbols-outlined text-5xl mb-4">inventory_2</span>
                            <p className="text-sm font-bold uppercase tracking-widest">No records found in this sector</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {entities.map(entity => (
                                <Link
                                    key={entity.id}
                                    to={`/project/${id}/bible/entity/${entity.id}`}
                                    className="group"
                                >
                                    <GlassPanel className="p-6 border-white/5 group-hover:border-primary/30 transition-all h-full relative overflow-hidden">
                                        <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted group-hover:text-primary mb-4 transition-colors">
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-1">{entity.nombre}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-tighter text-text-muted/60 px-2 py-0.5 rounded bg-white/5 inline-block">
                                            {entity.tipoEspecial || 'Standard Entity'}
                                        </p>

                                        {/* Hover Effect */}
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-primary">arrow_forward</span>
                                        </div>
                                    </GlassPanel>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default FolderView;
