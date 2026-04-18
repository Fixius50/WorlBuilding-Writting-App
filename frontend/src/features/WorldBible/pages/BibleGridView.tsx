import React, { useState, useEffect } from 'react';
import { folderService } from '@repositories/folderService';
import { entityService } from '@repositories/entityService';
import { Carpeta, Entidad } from '@domain/models/database';
import { useLanguage } from '@context/LanguageContext';
import { useOutletContext, Link, useParams, useNavigate } from 'react-router-dom';
import BibleCard from '../components/BibleCard';

interface BibleContext {
 handleOpenCreateModal: () => void;
 handleDeleteFolder: (id: string | number) => void;
 handleCreateSimpleFolder: (parentId: string | number | null, type: string) => void;
 handleRenameFolder: (id: string | number, name: string) => void;
 folders: Carpeta[];
}

const BibleGridView = () => {
 const { username, projectName } = useParams();
 const navigate = useNavigate();
 
 const {
 handleDeleteFolder,
 handleCreateSimpleFolder,
 handleRenameFolder,
 folders = []
 } = useOutletContext<BibleContext>();

 const { t } = useLanguage();

 // Rename State
 const [renamingFolderId, setRenamingFolderId] = useState<string | number | null>(null);
  const [renameValue, setRenameValue] = useState('');

 const handleRenameSubmit = async (folderId: string | number, newName: string = '') => {
    if (newName && newName.trim() && handleRenameFolder) {
     await handleRenameFolder(Number(folderId), newName.trim());
   }
   setRenamingFolderId(null);
   setRenameValue('');
 };

 if (folders === undefined) return <div className="p-20 text-center animate-pulse text-text-muted">{t('common.loading')}</div>;

 return (
 <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto custom-scrollbar">
 <header className="mb-12 flex flex-col items-center justify-center text-center">
 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary italic mb-4">
 <span className="material-symbols-outlined text-sm">auto_stories</span>
 {t('nav.bible')}
 </div>
 <h1 className="text-5xl font-black text-foreground tracking-tighter mb-4">Biblia del Mundo</h1>
 <p className="text-foreground/40 max-w-lg text-xs leading-relaxed italic">
 {t('bible.central_archive')}
 </p>
 </header>


 {/* Content Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
 {/* Add Folder Card (Zen Style) */}
  <div 
    onClick={() => handleCreateSimpleFolder(null, 'FOLDER')}
    className="group relative flex flex-col p-8 rounded-none monolithic-panel border border-dashed border-foreground/10 hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 cursor-pointer items-center justify-center min-h-[220px] bg-white/[0.01]"
  >
    <div className="size-16 rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500">
      <span className="material-symbols-outlined text-3xl">add</span>
    </div>
    <div className="mt-6 text-center">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 group-hover:text-foreground/80 transition-colors">
        {t('bible.new_folder')}
      </span>
    </div>
  </div>

  {folders.map(folder => (
  renamingFolderId === folder.id ? (
  <div key={folder.id} className="p-4 rounded-none monolithic-panel border border-primary/50">
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
  className="w-full monolithic-panel rounded-none p-3 text-sm text-foreground focus:border-primary/50 outline-none"
  placeholder={t('common.rename')}
  />
  </div>
  ) : (
  <BibleCard
    key={folder.id}
    item={folder}
    type="folder"
    linkTo={folder.tipo === 'TIMELINE' 
      ? `/${username || 'local'}/${projectName}/bible/dimension/${folder.id}`
      : `/${username || 'local'}/${projectName}/bible/folder/${folder.id}`}
    onDelete={() => handleDeleteFolder(folder.id)}
    onRename={() => { 
      setRenamingFolderId(folder.id); 
      setRenameValue(folder.nombre); 
    }}
  />
  )
  ))}

 </div>

  {/* Empty State */}
  {folders.length === 0 && (
    <div className="col-span-full py-12 text-center opacity-20">
      <p className="text-xs font-bold uppercase tracking-widest">{t('bible.empty_archive')}</p>
    </div>
  )}
  </div>
 );
};

export default BibleGridView;

