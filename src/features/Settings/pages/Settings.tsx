import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sqlocal } from '../../../database/db';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { syncService } from '../../../services/syncService';

const Settings = () => {
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState<any[]>([]);

  // Settings State
  const [settings, setSettings] = useState({
    theme: 'deep_space',
    font: 'Outfit',
    fontSize: 16,
    panelMode: 'classic' // 'classic', 'binder', 'floating'
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

  const addNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
    window.dispatchEvent(new Event('storage_update'));
    addNotification(`Ajuste actualizado: ${key}`);
  };

  const toggleProjectSelection = (id: string) => {
    const isSelected = selectedProjects.includes(id);
    const newSelection = isSelected
      ? selectedProjects.filter(p => p !== id)
      : [...selectedProjects, id];

    setSelectedProjects(newSelection);
    localStorage.setItem('sync_projects', JSON.stringify(newSelection));
    addNotification(isSelected ? "Universo desmarcado de sincronización" : "Universo incluido en sincronización");
  };

  const handleDownloadBackup = async () => {
    addNotification("Sincronizando con el servidor local...", "info");
    try {
      const res = await syncService.exportToDisk('worldbuilding_master');
      if (res.success) {
        addNotification("Copia de seguridad guardada en el servidor", "success");
      } else {
        addNotification(res.message, "error");
      }
    } catch (err) {
      console.error("Backup error", err);
      addNotification("Error en la sincronización con el servidor", "error");
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.db') && !file.name.endsWith('.sqlite3') && !file.name.endsWith('.sqlite')) {
      addNotification("Solo se permiten bases de datos SQLite (.db, .sqlite3)", "error");
      return;
    }

    addNotification("Sobrescribiendo la base de datos local OPFS...", "info");

    try {
      await sqlocal.overwriteDatabaseFile(file);
      addNotification("Universo importado con éxito. Por favor recarga la página.", "success");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      console.error("Import error", err);
      addNotification("Error al sobreescribir la base de datos local", "error");
    }

    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      addNotification("Imagen demasiado grande (máx 1MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      const newAvatar = ev.target?.result as string;
      const updatedUser = { ...(user || {}), avatarUrl: newAvatar };
      setUser(updatedUser);
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        addNotification("Foto de perfil actualizada", "success");
      } catch (err) {
        addNotification("Error al guardar imagen (memoria llena)", "error");
        console.error("Storage error", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = (key: string, value: string) => {
    const updatedUser = { ...(user || {}), [key]: value };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('storage_update'));
  };

  const tabs = [
    { id: 'general', label: 'General / Sincro', icon: 'person' },
    { id: 'appearance', label: 'Apariencia y Editor', icon: 'palette' }
  ];

  const themes = [
    { id: 'deep_space', label: 'Deep Space', color: '#0f172a' },
    { id: 'nebula', label: 'Nebula', color: '#7c3aed' } // Changed to a more vibrant purple
  ];

  return (
    <div className="flex flex-col w-full h-full bg-transparent text-foreground font-sans overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute -top-[10%] -left-[10%] size-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] size-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* TOAST NOTIFICATIONS */}
      <div className="fixed top-24 right-8 z-[100] flex flex-col gap-3">
        {notifications.map(n => (
          <div key={n.id} className="flex items-center gap-3 px-6 py-4 monolithic-panel border border-foreground/40 rounded-none shadow-2xl animate-slide-in-right">
            <span className={`material-symbols-outlined ${n.type === 'success' ? 'text-emerald-400' : 'text-primary'}`}>
              {n.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span className="text-sm font-bold">{n.message}</span>
          </div>
        ))}
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="h-20 flex-none flex items-center justify-center gap-12 text-center px-12 border-b border-foreground/10 bg-background z-30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-none flex items-center justify-center text-foreground shadow-lg" style={{ backgroundColor: 'hsl(var(--primary) / 0.8)', boxShadow: '0 8px 20px -4px hsla(var(--primary), 0.3)' }}>
              <span className="material-symbols-outlined text-2xl">settings</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Ajustes</h1>
          </div>

          <nav className="flex items-center gap-2 p-1 bg-foreground/5 rounded-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-none text-xs font-bold transition-all ${activeTab === tab.id
                  ? 'bg-primary text-foreground shadow-lg shadow-primary/20'
                  : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
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
          className="flex items-center gap-2 px-6 py-2.5 bg-foreground/5 hover:monolithic-panel rounded-none transition-all text-xs font-bold text-foreground/60 hover:text-foreground"
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
              <section className="monolithic-panel rounded-none p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'hsl(var(--primary))' }}>
                  <span className="material-symbols-outlined">person</span>
                  Perfil de Arquitecto
                </h3>
                <div className="flex items-center gap-6 p-6 bg-foreground/5 rounded-none border border-foreground/10 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  <div className="relative">
                    <div className="size-20 rounded-full bg-primary flex items-center justify-center text-foreground text-3xl font-black shadow-2xl border-4 border-foreground/40 overflow-hidden">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.displayName?.substring(0, 2).toUpperCase() || user?.username?.substring(0, 2).toUpperCase() || 'AR'
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 size-8 bg-primary rounded-full flex items-center justify-center text-foreground cursor-pointer hover:scale-110 transition-all border-4 border-background shadow-lg">
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={user?.displayName ?? ''}
                      onChange={(e) => updateProfile('displayName', e.target.value)}
                      placeholder={user?.username || "Tu nombre de arquitecto..."}
                      className="bg-transparent border-none text-2xl font-black text-foreground outline-none focus:ring-0 w-full p-0 placeholder-foreground/20"
                    />
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'hsl(var(--primary))' }}>Architect Rank • Local Session</p>
                  </div>
                </div>
              </section>

              <section className="monolithic-panel rounded-none p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined">sync_lock</span>
                    Sincronización y Respaldo
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportDatabase}
                      accept=".db,.sqlite,.sqlite3"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-2.5 monolithic-panel hover:bg-foreground/5 text-foreground/60 hover:text-foreground rounded-none text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <span className="material-symbols-outlined text-base">upload_file</span>
                      Importar
                    </button>
                    <button
                      onClick={handleDownloadBackup}
                      className="flex items-center gap-2 px-5 py-2.5 monolithic-panel hover:bg-primary/10 text-primary rounded-none text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                      style={{ borderColor: 'hsl(var(--primary) / 0.3)' }}
                    >
                      <span className="material-symbols-outlined text-base">cloud_sync</span>
                      Sincronizar Nube
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60 block">Universos para sincronización</label>
                  <div className="grid grid-cols-2 gap-3">
                    {projects.length > 0 ? projects.map(project => (
                      <button
                        key={project.filename}
                        onClick={() => toggleProjectSelection(project.filename)}
                        className={`flex items-center gap-3 p-4 rounded-none border transition-all text-left ${selectedProjects.includes(project.filename)
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'sunken-panel text-foreground/60 hover:border-foreground/40'
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
                      <div className="col-span-2 p-8 border border-dashed border-foreground/10 rounded-none text-center text-foreground/60 text-xs italic">
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
              <section className="monolithic-panel rounded-none p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">palette</span>
                  Estética del Sistema
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {themes.map(theme => {
                    const isSelected = settings.theme.startsWith(theme.id);
                    const isLight = settings.theme.endsWith('_light');

                    return (
                      <div key={theme.id} className={`relative flex flex-col gap-3 p-4 rounded-none border transition-all ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'sunken-panel hover:border-foreground/40'}`}>
                        <div className="h-24 rounded-none flex items-center justify-center overflow-hidden border border-foreground/10" style={{ backgroundColor: theme.color }}>
                          <div className="size-10 rounded-full bg-white/10 border-2 border-white/20 shadow-xl backdrop-blur-sm"></div>
                        </div>

                        <div className="flex flex-col gap-1 items-center mt-2">
                          <span className="text-sm font-black tracking-widest uppercase text-foreground">{theme.label}</span>
                          <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">{isSelected ? 'ESTILO ACTIVO' : 'DISPONIBLE'}</span>
                        </div>

                        <div className="flex items-center mt-3 border border-foreground/20 rounded-none overflow-hidden">
                          <button
                            onClick={() => updateSetting('theme', theme.id)}
                            className={`flex-1 py-1.5 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest transition-all
                              ${isSelected && !isLight ? 'bg-primary text-white shadow-inner' : 'bg-transparent text-foreground/50 hover:bg-foreground/5'}
                            `}
                          >
                            <span className="material-symbols-outlined text-[11px]">dark_mode</span>
                            Dark
                          </button>
                          <div className="w-px bg-foreground/20 h-full"></div>
                          <button
                            onClick={() => updateSetting('theme', `${theme.id}_light`)}
                            className={`flex-1 py-1.5 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest transition-all
                              ${isSelected && isLight ? 'bg-amber-500 text-black shadow-inner' : 'bg-transparent text-foreground/50 hover:bg-foreground/5'}
                            `}
                          >
                            <span className="material-symbols-outlined text-[11px]">light_mode</span>
                            Light
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="monolithic-panel rounded-none p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">view_sidebar</span>
                  Arquitectura de Paneles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['classic', 'binder', 'floating'].map((mode) => (
                    <div 
                      key={mode}
                      onClick={() => updateSetting('panelMode', mode)}
                      className={`relative flex flex-col gap-3 p-4 rounded-none border cursor-pointer transition-all ${settings.panelMode === mode ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'sunken-panel hover:border-foreground/40'}`}
                    >
                      <div className="h-20 bg-background/50 border border-foreground/10 flex items-center justify-center p-2 gap-2">
                        {mode === 'classic' && (
                          <div className="w-full h-full flex gap-1">
                            <div className="w-1/4 h-full bg-foreground/20"></div>
                            <div className="flex-1 h-full bg-foreground/10"></div>
                            <div className="w-1/4 h-full bg-foreground/20"></div>
                          </div>
                        )}
                        {mode === 'binder' && (
                          <div className="w-full h-full flex gap-1">
                            <div className="w-1/3 h-full bg-foreground/20 flex flex-col gap-1">
                               <div className="h-2 w-full flex gap-1"><div className="flex-1 bg-foreground/40"></div><div className="flex-1 bg-foreground/20"></div></div>
                               <div className="flex-1 w-full bg-foreground/10"></div>
                            </div>
                            <div className="flex-1 h-full bg-foreground/5"></div>
                          </div>
                        )}
                        {mode === 'floating' && (
                          <div className="w-full h-full bg-foreground/5 relative flex justify-between p-1">
                            <div className="w-4 h-4 rounded-full bg-foreground/30"></div>
                            <div className="w-1/2 h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-foreground/20 shadow-xl opacity-80 backdrop-blur-sm border border-foreground/30"></div>
                            <div className="w-4 h-4 rounded-full bg-foreground/30"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-center mt-2">
                        <span className="text-sm font-black tracking-widest uppercase text-foreground">
                          {mode === 'classic' ? 'Clásico' : mode === 'binder' ? 'Archivador' : 'Flotante'}
                        </span>
                        <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest text-center">
                          {mode === 'classic' ? 'Paneles Acoplados' : mode === 'binder' ? 'Pestañas Izquierdas' : 'Modales Superiores'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="monolithic-panel rounded-none p-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">text_fields</span>
                  Tipografía y Lectura
                </h3>
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Fuente del Codex</label>
                    <div className="relative">
                      <select
                        value={settings.font}
                        onChange={(e) => updateSetting('font', e.target.value)}
                        className="w-full sunken-panel border-foreground/40 rounded-none px-5 py-3.5 text-sm text-foreground appearance-none outline-none focus:border-primary transition-all cursor-pointer"
                        style={{ fontFamily: settings.font }}
                      >
                        <option value="Lexend" className="text-foreground">Lexend (UI Moderna)</option>
                        <option value="Outfit" className="text-foreground">Outfit (Sleek)</option>
                        <option value="Cormorant Garamond" className="text-foreground">Cormorant (Legendaria)</option>
                        <option value="Playfair Display" className="text-foreground">Playfair (Elegante)</option>
                        <option value="JetBrains Mono" className="text-foreground">JetBrains Mono (Codex)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/60">expand_more</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Tamaño del Texto</label>
                      <span className="text-xs font-bold text-primary">{settings.fontSize}px</span>
                    </div>
                    <div className="flex items-center gap-4 py-3">
                      <input
                        type="range"
                        min="12" max="24"
                        value={settings.fontSize}
                        onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                        className="flex-1 accent-primary h-1 bg-foreground/10 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-4 border-t border-foreground/10 pt-8">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Preferencia de Idioma / Language</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => changeLanguage('es')}
                      className={`flex-1 py-4 rounded-none border transition-all flex items-center justify-center gap-3 font-bold text-xs ${language === 'es' || !language ? 'border-primary bg-primary/10 text-foreground shadow-lg' : 'sunken-panel text-foreground/60 hover:text-foreground'}`}
                    >
                      <span className="text-xl">🇪🇸</span>
                      Castellano
                    </button>
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`flex-1 py-4 rounded-none border transition-all flex items-center justify-center gap-3 font-bold text-xs ${language === 'en' ? 'border-primary bg-primary/10 text-foreground shadow-lg' : 'sunken-panel text-foreground/60 hover:text-foreground'}`}
                    >
                      <span className="text-xl">🇺🇸</span>
                      English
                    </button>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-background/40 rounded-none border border-foreground/10 text-center shadow-inner">
                  <p style={{ fontFamily: settings.font, fontSize: `${settings.fontSize}px` }} className="text-foreground/60 transition-all duration-300">
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
