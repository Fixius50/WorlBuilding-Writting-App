import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, useParams, useNavigate, useLocation, NavLink, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';
import { Carpeta, Proyecto, Plantilla, FolderType } from '@domain/models/database';
import GlobalRightPanel from './GlobalRightPanel';
import ConfirmationModal from '@organisms/ConfirmationModal';
import CommandPalette from '@organisms/CommandPalette';
import { useSettingsStore } from '@store/useSettingsStore';
import ControlPanel from '@features/Graph/components/ControlPanel';
// Sync Service handled by UseCase
import { useAppStore } from '@store/useAppStore';
import { useRightPanelStore } from '@store/useRightPanelStore';

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  collapsed: boolean;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, collapsed, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2 border-l-[0.2rem] transition-all duration-200 group
      ${isActive
        ? 'border-primary text-primary bg-primary/10'
        : 'border-transparent text-foreground/60 hover:text-primary hover:bg-foreground/5'}
      ${collapsed ? 'justify-center px-0' : ''}
    `}
    title={collapsed ? label : ''}
  >
    <span className="material-symbols-outlined text-[1.2rem] transition-transform group-hover:scale-110">{icon}</span>
    {!collapsed && <span className="text-[0.8rem] font-sans tracking-wide font-medium">{label}</span>}
  </NavLink>
);

const ArchitectLayout: React.FC = () => {
  const { username, projectName } = useParams<{ username: string; projectName: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hideSidebarParam = searchParams.get('hideSidebar') === 'true';

  // Layout State
  const [leftOpen, setLeftOpen] = useState(true);
  const [loadedProject, setLoadedProject] = useState<Proyecto | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);

  // Bottom Graph Panel State
  const [bottomGraphOpen, setBottomGraphOpen] = useState(false);

  // General Settings State
  const panelMode = useAppStore(state => state.panelMode);
  const notifications = useSettingsStore(state => state.notifications);


  // Bible Explorer State
  const [folders, setFolders] = useState<Carpeta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // CRUD Modal State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<{ id: number; type: 'folder' | 'entity'; parentId?: number | null } | null>(null);

  const actualUsername = username || 'local';
  const baseUrl = `/${actualUsername}/${projectName}`;

  const loadFolders = useCallback(async (pId: number) => {
    const rootFolders = await WorkspaceUseCase.getRootFolders(pId);
    setFolders(rootFolders);
  }, []);

  // Load project and folders
  useEffect(() => {
    const init = async () => {
      if (projectName) {
        const project = await WorkspaceUseCase.getProjectByName(projectName);
        if (project) {
          setLoadedProject(project);
          setProjectId(project.id);
          // Actualizar el store global para que las menciones y sugerencias sepan en qué proyecto están
          await useAppStore.getState().setLastProjectId(project.id);
          await loadFolders(project.id);
        }
      }
    };
    init();
  }, [projectName]);

  // Auto-backup cada 5 minutos
  useEffect(() => {
    if (projectName) {
      const interval = setInterval(async () => {
        const res = await WorkspaceUseCase.exportBackup(projectName);
        if (res.success) {
          useSettingsStore.getState().addNotification("Copia de seguridad automática realizada", "success");
        } else {
          useSettingsStore.getState().addNotification("Error en copia automática", "error");
        }
      }, 5 * 60 * 1000); // 5 minutos

      return () => clearInterval(interval);
    }
  }, [projectName]);

  // Reset contextual content on navigation if it was custom
  const { mode, reset } = useRightPanelStore();
  useEffect(() => {
    if (mode === 'custom') {
       reset();
    }
  }, [location.pathname, mode, reset]);

  const { isOpen: rightOpen, togglePanel: toggleRightPanel, closePanel, openPanel } = useRightPanelStore();

  // CRUD Handlers
  const handleCreateSimpleFolder = useCallback(async (parentId: number | null = null, type: string = 'FOLDER') => {
    if (projectId) {
      try {
        const folderName = type === 'TIMELINE' ? (t('timeline.title') || 'Nueva Dimensión') : (t('bible.new_folder') || 'Nueva Carpeta');
        const newFolder = await WorkspaceUseCase.createFolder(
          folderName,
          projectId,
          parentId,
          type as FolderType
        );
        // [LOG REMOVED]
        await loadFolders(projectId);
        window.dispatchEvent(new CustomEvent('folder-update', {
          detail: { folderId: parentId, type: 'folder', item: newFolder, expand: !!parentId }
        }));
      } catch (err) {
        useSettingsStore.getState().addNotification("Error al crear carpeta", "error");
      }
    } else {
      useSettingsStore.getState().addNotification("Error: Proyecto no identificado", "error");
    }
  }, [projectId, loadFolders, t]);

  const handleCreateQuickEntity = useCallback(async (parentId: number, name: string, type: string) => {
    if (projectId) {
      try {
        const newEntity = await WorkspaceUseCase.createQuickEntity({
          nombre: name,
          tipo: type,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          descripcion: '',
          carpeta_id: parentId,
          project_id: projectId,
          contenido_json: JSON.stringify({}),
          folder_slug: null,
          imagen_url: null
        });
        
        // Notificar al árbol de carpetas para que refresque el contenido de parentId
        window.dispatchEvent(new CustomEvent('folder-update', {
          detail: { folderId: parentId, type: 'entity', item: newEntity }
        }));
        
        return newEntity;
      } catch (err) {
        // [LOG REMOVED]
      }
    }
  }, [projectId]);

  const handleRenameFolder = useCallback(async (folderId: number, newName: string) => {
    try {
      await WorkspaceUseCase.renameFolder(folderId, newName, projectId!);
      if (projectId) await loadFolders(projectId);
    } catch (err) {
      // [LOG REMOVED]
    }
  }, [projectId, loadFolders]);

  const handleDeleteFolder = useCallback((folderId: number, parentId: number | null = null) => {
    setDeletionTarget({ id: folderId, type: 'folder', parentId });
    setConfirmOpen(true);
  }, []);

  const handleDeleteEntity = useCallback((entityId: number, folderId: number) => {
    setDeletionTarget({ id: entityId, type: 'entity', parentId: folderId });
    setConfirmOpen(true);
  }, []);

  const confirmDeletion = async () => {
    if (deletionTarget && projectId) {
      const { id, type, parentId } = deletionTarget;

      try {
        if (type === 'folder') {
          await WorkspaceUseCase.deleteFolder(id);
          window.dispatchEvent(new CustomEvent('folder-update', {
            detail: { folderId: parentId, removeId: id, type: 'folder' }
          }));
        } else {
          await WorkspaceUseCase.deleteEntity(id);
          window.dispatchEvent(new CustomEvent('folder-update', {
            detail: { folderId: parentId, removeId: id, type: 'entity' }
          }));
        }
        await loadFolders(projectId);
      } catch (err) {
        // [LOG REMOVED]
      } finally {
        setDeletionTarget(null);
        setConfirmOpen(false);
      }
    }
  };

  const handleCreateEntity = useCallback((folderId: number | string, specialType: string = 'entidadindividual') => {
    const targetSlug = folderId;
    navigate(`${baseUrl}/bible/folder/${targetSlug}/entity/new/${specialType}`);
  }, [baseUrl, navigate]);

  const outletContextValue = useMemo(() => ({
    toggleRightPanel,
    projectId,
    projectName,
    baseUrl,
    handleCreateSimpleFolder,
    handleCreateQuickEntity,

    handleDeleteFolder,
    handleRenameFolder,
    handleCreateEntity,
    handleDeleteEntity,
    folders,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType
  }), [
    projectId,
    projectName,
    baseUrl,
    handleCreateSimpleFolder,
    handleDeleteFolder,
    handleRenameFolder,
    handleCreateEntity,
    handleDeleteEntity,
    folders,
    searchTerm,
    filterType,
    setSearchTerm,
    setFilterType
  ]);

  if (hideSidebarParam) {
    return (
      <div className="h-screen w-screen bg-background">
        <Outlet context={outletContextValue} />
      </div>
    );
  }

  const sidebarClasses = panelMode === 'floating'
    ? `fixed top-[2vh] left-[2vw] h-[96vh] rounded-none border border-foreground/10 shadow-2xl z-[200] transition-all duration-300 flex flex-col monolithic-panel ${leftOpen ? 'w-64 opacity-100 translate-y-0' : 'w-64 opacity-0 -translate-y-4 pointer-events-none'}`
    : `fixed top-0 left-0 h-full monolithic-panel border-y-0 border-l-0 shadow-2xl z-[200] ${panelMode === 'binder' ? '' : 'transition-all duration-500'} flex flex-col rounded-none ${leftOpen ? (panelMode === 'binder' && rightOpen ? 'w-0 -translate-x-full' : 'w-64 translate-x-0') : 'w-64 -translate-x-full'}`;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={sidebarClasses}>
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="h-16 flex items-center justify-center border-b relative bg-foreground/[0.02]" >
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-none bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                  <span className="material-symbols-outlined text-sm">auto_stories</span>
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground truncate max-w-[10rem]">
                  {loadedProject?.nombre || projectName}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
              <div className="p-3 space-y-1">
                <NavItem to={baseUrl} icon="home" label={t('nav.dashboard')} collapsed={false} end />
                <NavItem to={`${baseUrl}/bible`} icon="menu_book" label={t('nav.bible')} collapsed={false} />
                <NavItem to={`${baseUrl}/map`} icon="map" label={t('nav.atlas')} collapsed={false} />
                <NavItem to={`${baseUrl}/timeline`} icon="calendar_month" label={t('nav.chronology')} collapsed={false} />
                <NavItem to={`${baseUrl}/time`} icon="schedule" label="Calendarios" collapsed={false} />
                <NavItem to={`${baseUrl}/languages`} icon="translate" label={t('nav.languages')} collapsed={false} />
                <NavItem to={`${baseUrl}/planning`} icon="dashboard_customize" label="Centro de Planificación" collapsed={false} />
                <div className="h-px bg-foreground/10 my-2 mx-2 opacity-50"></div>
                <NavItem to={`${baseUrl}/writing`} icon="edit_note" label={t('nav.writing')} collapsed={false} />
              </div>
            </div>

            <div className="p-3 border-t bg-background mt-auto" >
              <NavItem to={`${baseUrl}/analytics`} icon="analytics" label={t('project.analytics_title')} collapsed={false} />
              <NavItem to={`${baseUrl}/sync`} icon="sync" label="Sincronizar" collapsed={false} />
              <div className="h-px bg-foreground/10 my-2 mx-2 opacity-50"></div>
              <NavItem to={`${baseUrl}/trash`} icon="delete" label={t('nav.trash')} collapsed={false} />
              <NavItem to={`${baseUrl}/settings`} icon="settings" label={t('nav.settings')} collapsed={false} />
              <NavItem to="/" icon="logout" label={t('nav.logout')} collapsed={false} />
            </div>
          </div>

          {/* STANDARDIZED LEFT COLLAPSE BUTTON - FOR CLASSIC & BINDER MODES */}
          {(panelMode === 'classic' || panelMode === 'binder') && (
          <button
            onClick={() => {
              if (panelMode === 'binder' && !leftOpen) {
                // Si está cerrado en binder, abrimos por defecto la navegación
                setLeftOpen(true);
                closePanel();
              } else {
                setLeftOpen(!leftOpen);
              }
            }}
            className={`
              absolute top-1/2 -translate-y-1/2 -right-10 w-10 h-24 
              bg-background border border-foreground/10 border-l-0
              rounded-none flex flex-col items-center justify-center gap-1
              transition-all duration-300 group
              hover:bg-indigo-500/10 hover:border-indigo-500/30
              ${leftOpen ? 'text-indigo-500 shadow-[4px_0_15px_-5px_rgba(99,102,241,0.3)] border-l-transparent' : 'text-foreground/60'}
            `}
            style={{
              borderLeftColor: leftOpen ? 'transparent' : undefined,
              right: panelMode === 'binder' && rightOpen ? '-40px' : '-40px' // Se mantiene a la derecha del panel activo
            }}
            title={leftOpen ? t('common.close_panel') : t('common.open_panel')}
          >
            <div className={`w-1 h-3 bg-current opacity-20 transition-all duration-500 ${leftOpen ? 'h-6 opacity-40' : ''}`}></div>
            <span className={`material-symbols-outlined text-lg transition-transform duration-500 ${!leftOpen ? 'rotate-180' : ''}`}>
              side_navigation
            </span>
            <div className={`w-1 h-3 bg-current opacity-20 transition-all duration-500 ${leftOpen ? 'h-6 opacity-40' : ''}`}></div>
          </button>
          )}
        </aside>

        {/* BINDER MODE TABS */}
        {panelMode === 'binder' && leftOpen && (
          <div className={`fixed top-32 z-[60] flex flex-col gap-2 ${rightOpen ? 'left-96' : 'left-64'}`}>
            <button
              onClick={() => {
                if (leftOpen && !rightOpen) {
                  setLeftOpen(false);
                } else {
                  setLeftOpen(true);
                  closePanel();
                }
              }}
              className={`w-10 py-5 bg-background border border-foreground/10 border-l-0 rounded-r-md flex justify-center text-foreground/60 hover:text-indigo-400 group relative ${leftOpen && !rightOpen ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/50 shadow-[4px_0_15px_-5px_rgba(99,102,241,0.3)] border-l-transparent' : ''}`}
              title="Navegación"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-current opacity-20"></div>
              <span className="material-symbols-outlined text-xl">map</span>
            </button>
            <button
              onClick={() => {
                if (leftOpen && rightOpen) {
                  setLeftOpen(false);
                  closePanel();
                } else {
                  setLeftOpen(true);
                  openPanel('notes');
                }
              }}
              className={`w-10 py-5 bg-background border border-foreground/10 border-l-0 rounded-r-md flex justify-center text-foreground/60 hover:text-indigo-400 group relative ${leftOpen && rightOpen ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/50 shadow-[4px_0_15px_-5px_rgba(99,102,241,0.3)] border-l-transparent' : ''}`}
              title="Archivos / Propiedades"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-current opacity-20"></div>
              <span className="material-symbols-outlined text-xl">folder_special</span>
            </button>
          </div>
        )}

        {/* FLOATING MODE TOGGLES (2vw / 2vh) */}
        {panelMode === 'floating' && (
          <div className="contents">
            <button
              id="floating-left-toggle"
              onClick={() => setLeftOpen(!leftOpen)}
              className={`fixed top-[2vh] left-[2vw] z-[70] size-12 rounded-none bg-background border transition-all flex items-center justify-center shadow-2xl ${leftOpen ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/30'}`}
              title="Menú Navegación"
            >
              <span className="material-symbols-outlined">{leftOpen ? 'close' : 'menu'}</span>
            </button>

            <button
              id="floating-right-toggle"
              onClick={toggleRightPanel}
              className={`fixed top-[2vh] right-[2vw] z-[70] size-12 rounded-none bg-background border transition-all flex items-center justify-center shadow-2xl ${rightOpen ? 'border-primary text-primary bg-primary/10' : 'border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/30'}`}
              title="Panel de Propiedades"
            >
              <span className="material-symbols-outlined">{rightOpen ? 'close' : 'folder_special'}</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        <main 
          className="flex-1 flex flex-col min-w-0 bg-background relative transition-all duration-500"
        >
          <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
            <Outlet context={outletContextValue} />
          </div>

          <GlobalRightPanel
            panelMode={panelMode}
          />

          <ControlPanel
            isOpen={bottomGraphOpen}
            onToggle={() => setBottomGraphOpen(prev => !prev)}
            projectId={projectId ?? undefined}
            projectName={projectName}
          />
        </main>
      </div>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDeletion}
        title={t('common.confirm_deletion')}
        message={t('common.are_you_sure_delete')}
        confirmText={t('common.delete')}
        type="danger"
      />
      {/* TOAST NOTIFICATIONS */}
      <div className="fixed top-24 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="flex items-center gap-3 px-6 py-4 monolithic-panel border border-foreground/40 rounded-none shadow-2xl animate-slide-in-right pointer-events-auto">
            <span className={`material-symbols-outlined ${n.type === 'success' ? 'text-emerald-400' : n.type === 'error' ? 'text-red-500' : 'text-primary'}`}>
              {n.type === 'success' ? 'check_circle' : n.type === 'error' ? 'report' : 'info'}
            </span>
            <span className="text-sm font-bold">{n.message}</span>
          </div>
        ))}
      </div>
      {/* COMMAND PALETTE — Ctrl+K */}
      <CommandPalette folders={folders} />
    </div>
  );
};

export default ArchitectLayout;
