import { useState, useEffect, useCallback } from "react";
import { TemplateUseCase } from "@application/useCases/TemplateUseCase";
import { Plantilla } from "@domain/models/database";
import { useQuery } from "@tanstack/react-query";

export const globalTemplatesQueryKey = [
  "template-manager",
  "global-templates",
] as const;
export const templateFoldersQueryKey = [
  "template-manager",
  "project-folders",
  1,
] as const;

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
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { data: folders = [] } = useQuery({
    queryKey: templateFoldersQueryKey,
    queryFn: async () => {
      return await TemplateUseCase.getProjectFolders(1);
    },
  });

  const {
    data: templates = [],
    isLoading: loading,
    refetch: refetchGlobalTemplates,
  } = useQuery<Plantilla[]>({
    queryKey: globalTemplatesQueryKey,
    queryFn: async () => {
      return await TemplateUseCase.getTemplates(0);
    },
  });

  useEffect(() => {
    switch (true) {
      case folders.length > 0:
        setRootFolderId(folders[0].id);
        break;
      default:
        break;
    }
  }, [folders]);

  const loadGlobalTemplates = useCallback(async () => {
    await refetchGlobalTemplates();
  }, [refetchGlobalTemplates]);

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
        orden: 0,
      });
      await loadGlobalTemplates();
    } catch (err) {}
  };

  const confirmDeleteAction = async () => {
    if (!confirmDeleteId) return;
    try {
      await TemplateUseCase.deleteTemplate(confirmDeleteId);
      await loadGlobalTemplates();
    } catch (err) {
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return {
    templates,
    loading,
    confirmDeleteId,
    setConfirmDeleteId,
    handleCreateTemplate,
    confirmDeleteAction,
  };
};

/**
 * 🧠 useNewFieldForm
 * Logic for the new attribute form.
 */
export const useNewFieldForm = (onAdd: (field: TemplateField) => void) => {
  const [label, setLabel] = useState("");
  const [type, setType] = useState("text");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState([""]);

  const handleAddOption = () => setOptions([...options, ""]);
  const handleRemoveOption = (idx: number) =>
    setOptions(options.filter((_, i) => i !== idx));
  const handleOptionChange = (idx: number, val: string) => {
    const newOpts = [...options];
    newOpts[idx] = val;
    setOptions(newOpts);
  };

  const handleSubmit = () => {
    if (!label) return;
    let metadata = null;
    if (["select", "multi_select"].includes(type)) {
      metadata = { options: options.filter((o) => o.trim()) };
    }
    onAdd({ label, type, required, metadata });
    setLabel("");
    setOptions([""]);
  };

  return {
    label,
    setLabel,
    type,
    setType,
    required,
    setRequired,
    options,
    handleAddOption,
    handleRemoveOption,
    handleOptionChange,
    handleSubmit,
  };
};
