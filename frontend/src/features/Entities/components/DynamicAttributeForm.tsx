import React, { useState, useEffect } from 'react';
import { templateService } from '@repositories/templateService';
import { entityService } from '@repositories/entityService';
import { Plantilla, Valor, Entidad } from '@domain/models/database';
// import MonolithicPanel from '@atoms/MonolithicPanel';
import { useLanguage } from '@context/LanguageContext';

interface DynamicAttributeFormProps {
  entity: Entidad;
  onUpdate?: () => void;
}

const DynamicAttributeForm: React.FC<DynamicAttributeFormProps> = ({ entity, onUpdate }) => {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Plantilla[]>([]);
  const [values, setValues] = useState<Valor[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Cargar todas las plantillas del proyecto
      const allTemplates = await templateService.getAll(entity.project_id);
      
      // 2. Filtrar las que aplican a esta entidad (Globales o por Tipo)
      const applicable = allTemplates.filter(tpl => 
        tpl.aplica_a_todo || tpl.tipo_objetivo === entity.tipo
      );
      setTemplates(applicable);

      // 3. Cargar valores actuales de la entidad
      const entityValues = await entityService.getValues(entity.id);
      setValues(entityValues);
    } catch (err) {
      // [LOG REMOVED]
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [entity.id]);

  const handleValueChange = async (templateId: number, newValue: string) => {
    setSavingId(templateId);
    try {
      const existingValue = values.find(v => v.plantilla_id === templateId);
      
      if (existingValue) {
        await entityService.updateValue(existingValue.id, newValue);
      } else {
        await entityService.addValue(entity.id, templateId, newValue);
      }
      
      // Recargar localmente para mostrar el cambio sin parpadeos
      const updatedValues = await entityService.getValues(entity.id);
      setValues(updatedValues);
      
      if (onUpdate) onUpdate();
    } catch (err) {
      // [LOG REMOVED]
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="p-4 animate-pulse italic opacity-30 text-[10px]">Cargando atributos mágicos...</div>;
  if (templates.length === 0) return null;

  // Agrupar por categoría
  const categories = templates.reduce((acc, tpl) => {
    const cat = tpl.categoria || 'Detalles Técnicos';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tpl);
    return acc;
  }, {} as Record<string, Plantilla[]>);

  return (
    <div className="space-y-8">
      {Object.entries(categories).map(([category, tpls]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary whitespace-nowrap">{category}</h3>
             <div className="h-[1px] w-full bg-gradient-to-r from-primary/20 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {tpls.map(tpl => {
              const valueObj = values.find(v => v.plantilla_id === tpl.id);
              const currentValue = valueObj ? valueObj.valor : '';
              
              return (
                <div key={tpl.id} className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 bg-background border border-foreground/5 hover:border-primary/20 transition-all rounded-none">
                  <div className="mb-2 md:mb-0">
                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-1">
                      {tpl.nombre}
                      {tpl.es_obligatorio ? <span className="text-primary ml-1">*</span> : ''}
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-2/3">
                    {(() => {
                      switch (tpl.tipo) {
                        case 'boolean':
                          return (
                            <button 
                              onClick={() => handleValueChange(tpl.id, currentValue === 'true' ? 'false' : 'true')}
                              className={`flex items-center gap-2 px-4 py-2 border transition-all text-[10px] font-black uppercase tracking-widest ${
                                currentValue === 'true' 
                                  ? 'bg-primary border-primary text-white' 
                                  : 'bg-foreground/5 border-foreground/10 text-foreground/40'
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {currentValue === 'true' ? 'check_circle' : 'cancel'}
                              </span>
                              {currentValue === 'true' ? 'Activado' : 'Desactivado'}
                            </button>
                          );
                        case 'date':
                          return (
                            <input 
                              type="date"
                              value={currentValue || ''}
                              onChange={e => handleValueChange(tpl.id, e.target.value)}
                              className="w-full bg-foreground/[0.02] border border-foreground/10 p-2 text-xs text-foreground outline-none focus:border-primary/50 transition-colors"
                            />
                          );
                        case 'number':
                          return (
                            <input 
                              type="number"
                              value={currentValue || ''}
                              onChange={e => handleValueChange(tpl.id, e.target.value)}
                              className="w-full bg-foreground/[0.02] border border-foreground/10 p-2 text-xs text-foreground outline-none focus:border-primary/50 transition-colors"
                            />
                          );
                        case 'textarea':
                        case 'long_text':
                          return (
                            <textarea
                              rows={tpl.tipo === 'long_text' ? 4 : 2}
                              value={currentValue || ''}
                              onChange={e => handleValueChange(tpl.id, e.target.value)}
                              className="w-full bg-foreground/[0.02] border border-foreground/10 p-3 text-xs text-foreground outline-none focus:border-primary/50 transition-colors min-h-[80px] leading-relaxed resize-y"
                              placeholder="Escribe contenido extendido..."
                            />
                          );
                        case 'select':
                          const metadata = typeof tpl.metadata === 'string' ? JSON.parse(tpl.metadata) : (tpl.metadata || {});
                          const options = (metadata.options as string[]) || [];
                          return (
                            <select
                              value={currentValue || ''}
                              onChange={e => handleValueChange(tpl.id, e.target.value)}
                              className="w-full bg-foreground/[0.02] border border-foreground/10 p-2 text-xs text-foreground outline-none focus:border-primary/50 transition-colors appearance-none"
                            >
                              <option value="">Seleccionar...</option>
                              {options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          );
                        case 'image':
                          return (
                            <div className="flex flex-col gap-2 w-full">
                              <input 
                                type="text"
                                value={currentValue || ''}
                                onChange={e => handleValueChange(tpl.id, e.target.value)}
                                className="w-full bg-foreground/[0.02] border border-foreground/10 p-2 text-xs text-foreground outline-none focus:border-primary/50 transition-colors"
                                placeholder="https://ejemplo.com/imagen.png"
                              />
                              {currentValue && (
                                <div className="size-20 border border-foreground/10 bg-foreground/5 overflow-hidden">
                                  <img src={currentValue} alt="Preview" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                                </div>
                              )}
                            </div>
                          );
                        default:
                          return (
                            <input 
                              type="text"
                              value={currentValue || ''}
                              onChange={e => handleValueChange(tpl.id, e.target.value)}
                              className="w-full bg-foreground/[0.02] border border-foreground/10 p-2 text-xs text-foreground outline-none focus:border-primary/50 transition-colors"
                              placeholder="..."
                            />
                          );
                      }
                    })()}
                    
                    {savingId === tpl.id && (
                      <span className="animate-spin material-symbols-outlined text-primary text-sm">sync</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DynamicAttributeForm;
