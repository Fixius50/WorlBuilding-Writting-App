import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../../js/services/api';
import BibleCard from '../../components/bible/BibleCard';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import SpecializedTimeline from './Specialized/SpecializedTimeline';
import { getHierarchyType, HIERARCHY_TYPES } from '../../../js/constants/hierarchy_types';

const FolderView = () => {
    const { username, projectName, folderSlug } = useParams();
    const navigate = useNavigate();
    const {
        handleCreateEntity,
        handleDeleteEntity,
        handleDeleteFolder, // Added handle
        handleCreateSimpleFolder,
        folderSearchTerm,
        folderFilterType
    } = useOutletContext(); // Get handlers from Global Layout

    // Local state for data
    const [entities, setEntities] = useState([]);
    const [subfolders, setSubfolders] = useState([]); // New state
    const [folder, setFolder] = useState(null);
    const [path, setPath] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creationMenuOpen, setCreationMenuOpen] = useState(false);

    // Filter Logic using Global Context
    const filteredEntities = entities.filter(ent => {
        const matchesSearch = ent.nombre.toLowerCase().includes(folderSearchTerm || '');
        const matchesType = folderFilterType === 'ALL' ||
            (folderFilterType === 'MAP' && ent.tipoEspecial === 'map') ||
            (folderFilterType === 'TIMELINE' && ent.tipoEspecial === 'timeline') ||
            (folderFilterType === 'ENTITY' && (!ent.tipoEspecial || ent.tipoEspecial === 'entidadindividual'));
        return matchesSearch && matchesType;
    });

    const filteredSubfolders = subfolders.filter(sub => {
        const matchesSearch = sub.nombre.toLowerCase().includes(folderSearchTerm || '');
        return matchesSearch && folderFilterType === 'ALL';
    });

    useEffect(() => {
        const handleUpdate = (e) => {
            const { folderId, removeId, type, item, expand } = e.detail || {};
            // If we are in the affected folder
            if (folderId === (folder?.id || folderSlug)) {
                if (removeId) {
                    if (type === 'folder') {
                        setSubfolders(prev => prev.filter(f => f.id !== removeId));
                    } else {
                        setEntities(prev => prev.filter(ent => ent.id !== removeId));
                    }
                } else if (item && item.slug && item.slug !== folderSlug) {
                    // Slug changed (rename), redirect to new URL
                    navigate(`/${username}/${projectName}/bible/folder/${item.slug}`, { replace: true });
                } else {
                    loadFolderContent();
                }
            }
        };
        window.addEventListener('folder-update', handleUpdate);
        return () => window.removeEventListener('folder-update', handleUpdate);
    }, [folderSlug, folder?.id]);

    useEffect(() => {
        loadFolderContent();
    }, [folderSlug]);

    const loadFolderContent = async () => {
        setLoading(true);
        try {
            const [ents, subs, info] = await Promise.all([
                api.get(`/world-bible/folders/${folderSlug}/entities`),
                api.get(`/world-bible/folders/${folderSlug}/subfolders`),
                api.get(`/world-bible/folders/${folderSlug}`)
            ]);
            setEntities(ents);
            setSubfolders(subs || []);
            // Handle new response format { folder: ..., path: ... }
            if (info.folder) {
                setFolder(info.folder);
                setPath(info.path || []);
            } else {
                // Fallback for old/root?
                setFolder(info || { name: 'Folder' });
                setPath([]);
            }
        } catch (err) {
            console.error("Error loading folder content:", err);
            setFolder(null);
            setPath([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-text-muted">Loading sector...</div>;

    if (!folder) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-text-muted">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-20">folder_off</span>
                <h2 className="text-xl font-bold opacity-50">Folder Not Found</h2>
                <p className="text-sm opacity-30 mt-2">The sector you are looking for does not exist or has been moved.</p>
                <Link to={`/${username}/${projectName}/bible`} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-colors">
                    Return to Root
                </Link>
            </div>
        );
    }

    const isDashboard = folder && folder.tipo && (['UNIVERSE', 'GALAXY', 'SYSTEM', 'PLANET'].includes(folder.tipo) || folder.tipo === 'MAGIC');
    const typeInfo = folder ? getHierarchyType(folder.tipo) : HIERARCHY_TYPES.FOLDER;

    if (isDashboard) {
        return (
            <div className="flex-1 overflow-y-auto bg-[#0a0a0c] text-white w-full h-full relative">
                <div className={`w-full min-h-[300px] ${typeInfo.bgColor} relative flex items-end p-10 border-b border-white/5`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent opacity-80 pointer-events-none"></div>

                    <div className="absolute top-6 left-10 z-20">
                        <Breadcrumbs path={path} currentFolder={folder} />
                    </div>

                    <div className="relative z-10 flex gap-8 items-end w-full max-w-7xl mx-auto">
                        <div className={`w-32 h-32 rounded-3xl ${typeInfo.bgColor} border border-white/10 flex items-center justify-center shadow-2xl`}>
                            <span className={`material-symbols-outlined text-6xl ${typeInfo.color}`}>{typeInfo.icon}</span>
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 ${typeInfo.bgColor} ${typeInfo.color}`}>
                                    {typeInfo.label}
                                </div>
                                <span className="text-white/30 text-xs font-mono tracking-widest uppercase">ID: {folder.id}</span>
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter text-white mb-2">{folder.nombre}</h1>
                            <p className="text-lg text-white/50 max-w-2xl font-light leading-relaxed">
                                {folder.descripcion || "Sin descripción definida para este sector cosmológico."}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/new/entidadindividual`)}
                                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">person_add</span> Nueva Entidad
                            </button>
                            <button
                                onClick={() => navigate(`/${username}/${projectName}/map-editor/create/${folderSlug}`, { state: { folderId: folder?.id } })}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-glass-border"
                            >
                                <span className="material-symbols-outlined text-sm">map</span> Mapa
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <div className="bg-[#13141f] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Estadísticas</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl font-black text-white">{entities.length + subfolders.length}</div>
                                    <div className="text-[10px] text-white/40 uppercase">Elementos</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#13141f] border border-white/5 rounded-2xl p-6 h-64 flex flex-col">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Notas Rápidas</h3>
                            <textarea className="flex-1 bg-transparent resize-none outline-none text-sm text-white/70 placeholder-white/20" placeholder="Escribir notas de la zona..."></textarea>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Contenido Interno</h3>
                        {entities.length === 0 && subfolders.length === 0 && (
                            <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center">
                                <span className="material-symbols-outlined text-4xl text-white/20 mb-2">folder_open</span>
                                <p className="text-white/30 text-sm">Este sector está vacío.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredSubfolders.map(sub => (
                                <BibleCard
                                    key={sub.id}
                                    item={sub}
                                    type="folder"
                                    linkTo={`/${username}/${projectName}/bible/folder/${sub.slug || sub.id}`}
                                    onDelete={() => handleDeleteFolder(sub.id, folder?.id || folderSlug)}
                                />
                            ))}
                            {filteredEntities.map(entity => (
                                <BibleCard
                                    key={entity.id}
                                    item={entity}
                                    type="entity"
                                    linkTo={`/${username}/${projectName}/bible/folder/${folder.slug || folderSlug}/entity/${entity.slug || entity.id}`}
                                    onDelete={() => handleDeleteEntity(entity.id, folder?.id || folderSlug)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto">
            <header className="mb-8 flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link to={`/${username}/${projectName}/bible`} className="text-xs font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Root
                        </Link>
                        {folder && (
                            <span className={`px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 ${typeInfo.color}`}>{typeInfo.label}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-3xl ${typeInfo.color}`}>{typeInfo.icon}</span>
                        <h1 className="text-4xl font-black text-white tracking-tighter">{folder?.nombre || 'Unnamed Folder'}</h1>
                    </div>
                    <p className="text-white/50 text-sm mt-2 max-w-xl">{folder?.descripcion}</p>
                </div>

                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setCreationMenuOpen(!creationMenuOpen)}
                        className="h-10 px-6 rounded-xl bg-primary hover:bg-primary-light transition flex items-center gap-2 text-xs font-bold text-white shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>Añadir Elemento</span>
                    </button>

                    {creationMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-surface-dark border border-glass-border rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <button onClick={() => { navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/new/entidadindividual`); setCreationMenuOpen(false); }} className="w-full px-4 py-2.5 hover:bg-white/5 text-left text-xs font-bold flex items-center gap-3 text-white/70 hover:text-white">
                                <span className="material-symbols-outlined text-sm text-primary">person</span> Personaje
                            </button>
                            <button onClick={() => { navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/new/entidadcolectiva`); setCreationMenuOpen(false); }} className="w-full px-4 py-2.5 hover:bg-white/5 text-left text-xs font-bold flex items-center gap-3 text-white/70 hover:text-white">
                                <span className="material-symbols-outlined text-sm text-blue-400">groups</span> Cultura / Grupo
                            </button>
                            <button onClick={() => { navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/new/zona`); setCreationMenuOpen(false); }} className="w-full px-4 py-2.5 hover:bg-white/5 text-left text-xs font-bold flex items-center gap-3 text-white/70 hover:text-white">
                                <span className="material-symbols-outlined text-sm text-green-400">location_on</span> Lugar / Geografía
                            </button>
                            <button onClick={() => { navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/new/interaccion`); setCreationMenuOpen(false); }} className="w-full px-4 py-2.5 hover:bg-white/5 text-left text-xs font-bold flex items-center gap-3 text-white/70 hover:text-white">
                                <span className="material-symbols-outlined text-sm text-amber-400">history_edu</span> Lore / Interacción
                            </button>
                            <button onClick={() => { navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/new/efectos`); setCreationMenuOpen(false); }} className="w-full px-4 py-2.5 hover:bg-white/5 text-left text-xs font-bold flex items-center gap-3 text-white/70 hover:text-white">
                                <span className="material-symbols-outlined text-sm text-purple-400">magic_button</span> Objeto / Efecto
                            </button>
                            <div className="h-px bg-white/5 my-1" />
                            <button onClick={() => { navigate(`/${username}/${projectName}/map-editor/create/${folderSlug}`, { state: { folderId: folder?.id } }); setCreationMenuOpen(false); }} className="w-full px-4 py-2.5 hover:bg-white/5 text-left text-xs font-bold flex items-center gap-3 text-white/70 hover:text-white">
                                <span className="material-symbols-outlined text-sm text-red-400">map</span> Nuevo Mapa
                            </button>
                            <button onClick={() => { handleCreateSimpleFolder(folder, 'TIMELINE'); setCreationMenuOpen(false); }} className="w-full px-4 py-2.5 hover:bg-white/5 text-left text-xs font-bold flex items-center gap-3 text-white/70 hover:text-white">
                                <span className="material-symbols-outlined text-sm text-cyan-400">timeline</span> Timeline
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Filter Toolbar REMOVED - Moved to Global Right Panel */}

            {/* Specialized Views based on Folder Type */}
            {folder?.tipo === 'TIMELINE' ? (
                <SpecializedTimeline
                    entities={filteredEntities}
                    folderId={folderSlug}
                    onAddEvent={() => navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/new/evento`)}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredSubfolders.map(sub => (
                        <BibleCard
                            key={sub.id}
                            item={sub}
                            type="folder"
                            linkTo={`/${username}/${projectName}/bible/folder/${sub.slug || sub.id}`}
                            onDelete={() => handleDeleteFolder(sub.id, folder?.id || folderSlug)}
                        />
                    ))}
                    {filteredEntities.map(entity => {
                        const typePart = (entity.tipoEspecial === 'map' || entity.tipoEspecial === 'timeline') ? entity.tipoEspecial : 'entity';
                        return (
                            <BibleCard
                                key={entity.id}
                                item={entity}
                                type="entity"
                                linkTo={`/${username}/${projectName}/bible/folder/${folder?.slug || folderSlug}/${typePart}/${entity.slug || entity.id}`}
                                onDelete={() => handleDeleteEntity(entity.id, folder?.id || folderSlug)}
                            />
                        );
                    })}
                </div>
            )}
            {entities.length === 0 && subfolders.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-glass-border rounded-[3rem] opacity-30 mt-8">
                    <p className="text-text-muted font-bold uppercase tracking-widest">Empty Folder</p>
                </div>
            )}
        </div>
    );
};

export default FolderView;
