import React, { useState, useMemo } from 'react';
import { Carpeta } from '@domain/models/database';
import { useLanguage } from '@context/LanguageContext';
import { Outlet, useNavigate, useOutletContext, useLocation, useParams } from 'react-router-dom';
import BibleTableView from '../components/BibleTableView';
import CreateNodeModal from '../components/CreateNodeModal';
import { FolderType } from '@domain/models/database';

interface ArchitectContext {
  projectId: number;
  projectName: string;
  baseUrl: string;
  folders: Carpeta[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  handleCreateSimpleFolder: (parentId: number | null, type?: FolderType) => Promise<void>;
  handleDeleteFolder: (id: number, parentId?: number | null) => void;
  handleRenameFolder: (id: number, name: string) => void;
  handleCreateEntity: (parentId: number | string, type?: string) => void;
  handleDeleteEntity: (id: number, folderId: number) => void;
  setRightOpen: (open: boolean) => void;
  [key: string]: unknown;
}

const WorldBibleLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectName } = useParams();
  const { t } = useLanguage();
  
  // Consumir el contexto centralizado del ArchitectLayout
  const architectContext = useOutletContext<ArchitectContext>();
  
  const [viewMode, setViewMode] = useState<'folders' | 'table'>('folders');
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [targetParent, setTargetParent] = useState<Carpeta | null>(null);

  // Determinar si estamos en la raíz o en profundidad
  const isRoot = useMemo(() => {
    return location.pathname.endsWith('/bible') || location.pathname.endsWith('/bible/');
  }, [location.pathname]);

  // Obtener el título dinámico (Nombre de la carpeta o Biblia del Mundo)
  const dynamicTitle = useMemo(() => {
    if (isRoot) return "Biblia del Mundo";
    
    // PRIORIDAD 1: Si estamos en una ENTIDAD
    const entityMatch = location.pathname.match(/\/entity\/(\d+)/);
    if (entityMatch) {
       // Por ahora mostramos un genérico o buscamos en algún sitio si es posible
       return "Ficha de Entidad";
    }

    // PRIORIDAD 2: Si estamos en una CARPETA
    const folderMatch = location.pathname.match(/\/folder\/(\d+)/);
    if (folderMatch) {
      const id = Number(folderMatch[1]);
      const folder = architectContext?.folders?.find(f => f.id === id);
      return folder ? folder.nombre : "Explorador";
    }

    return "Biblia del Mundo";
  }, [isRoot, location.pathname, architectContext?.folders]);

  // Filtrar carpetas raíz para la vista Grid
  const rootFolders = useMemo(() => {
    return (architectContext?.folders || []).filter(f => !f.padre_id);
  }, [architectContext?.folders]);

  const handleOpenCreateModal = (parentFolder = null) => {
    setTargetParent(parentFolder);
    setCreationModalOpen(true);
  };

  const handleCreateSubmit = async (formData: { nombre: string; tipo: FolderType }) => {
    if (!architectContext?.projectId) return;
    if (architectContext.handleCreateSimpleFolder) {
      await architectContext.handleCreateSimpleFolder(targetParent ? targetParent.id : null, formData.tipo);
    }
    setCreationModalOpen(false);
  };

  if (!architectContext) return <div className="p-20 text-center animate-pulse">Cargando contexto raíz...</div>;

  return (
    <div className="flex h-full w-full bg-background max-w-[1920px] mx-auto overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-gradient-to-br from-background-dark to-surface-dark/20 text-foreground flex flex-col">
        
        {/* Encabezado Unificado Centrado */}
        <header className="pt-12 pb-8 flex flex-col items-center justify-center text-center px-8 z-[100] shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary italic mb-4">
            <span className="material-symbols-outlined text-sm">auto_stories</span>
            {t('nav.bible')}
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tighter mb-6 drop-shadow-2xl">
            {dynamicTitle}
          </h1>
          
          <div className="w-full max-w-xl space-y-6">
            {/* Buscador Centrado */}
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-foreground/20 group-focus-within:text-primary transition-colors">search</span>
              <input
                value={architectContext.searchTerm}
                onChange={e => architectContext.setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 p-4 pl-12 rounded-none focus:border-primary/50 outline-none text-sm transition-all placeholder:italic"
                placeholder="Buscar en el archivo central..."
              />
            </div>

            {isRoot ? (
              /* Switch de Vista Centrado (Solo en Root) */
              <div className="flex items-center justify-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 p-1 w-fit mx-auto rounded-full shadow-2xl animate-in fade-in zoom-in-95">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewMode('folders'); }}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-500 ${
                    viewMode === 'folders' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-foreground/40 hover:text-foreground/80'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">folder</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Carpetas</span>
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewMode('table'); }}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-500 ${
                    viewMode === 'table' 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-foreground/40 hover:text-foreground/80'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">table_rows</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Gestor</span>
                </button>
              </div>
            ) : (
              /* Botón de Volver (Cuando estamos en un elemento) */
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <button
                  onClick={() => navigate(`/local/${projectName}/bible`)}
                  className="flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-primary hover:text-white transition-all rounded-full group mx-auto"
                >
                  <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volver al Archivo Central</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {viewMode === 'folders' ? (
            <Outlet context={{
              ...architectContext,
              folders: rootFolders, 
              allFolders: architectContext.folders || [],
              handleOpenCreateModal,
            }} />
          ) : (
            <BibleTableView 
              projectId={architectContext.projectId}
              allFolders={architectContext.folders || []}
              searchTerm={architectContext.searchTerm}
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
    </div>
  );
};

export default WorldBibleLayout;
