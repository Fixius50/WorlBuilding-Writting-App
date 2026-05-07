import React, { useState, useEffect, useCallback } from 'react';
import { Carpeta, Entidad } from '@domain/models/database';
import { entityService } from '@repositories/entityService';
import { useLanguage } from '@context/LanguageContext';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import BibleCard from '../components/BibleCard';

 interface BibleContext {
 handleOpenCreateModal: () => void;
 handleDeleteFolder: (id: string | number) => void;
 handleCreateSimpleFolder: (parentId: string | number | null, type: string) => void;
 handleRenameFolder: (id: string | number, name: string) => void;
 handleDeleteEntity: (id: number) => void;
 folders: Carpeta[];
 entities: Entidad[];
 projectId: number;
 searchTerm: string;
 filterType: string;
}

const BibleGridView = () => {
  const { username: urlUsername, projectName } = useParams();
  const navigate = useNavigate();
  
  // Por defecto usamos 'local', pero se mantiene la variable para futuras implementaciones online/multi-usuario
  const username = urlUsername || 'local';
  
  const {
    handleDeleteFolder,
    handleCreateSimpleFolder,
    handleRenameFolder,
    handleDeleteEntity,
    handleOpenCreateModal,
    folders = [],
    entities = [],
    projectId,
    searchTerm = '',
    filterType = 'ALL'
  } = useOutletContext<BibleContext>();


  const { t } = useLanguage();

  // Logic: Filter content based on Search and Type
  const filteredFolders = React.useMemo(() => {
    return folders.filter(f => 
      f.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [folders, searchTerm]);

  const filteredEntities = React.useMemo(() => {
    return entities.filter(e => {
      const matchesSearch = e.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || e.tipo === filterType;
      return matchesSearch && matchesType;
    });
  }, [entities, searchTerm, filterType]);

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

  const { folderId } = useParams();
  const isInsideFolder = !!folderId;

 return (
 <div className="flex-1 p-8 pt-0 max-w-[1600px] mx-auto w-full h-full overflow-y-auto custom-scrollbar">

 {/* Content Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
 {/* Add Card (Dynamic) */}
   <div 
     onClick={() => handleOpenCreateModal()}
     className="group relative flex flex-col p-8 rounded-none bg-foreground/[0.01] border border-dashed border-foreground/10 hover:border-primary/40 hover:bg-foreground/[0.03] transition-all duration-500 cursor-pointer items-center justify-center min-h-[220px]"
   >
    <div className="size-16 rounded-none bg-foreground/[0.03] border border-foreground/10 flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500">
      <span className="material-symbols-outlined text-3xl">add</span>
    </div>
    
    <div className="absolute bottom-8 left-0 right-0 text-center">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 group-hover:text-foreground/80 transition-colors">
        {isInsideFolder ? 'NUEVO NODO' : 'NUEVA CARPETA'}
      </span>
    </div>
  </div>

  {filteredFolders.map(folder => (
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
      ? `/${username}/${projectName}/bible/dimension/${folder.id}`
      : `/${username}/${projectName}/bible/folder/${folder.id}`}
    onDelete={() => handleDeleteFolder(folder.id)}
    onRename={() => { 
      setRenamingFolderId(folder.id); 
      setRenameValue(folder.nombre); 
    }}
  />
  )
  ))}

  {filteredEntities.map(entity => (
    <BibleCard
      key={`ent-${entity.id}`}
      item={entity}
      type="entity"
      linkTo={`/${username || 'local'}/${projectName}/bible/folder/${entity.carpeta_id}/entity/${entity.id}`}
      onDelete={() => handleDeleteEntity(entity.id)}
    />
  ))}

 </div>

  {/* Empty State */}
  {(filteredFolders.length === 0 && filteredEntities.length === 0) && (
    <div className="col-span-full py-12 text-center opacity-20">
      <p className="text-xs font-bold uppercase tracking-widest">{t('bible.empty_archive')}</p>
    </div>
  )}
  </div>
 );
};

export default BibleGridView;
