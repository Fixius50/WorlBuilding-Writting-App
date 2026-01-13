import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../js/services/api';

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('appearance');

    // Settings State
    const [settings, setSettings] = useState({
        theme: 'deep_space', // deep_space, nebula, high_contrast
        font: 'Manrope',
        fontSize: 16,
        focusMode: false,
        transparencyEffects: true,
        vaultPath: './data' // Local vault path (relative)
    });

    useEffect(() => {
        console.log("Settings Page Mounted");
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== "undefined") {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse user settings", e);
        }
    }, []);

    const handleLogout = async () => {
        try { await api.post('/auth/logout', {}); }
        catch (err) { console.error('Logout error', err); }
        finally {
            localStorage.removeItem('user');
            sessionStorage.clear();
            navigate('/');
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: 'settings' },
        { id: 'appearance', label: 'Apariencia', icon: 'palette' },
        { id: 'editor', label: 'Editor', icon: 'edit_note' },
        { id: 'sync', label: 'Sincronización', icon: 'sync_lock' },
        { id: 'notifications', label: 'Notificaciones', icon: 'notifications' }
    ];

    const themes = [
        { id: 'deep_space', label: 'Deep Space', color: '#0f172a' },
        { id: 'nebula', label: 'Nebula', color: '#312e81' },
        { id: 'high_contrast', label: 'High Contrast', color: '#000000' }
    ];

    return (
        <div className="flex w-full h-full bg-[#050508] text-white font-sans overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-none flex flex-col border-r border-white/5 bg-[#0a0a0e]">
                <div className="p-8 pb-4">
                    <div className="size-10 rounded-full bg-white flex items-center justify-center text-black mb-4">
                        <span className="material-symbols-outlined text-2xl">settings</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Ajustes</h1>
                    <p className="text-xs text-slate-500 font-mono mt-1">v2.4.0 Local-Build</p>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-12">

                    {/* Header */}
                    <header>
                        <h2 className="text-3xl font-bold mb-2">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-slate-500">
                            Personaliza la interfaz visual y tu entorno de escritura para maximizar tu creatividad y concentración.
                        </p>
                    </header>

                    {activeTab === 'appearance' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            {/* Theme Selector */}
                            <section className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8">
                                <h3 className="text-lg font-bold mb-1">Tema de la Interfaz</h3>
                                <p className="text-xs text-slate-500 mb-6">Selecciona el esquema de colores que prefieras.</p>

                                <div className="grid grid-cols-3 gap-6">
                                    {themes.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => setSettings({ ...settings, theme: theme.id })}
                                            className={`relative group text-left transition-all ${settings.theme === theme.id ? 'ring-2 ring-indigo-500' : 'hover:ring-1 hover:ring-white/20'} rounded-2xl overflow-hidden`}
                                        >
                                            <div className="h-32 bg-black/20 relative p-4 flex items-center justify-center">
                                                <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.color }}>
                                                    <div className="size-8 rounded-full bg-white/10 backdrop-blur-md"></div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-[#18181b]">
                                                <span className="text-xs font-bold text-slate-300 group-hover:text-white">{theme.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Editor Configuration */}
                            <section className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 space-y-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-indigo-400">text_fields</span>
                                    <h3 className="text-lg font-bold">Configuración del Editor</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-12 border-b border-white/5 pb-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500">Tipografía</label>
                                        <div className="relative">
                                            <select
                                                value={settings.font}
                                                onChange={(e) => setSettings({ ...settings, font: e.target.value })}
                                                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-indigo-500 transition-colors"
                                            >
                                                <option value="Manrope">Manrope (Sans-serif)</option>
                                                <option value="Inter">Inter</option>
                                                <option value="Merriweather">Merriweather (Serif)</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">expand_more</span>
                                        </div>
                                        <p className="text-[10px] text-slate-600">La fuente utilizada en el lienzo de escritura.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-bold text-slate-500">Tamaño de Fuente</label>
                                            <span className="text-xs font-bold text-indigo-400">{settings.fontSize}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="12" max="24"
                                            value={settings.fontSize}
                                            onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                                            className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase">
                                            <span>Aa</span>
                                            <span>Aa</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined">center_focus_strong</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Modo Enfoque</h4>
                                                <p className="text-xs text-slate-500">Oculta todos los paneles laterales al escribir.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={settings.focusMode} onChange={e => setSettings({ ...settings, focusMode: e.target.checked })} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 peer-checked:after:bg-white"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined">blur_on</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Efectos de Transparencia</h4>
                                                <p className="text-xs text-slate-500">Desactivar para mejorar el rendimiento.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={settings.transparencyEffects} onChange={e => setSettings({ ...settings, transparencyEffects: e.target.checked })} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 peer-checked:after:bg-white"></div>
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* Storage */}
                            <section className="bg-[#0f0f13] border border-white/5 rounded-3xl p-1 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-3xl"></div>
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4">
                                            <span className="material-symbols-outlined text-indigo-400 text-2xl">folder_special</span>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Almacenamiento Local</h3>
                                                <p className="text-xs text-slate-500">Tus datos viven en tu dispositivo. Gestiona tus copias de seguridad.</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold uppercase border border-green-500/20 flex items-center gap-2">
                                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span> Sincronizado
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 block mb-2">Ruta de la Bóveda</label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-[#18181b] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-slate-300 truncate">
                                                    {settings.vaultPath}
                                                </div>
                                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-colors">
                                                    Cambiar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <span className="material-symbols-outlined">history</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white">Copia de Seguridad Automática</h4>
                                                    <p className="text-[10px] text-slate-500">Ultima copia: Hace 12 minutos</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-colors">Restaurar</button>
                                                <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20">Respaldar Ahora</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-end pt-8 pb-20">
                                <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-xl">
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'appearance' && (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-600">
                            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">construction</span>
                            <h3 className="text-xl font-bold text-slate-500">En Construcción</h3>
                            <p className="text-sm">El módulo {tabs.find(t => t.id === activeTab)?.label} estará disponible pronto.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Settings;
