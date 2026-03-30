import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { folderService } from '../../../database/folderService';
import { entityService } from '../../../database/entityService';
import BibleCard from '../../WorldBible/components/BibleCard';
import Breadcrumbs from '../../../components/common/Breadcrumbs';
import MoveModal from '../../../components/common/MoveModal';
import { getHierarchyType, HIERARCHY_TYPES } from '../../../utils/constants/hierarchy_types';
import { Carpeta, Entidad } from '../../../database/types';

interface OutletContext {
  handleCreateEntity: (type: string) => void;
  handleDeleteEntity: (id: number, folderId: number) => void;
  handleDeleteFolder: (id: number) => void;
  handleCreateSimpleFolder: (padreId: number, tipo: any) => void;
  searchTerm: string;
  filterType: string;
  projectId: number;
  projectName: string;
  folders: Carpeta[];
  setRightOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
}

const FolderView: React.FC = () => {
 const { username, projectName, folderId } = useParams<{ username: string; projectName: string; folderId: string }>();
 const navigate = useNavigate();
  const {
    handleCreateEntity,
    handleDeleteEntity,
    handleDeleteFolder,
    handleCreateSimpleFolder,
    searchTerm: folderSearchTerm,
    filterType: folderFilterType,
    projectId,
    folders,
    setRightOpen,
    setRightPanelTab
  } = useOutletContext<OutletContext>();

 const [entities, setEntities] = useState<Entidad[]>([]);
  const [subfolders, setSubfolders] = useState<Carpeta[]>([]);
 const [folder, setFolder] = useState<Carpeta | null>(null);
 const [path, setPath] = useState<Carpeta[]>([]);
 const [loading, setLoading] = useState(true);
  const [creationMenuOpen, setCreationMenuOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  
  // Move Modal State
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<{ item: any; type: 'entity' | 'folder' } | null>(null);


  useEffect(() => {
    // Open right panel and set to context when entering a folder
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

 // Unified Filter Logic
  // Unified Filter Logic with useMemo and safety checks
  const filteredContent = React.useMemo(() => {
    const searchTermLower = (folderSearchTerm || '').toLowerCase();
    const filterTypeLower = (folderFilterType || 'ALL').toLowerCase();

    return {
      folders: subfolders.filter(f => {
        if (f.borrado === 1) return false;
        const name = (f.nombre || '').toLowerCase();
        return name.includes(searchTermLower);
      }),
      entities: entities.filter(ent => {
        // Excluir borrados
        if (ent.borrado === 1) return false;

        const name = (ent.nombre || '').toLowerCase();
        const desc = (ent.descripcion || '').toLowerCase();
        const type = (ent.tipo || '').toLowerCase();

        const matchesSearch = name.includes(searchTermLower) || desc.includes(searchTermLower);
        
        if (filterTypeLower === 'all') return matchesSearch;

        // Mapeo flexible de tipos (case insensitive)
        const isIndividual = filterTypeLower === 'individual' && 
          (type === 'individual' || type === 'entidadindividual' || type === 'personaje');
        
        const isLocation = filterTypeLower === 'location' && 
          (type === 'location' || type === 'zona' || type === 'lugar');
        
        const isCulture = filterTypeLower === 'culture' && 
          (type === 'culture' || type === 'entidadcolectiva' || type === 'cultura');

        const matchesType = isIndividual || isLocation || isCulture || type === filterTypeLower;

        return matchesSearch && matchesType;
      })
    };
  }, [entities, subfolders, folderSearchTerm, folderFilterType]);

 useEffect(() => {
 const handleUpdate = (e: any) => {
 const { folderId: affectedId } = e.detail || {};
 // If we are in the affected folder
 if (affectedId === folder?.id || affectedId === Number(folderId)) {
 loadFolderContent();
 }
 };
 window.addEventListener('folder-update', handleUpdate);
 return () => window.removeEventListener('folder-update', handleUpdate);
 }, [folderId, folder?.id]);

 useEffect(() => {
 loadFolderContent();
 }, [folderId, folders]);

  const loadFolderContent = async () => {
  if (!folderId) return;
  setLoading(true);
  try {
  let fInfo: Carpeta | undefined;
  const id = Number(folderId);
  
  fInfo = folders.find(f => f.id === id);
  if (!fInfo) fInfo = await folderService.getById(id);

  if (fInfo) {
        setFolder(fInfo);
        const [ents, subs] = await Promise.all([
          entityService.getByFolder(fInfo.id),
          folderService.getSubfolders(fInfo.id)
        ]);
        setEntities(ents);
        setSubfolders(subs);
        const breadcrumbs = await folderService.getPath(fInfo.id);
        setPath(breadcrumbs);
      } else {
        setFolder(null);
      }
    } catch (err) {
      console.error("Error loading folder content:", err);
      setFolder(null);
      setPath([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameEntity = async (entity: Entidad) => {
    const newName = prompt('Renombrar registro:', entity.nombre);
    if (newName && newName !== entity.nombre) {
      try {
        await entityService.update(entity.id, { nombre: newName });
        loadFolderContent();
        window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: folder?.id } }));
      } catch (err) {
        console.error("Rename failed", err);
      }
    }
  };

  const handleMoveItem = async (targetFolderId: number | null) => {
    if (!itemToMove) return;
    try {
      if (itemToMove.type === 'entity') {
        await entityService.move(itemToMove.item.id, targetFolderId);
      } else {
        await folderService.move(itemToMove.item.id, targetFolderId);
      }
      loadFolderContent();
      window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: folder?.id } }));
      setMoveModalOpen(false);
    } catch (err) {
      console.error("Move failed", err);
    }
  };

 if (loading) return (
 <div className="flex-1 flex flex-col items-center justify-center p-20 animate-pulse">
 <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
 <div className="text-foreground/60 font-bold uppercase tracking-widest text-[10px]">Cargando Sector...</div>
 </div>
 );

 if (!folder) {
 return (
 <div className="flex-1 flex flex-col items-center justify-center p-20 text-foreground/60">
 <span className="material-symbols-outlined text-6xl mb-4 opacity-20">folder_off</span>
 <h2 className="text-xl font-bold opacity-50">Sector No Encontrado</h2>
 <p className="text-sm opacity-30 mt-2 text-center max-w-xs">El sector que buscas no existe en los registros actuales.</p>
 <Link to={`/local/${projectName}/bible`} className="mt-6 px-6 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors border border-foreground/10">
 Volver al Origen
 </Link>
 </div>
 );
 }

 const typeInfo = getHierarchyType(folder.tipo);
 const isDashboard = ['UNIVERSE', 'GALAXY', 'SYSTEM', 'PLANET'].includes(folder.tipo);

 if (isDashboard) {
 return (
 <div className="flex-1 overflow-y-auto bg-[#0a0a0c] text-foreground w-full h-full relative custom-scrollbar">
 <div className={`w-full min-h-[300px] ${typeInfo.bgColor} relative flex items-end p-10 border-b border-foreground/10`}>
 <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent opacity-80 pointer-events-none"></div>

 <div className="absolute top-6 left-10 z-20">
 <Breadcrumbs path={path} currentFolder={folder} />
 </div>

 <div className="relative z-10 flex gap-8 items-end w-full max-w-7xl mx-auto">
 <div className={`w-32 h-32 rounded-none ${typeInfo.bgColor} border border-foreground/40 flex items-center justify-center shadow-2xl group transition-transform hover:scale-105`}>
 <span className={`material-symbols-outlined text-6xl ${typeInfo.color} transition-all group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]`}>{typeInfo.icon}</span>
 </div>
 <div className="flex-1 mb-2">
 <div className="flex items-center gap-3 mb-3">
 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-foreground/40 ${typeInfo.bgColor} ${typeInfo.color}`}>
 {typeInfo.label}
 </div>
 <span className="text-foreground/30 text-xs font-mono tracking-widest uppercase opacity-40">INDEX: 0x{folder.id.toString(16).toUpperCase()}</span>
 </div>
 <h1 className="text-6xl font-black tracking-tighter text-foreground mb-2">{folder.nombre}</h1>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.id}/entity/new/entidadindividual`)}
 className="px-5 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-none text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-indigo-500/20"
 >
 <span className="material-symbols-outlined text-sm">person_add</span> Nueva Entidad
 </button>
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="space-y-6">
 <div className="bg-white/[0.02] border border-foreground/10 rounded-none p-6 ">
 <h3 className="text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-4">Métricas del Sector</h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 bg-foreground/5 rounded-none border border-foreground/10">
 <div className="text-2xl font-black text-foreground">{entities.length}</div>
 <div className="text-[9px] text-foreground/60 uppercase font-bold tracking-tighter">Entidades</div>
 </div>
 </div>
 </div>
 </div>
 <div className="lg:col-span-2">
 <h3 className="text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-4">Registros de Campo</h3>
 {entities.length === 0 && (
 <div className="p-16 border border-dashed border-foreground/40 rounded-[3rem] text-center bg-white/[0.01]">
 <span className="material-symbols-outlined text-4xl text-foreground/60 mb-2">database</span>
 <p className="text-foreground/60 text-xs font-bold uppercase tracking-widest">Sin registros en este sector</p>
 </div>
 )}
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Add Entity Card (Zen Style) */}
    <div 
      onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.id}/entity/new/entidadindividual`)}
      className="group relative flex flex-col p-6 rounded-none monolithic-panel border border-dashed border-foreground/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-500 cursor-pointer items-center justify-center min-h-[180px] bg-white/[0.01]"
    >
      <div className="size-12 rounded-none bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500/40 group-hover:text-indigo-400 group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-500">
        <span className="material-symbols-outlined text-2xl">add</span>
      </div>
      <div className="mt-4 text-center">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 group-hover:text-foreground/80 transition-colors">
          Nueva Entidad
        </span>
      </div>
    </div>

    {filteredContent.folders.map(sub => (
      <BibleCard
        key={`f-${sub.id}`}
        item={sub}
        type="folder"
        linkTo={`/local/${projectName}/bible/folder/${sub.id}`}
        onDelete={() => handleDeleteFolder(sub.id)}
        onRename={() => {
          const newName = prompt('Renombrar carpeta:', sub.nombre);
          if (newName) navigate(`/local/${projectName}/bible/folder/${sub.id}`); // This is a placeholder for actual renaming
        }}
      />
    ))}
    {filteredContent.entities.map(entity => (
      <BibleCard
        key={`e-${entity.id}`}
        item={entity}
        type="entity"
        linkTo={`/local/${projectName}/bible/folder/${folder.id}/entity/${entity.id}`}
        onDelete={() => handleDeleteEntity(entity.id, folder.id)}
        onRename={() => handleRenameEntity(entity)}
      />
    ))}
  </div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto custom-scrollbar">
 <header className="mb-10 flex items-end justify-center gap-12 text-center">
 <div>
 <div className="flex items-center gap-2 mb-4">
 <Breadcrumbs path={path} currentFolder={folder} />
 </div>
 <div className="flex items-center gap-4">
 <div className={`w-14 h-14 rounded-none ${typeInfo.bgColor} border border-foreground/10 flex items-center justify-center shadow-lg`}>
 <span className={`material-symbols-outlined text-2xl ${typeInfo.color}`}>{typeInfo.icon}</span>
 </div>
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className={`px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-widest border border-foreground/40 ${typeInfo.bgColor} ${typeInfo.color}`}>{typeInfo.label}</span>
 </div>
 <h1 className="text-4xl font-black text-foreground tracking-tighter">{folder.nombre}</h1>
 </div>
 </div>
 </div>
  {portalTarget && createPortal(
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-4">Acciones del Sector</h3>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.id}/entity/new/entidadindividual`)} className="w-full px-4 py-3 bg-foreground/5 hover:bg-indigo-500/10 text-left text-[11px] font-bold flex items-center gap-3 text-foreground/60 hover:text-indigo-400 transition-all border border-foreground/5 hover:border-indigo-500/30">
            <span className="material-symbols-outlined text-lg text-indigo-500/50">person_add</span> Crear Entidad
          </button>
          
          <button onClick={() => navigate(`/local/${projectName}/map-editor/create/${folder.id}`)} className="w-full px-4 py-3 bg-foreground/5 hover:bg-cyan-500/10 text-left text-[11px] font-bold flex items-center gap-3 text-foreground/60 hover:text-cyan-400 transition-all border border-foreground/5 hover:border-cyan-500/30">
            <span className="material-symbols-outlined text-lg text-cyan-500/50">map</span> Crear Mapa
          </button>
          
          <button onClick={() => handleCreateSimpleFolder(folder.id, 'TIMELINE')} className="w-full px-4 py-3 bg-foreground/5 hover:bg-orange-500/10 text-left text-[11px] font-bold flex items-center gap-3 text-foreground/60 hover:text-orange-400 transition-all border border-foreground/5 hover:border-orange-500/30">
            <span className="material-symbols-outlined text-lg text-orange-500/50">history</span> Crear Línea de Tiempo
          </button>
          
          <div className="h-px bg-foreground/5 my-2" />
          
          <button onClick={() => handleDeleteFolder(folder.id)} className="w-full px-4 py-3 bg-foreground/5 hover:bg-rose-500/10 text-left text-[11px] font-bold flex items-center gap-3 text-foreground/60 hover:text-rose-400 transition-all border border-foreground/5 hover:border-rose-500/30">
            <span className="material-symbols-outlined text-lg text-rose-500/50">delete</span> Eliminar Carpeta
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-foreground/10">
        <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-4">Métricas del Sector</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-foreground/5 border border-foreground/10 flex flex-col items-center">
            <div className="text-xl font-black text-foreground">{entities.length}</div>
            <div className="text-[8px] text-foreground/40 uppercase font-black tracking-widest">Entidades</div>
          </div>
          <div className="p-4 bg-foreground/5 border border-foreground/10 flex flex-col items-center opacity-40">
            <div className="text-xl font-black text-foreground">0</div>
            <div className="text-[8px] text-foreground/40 uppercase font-black tracking-widest">Enlaces</div>
          </div>
        </div>
      </div>
    </div>,
    portalTarget
  )}
 </header>

 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    {/* Add Entity Card (Zen Style) */}
    <div 
      onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.id}/entity/new/entidadindividual`)}
      className="group relative flex flex-col p-8 rounded-none monolithic-panel border border-dashed border-foreground/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-500 cursor-pointer items-center justify-center min-h-[220px] bg-white/[0.01]"
    >
      <div className="size-16 rounded-none bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500/40 group-hover:text-indigo-400 group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-500">
        <span className="material-symbols-outlined text-3xl">add</span>
      </div>
      <div className="mt-6 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 group-hover:text-foreground/80 transition-colors">
          Nueva Entidad
        </span>
      </div>
    </div>

    {filteredContent.folders.map(sub => (
      <BibleCard
        key={`f-${sub.id}`}
        item={sub}
        type="folder"
        linkTo={`/local/${projectName}/bible/folder/${sub.id}`}
        onDelete={() => handleDeleteFolder(sub.id)}
        onRename={() => {
          const newName = prompt('Renombrar carpeta:', sub.nombre);
          if (newName && newName !== sub.nombre) {
            folderService.update(sub.id, newName, projectId).then(() => {
              loadFolderContent();
              window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: folder?.id } }));
            });
          }
        }}
        onMove={() => { setItemToMove({ item: sub, type: 'folder' }); setMoveModalOpen(true); }}
      />
    ))}
    {filteredContent.entities.map(entity => (
      <BibleCard
        key={`e-${entity.id}`}
        item={entity}
        type="entity"
        linkTo={`/local/${projectName}/bible/folder/${folder.id}/entity/${entity.id}`}
        onDelete={() => handleDeleteEntity(entity.id, folder.id)}
        onRename={() => handleRenameEntity(entity)}
        onMove={() => { setItemToMove({ item: entity, type: 'entity' }); setMoveModalOpen(true); }}
      />
    ))}
  </div>

  <MoveModal
     isOpen={moveModalOpen}
     onClose={() => setMoveModalOpen(false)}
     onConfirm={handleMoveItem}
     folders={folders}
     title={`Mover ${itemToMove?.type === 'folder' ? 'Carpeta' : 'Entidad'}`}
     currentItemId={itemToMove?.item?.id}
     itemType={itemToMove?.type || 'entity'}
  />

 {entities.length === 0 && (
 <div className="p-20 text-center border-2 border-dashed border-foreground/10 rounded-[4rem] bg-white/[0.01]">
 <span className="material-symbols-outlined text-5xl text-foreground/60 mb-4">inventory_2</span>
 <p className="text-foreground/60 font-black uppercase tracking-[0.2em] text-sm">Archivo Vacío</p>
 </div>
 )}
 </div>
 );
};

export default FolderView;
