import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../database/projectService';
import { folderService } from '../database/folderService';
import { entityService } from '../database/entityService';
import { Proyecto } from '../database/types';
import CreateWorkspaceModal from "../features/Dashboard/components/CreateWorkspaceModal";
import EditWorkspaceModal from "../features/Dashboard/components/EditWorkspaceModal";
import { sqlocal } from '../database/db';
import ConfirmModal from "../components/common/ConfirmModal";
import { syncService } from '../services/syncService';

const WorkspaceSelector: React.FC = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // CRUD State
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Proyecto | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await projectService.list();
      setWorkspaces(data);
    } catch (err) {
      console.error("Failed to load workspaces", err);
      setError("Error al cargar cuadernos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (projectName: string) => {
    try {
      // En Local-First, el select es solo navegar a la ruta del proyecto
      localStorage.setItem('user', JSON.stringify({ username: 'local', success: true }));
      navigate(`/local/${projectName}`);
    } catch (err: any) {
      setError(err.message || "Fallo al entrar al cuaderno");
    }
  };

  const handleCreateWorkspace = async (formData: { name: string, title: string, genre: string, imageUrl?: string }) => {
    try {
      setLoading(true);
      const res = await projectService.create(formData.name, formData.title, formData.genre, formData.imageUrl);
      if (res) await handleSelect(res.nombre);
    } catch (err) {
      setError("Error al crear cuaderno");
      setLoading(false);
    }
  };



  const handleDeleteConfirm = async () => {
    if (projectToDelete === null) return;
    try {
      setLoading(true);
      await projectService.delete(projectToDelete);
      await loadWorkspaces();
      setProjectToDelete(null);
    } catch (err) {
      setError("Error al borrar el cuaderno");
      setLoading(false);
    }
  };

  const handleUpdateWorkspace = async (id: number, data: Partial<Proyecto>) => {
    try {
      setLoading(true);
      await projectService.update(id, data);
      await loadWorkspaces();
      setProjectToEdit(null);
    } catch (err) {
      setError("Error al actualizar cuaderno");
      setLoading(false);
    }
  };



  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await syncService.exportToDisk('worldbuilding_master');
      if (res.success) {
        alert("Copia de seguridad guardada con éxito en el servidor local.");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Fallo en la sincronización.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    const confirmImport = window.confirm("¿Seguró? Esto sobrescribirá todos tus datos actuales con la versión del servidor.");
    if (!confirmImport) return;

    try {
      setLoading(true);
      const res = await syncService.importFromDisk('worldbuilding_master');
      if (res.success) {
        alert("Datos restaurados con éxito.");
        window.location.reload();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Error al importar datos.");
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkspaces = workspaces.filter(w =>
    (w.nombre || w.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col items-center font-sans selection:bg-indigo-500/30 overflow-hidden">
      <div className="w-full max-w-6xl flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8">

        <header className="w-full mt-24 mb-12 flex flex-col lg:flex-row lg:items-end justify-center gap-12 text-center gap-8 flex-shrink-0">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="text-6xl font-black tracking-tighter leading-none">
                <span className="block text-primary">Mis</span>
                <span className="block text-foreground">Cuadernos</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-5 py-3 monolithic-panel hover:bg-foreground/5 rounded-none transition-all text-xs font-bold text-foreground/60 hover:text-foreground group"
              title="Configuración Global"
            >
              <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-500">settings</span>
              <span className="hidden sm:inline">Ajustes</span>
            </button>

            <button
               onClick={handleExport}
               className="flex items-center gap-2 px-5 py-3 monolithic-panel hover:bg-primary/5 rounded-none transition-all text-xs font-bold text-primary group"
               title="Exportar base de datos al servidor"
             >
               <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">cloud_upload</span>
               <span className="hidden sm:inline">Exportar</span>
            </button>

            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-5 py-3 monolithic-panel hover:bg-foreground/5 rounded-none transition-all text-xs font-bold text-foreground/60 group"
              title="Importar base de datos desde el servidor"
            >
              <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">cloud_download</span>
              <span className="hidden sm:inline">Importar</span>
            </button>

             <a
               href="/manual/Guia_Usuario.html"
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 px-5 py-3 monolithic-panel hover:bg-primary/10 rounded-none transition-all text-xs font-bold text-primary hover:text-primary/80 group no-underline"
               title="Abrir Manual de Usuario"
             >
               <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">menu_book</span>
               <span className="hidden sm:inline">Guía de Usuario</span>
             </a>

            <div className="relative group min-w-[300px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 text-xl group-focus-within:text-primary transition-colors pointer-events-none">search</span>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sunken-panel rounded-none py-3 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20"
              />
            </div>
          </div>
        </header>

        <section className="w-full max-w-6xl">
          {loading ? (
            <div className="flex flex-col items-center gap-6 py-20 opacity-20">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Accediendo al Sector Local...</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-start pb-20">

              <div
                onClick={() => setIsCreateModalOpen(true)}
                className="group relative h-[380px] monolithic-panel border-dashed border-2 overflow-hidden flex flex-col items-center justify-center gap-6 transition-all cursor-pointer animate-in fade-in duration-700 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
              >
                <div className="w-20 h-20 bg-background border-[0.5px] rounded-none flex items-center justify-center text-4xl text-foreground/40 group-hover:scale-110 group-hover:text-primary transition-all rounded-full">
                  <span className="material-symbols-outlined text-4xl">add</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black tracking-tight text-foreground/70 group-hover:text-foreground transition-colors">Nuevo Cuaderno</h3>
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-2 group-hover:text-foreground/70">Inicia un nuevo universo</p>
                </div>
              </div>



              {filteredWorkspaces.map(workspace => {
                const displayImg = workspace.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800';

                return (
                  <div
                    key={workspace.id}
                    onClick={() => handleSelect(workspace.nombre)}
                    className="group relative h-[380px] monolithic-panel overflow-hidden transition-all hover:-translate-y-2 cursor-pointer animate-in fade-in slide-in-from-bottom-4 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] flex flex-col"
                  >
                    <div className="w-full h-40 shrink-0 border-b overflow-hidden" >
                      <img src={displayImg} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 grayscale-[0.8] group-hover:grayscale-0 transition-all duration-500" alt="" />
                    </div>

                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); setProjectToEdit(workspace); }}
                        className="w-10 h-10 monolithic-panel rounded-none flex items-center justify-center text-foreground/60 hover:text-primary-foreground hover:bg-primary transition-all border-none"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setProjectToDelete(workspace.id); }}
                        className="w-10 h-10 monolithic-panel rounded-none flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-red-500 transition-all border-none"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col p-8">
                      <div className="mt-auto space-y-3">
                        <span className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-[9px] font-black text-primary rounded-none tracking-widest uppercase">
                          {workspace.tag || 'GENERAL'}
                        </span>
                        <h3 className="text-3xl font-black text-foreground tracking-tighter leading-tight group-hover:text-primary transition-colors">
                          {workspace.nombre}
                        </h3>
                        
                        <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">
                          {workspace.descripcion || 'Una tierra dividida por la magia y la tecnología antigua...'}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t mt-4" >
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                              Última edición: <span className="text-foreground/70">{new Date(workspace.ultima_modificacion).toLocaleDateString()}</span>
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center text-[10px] font-black text-primary" >
                            {workspace.initials}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-none text-xs font-bold shadow-2xl animate-bounce">
          {error}
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateWorkspace}
      />

      {projectToEdit && (
        <EditWorkspaceModal
          isOpen={!!projectToEdit}
          onClose={() => setProjectToEdit(null)}
          project={projectToEdit}
          onUpdate={(data: Partial<Proyecto>) => handleUpdateWorkspace(projectToEdit.id, data)}
        />
      )}

      <ConfirmModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar Proyecto?"
        message={`Estás a punto de borrar este cuaderno y todo su contenido permanentemente. Esta acción no se puede deshacer.`}
        confirmText="Eliminar Universo"
        isDestructive={true}
      />
    </div>
  );
};

export default WorkspaceSelector;
