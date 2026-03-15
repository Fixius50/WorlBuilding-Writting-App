import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation, NavLink, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { folderService } from '../../database/folderService';
import { projectService } from '../../database/projectService';
import { entityService } from '../../database/entityService';
import { Carpeta, Proyecto } from '../../database/types';
import GlobalRightPanel from './GlobalRightPanel';
import ConfirmationModal from '../common/ConfirmationModal';
import BottomGraphDrawer from '../../features/Graph/components/BottomGraphDrawer';

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
                ? 'border-[#007acc] text-white bg-primary/20'
                : 'border-transparent text-slate-400 hover:text-primary hover:bg-primary/5'}
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
    const [rightOpen, setRightOpen] = useState(false);
    const [loadedProject, setLoadedProject] = useState<Proyecto | null>(null);
    const [projectId, setProjectId] = useState<number | null>(null);

    // Right Panel Context Content
    const [globalPanelContent, setGlobalPanelContent] = useState<React.ReactNode>(null);
    const [rightPanelTab, setRightPanelTab] = useState('NOTEBOOKS');
    const [rightPanelTitle, setRightPanelTitle] = useState<string | null>(null);
    const [rightPanelMode, setRightPanelMode] = useState<'overlay' | 'push'>('overlay');

    // Bottom Graph Panel State
    const [bottomGraphOpen, setBottomGraphOpen] = useState(false);

    // Bible Explorer State
    const [folders, setFolders] = useState<Carpeta[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    // CRUD Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletionTarget, setDeletionTarget] = useState<{ id: number; type: 'folder' | 'entity'; parentId?: number | null } | null>(null);

    const actualUsername = username || 'local';
    const baseUrl = `/${actualUsername}/${projectName}`;

    const loadFolders = async (pId: number) => {
        const rootFolders = await folderService.getByProject(pId);
        setFolders(rootFolders);
    };

    // Load project and folders
    useEffect(() => {
        const init = async () => {
            if (projectName) {
                const project = await projectService.getByName(projectName);
                if (project) {
                    setLoadedProject(project);
                    setProjectId(project.id);
                    await loadFolders(project.id);
                }
            }
        };
        init();
    }, [projectName]);

    // Clear panel on route change
    useEffect(() => {
        setGlobalPanelContent(null);
        setRightPanelTab('CONTEXT');
    }, [location.pathname]);

    const toggleRightPanel = () => setRightOpen(prev => !prev);

    // CRUD Handlers
    const handleCreateSimpleFolder = async (parentId: number | null = null, type: string = 'FOLDER') => {
        if (!projectId) return;
        try {
            const newFolder = await folderService.create(
                type === 'TIMELINE' ? 'Nueva Timeline' : 'Nueva Carpeta',
                projectId,
                parentId,
                type as any
            );
            await loadFolders(projectId);
            // Dispatch event for components listening for updates (like FolderView)
            window.dispatchEvent(new CustomEvent('folder-update', {
                detail: { folderId: parentId, type: 'folder', item: newFolder, expand: !!parentId }
            }));
        } catch (err) {
            console.error("Error creating folder:", err);
        }
    };

    const handleRenameFolder = async (folderId: number, newName: string) => {
        try {
            await folderService.update(folderId, newName);
            if (projectId) await loadFolders(projectId);
        } catch (err) {
            console.error("Error renaming folder:", err);
        }
    };

    const handleDeleteFolder = (folderId: number, parentId: number | null = null) => {
        setDeletionTarget({ id: folderId, type: 'folder', parentId });
        setConfirmOpen(true);
    };

    const handleDeleteEntity = (entityId: number, folderId: number) => {
        setDeletionTarget({ id: entityId, type: 'entity', parentId: folderId });
        setConfirmOpen(true);
    };

    const confirmDeletion = async () => {
        if (!deletionTarget || !projectId) return;
        const { id, type, parentId } = deletionTarget;

        try {
            if (type === 'folder') {
                await folderService.delete(id);
                window.dispatchEvent(new CustomEvent('folder-update', {
                    detail: { folderId: parentId, removeId: id, type: 'folder' }
                }));
            } else {
                await entityService.delete(id);
                window.dispatchEvent(new CustomEvent('folder-update', {
                    detail: { folderId: parentId, removeId: id, type: 'entity' }
                }));
            }
            await loadFolders(projectId);
        } catch (err) {
            console.error("Deletion failed:", err);
        } finally {
            setDeletionTarget(null);
            setConfirmOpen(false);
        }
    };

    const handleCreateEntity = (folderId: number | string, specialType: string = 'entidadindividual') => {
        const targetSlug = folderId; // In local-first we use the ID as slug for now or the actual slug if available
        navigate(`${baseUrl}/bible/folder/${targetSlug}/entity/new/${specialType}`);
    };

    // Minimal layout for iframe/hideSidebar
    if (hideSidebarParam) {
        return (
            <div className="h-screen w-screen bg-background">
                <Outlet context={{
                    setRightOpen,
                    setRightPanelTab,
                    projectId,
                    baseUrl
                }} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={`
                        fixed top-0 left-0 h-full bg-background border-r border-white/5 shadow-2xl z-40 transition-all duration-500 ease-in-out flex flex-col
                        ${leftOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
                    `}
                >
                    <div className="w-full h-full flex flex-col overflow-hidden">
                        <div className="h-16 flex items-center justify-center border-b border-white/5 relative bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                                    <span className="material-symbols-outlined text-sm">auto_stories</span>
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-white truncate max-w-[10rem]">
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
                                <NavItem to={`${baseUrl}/languages`} icon="translate" label={t('nav.languages')} collapsed={false} />
                                <div className="h-px bg-white/5 my-2 mx-2 opacity-50"></div>
                                <NavItem to={`${baseUrl}/writing`} icon="edit_note" label={t('nav.writing')} collapsed={false} />
                            </div>
                        </div>

                        {/* Sidebar Footer (Settings & Logout) */}
                        <div className="p-3 border-t border-white/5 bg-background mt-auto">
                            <NavItem to={`${baseUrl}/settings`} icon="settings" label={t('nav.settings')} collapsed={false} />
                            <NavItem to="/" icon="logout" label={t('nav.logout')} collapsed={false} />
                        </div>
                    </div>

                    <button
                        onClick={() => setLeftOpen(!leftOpen)}
                        className={`
                            absolute top-1/2 -translate-y-1/2 -right-10 w-10 h-24 
                            bg-background border border-white/5 border-l-0
                            rounded-r-2xl flex flex-col items-center justify-center gap-1
                            transition-all duration-300 group
                            hover:bg-indigo-500/10 hover:border-indigo-500/30
                            ${leftOpen ? 'text-indigo-500 shadow-[4px_0_15px_-5px_rgba(99,102,241,0.3)]' : 'text-slate-500'}
                        `}
                    >
                        <div className={`w-1 h-3 rounded-full bg-current opacity-20 transition-all duration-500 ${leftOpen ? 'h-6 opacity-40' : ''}`}></div>
                        <span className={`material-symbols-outlined text-lg transition-transform duration-500 ${!leftOpen ? 'rotate-180' : ''}`}>
                            side_navigation
                        </span>
                        <div className={`w-1 h-3 rounded-full bg-current opacity-20 transition-all duration-500 ${leftOpen ? 'h-6 opacity-40' : ''}`}></div>
                    </button>
                </aside>
                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0 bg-background relative">
                    <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
                        <Outlet context={{
                            setRightOpen,
                            toggleRightPanel,
                            rightPanelTab,
                            setRightPanelTab,
                            setRightPanelTitle,
                            setRightPanelMode,
                            projectId,
                            baseUrl,
                            setBottomGraphOpen
                        }} />
                    </div>

                    {/* Global Right Panel */}
                    <GlobalRightPanel
                        isOpen={rightOpen}
                        onClose={() => setRightOpen(false)}
                        onToggle={toggleRightPanel}
                        folders={folders}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        projectId={projectId}
                        activeTab={rightPanelTab}
                        setActiveTab={setRightPanelTab}
                        title={rightPanelTitle}
                        handleCreateSimpleFolder={handleCreateSimpleFolder}
                        handleRenameFolder={handleRenameFolder}
                        handleDeleteFolder={handleDeleteFolder}
                        handleCreateEntity={handleCreateEntity}
                    />

                    {/* Bottom Graph Trigger */}
                    {!bottomGraphOpen && !hideSidebarParam && (
                        <button
                            onClick={() => setBottomGraphOpen(true)}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-6 py-2 rounded-full bg-background/80 backdrop-blur-xl border border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all text-slate-400 hover:text-white shadow-2xl group animate-in slide-in-from-bottom-8"
                        >
                            <span className="material-symbols-outlined text-[1.125rem] group-hover:-translate-y-1 transition-transform text-primary group-hover:drop-shadow-[0_0_0.5rem_rgba(var(--primary-rgb),0.8)]">hub</span>
                            <span className="text-[0.65rem] font-black uppercase tracking-widest">Abrir Grafo</span>
                        </button>
                    )}

                    {/* Bottom Graph Drawer */}
                    <BottomGraphDrawer 
                        isOpen={bottomGraphOpen} 
                        onClose={() => setBottomGraphOpen(false)} 
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
        </div>
    );
};

export default ArchitectLayout;
