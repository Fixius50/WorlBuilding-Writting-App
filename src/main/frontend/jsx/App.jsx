import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

import WorkspaceSelector from './pages/WorkspaceSelector';
import ProjectView from './pages/ProjectView';
import Settings from './pages/Settings';
import ArchitectLayout from './components/layout/ArchitectLayout';
import GraphView from './pages/Graph/GraphView';
import GeneralGraphView from './pages/Graph/GeneralGraphView';
import EntityRouter from './pages/Entities/EntityRouter';
import TimelineView from './pages/Timeline/TimelineView';
import MapRouter from './pages/Maps/MapRouter';
import LinguisticsRouter from './pages/Linguistics/LinguisticsRouter';
import WritingView from './pages/Writing/WritingView';
import WritingHub from './pages/Writing/WritingHub';
import TrashView from './pages/Trash/TrashView';
import EntityBuilder from './pages/Entities/EntityBuilder';
import FolderView from './pages/Entities/FolderView';
import WorldBibleLayout from './pages/WorldBible/WorldBibleLayout';
import BibleGridView from './pages/WorldBible/BibleGridView';
import MapEditor from './pages/Specialized/MapEditor';

// Zen Editor Import (was creating issues earlier, ensuring path is correct)
// import ZenEditor from './components/editor/ZenEditor'; 

import React, { useState, useEffect } from 'react';

import { LanguageProvider } from './context/LanguageContext';

function App() {
    const [theme, setTheme] = useState('deep_space');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Load initial
        const savedSettings = localStorage.getItem('app_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.theme) setTheme(settings.theme);
        }
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined') {
            setUser(JSON.parse(savedUser));
        }

        // Listen for internal storage changes (from same window)
        const handleSync = () => {
            const updatedSettings = localStorage.getItem('app_settings');
            if (updatedSettings) {
                const settings = JSON.parse(updatedSettings);
                if (settings.theme) setTheme(settings.theme);
            }
            const updatedUser = localStorage.getItem('user');
            if (updatedUser && updatedUser !== 'undefined') {
                setUser(JSON.parse(updatedUser));
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
                    {/* <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'orange', zIndex: 9999 }}>APP MOUNTED (FULL + SAFE MAP EDITOR)</div> */}
                    <Routes>
                        <Route path="/" element={<WorkspaceSelector />} />

                        <Route element={<AppLayout />}>
                            <Route path="/settings" element={<Settings />} />

                            {/* Architect View for Projects */}
                            <Route path="/:username/:projectName" element={<ArchitectLayout />}>
                                <Route index element={<ProjectView />} />
                                <Route path="writing" element={<WritingHub />} />
                                <Route path="writing/:notebookId" element={<WritingView />} />

                                <Route path="entities/:type/:entityId" element={<EntityRouter />} />

                                <Route path="map-editor/create/:folderId" element={<MapEditor mode="create" />} />
                                <Route path="map-editor/edit/:entityId" element={<MapEditor mode="edit" />} />

                                <Route path="bible" element={<WorldBibleLayout />}>
                                    <Route index element={<BibleGridView />} />

                                    {/* Creation routes */}
                                    <Route path="folder/:folderSlug/entity/new/:type" element={<EntityBuilder mode="creation" />} />

                                    {/* Slug based routing */}
                                    <Route path="folder/:folderSlug" element={<FolderView />} />
                                    <Route path="entity/:entitySlug" element={<EntityBuilder />} />

                                    {/* Nested routes for structure visualization */}
                                    <Route path="folder/:folderSlug/entity/:entitySlug" element={<EntityBuilder />} />
                                    <Route path="folder/:folderSlug/map/:entitySlug" element={<EntityBuilder />} />
                                    <Route path="folder/:folderSlug/timeline/:entitySlug" element={<EntityBuilder />} />
                                </Route>

                                {/* Other modules inside Architect */}
                                <Route path="map" element={<MapRouter />} />
                                <Route path="timeline" element={<TimelineView />} />
                                <Route path="languages" element={<LinguisticsRouter />} />
                                <Route path="trash" element={<TrashView />} />
                                <Route path="graph" element={<GeneralGraphView />} />
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </div>
        </LanguageProvider>
    );
}

export default App;
