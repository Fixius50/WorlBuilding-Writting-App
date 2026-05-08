import React, { useState, useMemo } from 'react';
import { Carpeta } from '@domain/models/database';
import { useLanguage } from '@context/LanguageContext';
import { Outlet, useNavigate, useOutletContext, useLocation, useParams } from 'react-router-dom';
import BibleTableView from '../components/BibleTableView';
import CreateNodeModal from '../components/CreateNodeModal';
import { FolderType } from '@domain/models/database';
import { ArchitectContext } from '@domain/models/ui';
import { folderService } from '@repositories/folderService';
import { entityService } from '@repositories/entityService';
import ConfirmationModal from '@organisms/ConfirmationModal';
import { useRightPanelStore } from '@store/useRightPanelStore';


const WorldBibleLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectName } = useParams();
  const { t } = useLanguage();
  
  // Consumir el contexto centralizado del ArchitectLayout
  const architectContext = useOutletContext<ArchitectContext>();
  const { openPanel, closePanel, setActiveTab, setCustomContent } = useRightPanelStore();
  
  const [viewMode, setViewMode] = useState<'folders' | 'table'>('folders');
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [targetParent, setTargetParent] = useState<Carpeta | null>(null);
  
  const [localEntities, setLocalEntities] = useState<any[]>([]);
  const [localFolders, setLocalFolders] = useState<Carpeta[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Carpeta | null>(null);

  // Estados para Modal de Confirmación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<number | null>(null);

  // Determinar si estamos en la raíz o en profundidad
  const isRoot = useMemo(() => {
    const path = location.pathname.split('?')[0];
    return path.endsWith('/bible') || path.endsWith('/bible/');
  }, [location.pathname]);

  // Determinar si estamos en modo edición (Entidad o Dimensión)
  const isEditorView = useMemo(() => {
    return location.pathname.includes('/entity/') || location.pathname.includes('/dimension');
  }, [location.pathname]);

  // Obtener el título dinámico (Nombre de la carpeta o Biblia del Mundo)
  const dynamicTitle = useMemo(() => {
    if (isRoot) return "Biblia del Mundo";
    
    // PRIORIDAD 1: Si estamos en una DIMENSIÓN
    if (location.pathname.includes('/dimension')) {
       const folderMatch = location.pathname.match(/\/folder\/(\d+)/);
       if (folderMatch) {
         const id = Number(folderMatch[1]);
         const folder = architectContext?.folders?.find(f => f.id === id);
         return folder ? `Dimensión: ${folder.nombre}` : "Visor de Dimensiones";
       }
       return "Visor de Dimensiones";
    }

    // PRIORIDAD 2: Si estamos en una ENTIDAD
    if (location.pathname.includes('/entity/')) {
       return "Ficha de Entidad";
    }

    // PRIORIDAD 3: Si estamos en una CARPETA
    const folderMatch = location.pathname.match(/\/folder\/(\d+)/);
    if (folderMatch) {
      const id = Number(folderMatch[1]);
      const folder = architectContext?.folders?.find(f => f.id === id);
      return folder ? folder.nombre : "Explorador de Archivos";
    }

    return "Biblia del Mundo";
  }, [isRoot, location.pathname, architectContext?.folders]);

  // Filtrar carpetas raíz para la vista Grid
  const rootFolders = useMemo(() => {
    return (architectContext?.folders || []).filter(f => !f.padre_id);
  }, [architectContext?.folders]);

  const handleOpenCreateModal = (parentFolder: Carpeta | null = null) => {
    setTargetParent(parentFolder);
    setCreationModalOpen(true);
  };

  React.useEffect(() => {
    const loadData = async () => {
      if (!architectContext?.projectId) return;
      if (isRoot) {
        const roots = (architectContext.folders || []).filter(f => !f.padre_id);
        setLocalFolders(roots);
        setLocalEntities([]);
        setCurrentFolder(null);
      } else {
        const match = location.pathname.match(/\/folder\/(\d+)/);
        if (match) {
          const currentFolderId = Number(match[1]);
          const folder = architectContext.folders?.find(f => f.id === currentFolderId);
          setCurrentFolder(folder || null);
          const ents = await entityService.getByFolder(currentFolderId);
          setLocalEntities(ents);
          setLocalFolders([]);
        }
      }
    };
    loadData();
    window.addEventListener('folder-update', loadData);
    window.addEventListener('entity-update', loadData);
    return () => {
      window.removeEventListener('folder-update', loadData);
      window.removeEventListener('entity-update', loadData);
    };
  }, [isRoot, location.pathname, architectContext?.projectId, architectContext?.folders]);

  const handleDeleteEntity = (id: number) => {
    setEntityToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteEntity = async () => {
    if (!entityToDelete) return;
    try {
      await entityService.delete(entityToDelete);
      window.dispatchEvent(new CustomEvent('entity-update'));
      setEntityToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (formData: { nombre: string; tipo: string; descripcion?: string }) => {
    if (!architectContext?.projectId) return;
    
    try {
      if (isRoot) {
        // Root: Solo creamos carpetas
        await folderService.create(
          formData.nombre,
          architectContext.projectId,
          null,
          'FOLDER'
        );
        window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: null } }));
      } else {
        // No root: Solo creamos entidades
        const currentFolderId = Number(location.pathname.match(/\/folder\/(\d+)/)?.[1]);
        if (currentFolderId) {
          const baseSlug = formData.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          await entityService.create({
            nombre: formData.nombre,
            descripcion: formData.descripcion || '',
            tipo: formData.tipo || 'PERSONAJE',
            carpeta_id: currentFolderId,
            project_id: architectContext.projectId,
            slug: baseSlug,
            contenido_json: null,
            folder_slug: null,
            imagen_url: null
          });
          window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: currentFolderId } }));
          window.dispatchEvent(new CustomEvent('entity-update'));
        }
      }
    } catch (err) {
      console.error(err);
    }
    
    setCreationModalOpen(false);
  };

  if (!architectContext) return <div className="p-20 text-center animate-pulse">Cargando contexto raíz...</div>;

  return (
    <div className="flex h-full w-full bg-background max-w-[1920px] mx-auto overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-gradient-to-br from-background-dark to-surface-dark/20 text-foreground flex flex-col">
        
        {/* Encabezado Unificado Centrado - Solo si no estamos en vista de editor */}
        {!isEditorView && (
          <header className="pt-12 pb-8 flex flex-col items-center justify-center text-center px-8 z-[100] shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] italic mb-4">
              <span className="material-symbols-outlined text-sm">auto_stories</span>
              {t('nav.bible')}
            </div>
            <h1 className="text-5xl font-black text-[hsl(var(--foreground))] tracking-tighter mb-6 drop-shadow-2xl">
              {dynamicTitle}
            </h1>
            
            <div className="w-full max-w-xl space-y-6">
              {/* Buscador y Filtros Unificados */}
              <div className="flex items-center gap-0 bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--foreground)/0.1)] focus-within:border-[hsl(var(--primary)/0.5)] transition-all group">
                <div className="relative flex-1 flex items-center">
                  <span className="absolute left-4 material-symbols-outlined text-[hsl(var(--foreground)/0.2)] group-focus-within:text-[hsl(var(--primary))] transition-colors">search</span>
                  <input
                    value={architectContext.searchTerm}
                    onChange={e => architectContext.setSearchTerm(e.target.value)}
                    className="w-full bg-transparent p-4 pl-12 outline-none text-sm placeholder:italic"
                    placeholder="Buscar en el archivo central..."
                  />
                </div>
                
                <div className="h-8 w-px bg-[hsl(var(--foreground)/0.1)]" />
                
                <div className="relative">
                  <select
                    value={architectContext.filterType || 'ALL'}
                    onChange={e => architectContext.setFilterType?.(e.target.value)}
                    className="bg-transparent pl-4 pr-10 py-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.6)] hover:text-[hsl(var(--primary))] outline-none appearance-none cursor-pointer transition-colors"
                  >
                    <option value="ALL">Todo</option>
                    <option value="SPACES">Espacios</option>
                    <option value="ENTITIES">Entidades</option>
                    <option value="MAPS">Mapas</option>
                    <option value="TIMELINES">Líneas</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-xs pointer-events-none opacity-40">expand_more</span>
                </div>
              </div>

              {isRoot ? (
                /* Switch de Vista Centrado (Solo en Root) */
                <div className="flex items-center justify-center gap-2 bg-background  border border-[hsl(var(--foreground)/0.1)] p-1 w-fit mx-auto rounded-full shadow-2xl animate-in fade-in zoom-in-95">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewMode('folders'); }}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-500 ${
                      viewMode === 'folders' 
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.2)]' 
                        : 'text-[hsl(var(--foreground)/0.4)] hover:text-[hsl(var(--foreground)/0.8)]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">folder</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Carpetas</span>
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewMode('table'); }}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-500 ${
                      viewMode === 'table' 
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.2)]' 
                        : 'text-[hsl(var(--foreground)/0.4)] hover:text-[hsl(var(--foreground)/0.8)]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">table_rows</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Gestor</span>
                  </button>
                </div>
              ) : (
                /* Barra de Herramientas Contextual (Cuando estamos en una carpeta) */
                <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <button
                    onClick={() => navigate(`/local/${projectName}/bible`)}
                    className="flex items-center gap-3 px-6 py-2.5 bg-[hsl(var(--foreground)/0.05)] hover:bg-[hsl(var(--foreground)/0.1)] border border-[hsl(var(--foreground)/0.1)] text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition-all rounded-full group"
                  >
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volver</span>
                  </button>

                  <button
                    onClick={() => {
                      const id = Number(location.pathname.match(/\/folder\/(\d+)/)?.[1]);
                      const folder = architectContext?.folders?.find(f => f.id === id);
                      handleOpenCreateModal(folder || null);
                    }}
                    className="flex items-center gap-3 px-6 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-all rounded-full group"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nuevo Nodo</span>
                  </button>

                </div>
              )}
            </div>
          </header>
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
          {(!isRoot || viewMode === 'folders') ? (
            <Outlet context={{
              ...architectContext,
              folders: localFolders,
              entities: localEntities,
              currentFolder,
              allFolders: architectContext.folders || [],
              handleOpenCreateModal: () => handleOpenCreateModal(currentFolder),
              handleDeleteEntity,
              // Arreglo para el error de contexto en Profile Views
              setRightOpen: (open: boolean) => open ? openPanel('custom') : closePanel(),
              setRightPanelTab: setActiveTab,
              setRightPanelContent: (content: React.ReactNode) => useRightPanelStore.setState({ content, mode: 'custom', isOpen: true }),
              setRightPanelTitle: (title: React.ReactNode) => useRightPanelStore.setState({ title }),
            }} />
          ) : (
            <BibleTableView 
              projectId={architectContext.projectId}
              allFolders={architectContext.folders || []}
              filterType={architectContext.filterType}
              searchTerm={architectContext.searchTerm}
              handleOpenCreateModal={handleOpenCreateModal}
            />
          )}
        </div>
      </main>

      <CreateNodeModal
        isOpen={creationModalOpen}
        onClose={() => setCreationModalOpen(false)}
        onCreate={handleCreateSubmit}
        parentFolder={targetParent}
      />

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteEntity}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."
        confirmText="Borrar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default WorldBibleLayout;
