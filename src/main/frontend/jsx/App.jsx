import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProjectView from './pages/ProjectView';
import Settings from './pages/Settings';
import ArchitectLayout from './components/layout/ArchitectLayout';
import GraphView from './pages/Graph/GraphView';
import EntityRouter from './pages/Entities/EntityRouter';
import TimelineView from './pages/Timeline/TimelineView';
import MapRouter from './pages/Maps/MapRouter';
import LinguisticsRouter from './pages/Linguistics/LinguisticsRouter';
import WritingView from './pages/Writing/WritingView';
import TrashView from './pages/Trash/TrashView';
import EntityBuilder from './pages/Entities/EntityBuilder';
import FolderView from './pages/Entities/FolderView';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />

                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Architect View for Projects */}
                    {/* Architect View for Projects */}
                    {/* Architect View for Projects */}
                    <Route path="/:username/:projectName" element={<ArchitectLayout />}>
                        <Route index element={<ProjectView />} />
                        <Route path="writing" element={<WritingView />} />

                        {/* Specialized Entity Views */}
                        <Route path="entities/:type/:entityId" element={<EntityRouter />} />
                        <Route path="settings" element={<Settings />} />

                        {/* New Dynamic Bible Routes */}
                        <Route path="bible" element={<div className="p-8 text-white">World Bible Root View (Select a folder)</div>} />
                        <Route path="bible/entity/:entityId" element={<EntityBuilder />} />
                        <Route path="bible/folder/:folderId" element={<FolderView />} />

                        {/* Other modules inside Architect */}
                        <Route path="map" element={<MapRouter />} />
                        <Route path="timeline" element={<TimelineView />} />
                        <Route path="languages" element={<LinguisticsRouter />} />
                        <Route path="trash" element={<TrashView />} />
                        <Route path="graph" element={<GraphView />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
