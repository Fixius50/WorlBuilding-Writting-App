import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

import WorkspaceSelector from './pages/WorkspaceSelector';
import ProjectView from './pages/ProjectView';
import Settings from './features/Settings/pages/Settings';
import ArchitectLayout from './components/layout/ArchitectLayout';
import GeneralGraphView from './features/Graph/pages/GeneralGraphView';
import EntityRouter from './features/Entities/pages/EntityRouter';
import TimelineView from './features/Timeline/pages/TimelineView';
import MapRouter from './features/Maps/pages/MapRouter';
import LinguisticsRouter from './features/Linguistics/pages/LinguisticsRouter';
import TrashView from './features/Trash/pages/TrashView';
import EntityBuilder from './features/Entities/pages/EntityBuilder';
import FolderView from './features/Entities/pages/FolderView';
import WorldBibleLayout from './features/WorldBible/pages/WorldBibleLayout';
import BibleGridView from './features/WorldBible/pages/BibleGridView';
import MapEditor from './features/Specialized/pages/MapEditor';
import Dashboard from './features/Dashboard/pages/Dashboard';
import WritingHub from './features/Writing/pages/WritingHub';
import WritingView from './features/Writing/pages/WritingView';

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';

interface User {
    username: string;
    // ... otros campos
}

function App() {
    const [theme, setTheme] = useState<string>('deep_space');
    // @ts-ignore - Temporary until we define full User type
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Load initial
        const savedSettings = localStorage.getItem('app_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                if (settings.theme) setTheme(settings.theme);
            } catch(e) {}
        }
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined') {
            try {
                setUser(JSON.parse(savedUser));
            } catch(e) {}
        }

        const handleSync = () => {
            const updatedSettings = localStorage.getItem('app_settings');
            if (updatedSettings) {
                try {
                    const settings = JSON.parse(updatedSettings);
                    if (settings.theme) setTheme(settings.theme);
                } catch(e) {}
            }
            const updatedUser = localStorage.getItem('user');
            if (updatedUser && updatedUser !== 'undefined') {
                try {
                    setUser(JSON.parse(updatedUser));
                } catch(e) {}
            }
        };

        window.addEventListener('storage_update', handleSync);
        return () => window.removeEventListener('storage_update', handleSync);
    }, []);

    useEffect(() => {
        document.body.classList.forEach(cls => {
            if (cls.startsWith('theme-')) document.body.classList.remove(cls);
        });
        document.body.classList.add(`theme-${theme}`);
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
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="entities/:type/:entityId" element={<EntityRouter />} />

                                <Route path="map-editor/create/:folderId" element={<MapEditor mode="create" />} />
                                <Route path="map-editor/edit/:entityId" element={<MapEditor mode="edit" />} />

                                <Route path="bible" element={<WorldBibleLayout />}>
                                    <Route index element={<BibleGridView />} />
                                    <Route path="folder/:folderSlug/entity/new/:type" element={<EntityBuilder mode="creation" />} />
                                    <Route path="folder/:folderSlug" element={<FolderView />} />
                                    <Route path="entity/:entitySlug" element={<EntityBuilder mode="edit" />} />
                                    <Route path="folder/:folderSlug/entity/:entitySlug" element={<EntityBuilder mode="edit" />} />
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
}

export default App;
