import { useState, useEffect, useCallback } from 'react';
import { HIERARCHY_DEFINITIONS, HierarchyTypeId } from '@domain/models/hierarchy';
import { getHierarchyVisuals } from '@presentation/utils/hierarchyVisuals';

/**
 * 🧠 useCreateNodeModal
 * Logic for the "Omni-Creator" modal, handling form state and archetype selection.
 */
export const useCreateNodeModal = (
  isOpen: boolean,
  parentFolder: { id: number; nombre: string } | null | undefined,
  onClose: () => void,
  onCreate: (data: { nombre: string; tipo: string; descripcion?: string }) => void
) => {
  const isRoot = !parentFolder;

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'FOLDER' as HierarchyTypeId,
    canvasType: 'BLANK'
  });

  // Definición de tipos disponibles para el Omni-Constructor agrupados por Arquetipo
  const ARQUETIPOS_GROUPS = [
    {
      name: 'ARQUETIPO CÓSMICO',
      ids: ['UNIVERSE', 'PLANET', 'DIMENSION'] as HierarchyTypeId[]
    },
    {
      name: 'ARQUETIPO INDIVIDUAL',
      ids: ['PERSONAJE', 'OBJETO', 'ENTIDAD'] as HierarchyTypeId[]
    },
    {
      name: 'ARQUETIPO TERRITORIAL',
      ids: ['LUGAR', 'MAP'] as HierarchyTypeId[]
    },
    {
      name: 'ARQUETIPO COLECTIVO',
      ids: ['ORGANIZACION', 'CONLANG'] as HierarchyTypeId[]
    },
    {
      name: 'ARQUETIPO CRONOLÓGICO',
      ids: ['EVENTO', 'TIMELINE'] as HierarchyTypeId[]
    }
  ];

  const getFullType = useCallback((id: HierarchyTypeId) => ({
    ...HIERARCHY_DEFINITIONS[id],
    ...getHierarchyVisuals(id)
  }), []);

  useEffect(() => {
    if (isOpen) {
      const defaultType: HierarchyTypeId = parentFolder ? 'PERSONAJE' : 'FOLDER';
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: defaultType,
        canvasType: 'BLANK'
      });
    }
  }, [isOpen, parentFolder]);

  const handleSubmit = useCallback(() => {
    const finalTipo = isRoot ? 'FOLDER' : formData.tipo;
    const finalData = { ...formData, tipo: finalTipo };
    
    onCreate(finalData);
    onClose();
  }, [isRoot, formData, onCreate, onClose]);

  const setNombre = useCallback((nombre: string) => setFormData(prev => ({ ...prev, nombre })), []);
  const setDescripcion = useCallback((descripcion: string) => setFormData(prev => ({ ...prev, descripcion })), []);
  const setTipo = useCallback((tipo: HierarchyTypeId) => setFormData(prev => ({ ...prev, tipo })), []);

  return {
    isRoot,
    formData,
    setNombre,
    setDescripcion,
    setTipo,
    handleSubmit,
    ARQUETIPOS_GROUPS,
    getFullType
  };
};
