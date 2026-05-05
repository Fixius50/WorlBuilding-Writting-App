import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import { folderService } from '@repositories/folderService';
import { entityService } from '@repositories/entityService';
import { Entidad, Carpeta } from '@domain/models/database';
import MonolithicPanel from '@atoms/MonolithicPanel';
import Button from '@atoms/Button';
import { useRightPanelStore } from '@store/useRightPanelStore';
import Breadcrumbs from '@molecules/Breadcrumbs';
import InputModal from '@organisms/InputModal';
import MoveModal from '@organisms/MoveModal';
import ConfirmationModal from '@organisms/ConfirmationModal';

interface FolderViewContext {
  projectId: number;
  handleDeleteEntity: (id: number, folderId: number) => void;
  handleDeleteFolder: (id: number) => void;
  handleCreateSimpleFolder: (padreId: number, tipo: string) => void;
  searchTerm: string;
  filterType: string;
  folders: Carpeta[];
}

const FolderView: React.FC = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const {
    handleDeleteEntity,
    handleDeleteFolder,
    handleCreateSimpleFolder,
    searchTerm: folderSearchTerm,
    filterType: folderFilterType,
    projectId,
    folders
  } = useOutletContext<FolderViewContext>();

  const { openPanel } = useRightPanelStore();

  const [entities, setEntities] = useState<Entidad[]>([]);
  const [subfolders, setSubfolders] = useState<Carpeta[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Carpeta | null>(null);
  const [path, setPath] = useState<Carpeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [isNewSubfolderModalOpen, setIsNewSubfolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<{ item: Entidad | Carpeta; type: 'entity' | 'folder' } | null>(null);

  useEffect(() => {
    openPanel('bulk', 0, 'Explorador');
  }, [openPanel]);

  useEffect(() => {
    const loadContent = async () => {
      if (!folderId) return;
      setLoading(true);
      try {
        const id = Number(folderId);
        const folder = await folderService.getById(id);
        setCurrentFolder(folder);

        const [ents, subs, pth] = await Promise.all([
          entityService.getByFolder(id),
          folderService.getSubfolders(id),
          folderService.getPath(id)
        ]);
        setEntities(ents);
        setSubfolders(subs);
        // El path incluye la carpeta actual al final, Breadcrumbs la maneja por separado si se pasa currentFolder
        // o podemos pasarle el path completo. Breadcrumbs.tsx usa path para los padres y currentFolder para el último.
        // Si folderService.getPath devuelve [Raiz, ..., Actual], le pasamos el slice(0, -1) como path.
        setPath(pth.slice(0, -1));
      } catch (err) {
        console.error('Error loading folder content:', err);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [folderId]);

  const filteredContent = React.useMemo(() => {
    const searchTermLower = (folderSearchTerm || '').toLowerCase();
    
    const fFolders = subfolders.filter(f => 
      f.nombre.toLowerCase().includes(searchTermLower)
    );
    
    const fEntities = entities.filter(e => {
      const matchesSearch = e.nombre.toLowerCase().includes(searchTermLower);
      const matchesFilter = folderFilterType === 'ALL' || e.tipo === folderFilterType;
      return matchesSearch && matchesFilter;
    });

    return { folders: fFolders, entities: fEntities };
  }, [subfolders, entities, folderSearchTerm, folderFilterType]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-8 lg:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-6">
        <Breadcrumbs path={path} currentFolder={currentFolder} />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-foreground">
              {currentFolder?.nombre || 'Carpeta'}
            </h1>
            <p className="text-xs font-medium text-foreground/40 uppercase tracking-widest">
              {filteredContent.folders.length} Carpetas • {filteredContent.entities.length} Entidades
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => setIsNewSubfolderModalOpen(true)}
               className="h-10 px-6"
             >
               Nueva Subcarpeta
             </Button>
             <Button 
               variant="primary" 
               size="sm" 
               onClick={() => navigate(`/local/prueba/bible/folder/${folderId}/entity/new/entidadindividual`)}
               className="h-10 px-6"
             >
               Nueva Entidad
             </Button>
          </div>
        </div>
      </header>

      {/* Grid de Contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredContent.folders.map(folder => (
          <MonolithicPanel 
            key={folder.id}
            className="group cursor-pointer hover:border-primary/30 transition-all p-5 flex items-center gap-4"
            onClick={() => navigate(`/local/prueba/bible/folder/${folder.id}`)}
          >
            <div className="size-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-xl">folder</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{folder.nombre}</div>
              <div className="text-[10px] text-foreground/40 uppercase font-black">Subcarpeta</div>
            </div>
          </MonolithicPanel>
        ))}

        {filteredContent.entities.map(entity => (
          <MonolithicPanel 
            key={entity.id}
            className="group cursor-pointer hover:border-primary/30 transition-all p-5 flex items-center gap-4"
            onClick={() => navigate(`/local/prueba/bible/folder/${folderId}/entity/${entity.id}`)}
          >
            <div className="size-10 rounded bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{entity.nombre}</div>
              <div className="text-[10px] text-foreground/40 uppercase font-black">{entity.tipo}</div>
            </div>
          </MonolithicPanel>
        ))}
      </div>

      {/* Modales */}
      <InputModal
        isOpen={isNewSubfolderModalOpen}
        onClose={() => setIsNewSubfolderModalOpen(false)}
        onConfirm={(name) => {
          handleCreateSimpleFolder(Number(folderId), name);
          setIsNewSubfolderModalOpen(false);
        }}
        title="Nueva Subcarpeta"
        placeholder="Nombre de la carpeta..."
      />

      {/* Aquí faltarían otros modales si fueran necesarios, pero para el bug de setRightOpen esto es suficiente */}
    </div>
  );
};

export default FolderView;
