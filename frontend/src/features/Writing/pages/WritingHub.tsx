import React, { useState, useEffect } from 'react';
import { useLanguage } from '@context/LanguageContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { notebookService, Cuaderno } from '@repositories/notebookService';
import GlassPanel from '@atoms/GlassPanel';

interface WritingOutletContext {
  projectId: number;
  setRightPanelTab: (tab: string) => void;
  baseUrl: string;
}

const WritingHub = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const outlet = useOutletContext<WritingOutletContext>();
  const { setRightPanelTab, baseUrl, projectId } = outlet || { projectId: 1, baseUrl: '' };
  const numericProjectId: number = projectId ? Number(projectId) : 1;

  const [notebooks, setNotebooks] = useState<Cuaderno[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [notebookToEdit, setNotebookToEdit] = useState<Cuaderno | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');

  useEffect(() => {
    if (setRightPanelTab) setRightPanelTab('NOTEBOOKS');
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      const pid = projectId ? Number(projectId) : 1;
      const data = await notebookService.getAllByProject(pid);
      setNotebooks(data || []);
    } catch (err) {
      console.error("Error loading notebooks:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setTitle('');
    setGenre('');
    setSubmitError(null);
    setNotebookToEdit(null);
    setIsCreating(true);
  };

  const openEditModal = (e: React.MouseEvent, nb: Cuaderno) => {
    e.stopPropagation();
    setNotebookToEdit(nb);
    setTitle(nb.titulo);
    setGenre(nb.genero || '');
    setSubmitError(null);
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmitError(null);
    
    if (!title.trim()) {
      setSubmitError('El título es obligatorio');
      return;
    }
    
    setSaving(true);
    try {
      const pid = projectId ? Number(projectId) : 1;
      console.log('[WritingHub] Creating notebook - projectId:', pid, 'title:', title, 'genre:', genre);
      
      if (notebookToEdit) {
        await notebookService.update(notebookToEdit.id, { titulo: title.trim(), genero: genre });
        setNotebooks(prev => prev.map(n => n.id === notebookToEdit.id ? { ...n, titulo: title.trim(), genero: genre } : n));
      } else {
        const nuevo = await notebookService.create(pid, title.trim(), genre);
        console.log('[WritingHub] Created notebook:', nuevo);
        setNotebooks(prev => [nuevo, ...prev]);
      }
      closeModal();
    } catch (err: unknown) {
      console.error('[WritingHub] Error saving notebook:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar. Revisa la consola.';
      setSubmitError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setIsCreating(false);
    setNotebookToEdit(null);
    setTitle('');
    setGenre('');
    setSubmitError(null);
    setSaving(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar este archivador?')) return;
    try {
      await notebookService.delete(id);
      setNotebooks(notebooks.filter(n => n.id !== id));
    } catch (err) {
      console.error("Error deleting notebook:", err);
    }
  };


  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0c]">
        <div className="animate-spin text-primary material-symbols-outlined text-4xl">sync</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0c] overflow-y-auto custom-scrollbar p-12">
      <header className="mb-16 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="mb-8">
          <h1 className="text-5xl font-black text-foreground tracking-tighter mb-2 uppercase">Biblioteca</h1>
          <p className="text-foreground/40 font-serif italic text-xl opacity-80 uppercase tracking-[0.1em]">Crónicas y Archivadores</p>
        </div>
        
        {/* Buscador Dinámico Centrado */}
        <div className="w-full max-w-md relative group">
          <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all duration-500"></div>
          <div className="relative flex items-center bg-white/[0.03] border border-white/10 group-focus-within:border-primary/40 transition-all">
            <span className="material-symbols-outlined ml-4 text-foreground/20 group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text"
              placeholder="BUSCAR EN LA BIBLIOTECA..."
              className="w-full bg-transparent border-none px-4 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-foreground outline-none placeholder:text-foreground/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mr-4 text-foreground/20 hover:text-foreground transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Botón Flotante o Integrado en la cabecera (Opcionalmente movido abajo si se desea, pero el usuario pidió quitar el de la derecha) */}
        {/* Lo dejamos como una acción secundaria centrada o para más adelante si lo pide, por ahora cumplimos: centrar título y buscador */}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Siempre mostramos la tarjeta de creación al principio */}
        <div 
          onClick={openCreateModal}
          className="group relative h-64 border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-foreground/20 hover:text-primary/60 hover:border-primary/40 cursor-pointer transition-all bg-white/[0.01]"
        >
          <div className="size-16 rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500">
            <span className="material-symbols-outlined text-4xl">add_circle</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-foreground transition-colors">Nueva Crónica</span>
        </div>

        {notebooks
          .filter(nb => nb.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || (nb.genero || '').toLowerCase().includes(searchTerm.toLowerCase()))
          .map((nb) => (
          <GlassPanel
            key={nb.id}
            onClick={() => navigate(`${baseUrl}/writing/${nb.id}`)}
            className="group relative h-64 p-8 cursor-pointer flex flex-col justify-between overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-2"
          >
            {/* Indicador lateral Zen */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-all duration-500"></div>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="size-12 bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-xl">
                  <span className="material-symbols-outlined text-2xl">auto_stories</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => openEditModal(e, nb)}
                    className="p-2 bg-white/[0.03] border border-white/5 text-foreground/40 hover:text-primary hover:border-primary/30 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, nb.id)}
                    className="p-2 bg-white/[0.03] border border-white/5 text-foreground/40 hover:text-red-400 hover:border-red-400/30 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground/80 group-hover:text-foreground transition-colors line-clamp-2 leading-tight uppercase tracking-tight">{nb.titulo || 'Sin Título'}</h3>
                {nb.genero && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {nb.genero.split(',').map((tag, i) => (
                      <span key={i} className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-all duration-500">
              <span className="material-symbols-outlined text-sm text-primary animate-pulse">menu_book</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/60 group-hover:text-primary transition-colors">Abrir Crónica</span>
            </div>
          </GlassPanel>
        ))}
        
      </div>

      {/* Creation/Edit Modal Zen */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0c]/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <GlassPanel className="p-12 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-500 border-white/10">
            <div className="flex items-center gap-6 mb-10">
              <div className="size-14 bg-primary flex items-center justify-center text-foreground shadow-2xl shadow-primary/30">
                <span className="material-symbols-outlined text-3xl">{notebookToEdit ? 'edit' : 'auto_stories'}</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">
                  {notebookToEdit ? 'Refinar Archivador' : 'Nueva Crónica'}
                </h2>
                <p className="text-[10px] text-primary uppercase font-black tracking-[0.4em] mt-1">
                  {notebookToEdit ? 'Actualizando registros' : 'Expandiendo la biblioteca'}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-foreground/40 tracking-[0.3em] ml-1">Título del Registro</label>
                <input
                  autoFocus
                  className="w-full bg-white/[0.03] border border-white/10 px-6 py-5 text-foreground text-lg outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 font-serif"
                  placeholder="Ej: Crónicas de Aethelgard"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent); }}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-foreground/40 tracking-[0.3em] ml-1">Etiquetas (separadas por coma)</label>
                <input
                  className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 text-sm font-mono"
                  placeholder="Fantasía, Oscuro, Épico..."
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                />
                <p className="text-[9px] text-foreground/40 italic px-1">Usa etiquetas libres para organizar mejor tu biblioteca.</p>
              </div>

              {/* Error state visible */}
              {submitError && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                  ⚠ {submitError}
                </div>
              )}

              <div className="flex gap-6 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-5 text-foreground/40 hover:text-foreground font-black uppercase text-[10px] tracking-[0.2em] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                  className={`flex-[2] py-5 text-foreground font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/20 transition-all ${saving ? 'bg-primary/40 cursor-wait' : 'bg-primary hover:bg-primary/80 hover:scale-[1.02] active:scale-95'}`}
                >
                  {saving ? 'Guardando...' : notebookToEdit ? 'Confirmar Cambios' : 'Crear Archivador'}
                </button>
              </div>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
};

export default WritingHub;

