import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout
import AppLayout from '@layout/AppLayout';
import ArchitectLayout from '@layout/ArchitectLayout';

// Pages (root level)
import WorkspaceSelector from '@presentation/pages/WorkspaceSelector';
import ProjectView from '@presentation/pages/ProjectView';

// Features (via barrel files)
import { Settings, ArchetypeManager } from '@features/Settings';
import { Dashboard } from '@features/Dashboard';
import { EntityRouter, EntityBuilder, FolderView } from '@features/Entities';
import { GeneralGraphView } from '@features/Graph';
import { TimelineView, DimensionEditor } from '@features/Timeline';
import { MapRouter } from '@features/Maps';
import { MapEditor } from '@features/Specialized';
import { LinguisticsRouter } from '@features/Linguistics';
import { TrashView } from '@features/Trash';
import { WorldBibleLayout, BibleGridView } from '@features/WorldBible';
import { WritingHub, WritingView } from '@features/Writing';
import { AnalyticsDashboard } from '@features/Analytics';
import { PlanningCenterView } from '@features/PlanningCenter';
import { CalendarManagerView } from '@features/Calendars';
import { SyncView } from '@features/Sync';

// Store & Context
import { useAppStore } from '@store/useAppStore';
import { LanguageProvider } from '@context/LanguageContext';
import { initializeDatabase } from '@database';

const App = () => {
  const isInitialized = useAppStore((state) => state.isInitialized);
  const initializeStore = useAppStore((state) => state.initializeStore);
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    const startup = async () => {
      // 1. Asegurarnos de que las tablas de SQLite existen
      await initializeDatabase();
      // 2. Cargar las configuraciones en Zustand
      await initializeStore();
    };
    startup();
  }, [initializeStore]);

  // Aplicar clase de tema al body
  useEffect(() => {
    if (isInitialized) {
      document.body.className = `theme-${theme}`;
    }
  }, [theme, isInitialized]);

  // Pantalla de carga ultra-rápida mientras lee SQLite
  if (!isInitialized) {
    return <div className="h-screen w-screen bg-[#111] flex items-center justify-center text-white text-[10px] uppercase font-black tracking-widest animate-pulse">Iniciando Codex...</div>;
  }

  return (
    <LanguageProvider>
      <div className={`app-container h-screen w-screen overflow-hidden`}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WorkspaceSelector />} />

            <Route element={<AppLayout />}>
              <Route path="/settings" element={<Settings />} />

              {/* El :username ahora es irrelevante en Local-First, pero lo mantenemos para no romper rutas */}
              <Route path="/local/:projectName" element={<ArchitectLayout />}>
                <Route index element={<ProjectView />} />
                <Route path="settings" element={<Settings />} />
                <Route path="workshop" element={<ArchetypeManager />} />
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
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="planning" element={<PlanningCenterView />} />
                <Route path="planning/:pizarraId" element={<PlanningCenterView />} />
                <Route path="genealogy" element={<PlanningCenterView />} />
                <Route path="time" element={<CalendarManagerView />} />
                <Route path="sync" element={<SyncView />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
};

export default App;
