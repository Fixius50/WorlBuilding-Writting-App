import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TemplateUseCase } from "@application/useCases/TemplateUseCase";
import { Plantilla, Valor, Entidad } from "@domain/models/database";

/**
 * 🧠 useDynamicAttributeForm
 * Logic for managing dynamic entity attributes, including loading templates and persistence.
 */
export const useDynamicAttributeForm = (
  entity: Entidad,
  onUpdate?: () => void,
) => {
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState<number | null>(null);

  const attributesQueryKey = [
    "entity-dynamic-attributes",
    entity.project_id,
    entity.id,
    entity.tipo || "",
  ] as const;

  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: attributesQueryKey,
    enabled: Number.isFinite(entity.id) && Number.isFinite(entity.project_id),
    queryFn: async (): Promise<{ templates: Plantilla[]; values: Valor[] }> => {
      const allTemplates = await TemplateUseCase.getTemplates(
        entity.project_id,
      );
      const normalizedEntityType = (entity.tipo || "").trim().toUpperCase();
      const applicable = allTemplates.filter((tpl) => {
        const appliesToAll =
          tpl.aplica_a_todo === true || tpl.aplica_a_todo === 1;
        const targetType =
          typeof tpl.tipo_objetivo === "string"
            ? tpl.tipo_objetivo.trim().toUpperCase()
            : "";
        const hasNoSpecificTarget = targetType.length === 0;
        const matchesEntityType = targetType === normalizedEntityType;

        switch (true) {
          case appliesToAll:
          case hasNoSpecificTarget:
          case matchesEntityType:
            return true;
          default:
            return false;
        }
      });

      const entityValues = await TemplateUseCase.getEntityValues(entity.id);
      return {
        templates: applicable,
        values: entityValues,
      };
    },
  });

  const templates = data?.templates || [];
  const values = data?.values || [];

  const loadData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleValueChange = useCallback(
    async (templateId: number, newValue: string) => {
      setSavingId(templateId);
      try {
        const existingValue = values.find((v) => v.plantilla_id === templateId);
        if (existingValue) {
          await TemplateUseCase.updateEntityValue(existingValue.id, newValue);
        } else {
          await TemplateUseCase.addEntityValue(entity.id, templateId, newValue);
        }
        await queryClient.invalidateQueries({ queryKey: attributesQueryKey });
        if (onUpdate) onUpdate();
      } catch (err) {
      } finally {
        setSavingId(null);
      }
    },
    [values, entity.id, onUpdate, queryClient, attributesQueryKey],
  );

  const categories = templates.reduce(
    (acc, tpl) => {
      const cat = tpl.categoria || "Detalles Técnicos";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(tpl);
      return acc;
    },
    {} as Record<string, Plantilla[]>,
  );

  return {
    templates,
    values,
    loading,
    savingId,
    categories,
    handleValueChange,
    loadData,
  };
};
