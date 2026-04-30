import React, { useState, useEffect } from 'react';
import { templateService } from '@repositories/templateService';
import { Plantilla } from '@domain/models/database';
import { useOutletContext } from 'react-router-dom';
import GlassPanel from '@atoms/GlassPanel';
import Button from '@atoms/Button';
import { useLanguage } from '@context/LanguageContext';

const ArchetypeManager: React.FC = () => {
  const { t } = useLanguage();
  const { projectId } = useOutletContext<{ projectId: number }>();
  const [templates, setTemplates] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Plantilla>>({
    nombre: '',
    tipo: 'text',
    valor_defecto: '',
    es_obligatorio: 0,
    aplica_a_todo: 1,
    tipo_objetivo: 'PERSONAJE',
    categoria: 'General',
    orden: 0
  });

  const loadTemplates = async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await templateService.getAll(projectId);
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !formData.nombre) return;

    try {
      if (editingId) {
        await templateService.update(editingId, formData);
      } else {
        await templateService.create({
          ...formData as any,
          project_id: projectId
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        nombre: '',
        tipo: 'text',
        valor_defecto: '',
        es_obligatorio: 0,
        aplica_a_todo: 1,
        tipo_objetivo: 'PERSONAJE',
        categoria: 'General',
        orden: 0
      });
      loadTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  const handleEdit = (tpl: Plantilla) => {
    setFormData(tpl);
    setEditingId(tpl.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este atributo? Esto no borrará los datos ya guardados en las entidades, pero el campo dejará de ser visible.')) return;
    await templateService.delete(id);
    loadTemplates();
  };

  if (loading) return <div className="p-10 text-center animate-pulse italic opacity-50">Sincronizando leyes del mundo...</div>;

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto overflow-y-auto custom-scrollbar">
      <header className="mb-12">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary italic mb-4">
          <span className="material-symbols-outlined text-sm">architecture</span>
          El Taller: Leyes del Mundo
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-black text-foreground tracking-tighter mb-4">Gestor de Arquetipos</h1>
            <p className="text-foreground/40 max-w-lg text-xs leading-relaxed italic">
              Define las reglas físicas y metafísicas de tu universo. Crea campos personalizados que aparecerán en tus entidades automáticamente.
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingId(null);
              setFormData({
                 nombre: '', tipo: 'text', valor_defecto: '', es_obligatorio: 0,
                 aplica_a_todo: 1, tipo_objetivo: 'PERSONAJE', categoria: 'General', orden: 0
              });
              setShowForm(!showForm);
            }}
            variant="primary"
            className="rounded-none px-8 font-black uppercase tracking-widest text-[10px]"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Atributo'}
          </Button>
        </div>
      </header>

      {showForm && (
        <GlassPanel className="mb-12 p-8 border-primary/20 bg-primary/5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block">Nombre del Atributo</label>
                <input 
                  autoFocus
                  required
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 p-3 rounded-none outline-none focus:border-primary/50 transition-all"
                  placeholder="Ej: Nivel de Magia, Raza, Fecha de Coronación..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block">Tipo de Dato</label>
                  <select 
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-none outline-none focus:border-primary/50"
                  >
                    <option value="text">Texto Corto</option>
                    <option value="long_text">Texto Largo</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                    <option value="boolean">Interruptor (Sí/No)</option>
                    <option value="select">Lista Desplegable</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block">Categoría</label>
                  <input 
                    value={formData.categoria || ''}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-none outline-none focus:border-primary/50"
                    placeholder="General, Técnico, Biografía..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block">Alcance del Atributo</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, aplica_a_todo: 1})}
                    className={`flex-1 p-3 border transition-all text-[10px] font-bold uppercase tracking-widest ${formData.aplica_a_todo ? 'bg-primary border-primary text-white' : 'border-white/10 text-foreground/40'}`}
                  >
                    Global
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, aplica_a_todo: 0})}
                    className={`flex-1 p-3 border transition-all text-[10px] font-bold uppercase tracking-widest ${!formData.aplica_a_todo ? 'bg-primary border-primary text-white' : 'border-white/10 text-foreground/40'}`}
                  >
                    Específico
                  </button>
                </div>
              </div>

              {!formData.aplica_a_todo && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block">Solo para tipo:</label>
                  <select 
                    value={formData.tipo_objetivo || ''}
                    onChange={e => setFormData({...formData, tipo_objetivo: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-none outline-none focus:border-primary/50"
                  >
                    <option value="PERSONAJE">Personaje</option>
                    <option value="LUGAR">Lugar</option>
                    <option value="ORGANIZACION">Facción</option>
                    <option value="OBJETO">Objeto</option>
                    <option value="EVENTO">Evento</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4">
                <input 
                  type="checkbox"
                  id="obligatorio"
                  checked={!!formData.es_obligatorio}
                  onChange={e => setFormData({...formData, es_obligatorio: e.target.checked ? 1 : 0})}
                  className="size-4 accent-primary"
                />
                <label htmlFor="obligatorio" className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Es obligatorio</label>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" variant="primary" className="rounded-none px-12 font-black uppercase">
                {editingId ? 'Actualizar Regla' : 'Establecer Ley'}
              </Button>
            </div>
          </form>
        </GlassPanel>
      )}

      {/* Lista de Atributos */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="p-20 text-center border border-dashed border-white/10 opacity-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No hay leyes definidas aún</p>
          </div>
        ) : (
          templates.map(tpl => (
            <div key={tpl.id} className="group relative flex items-center justify-between p-6 monolithic-panel border border-white/5 hover:border-primary/30 transition-all duration-500 bg-white/[0.01]">
              <div className="flex items-center gap-6">
                <div className="size-12 rounded-none bg-white/5 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">
                    {tpl.tipo === 'number' ? '123' : tpl.tipo === 'date' ? 'calendar_today' : tpl.tipo === 'boolean' ? 'toggle_on' : 'match_case'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-foreground uppercase tracking-wider text-sm">{tpl.nombre}</h3>
                    <span className="text-[8px] font-black px-2 py-0.5 bg-primary/10 text-primary rounded uppercase tracking-tighter">
                      {tpl.tipo}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-foreground/20">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">category</span>
                      {tpl.categoria || 'Sin categoría'}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">public</span>
                      {tpl.aplica_a_todo ? 'Global' : `Solo ${tpl.tipo_objetivo}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(tpl)} className="p-2 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button onClick={() => handleDelete(tpl.id)} className="p-2 hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArchetypeManager;
