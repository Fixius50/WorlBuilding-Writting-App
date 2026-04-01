import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Outlet, useParams, useNavigate, useOutletContext } from 'react-router-dom';
import CreateNodeModal from '../components/CreateNodeModal';
import { FolderType, Carpeta } from '../../../database/types';

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
  const { t } = useLanguage();
  
  // Consumir el contexto centralizado del ArchitectLayout
  const architectContext = useOutletContext<ArchitectContext>();
  
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [targetParent, setTargetParent] = useState<Carpeta | null>(null);

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
    <div className="flex h-full w-full bg-background max-w-[1920px] mx-auto">
      <main className="flex-1 overflow-hidden relative bg-gradient-to-br from-background-dark to-surface-dark/20 text-foreground">
        <Outlet context={{
          ...architectContext,
          // 'folders' será la lista filtrada (raíz) para GridView, 
          // pero 'allFolders' tendrá el árbol completo para subcarpetas y MoveModal
          folders: rootFolders, 
          allFolders: architectContext.folders || [],
          handleOpenCreateModal,
        }} />
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
