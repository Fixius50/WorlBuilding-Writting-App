import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../js/services/api';

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [activeTab, setActiveTab] = useState('general');
    const [notifications, setNotifications] = useState([]);

    // Settings State
    const [settings, setSettings] = useState({
        theme: 'deep_space',
        font: 'Manrope',
        fontSize: 16
    });

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== "undefined") {
                setUser(JSON.parse(storedUser));
            }
            const savedSettings = localStorage.getItem('app_settings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
            const savedSync = localStorage.getItem('sync_projects');
            if (savedSync) {
                setSelectedProjects(JSON.parse(savedSync));
            }
            loadProjects();
        } catch (e) {
            console.error("Failed to parse user settings", e);
        }
    }, []);

    const loadProjects = async () => {
        try {
            const data = await api.get('/workspaces');
            if (data) setProjects(data);
        } catch (err) {
            console.error("Error loading projects for sync", err);
        }
    };

    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('app_settings', JSON.stringify(newSettings));
        addNotification(`Ajuste actualizado: ${key}`);
    };

    const toggleProjectSelection = (id) => {
        const isSelected = selectedProjects.includes(id);
        const newSelection = isSelected
            ? selectedProjects.filter(p => p !== id)
            : [...selectedProjects, id];

        setSelectedProjects(newSelection);
        localStorage.setItem('sync_projects', JSON.stringify(newSelection));
        addNotification(isSelected ? "Universo desmarcado de sincronización" : "Universo incluido en sincronización");
    };

    const handleDownloadBackup = () => {
        addNotification("Iniciando descarga de backup...", "info");
        const link = document.createElement('a');

        // Build URL with selected projects
        const baseUrl = '/api/backup/download';
        const params = selectedProjects.length > 0
            ? `?projects=${selectedProjects.join(',')}`
            : '';

        link.href = baseUrl + params;
        link.setAttribute('download', `worldbuilding_backup_${Date.now()}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const tabs = [
        { id: 'general', label: 'General / Sincro', icon: 'person' },
        { id: 'appearance', label: 'Apariencia y Editor', icon: 'palette' }
    ];

    const themes = [
        { id: 'deep_space', label: 'Deep Space', color: '#0f172a' },
        { id: 'nebula', label: 'Nebula', color: '#312e81' },
        { id: 'high_contrast', label: 'High Contrast', color: '#000000' }
    ];

    return (
        <div className="flex flex-col w-full h-full bg-[#050508] text-white font-sans overflow-hidden">
            {/* TOAST NOTIFICATIONS */}
            <div className="fixed top-24 right-8 z-[100] flex flex-col gap-3">
                {notifications.map(n => (
                    <div key={n.id} className="flex items-center gap-3 px-6 py-4 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl animate-slide-in-right">
                        <span className={`material-symbols-outlined ${n.type === 'success' ? 'text-green-400' : 'text-indigo-400'}`}>
                            {n.type === 'success' ? 'check_circle' : 'info'}
                        </span>
                        <span className="text-sm font-bold">{n.message}</span>
                    </div>
                ))}
            </div>

            {/* TOP NAVIGATION BAR */}
            <header className="h-20 flex-none flex items-center justify-between px-12 border-b border-white/5 bg-[#0a0a0e] z-30">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <span className="material-symbols-outlined text-2xl">settings</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight hidden sm:block">Ajustes</h1>
                    </div>

                    <nav className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-xs font-bold text-slate-400 hover:text-white"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Volver</span>
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-3xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <section className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-400">
                                    <span className="material-symbols-outlined">person</span>
                                    Perfil de Arquitecto
                                </h3>
                                <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="size-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-black">
                                        {user?.username?.substring(0, 2).toUpperCase() || 'AR'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold text-white">{user?.username || 'Arquitecto Local'}</h4>
                                        <p className="text-xs text-slate-500 mt-1">Sincronización guardada automáticamente.</p>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
                                        <span className="material-symbols-outlined">sync_lock</span>
                                        Sincronización y Respaldo
                                    </h3>
                                    <button
                                        onClick={handleDownloadBackup}
                                        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/30"
                                    >
                                        <span className="material-symbols-outlined text-sm">cloud_download</span>
                                        Descargar Backup ZIP
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Universos para sincronización</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {projects.length > 0 ? projects.map(project => (
                                            <button
                                                key={project.filename}
                                                onClick={() => toggleProjectSelection(project.filename)}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${selectedProjects.includes(project.filename)
                                                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                                                    : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/10'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-lg">
                                                    {selectedProjects.includes(project.filename) ? 'check_circle' : 'circle'}
                                                </span>
                                                <div className="truncate">
                                                    <p className="text-xs font-bold truncate">{project.title}</p>
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="col-span-2 p-8 border border-dashed border-white/5 rounded-2xl text-center text-slate-600 text-xs italic text-glass-muted">
                                                No hay universos detectados...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <section className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-400">
                                    <span className="material-symbols-outlined">palette</span>
                                    Estética del Sistema
                                </h3>
                                <div className="grid grid-cols-3 gap-6">
                                    {themes.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => updateSetting('theme', theme.id)}
                                            className={`relative flex flex-col gap-3 group text-left transition-all p-3 rounded-2xl border ${settings.theme === theme.id ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/50' : 'border-white/5 bg-black/20 hover:border-white/20'}`}
                                        >
                                            <div className="h-24 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: theme.color }}>
                                                <div className="size-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/10"></div>
                                            </div>
                                            <span className="text-xs font-bold text-center">{theme.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-400">
                                    <span className="material-symbols-outlined">text_fields</span>
                                    Tipografía y Lectura
                                </h3>
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fuente del Codex</label>
                                        <div className="relative">
                                            <select
                                                value={settings.font}
                                                onChange={(e) => updateSetting('font', e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white appearance-none outline-none focus:border-indigo-500 transition-all font-sans"
                                            >
                                                <option value="Manrope">Manrope (Moderno)</option>
                                                <option value="Merriweather">Merriweather (Serif)</option>
                                                <option value="Inter">Inter (Legibilidad)</option>
                                                <option value="JetBrains Mono">JetBrains (Mono)</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tamaño del Texto</label>
                                            <span className="text-xs font-bold text-indigo-400">{settings.fontSize}px</span>
                                        </div>
                                        <div className="flex items-center gap-4 py-3">
                                            <input
                                                type="range"
                                                min="12" max="24"
                                                value={settings.fontSize}
                                                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                                                className="flex-1 accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-white/5 text-center shadow-inner">
                                    <p style={{ fontFamily: settings.font, fontSize: `${settings.fontSize}px` }} className="text-slate-200 transition-all duration-300">
                                        "El universo es un libro escrito en el lenguaje de las historias."
                                    </p>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Settings;
