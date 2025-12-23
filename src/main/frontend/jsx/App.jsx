import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import GraphView from './pages/Graph/GraphView';
import EntityRouter from './pages/Entities/EntityRouter';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />

                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Graph Visualization */}
                    <Route path="/graph" element={<GraphView />} />

                    {/* Specialized Entity Views (Polymorphic) */}
                    <Route path="/entities/:type/:id" element={<EntityRouter />} />
                    <Route path="/entities/:type" element={<div className="p-8 text-white">List View for :type (Coming Soon)</div>} />

                    {/* Placeholders for other modules */}
                    <Route path="/map" element={<div className="p-8 text-white">Map Module (Coming Soon)</div>} />
                    <Route path="/timeline" element={<div className="p-8 text-white">Timeline Module (Coming Soon)</div>} />
                    <Route path="/languages" element={<div className="p-8 text-white">Linguistics Module (Coming Soon)</div>} />
                    <Route path="/settings" element={<div className="p-8 text-white">Settings Module (Coming Soon)</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
