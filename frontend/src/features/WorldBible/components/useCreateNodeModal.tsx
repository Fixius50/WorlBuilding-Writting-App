import { useState, useEffect, useCallback } from "react";
import { HierarchyTypeId, HIERARCHY_DEFINITIONS } from "../types";
import { getHierarchyVisuals } from "@presentation/utils/hierarchyVisuals";

/**
 * 🧠 useCreateArchetypeModal
 * Logic for the "Omni-Creator" modal, handling form state and archetype selection.
 */
export const useCreateArchetypeModal = (
  isOpen: boolean,
  parentFolder: { id: number; nombre: string } | null | undefined,
  onClose: () => void,
  onCreate: (data: {
    nombre: string;
    tipo: string;
    descripcion?: string;
  }) => void,
  forceEntityMode?: boolean,
) => {
  const isRoot = !parentFolder && !forceEntityMode;

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "folder" as HierarchyTypeId,
    canvasType: "blank",
  });

  // Definición de tipos disponibles para el Omni-Constructor agrupados por Arquetipo
  const ARQUETIPOS_GROUPS = [
    {
      name: "ARQUETIPO INDIVIDUAL",
      ids: ["personaje", "magic", "objeto"] as HierarchyTypeId[],
    },
    {
      name: "ARQUETIPO COLECTIVO",
      ids: ["organizacion", "conlang"] as HierarchyTypeId[],
    },
    {
      name: "ARQUETIPO TERRITORIAL",
      ids: ["lugar", "map"] as HierarchyTypeId[],
    },
    {
      name: "ARQUETIPO CRONOLÓGICO",
      ids: ["evento", "timeline"] as HierarchyTypeId[],
    },
    {
      name: "ARQUETIPO CÓSMICO",
      ids: ["universe", "planet", "dimension"] as HierarchyTypeId[],
    },
  ];

  const getFullType = useCallback(
    (id: HierarchyTypeId) => ({
      ...HIERARCHY_DEFINITIONS[id],
      ...getHierarchyVisuals(id),
    }),
    [],
  );

  useEffect(() => {
    if (isOpen) {
      const defaultType: HierarchyTypeId =
        parentFolder || forceEntityMode ? "personaje" : "folder";
      setFormData({
        nombre: "",
        descripcion: "",
        tipo: defaultType,
        canvasType: "blank",
      });
    }
  }, [isOpen, parentFolder]);

  const handleSubmit = useCallback(() => {
    // Normalizamos a minúsculas para el dominio
    const finalTipo = isRoot ? "folder" : formData.tipo || "personaje";
    const finalData = { ...formData, tipo: finalTipo.toLowerCase() };

    onCreate(finalData);
    onClose();
  }, [isRoot, formData, onCreate, onClose]);

  const setNombre = useCallback(
    (nombre: string) => setFormData((prev) => ({ ...prev, nombre })),
    [],
  );
  const setDescripcion = useCallback(
    (descripcion: string) => setFormData((prev) => ({ ...prev, descripcion })),
    [],
  );
  const setTipo = useCallback(
    (tipo: HierarchyTypeId) => setFormData((prev) => ({ ...prev, tipo })),
    [],
  );

  return {
    isRoot,
    formData,
    setNombre,
    setDescripcion,
    setTipo,
    handleSubmit,
    ARQUETIPOS_GROUPS,
    getFullType,
  };
};
