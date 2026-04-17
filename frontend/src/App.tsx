import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout
import AppLayout from '@/components/layout/AppLayout';
import ArchitectLayout from '@/components/layout/ArchitectLayout';

// Pages (root level)
import WorkspaceSelector from '@/pages/WorkspaceSelector';
import ProjectView from '@/pages/ProjectView';

// Features (via barrel files)
import { Settings } from '@/features/Settings';
import { Dashboard } from '@/features/Dashboard';
import { EntityRouter, EntityBuilder, FolderView } from '@/features/Entities';
import { GeneralGraphView } from '@/features/Graph';
import { TimelineView, DimensionEditor } from '@/features/Timeline';
import { MapRouter } from '@/features/Maps';
import { MapEditor } from '@/features/Specialized';
import { LinguisticsRouter } from '@/features/Linguistics';
import { TrashView } from '@/features/Trash';
import { WorldBibleLayout, BibleGridView } from '@/features/WorldBible';
import { WritingHub, WritingView } from '@/features/Writing';

// Store & Context
import { useAppStore } from '@/store/useAppStore';
import { LanguageProvider } from '@/context/LanguageContext';

const App = () => {
  const theme = useAppStore((state) => state.theme);
  const syncFromStorage = useAppStore((state) => state.syncFromStorage);

  // Sync theme/user desde localStorage cuando otros componentes disparan 'storage_update'
  useEffect(() => {
    const handleSync = () => syncFromStorage();
    window.addEventListener('storage_update', handleSync);
    return () => window.removeEventListener('storage_update', handleSync);
  }, [syncFromStorage]);

  // Aplicar clase de tema al body
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <LanguageProvider>
      <div className={`app-container theme-${theme} h-screen w-screen overflow-hidden`}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WorkspaceSelector />} />

            <Route element={<AppLayout />}>
              <Route path="/settings" element={<Settings />} />

              {/* El :username ahora es irrelevante en Local-First, pero lo mantenemos para no romper rutas */}
              <Route path="/local/:projectName" element={<ArchitectLayout />}>
                <Route index element={<ProjectView />} />
                <Route path="settings" element={<Settings />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="entities/:type/:entityId" element={<EntityRouter />} />

                <Route path="map-editor/create/:folderId" element={<MapEditor mode="create" />} />
                <Route path="map-editor/edit/:entityId" element={<MapEditor mode="edit" />} />

                <Route path="bible" element={<WorldBibleLayout />}>
                  <Route index element={<BibleGridView />} />
                  <Route path="folder/:folderId/entity/new/:type" element={<EntityBuilder mode="creation" />} />
                  <Route path="folder/:folderId" element={<FolderView />} />
                  <Route path="dimension/:folderId" element={<DimensionEditor />} />
                  <Route path="entity/:entityId" element={<EntityBuilder mode="edit" />} />
                  <Route path="folder/:folderId/entity/:entityId" element={<EntityBuilder mode="edit" />} />
                </Route>

                <Route path="map" element={<MapRouter />} />
                <Route path="timeline" element={<TimelineView />} />
                <Route path="languages" element={<LinguisticsRouter />} />
                <Route path="trash" element={<TrashView />} />
                <Route path="graph" element={<GeneralGraphView />} />
                <Route path="writing" element={<WritingHub />} />
                <Route path="writing/:notebookId" element={<WritingView />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
};

export default App;
