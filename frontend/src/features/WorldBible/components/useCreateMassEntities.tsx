import { useState, useEffect } from 'react';
import { WorldBibleUseCase } from '@application/useCases/WorldBibleUseCase';
import { Carpeta, Plantilla } from '@domain/models/database';

interface AttributeValue {
  template: Plantilla;
  value: string;
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
  initialFolderId?: number | null
) => {
  const [nameList, setNameList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [type, setType] = useState('PERSONAJE');
  const [folderId, setFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<Plantilla[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeValue[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setNameList([]);
      setInputValue('');
      
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
    } catch (err) { }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !nameList.includes(val)) {
        setNameList(prev => [...prev, val]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && nameList.length > 0) {
      setNameList(prev => prev.slice(0, -1));
    }
  };

  const removeName = (nameToRemove: string) => {
    setNameList(prev => prev.filter(n => n !== nameToRemove));
  };

  const handleAddAttribute = (templateId: number) => {
    const tpl = availableTemplates.find(t => t.id === templateId);
    if (tpl && !selectedAttributes.find(a => a.template.id === templateId)) {
      setSelectedAttributes(prev => [...prev, { template: tpl, value: tpl.valor_defecto || '' }]);
    }
  };

  const handleRemoveAttribute = (templateId: number) => {
    setSelectedAttributes(prev => prev.filter(a => a.template.id !== templateId));
  };

  const handleAttributeValueChange = (templateId: number, value: string) => {
    setSelectedAttributes(prev => prev.map(a => 
      a.template.id === templateId ? { ...a, value } : a
    ));
  };

  const handleSubmit = async () => {
    if (nameList.length === 0 || !folderId) return;
    setLoading(true);
    try {
      for (const name of nameList) {
        await WorldBibleUseCase.createEntityWithAttributes(
          {
            nombre: name,
            tipo: type,
            project_id: projectId,
            carpeta_id: folderId
          },
          selectedAttributes
            .filter(attr => attr.value.trim())
            .map(attr => ({ templateId: attr.template.id, value: attr.value }))
        );
      }
      onCreated();
      onClose();
      setNameList([]);
      setSelectedAttributes([]);
    } catch (err) { } finally {
      setLoading(false);
    }
  };

  return {
    nameList, setNameList,
    inputValue, setInputValue,
    type, setType,
    folderId, setFolderId,
    loading,
    availableTemplates,
    selectedAttributes,
    handleKeyDown,
    removeName,
    handleAddAttribute,
    handleRemoveAttribute,
    handleAttributeValueChange,
    handleSubmit
  };
};
