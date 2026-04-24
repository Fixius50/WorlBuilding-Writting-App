import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useLanguage } from '@context/LanguageContext';
import { folderService } from '@repositories/folderService';
import { entityService } from '@repositories/entityService';
import BibleCard from '@features/WorldBible/components/BibleCard';
import Breadcrumbs from '@molecules/Breadcrumbs';
import MoveModal from '@organisms/MoveModal';
import { getHierarchyType } from '@utils/constants/hierarchy_types';
import { Carpeta, Entidad } from '@domain/models/database';

interface OutletContext {
  handleCreateEntity: (type: string) => void;
  handleDeleteEntity: (id: number, folderId: number) => void;
  handleDeleteFolder: (id: number) => void;
  handleCreateSimpleFolder: (padreId: number, tipo: unknown) => void;
  searchTerm: string;
  filterType: string;
  projectId: number;
  projectName: string;
  folders: Carpeta[];
  setRightOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
}

const FolderView: React.FC = () => {
  const { projectName, folderId } = useParams<{ projectName: string; folderId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    handleDeleteEntity,
    handleDeleteFolder,
    handleCreateSimpleFolder,
    searchTerm: folderSearchTerm,
    filterType: folderFilterType,
    projectId,
    allFolders: folders,
    setRightOpen,
    setRightPanelTab
  } = useOutletContext<OutletContext & { allFolders: Carpeta[] }>();

  const [entities, setEntities] = useState<Entidad[]>([]);
  const [subfolders, setSubfolders] = useState<Carpeta[]>([]);
  const [folder, setFolder] = useState<Carpeta | null>(null);
  const [path, setPath] = useState<Carpeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [creationMenuOpen, setCreationMenuOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  
  // Move Modal State
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<{ item: Entidad | Carpeta; type: 'entity' | 'folder' } | null>(null);

  useEffect(() => {
    setRightOpen(true);
    setRightPanelTab('CONTEXT');

    const interval = setInterval(() => {
      const el = document.getElementById('global-right-panel-portal');
      if (el) {
        setPortalTarget(el);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [setRightOpen, setRightPanelTab]);

  const filteredContent = React.useMemo(() => {
    const searchTermLower = (folderSearchTerm || '').toLowerCase();
    const filterTypeLower = (folderFilterType || 'ALL').toLowerCase();

    return {
      folders: subfolders.filter(f => !f.borrado && (f.nombre || '').toLowerCase().includes(searchTermLower)),
      entities: entities.filter(ent => {
        if (ent.borrado) return false;
        const name = (ent.nombre || '').toLowerCase();
        const desc = (ent.descripcion || '').toLowerCase();
        const matchesSearch = name.includes(searchTermLower) || desc.includes(searchTermLower);
        if (filterTypeLower === 'all') return matchesSearch;
        return matchesSearch && (ent.tipo || '').toLowerCase() === filterTypeLower;
      })
    };
  }, [entities, subfolders, folderSearchTerm, folderFilterType]);

  const loadFolderContent = useCallback(async () => {
    if (!folderId) return;
    setLoading(true);
    try {
      const id = Number(folderId);
      const fInfo = folders.find(f => f.id === id) || await folderService.getById(id);

      if (fInfo) {
        setFolder(fInfo);
        const [ents, subs, breadcrumbs] = await Promise.all([
          entityService.getByFolder(fInfo.id),
          folderService.getSubfolders(fInfo.id),
          folderService.getPath(fInfo.id)
        ]);
        setEntities(ents);
        setSubfolders(subs);
        setPath(breadcrumbs);
      }
    } catch (err) {
      console.error("Error loading folder content:", err);
    } finally {
      setLoading(false);
    }
  }, [folderId, folders]);

  useEffect(() => {
    loadFolderContent();
  }, [loadFolderContent]);

  useEffect(() => {
    const handleUpdate = () => loadFolderContent();
    window.addEventListener('folder-update', handleUpdate);
    return () => window.removeEventListener('folder-update', handleUpdate);
  }, [loadFolderContent]);

  const handleRenameEntity = async (entity: Entidad) => {
    const newName = prompt('Renombrar registro:', entity.nombre);
    if (newName && newName !== entity.nombre) {
      await entityService.update(entity.id, { nombre: newName });
      loadFolderContent();
    }
  };

  const handleMoveItem = async (targetFolderId: number | null) => {
    if (!itemToMove) return;
    if (itemToMove.type === 'entity') {
      await entityService.move(itemToMove.item.id, targetFolderId);
    } else {
      await folderService.move(itemToMove.item.id, targetFolderId);
    }
    setMoveModalOpen(false);
    loadFolderContent();
    window.dispatchEvent(new CustomEvent('folder-update'));
  };

  if (loading) return <div className="flex-1 flex items-center justify-center p-20 animate-pulse">Cargando...</div>;
  if (!folder) return <div className="flex-1 flex items-center justify-center p-20">Sector No Encontrado</div>;

  const typeInfo = getHierarchyType(folder.tipo);

  return (
    <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto custom-scrollbar">
      <header className="mb-10 flex flex-col gap-4">
        <Breadcrumbs path={path} currentFolder={folder} />
        <div className="flex items-center gap-6">
          <div className={`size-16 ${typeInfo.bgColor} border border-white/10 flex items-center justify-center shadow-2xl`}>
            <span className={`material-symbols-outlined text-3xl ${typeInfo.color}`}>{typeInfo.icon}</span>
          </div>
          <div>
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border border-white/20 ${typeInfo.bgColor} ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <h1 className="text-4xl font-black text-white tracking-tighter mt-1">{folder.nombre}</h1>
          </div>
        </div>

        {portalTarget && createPortal(
          <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.id}/entity/new/entidadindividual`)} className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 transition-all group">
                <span className="material-symbols-outlined text-indigo-400 opacity-40 group-hover:opacity-100">person_add</span>
                <span className="text-[11px] font-bold text-white/60 group-hover:text-white">Nueva Entidad</span>
              </button>
              <button onClick={() => handleCreateSimpleFolder(folder.id, 'TIMELINE')} className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 transition-all group">
                <span className="material-symbols-outlined text-orange-400 opacity-40 group-hover:opacity-100">lan</span>
                <span className="text-[11px] font-bold text-white/60 group-hover:text-white">{t('bible.new_timeline')}</span>
              </button>
              <button onClick={() => handleCreateSimpleFolder(folder.id, 'FOLDER')} className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                <span className="material-symbols-outlined text-white/40 group-hover:text-white">create_new_folder</span>
                <span className="text-[11px] font-bold text-white/60 group-hover:text-white">Nueva Carpeta</span>
              </button>
            </div>
          </div>,
          portalTarget
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Creation Card */}
        <div 
          onClick={() => setCreationMenuOpen(!creationMenuOpen)}
          className="group relative flex flex-col p-8 monolithic-panel border border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-500 cursor-pointer items-center justify-center min-h-[220px] bg-white/[0.01]"
        >
          <div className="size-16 bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-indigo-400 transition-all">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <span className="mt-6 text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white">Nuevo Registro</span>
          
          {creationMenuOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#121214] border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
              <button onClick={(e) => { e.stopPropagation(); handleCreateSimpleFolder(folder.id, 'TIMELINE'); setCreationMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold hover:bg-orange-500/10 text-orange-400/60 hover:text-orange-400 border-b border-white/5">
                <span className="material-symbols-outlined text-base">lan</span> {t('bible.new_timeline')}
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigate(`/local/${projectName}/bible/folder/${folder.id}/entity/new/entidadindividual`); setCreationMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold hover:bg-indigo-500/10 text-indigo-400/60 hover:text-indigo-400">
                <span className="material-symbols-outlined text-base">person_add</span> Entidad
              </button>
            </div>
          )}
        </div>

        {filteredContent.folders.map(sub => (
          <BibleCard
            key={`f-${sub.id}`}
            item={sub}
            type="folder"
            linkTo={sub.tipo === 'TIMELINE' ? `/local/${projectName}/bible/dimension/${sub.id}` : `/local/${projectName}/bible/folder/${sub.id}`}
            onDelete={() => handleDeleteFolder(sub.id)}
            onMove={() => { setItemToMove({ item: sub, type: 'folder' }); setMoveModalOpen(true); }}
          />
        ))}

        {filteredContent.entities.map(ent => (
          <BibleCard
            key={`e-${ent.id}`}
            item={ent}
            type="entity"
            linkTo={`/local/${projectName}/bible/folder/${folder.id}/entity/${ent.id}`}
            onDelete={() => handleDeleteEntity(ent.id, folder.id)}
            onRename={() => handleRenameEntity(ent)}
            onMove={() => { setItemToMove({ item: ent, type: 'entity' }); setMoveModalOpen(true); }}
          />
        ))}
      </div>

      <MoveModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        onConfirm={handleMoveItem}
        folders={folders}
        title={`Mover ${itemToMove?.type === 'folder' ? 'Carpeta' : 'Entidad'}`}
        currentItemId={itemToMove?.item?.id ?? 0}
        itemType={itemToMove?.type || 'entity'}
      />
    </div>
  );
};

export default FolderView;
