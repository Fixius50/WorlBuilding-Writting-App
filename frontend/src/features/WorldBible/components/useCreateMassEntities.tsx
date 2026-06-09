import { useState, useEffect } from "react";
import { WorldBibleUseCase } from "@application/useCases/WorldBibleUseCase";
import { Carpeta, Plantilla } from "@domain/models/database";

interface AttributeValue {
  template: Plantilla;
  value: string;
}

interface PendingEntity {
  name: string;
  type: string;
}

/**
 * 🧠 useCreateMassEntities
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

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, allFolders, initialFolderId]);

  const loadTemplates = async () => {
    try {
      const tpls = await WorldBibleUseCase.getTemplates(projectId);
      setAvailableTemplates(tpls);
    } catch (err) {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputValue.trim();
      if (val) {
        const parts = val.split(";").map((p) => p.trim()).filter((p) => !!p);
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

  const handleAddAttribute = (templateId: number) => {
    const tpl = availableTemplates.find((t) => t.id === templateId);
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
    setLoading(true);
    try {
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
          continue;
        }
        await WorldBibleUseCase.createEntityWithAttributes(
          {
            nombre: entry.name,
            tipo: resolvedType,
            project_id: projectId,
            carpeta_id: resolvedFolderId,
          },
          selectedAttributes
            .filter((attr) => attr.value.trim())
            .map((attr) => ({
              templateId: attr.template.id,
              value: attr.value,
            })),
        );
      }
      onCreated();
      onClose();
      setNameEntries([]);
      setSelectedAttributes([]);
    } catch (err) {
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
    handleSubmit,
  };
};
