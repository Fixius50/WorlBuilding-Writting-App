import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { TemplateUseCase } from '@application/useCases/TemplateUseCase';
import { Entidad, Carpeta } from '@domain/models/database';
import MonolithicPanel from '@atoms/MonolithicPanel';
import { useRightPanelStore } from '@store/useRightPanelStore';
import { getHierarchyVisuals } from '@presentation/utils/hierarchyVisuals';

interface FolderViewContext {
  projectId: number;
  handleDeleteEntity: (id: number, folderId: number) => void;
  handleDeleteFolder: (id: number) => void;
  handleCreateSimpleFolder: (padreId: number, tipo: string) => void;
  searchTerm: string;
  filterType: string;
  folders: Carpeta[];
  projectName: string;
}

const FolderView: React.FC = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const {
    searchTerm: folderSearchTerm,
    filterType: folderFilterType,
    projectId,
    projectName
  } = useOutletContext<FolderViewContext>();

  const { openPanel } = useRightPanelStore();

  const [entities, setEntities] = useState<Entidad[]>([]);
  const [subfolders, setSubfolders] = useState<Carpeta[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Carpeta | null>(null);
  const [path, setPath] = useState<Carpeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    openPanel('bulk', 0, 'Explorador');
  }, [openPanel]);

  useEffect(() => {
    const loadContent = async () => {
      if (!folderId) return;
      setLoading(true);
      try {
        const id = Number(folderId);
        const folder = await WorkspaceUseCase.getFolderById(id);
        setCurrentFolder(folder);

        const [ents, subs, pth] = await Promise.all([
          EntityUseCase.getByFolder(id),
          WorkspaceUseCase.getSubfolders(id),
          WorkspaceUseCase.getFolderPath(id)
        ]);
        setEntities(ents);
        setSubfolders(subs);
        // El path incluye la carpeta actual al final, Breadcrumbs la maneja por separado si se pasa currentFolder
        // o podemos pasarle el path completo. Breadcrumbs.tsx usa path para los padres y currentFolder para el último.
        // Si WorkspaceUseCase.getPath devuelve [Raiz, ..., Actual], le pasamos el slice(0, -1) como path.
        setPath(pth.slice(0, -1));
      } catch (err) {
        // [LOG REMOVED]
      } finally {
        setLoading(false);
      }
    };
    loadContent();

    // Suscribirse a actualizaciones para reactividad instantánea
    const handleUpdate = (e: Event) => {
      const { folderId: updatedFolderId } = (e as CustomEvent<{ folderId: number }>).detail || {};
      if (Number(updatedFolderId) === Number(folderId)) {
        loadContent();
      }
    };

    window.addEventListener('folder-update', handleUpdate);
    return () => window.removeEventListener('folder-update', handleUpdate);
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

    let finalFolders = fFolders;
    let finalEntities = fEntities;

    if (folderFilterType === 'SPACES') {
      finalEntities = [];
    } else if (folderFilterType === 'ENTITIES') {
      finalFolders = [];
      finalEntities = fEntities.filter(e => e.tipo !== 'MAPA' && e.tipo !== 'TIMELINE');
    } else if (folderFilterType === 'MAPS') {
      finalFolders = [];
      finalEntities = fEntities.filter(e => e.tipo === 'MAPA' || e.tipo === 'MAP');
    } else if (folderFilterType === 'TIMELINES') {
      finalFolders = [];
      finalEntities = fEntities.filter(e => e.tipo === 'TIMELINE' || e.tipo === 'LINEA_TEMPORAL');
    }

    return { folders: finalFolders, entities: finalEntities };
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
      {/* Header eliminado por unificación en Layout superior */}


      {/* Grid de Contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredContent.folders.map(folder => (
          <MonolithicPanel 
            key={folder.id}
            className="group cursor-pointer hover:border-primary/30 transition-all p-5 flex items-center gap-4"
            onClick={() => navigate(`/local/${projectName}/bible/folder/${folder.id}`)}
          >
            <div className="size-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-xl">folder</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{folder.nombre}</div>
              <div className="text-[10px] text-foreground/40 uppercase font-black">{folder.tipo === 'FOLDER' ? 'Espacio' : folder.tipo}</div>
            </div>
          </MonolithicPanel>
        ))}

        {filteredContent.entities.map(entity => {
          const visuals = getHierarchyVisuals(entity.tipo);
          return (
            <MonolithicPanel 
              key={entity.id}
              className="group cursor-pointer hover:border-primary/30 transition-all p-5 flex items-center gap-4"
              onClick={() => navigate(`/local/${projectName}/bible/folder/${folderId}/entity/${entity.id}`)}
            >
              <div className={`size-10 rounded bg-foreground/5 flex items-center justify-center ${visuals.color}`}>
                <span className="material-symbols-outlined text-xl">{visuals.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{entity.nombre}</div>
                <div className="text-[10px] text-foreground/40 uppercase font-black">{entity.tipo}</div>
              </div>
            </MonolithicPanel>
          );
        })}
      </div>

      {/* Modales eliminados para la nueva arquitectura estricta */}

      {/* Aquí faltarían otros modales si fueran necesarios, pero para el bug de setRightOpen esto es suficiente */}
    </div>
  );
};

export default FolderView;
