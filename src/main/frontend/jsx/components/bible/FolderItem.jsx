import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../js/services/api';
import { getHierarchyType } from '../../../js/constants/hierarchy_types';

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

const getEntityRoute = (username, projectName, entity, folderSlug) => {
    // Unify all entity types under the folder structure as requested
    // Format: /bible/folder/:folderSlug/entity/:entitySlug
    // We can also use specific types if we want distinct URL structures, e.g. /map/:slug
    // Using generic entity route for now which EntityBuilder handles.
    const slug = entity.slug || entity.id;
    const parent = folderSlug || 'root'; // Should practically always be available here
    return `/${username}/${projectName}/bible/folder/${parent}/entity/${slug}`;
};

const FolderItem = ({ folder, onCreateSubfolder, onRename, onDeleteFolder, onDeleteEntity, onCreateTemplate, onMoveEntity, onCreateEntity, onConfirmCreate, className }) => {
    const { username, projectName } = useParams();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState({ folders: [], entities: [] });
    const [loaded, setLoaded] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [itemName, setItemName] = useState(folder.nombre);

    useEffect(() => { setItemName(folder.nombre); }, [folder.nombre]);

    useEffect(() => {
        const handleUpdate = (e) => {
            const { folderId, optimisticType, confirmedType, removeId, item, oldId, expand, type } = e.detail || {};

            if (folderId === folder.id) {
                if (expand) { setIsOpen(true); if (!loaded) loadContent(); }

                if (loaded) {
                    if (optimisticType) {
                        const key = optimisticType === 'folder' ? 'folders' : 'entities';
                        setContent(prev => ({
                            ...prev,
                            [key]: [...prev[key].filter(i => i.id !== item.id), item]
                        }));
                    } else if (confirmedType) {
                        const key = confirmedType === 'folder' ? 'folders' : 'entities';
                        setContent(prev => ({
                            ...prev,
                            [key]: prev[key].map(i => i.id === oldId ? item : i)
                        }));
                    } else if (removeId) {
                        const key = type === 'folder' ? 'folders' : 'entities';
                        setContent(prev => ({
                            ...prev,
                            [key]: prev[key].filter(i => i.id !== removeId)
                        }));
                    } else if (!optimisticType && !confirmedType && !removeId) {
                        loadContent();
                    }
                }
            } else if (e.detail?.targetFolderId === folder.id && e.detail?.type === 'move-in') {
                if (loaded) loadContent();
            } else if (e.detail?.sourceFolderId === folder.id && e.detail?.type === 'move-out') {
                if (loaded) {
                    setContent(prev => ({
                        ...prev,
                        entities: prev.entities.filter(e => e.id !== e.detail.entityId)
                    }));
                }
            }
        };
        window.addEventListener('folder-update', handleUpdate);
        return () => window.removeEventListener('folder-update', handleUpdate);
    }, [folder.id, loaded]);

    const loadContent = async () => {
        try {
            const [subs, ents] = await Promise.all([
                api.get(`/world-bible/folders/${folder.id}/subfolders`),
                api.get(`/world-bible/folders/${folder.id}/entities`)
            ]);
            setContent({ folders: subs, entities: ents });
            setLoaded(true);
        } catch (err) { console.error("Error reloading folder content:", err); }
    };

    const toggle = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
        if (!loaded && !isOpen) loadContent();
    };

    const navigateToFolder = () => navigate(`/${username}/${projectName}/bible/folder/${folder.slug || folder.id}`);
    const handleContextMenu = (e, type, id, name) => {
        e.preventDefault(); e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, type, id, name });
    };
    const closeContextMenu = () => setContextMenu(null);
    useEffect(() => {
        if (contextMenu) {
            window.addEventListener('click', closeContextMenu);
            return () => window.removeEventListener('click', closeContextMenu);
        }
    }, [contextMenu]);

    const handleNameSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.target.value.trim();
            if (val) {
                onConfirmCreate(folder.id, val, 'folder', folder.parentId, folder.tipoEspecial);
            } else {
                if (folder.isNew) onDeleteEntity(folder.id, folder.parentId);
            }
        }
    };

    if (folder.isNew) {
        return (
            <div className="px-3 py-1 animate-in fade-in zoom-in-95 duration-200">
                <input
                    autoFocus
                    type="text"
                    className="w-full bg-surface-light border border-primary/50 rounded px-2 py-1 text-xs text-white outline-none"
                    placeholder="Folder Name..."
                    onKeyDown={handleNameSubmit}
                    onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val) onConfirmCreate(folder.id, val, 'folder', folder.parentId);
                        else onDeleteEntity(folder.id, folder.parentId);
                    }}
                />
            </div>
        );
    }

    const InputItem = ({ item, type }) => (
        <div className="px-3 py-1 animate-in fade-in zoom-in-95 duration-200">
            <input
                autoFocus
                type="text"
                className="w-full bg-surface-light border border-primary/50 rounded px-2 py-1 text-xs text-white outline-none"
                placeholder="Name..."
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val) onConfirmCreate(item.id, val, type, folder.id, item.tipoEspecial);
                        else onDeleteEntity(item.id, folder.id);
                    }
                }}
                onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val) onConfirmCreate(item.id, val, type, folder.id, item.tipoEspecial);
                    else onDeleteEntity(item.id, folder.id);
                }}
            />
        </div>
    );

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('bg-primary/20'); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('bg-primary/20'); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('bg-primary/20');
        const entityId = e.dataTransfer.getData('entityId');
        const sourceFolderId = e.dataTransfer.getData('sourceFolderId');
        if (entityId && sourceFolderId && sourceFolderId !== String(folder.id)) {
            onMoveEntity(entityId, folder.id, sourceFolderId);
        }
    };

    return (
        <div className={`space-y-1 select-none ${className || ''}`}>
            <div
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 cursor-pointer transition-all group relative"
                onClick={navigateToFolder}
                onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id, folder.nombre)}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            >
                <span onClick={toggle} className={`material-symbols-outlined text-lg transition-transform hover:text-primary ${isOpen ? 'rotate-90 text-primary' : 'opacity-50'}`}>chevron_right</span>

                {/* Dynamic Icon */}
                <span className={`material-symbols-outlined text-lg ${getHierarchyType(folder.tipo).color}`}>
                    {getHierarchyType(folder.tipo).icon}
                </span>

                <span className="truncate flex-1">{itemName}</span>



            </div>

            {contextMenu && (
                <div className="fixed bg-surface-dark border border-glass-border shadow-2xl rounded-xl py-2 z-50 w-48 text-xs font-medium flex flex-col" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
                    <div className="px-4 py-2 border-b border-white/5 font-bold text-text-muted truncate">{contextMenu.name}</div>
                    {contextMenu.type === 'folder' ? (
                        <>
                            <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { onCreateSubfolder(folder); closeContextMenu(); }}><span className="material-symbols-outlined text-sm">create_new_folder</span> New Subfolder</button>
                            <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { onCreateEntity(folder.id, 'entidadindividual'); closeContextMenu(); }}><span className="material-symbols-outlined text-sm">person</span> New Character</button>
                            <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { onCreateEntity(folder.id, 'map'); closeContextMenu(); }}><span className="material-symbols-outlined text-sm">map</span> New Map</button>
                            <div className="h-px bg-white/5 my-1" />
                            <button className="px-4 py-2 hover:bg-red-500/10 text-red-400 text-left flex items-center gap-2" onClick={() => { onDeleteFolder(folder.id); closeContextMenu(); }}><span className="material-symbols-outlined text-sm">delete</span> Delete Folder</button>
                        </>
                    ) : (
                        <button className="px-4 py-2 hover:bg-red-500/10 text-red-400 text-left flex items-center gap-2" onClick={() => { onDeleteEntity(contextMenu.id, folder.id); closeContextMenu(); }}><span className="material-symbols-outlined text-sm">delete</span> Delete Entity</button>
                    )}
                </div>
            )}

            {isOpen && (
                <div className="ml-6 pl-4 border-l border-glass-border space-y-1 animate-slide-in">
                    {content.folders.map(sub => (
                        sub.isNew ? <InputItem key={sub.id} item={sub} type="folder" /> :
                            <FolderItem
                                key={sub.uiKey || sub.id}
                                folder={sub}
                                onCreateSubfolder={onCreateSubfolder}
                                onRename={onRename}
                                onDeleteFolder={onDeleteFolder}
                                onDeleteEntity={onDeleteEntity}
                                onCreateTemplate={onCreateTemplate}
                                onMoveEntity={onMoveEntity}
                                onCreateEntity={onCreateEntity}
                                onConfirmCreate={onConfirmCreate}
                                className={sub.pending ? 'opacity-50 pointer-events-none' : ''}
                            />
                    ))}
                    {content.entities.map(ent => (
                        ent.isNew ? <InputItem key={ent.id} item={ent} type="entity" /> :
                            <Link
                                key={ent.id}
                                to={getEntityRoute(username, projectName, ent, folder.slug || folder.id)}
                                onContextMenu={(e) => handleContextMenu(e, 'entity', ent.id, ent.nombre)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-medium text-text-muted hover:text-white hover:bg-primary/10 transition-all group cursor-grab active:cursor-grabbing ${ent.pending ? 'opacity-50 pointer-events-none' : ''}`}
                                draggable={!ent.pending}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('entityId', ent.id);
                                    e.dataTransfer.setData('sourceFolderId', folder.id);
                                }}
                            >
                                <span className={`material-symbols-outlined text-sm opacity-70 group-hover:text-primary transition-colors`}>{getIconForType(ent.tipoEspecial)}</span>
                                <span className="truncate">{ent.nombre}</span>
                            </Link>
                    ))}
                    {loaded && content.folders.length === 0 && content.entities.length === 0 && (
                        <div className="px-3 py-2 text-[10px] text-text-muted/30 uppercase font-black italic tracking-tighter">Empty Sector</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FolderItem;
