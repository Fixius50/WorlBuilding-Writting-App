import { useState, useEffect, useCallback } from 'react';
import { TemplateUseCase } from '@application/useCases/TemplateUseCase';
import { Plantilla, Valor, Entidad } from '@domain/models/database';

/**
 * 🧠 useDynamicAttributeForm
 * Logic for managing dynamic entity attributes, including loading templates and persistence.
 */
export const useDynamicAttributeForm = (
  entity: Entidad,
  onUpdate?: () => void
) => {
  const [templates, setTemplates] = useState<Plantilla[]>([]);
  const [values, setValues] = useState<Valor[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allTemplates = await TemplateUseCase.getTemplates(entity.project_id);
      const applicable = allTemplates.filter(tpl => 
        tpl.aplica_a_todo || tpl.tipo_objetivo === entity.tipo
      );
      setTemplates(applicable);
      const entityValues = await TemplateUseCase.getEntityValues(entity.id);
      setValues(entityValues);
    } catch (err) { }
    finally {
      setLoading(false);
    }
  }, [entity.id, entity.project_id, entity.tipo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleValueChange = async (templateId: number, newValue: string) => {
    setSavingId(templateId);
    try {
      const existingValue = values.find(v => v.plantilla_id === templateId);
      if (existingValue) {
        await TemplateUseCase.updateEntityValue(existingValue.id, newValue);
      } else {
        await TemplateUseCase.addEntityValue(entity.id, templateId, newValue);
      }
      const updatedValues = await TemplateUseCase.getEntityValues(entity.id);
      setValues(updatedValues);
      if (onUpdate) onUpdate();
    } catch (err) { }
    finally {
      setSavingId(null);
    }
  };

  const categories = templates.reduce((acc, tpl) => {
    const cat = tpl.categoria || 'Detalles Técnicos';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tpl);
    return acc;
  }, {} as Record<string, Plantilla[]>);

  return {
    templates,
    values,
    loading,
    savingId,
    categories,
    handleValueChange,
    loadData
  };
};
