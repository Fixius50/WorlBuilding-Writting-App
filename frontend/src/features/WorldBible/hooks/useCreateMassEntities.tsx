import { useState, useEffect, useRef } from "react";
import { WorldBibleUseCase } from "@features/WorldBible/application/WorldBibleUseCase";
import { TemplateUseCase } from "@features/Settings/application/TemplateUseCase";
import { Carpeta, Plantilla } from "@domain/database";
import { useSettingsStore } from "@features/Settings/store/useSettingsStore";

interface AttributeValue {
  template: Plantilla;
  value: string;
}

interface PendingEntity {
  name: string;
  type: string;
}

/**
 * ðŸ§  useCreateMassEntities
 * Logic for batch creating entities with common attributes.
 */
export const useCreateMassEntities = (
  isOpen: boolean,
  projectId: number,
  allFolders: Carpeta[],
  onCreated: () => void,
  onClose: () => void,
  initialFolderId?: number | null,
) => {
  const [nameEntries, setNameEntries] = useState<PendingEntity[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [type, setType] = useState("PERSONAJE");
  const [folderId, setFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<Plantilla[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<
    AttributeValue[]
  >([]);
  const addNotification = useSettingsStore((state) => state.addNotification);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      loadTemplates();
      setNameEntries([]);
      setInputValue("");

      if (initialFolderId) {
        setFolderId(initialFolderId);
      } else if (allFolders && allFolders.length > 0) {
        setFolderId(allFolders[0].id);
      } else {
        setFolderId(null);
      }
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, initialFolderId, projectId]);

  useEffect(() => {
    if (!isOpen || folderId) {
      return;
    }

    if (initialFolderId) {
      setFolderId(initialFolderId);
      return;
    }

    if (allFolders && allFolders.length > 0) {
      setFolderId(allFolders[0].id);
    }
  }, [isOpen, folderId, initialFolderId, allFolders]);

  const loadTemplates = async () => {
    try {
      const tpls = await WorldBibleUseCase.getTemplates(projectId);
      setAvailableTemplates(tpls);
    } catch {}
  };

  const handleCreateTemplate = async (
    templateData: Pick<
      Plantilla,
      "nombre" | "tipo" | "valor_defecto" | "es_obligatorio"
    >,
  ): Promise<Plantilla | null> => {
    if (!projectId || !templateData.nombre.trim()) {
      return null;
    }

    try {
      const createdTemplate = await TemplateUseCase.createTemplate({
        nombre: templateData.nombre.trim(),
        tipo: templateData.tipo || "text",
        valor_defecto: templateData.valor_defecto ?? "",
        metadata: null,
        es_obligatorio: Number(templateData.es_obligatorio) ? 1 : 0,
        project_id: projectId,
        aplica_a_todo: 1,
        tipo_objetivo: "PERSONAJE",
        categoria: "General",
        orden: 0,
      });

      await loadTemplates();
      addNotification(`Plantilla creada: ${createdTemplate.nombre}`, "success");
      return createdTemplate;
    } catch {
      addNotification("No se pudo crear la plantilla", "error");
      return null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputValue.trim();
      if (val) {
        const parts = val
          .split(";")
          .map((p) => p.trim())
          .filter((p) => !!p);
        setNameEntries((prev) => [
          ...prev,
          ...parts.map((p) => ({ name: p, type })),
        ]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && nameEntries.length > 0) {
      setNameEntries((prev) => prev.slice(0, -1));
    }
  };

  const removeNameAt = (indexToRemove: number) => {
    setNameEntries((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const updateNameType = (name: string, newType: string) => {
    setNameEntries((prev) =>
      prev.map((entry) =>
        entry.name === name ? { ...entry, type: newType } : entry,
      ),
    );
  };

  const handleAddAttribute = (
    templateId: number,
    templateOverride?: Plantilla,
  ) => {
    const tpl =
      templateOverride || availableTemplates.find((t) => t.id === templateId);
    if (tpl && !selectedAttributes.find((a) => a.template.id === templateId)) {
      setSelectedAttributes((prev) => [
        ...prev,
        { template: tpl, value: tpl.valor_defecto || "" },
      ]);
    }
  };

  const handleRemoveAttribute = (templateId: number) => {
    setSelectedAttributes((prev) =>
      prev.filter((a) => a.template.id !== templateId),
    );
  };

  const handleAttributeValueChange = (templateId: number, value: string) => {
    setSelectedAttributes((prev) =>
      prev.map((a) => (a.template.id === templateId ? { ...a, value } : a)),
    );
  };

  const handleSubmit = async (
    typeSequence?: string[],
    folderSequence?: number[],
  ) => {
    const hasFolderSequence = !!folderSequence && folderSequence.length > 0;
    if (nameEntries.length === 0 || (!folderId && !hasFolderSequence)) return;

    const attributesToApply: { templateId: number; value: string }[] = [];
    for (const attr of selectedAttributes) {
      const trimmedValue = attr.value.trim();
      if (!trimmedValue) {
        continue;
      }
      attributesToApply.push({
        templateId: attr.template.id,
        value: attr.value,
      });
    }

    setLoading(true);
    onClose();
    const totalCount = nameEntries.length;
    const progressNotificationId = addNotification(
      `Cargando entidades en serie...`,
      "info",
      {
        autoCloseMs: null,
        progress: { current: 0, total: totalCount },
      },
    );

    try {
      let createdCount = 0;
      let failedCount = 0;

      for (let index = 0; index < nameEntries.length; index += 1) {
        const entry = nameEntries[index];
        const resolvedType =
          typeSequence && typeSequence.length > 0
            ? typeSequence[Math.min(index, typeSequence.length - 1)]
            : entry.type;
        const resolvedFolderId =
          folderSequence && folderSequence.length > 0
            ? folderSequence[Math.min(index, folderSequence.length - 1)]
            : folderId;
        if (!resolvedFolderId) {
          failedCount += 1;
          addNotification(
            `Procesando carga masiva... (${index + 1}/${totalCount})`,
            "info",
            {
              id: progressNotificationId,
              autoCloseMs: null,
              progress: { current: index + 1, total: totalCount },
            },
          );
          continue;
        }

        try {
          await WorldBibleUseCase.createEntityWithAttributes(
            {
              nombre: entry.name,
              tipo: resolvedType,
              project_id: projectId,
              carpeta_id: resolvedFolderId,
            },
            attributesToApply,
          );

          createdCount += 1;
          onCreated();
        } catch {
          failedCount += 1;
        }

        addNotification(
          `Procesando carga masiva... (${index + 1}/${totalCount})`,
          "info",
          {
            id: progressNotificationId,
            autoCloseMs: null,
            progress: { current: index + 1, total: totalCount },
          },
        );
      }

      if (failedCount > 0) {
        addNotification(
          `Carga finalizada: ${createdCount} creadas, ${failedCount} con error`,
          createdCount > 0 ? "info" : "error",
          {
            id: progressNotificationId,
            autoCloseMs: 2000,
            progress: { current: totalCount, total: totalCount },
          },
        );
      } else {
        addNotification(
          `Carga completada: ${createdCount} entidades creadas`,
          "success",
          {
            id: progressNotificationId,
            autoCloseMs: 2000,
            progress: { current: totalCount, total: totalCount },
          },
        );
      }

      setNameEntries([]);
      setSelectedAttributes([]);
    } catch {
      addNotification("Error inesperado durante la carga masiva", "error", {
        id: progressNotificationId,
        autoCloseMs: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    nameEntries,
    inputValue,
    setInputValue,
    type,
    setType,
    folderId,
    setFolderId,
    loading,
    availableTemplates,
    selectedAttributes,
    handleKeyDown,
    removeNameAt,
    updateNameType,
    handleAddAttribute,
    handleRemoveAttribute,
    handleAttributeValueChange,
    handleCreateTemplate,
    handleSubmit,
  };
};


