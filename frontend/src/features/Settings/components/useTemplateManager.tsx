import { useState, useEffect } from 'react';
import { TemplateUseCase } from '@application/useCases/TemplateUseCase';
import { Plantilla } from '@domain/models/database';

export interface TemplateField {
  label: string;
  type: string;
  required: boolean;
  metadata: unknown;
}

/**
 * 🧠 useTemplateManager
 * Logic for managing global attribute templates.
 */
export const useTemplateManager = () => {
  const [rootFolderId, setRootFolderId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const folders = await TemplateUseCase.getProjectFolders(1);
      if (folders.length > 0) {
        setRootFolderId(folders[0].id);
      }
      loadGlobalTemplates();
    } catch (err) { }
  };

  const loadGlobalTemplates = async () => {
    setLoading(true);
    try {
      const data = await TemplateUseCase.getTemplates(0);
      setTemplates(data);
    } catch (err) { }
    finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (newField: TemplateField) => {
    try {
      await TemplateUseCase.createTemplate({
        nombre: newField.label,
        tipo: newField.type,
        valor_defecto: null,
        metadata: newField.metadata ? JSON.stringify(newField.metadata) : null,
        es_obligatorio: newField.required,
        project_id: 0,
        aplica_a_todo: 1,
        tipo_objetivo: null,
        categoria: null,
        orden: 0
      });
      loadGlobalTemplates();
    } catch (err) { }
  };

  const confirmDeleteAction = async () => {
    if (!confirmDeleteId) return;
    try {
      await TemplateUseCase.deleteTemplate(confirmDeleteId);
      setTemplates(prev => prev.filter(t => t.id !== confirmDeleteId));
    } catch (err) { }
    finally {
      setConfirmDeleteId(null);
    }
  };

  return {
    templates,
    loading,
    confirmDeleteId,
    setConfirmDeleteId,
    handleCreateTemplate,
    confirmDeleteAction
  };
};

/**
 * 🧠 useNewFieldForm
 * Logic for the new attribute form.
 */
export const useNewFieldForm = (onAdd: (field: TemplateField) => void) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('text');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState(['']);

  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));
  const handleOptionChange = (idx: number, val: string) => {
    const newOpts = [...options];
    newOpts[idx] = val;
    setOptions(newOpts);
  };

  const handleSubmit = () => {
    if (!label) return;
    let metadata = null;
    if (['select', 'multi_select'].includes(type)) {
      metadata = { options: options.filter(o => o.trim()) };
    }
    onAdd({ label, type, required, metadata });
    setLabel('');
    setOptions(['']);
  };

  return {
    label, setLabel,
    type, setType,
    required, setRequired,
    options,
    handleAddOption,
    handleRemoveOption,
    handleOptionChange,
    handleSubmit
  };
};
