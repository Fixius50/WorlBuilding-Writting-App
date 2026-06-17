import { useState, useCallback } from "react";
import { TemplateUseCase } from "@features/Settings/application/TemplateUseCase";
import { Plantilla } from "@domain/database";
import { useQuery } from "@tanstack/react-query";

export const archetypeTemplatesQueryKey = (projectId: number) =>
  ["archetype-templates", projectId] as const;

/**
 * ðŸ§  useArchetypeManager
 * Logic for managing custom entity attributes and world-building rules.
 */
export const useArchetypeManager = (projectId: number) => {
  const {
    data: templates = [],
    isLoading: loading,
    refetch: refetchTemplates,
  } = useQuery<Plantilla[]>({
    queryKey: archetypeTemplatesQueryKey(projectId),
    enabled: Number.isFinite(projectId) && projectId > 0,
    queryFn: async () => {
      return await TemplateUseCase.getTemplates(projectId);
    },
  });

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Plantilla>>({
    nombre: "",
    tipo: "text",
    valor_defecto: "",
    es_obligatorio: 0,
    aplica_a_todo: 1,
    tipo_objetivo: "PERSONAJE",
    categoria: "General",
    orden: 0,
  });

  const loadTemplates = useCallback(async () => {
    await refetchTemplates();
  }, [refetchTemplates]);

  const resetForm = useCallback(() => {
    setFormData({
      nombre: "",
      tipo: "text",
      valor_defecto: "",
      es_obligatorio: 0,
      aplica_a_todo: 1,
      tipo_objetivo: "PERSONAJE",
      categoria: "General",
      orden: 0,
    });
    setEditingId(null);
    setShowForm(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!projectId || !formData.nombre) return;

      try {
        if (editingId) {
          await TemplateUseCase.updateTemplate(editingId, formData);
        } else {
          await TemplateUseCase.createTemplate({
            ...(formData as Omit<Plantilla, "id" | "created_at">),
            project_id: projectId,
          });
        }
        resetForm();
        await loadTemplates();
      } catch (err) {
        console.error("Error saving template:", err);
      }
    },
    [projectId, formData, editingId, resetForm, loadTemplates],
  );

  const handleEdit = useCallback((tpl: Plantilla) => {
    setFormData(tpl);
    setEditingId(tpl.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      if (
        !window.confirm(
          "Â¿Eliminar este atributo? Esto no borrarÃ¡ los datos ya guardados en las entidades, pero el campo dejarÃ¡ de ser visible.",
        )
      )
        return;
      try {
        await TemplateUseCase.deleteTemplate(id);
        await loadTemplates();
      } catch (err) {
        console.error("Error deleting template:", err);
      }
    },
    [loadTemplates],
  );

  const toggleForm = useCallback(() => {
    if (showForm) {
      resetForm();
    } else {
      setShowForm(true);
    }
  }, [showForm, resetForm]);

  return {
    templates,
    loading,
    showForm,
    editingId,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    toggleForm,
  };
};

