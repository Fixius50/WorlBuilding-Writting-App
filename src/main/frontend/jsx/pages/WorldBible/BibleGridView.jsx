import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOutletContext, Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../../js/services/api';
import BibleCard from '../../components/bible/BibleCard';

const BibleGridView = () => {
    const { username, projectName } = useParams();
    const navigate = useNavigate();
    // Consume 'folders' from Layout Context. No local fetch needed for Root.
    const {
        handleOpenCreateModal,
        handleDeleteFolder,
        handleCreateSimpleFolder,
        handleRenameFolder,
        folders = [] // Default to empty
    } = useOutletContext();
    const { t } = useLanguage();

    // Context Menu State
    const [contextMenu, setContextMenu] = useState(null);
    const [renamingFolderId, setRenamingFolderId] = useState(null);
    const [renameValue, setRenameValue] = useState('');

    const handleContextMenu = (e, folder) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, folder });
    };

    const closeContextMenu = () => setContextMenu(null);

    useEffect(() => {
        if (contextMenu) {
            const handler = () => closeContextMenu();
            window.addEventListener('click', handler);
            return () => window.removeEventListener('click', handler);
        }
    }, [contextMenu]);

    const handleRenameSubmit = async (folderId, newName) => {
        if (newName.trim() && handleRenameFolder) {
            await handleRenameFolder(folderId, newName.trim());
        }
        setRenamingFolderId(null);
        setRenameValue('');
    };

    if (folders === undefined) return <div className="p-20 text-center animate-pulse text-text-muted">{t('common.loading')}</div>;

    return (
        <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto">
            <header className="mb-8 flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary italic mb-2">
                        <span className="material-symbols-outlined text-sm">auto_stories</span>
                        {t('nav.bible')}
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">{t('bible.root_index')}</h1>
                    <p className="text-text-muted mt-2 max-w-lg text-sm">
                        {t('bible.central_archive')}
                    </p>
                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-2">
                    <button onClick={() => handleCreateSimpleFolder(null, 'FOLDER')} className="px-6 py-2 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-sm">create_new_folder</span> {t('bible.new_folder')}
                    </button>
                </div>
            </header>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {folders.map(folder => (
                    renamingFolderId === folder.id ? (
                        <div key={folder.id} className="p-4 rounded-3xl bg-surface-dark border border-primary/50">
                            <input
                                autoFocus
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameSubmit(folder.id, renameValue);
                                    if (e.key === 'Escape') { setRenamingFolderId(null); setRenameValue(''); }
                                }}
                                onBlur={() => handleRenameSubmit(folder.id, renameValue)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary/50 outline-none"
                                placeholder={t('common.rename')}
                            />
                        </div>
                    ) : (
                        <BibleCard
                            key={folder.id}
                            item={folder}
                            type="folder"
                            linkTo={`/${username}/${projectName}/bible/folder/${folder.slug || folder.id}`}
                            onDelete={() => handleDeleteFolder(folder.id)}
                            onContextMenu={(e) => handleContextMenu(e, folder)}
                        />
                    )
                ))}
            </div>

            {folders.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-glass-border rounded-[3rem] opacity-30 mt-8">
                    <span className="material-symbols-outlined text-6xl mb-4 text-text-muted">library_books</span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">{t('bible.empty_archive')}</h3>
                    <p className="text-text-muted mt-2">{t('bible.empty_archive_desc')}</p>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-surface-dark border border-glass-border shadow-2xl rounded-xl py-2 z-50 w-52 text-xs font-medium flex flex-col animate-in fade-in zoom-in-95 duration-150"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 py-2 border-b border-white/5 font-bold text-text-muted truncate flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">folder</span>
                        {contextMenu.folder.nombre}
                    </div>

                    <button
                        className="px-4 py-2.5 hover:bg-white/5 text-left flex items-center gap-3 text-white/80 hover:text-white transition-colors"
                        onClick={() => {
                            setRenamingFolderId(contextMenu.folder.id);
                            setRenameValue(contextMenu.folder.nombre);
                            closeContextMenu();
                        }}
                    >
                        <span className="material-symbols-outlined text-sm">edit</span> {t('common.rename')}
                    </button>

                    <button
                        className="px-4 py-2.5 hover:bg-red-500/10 text-red-400 text-left flex items-center gap-3 transition-colors"
                        onClick={() => {
                            handleDeleteFolder(contextMenu.folder.id);
                            closeContextMenu();
                        }}
                    >
                        <span className="material-symbols-outlined text-sm">delete</span> {t('bible.delete_folder')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BibleGridView;

