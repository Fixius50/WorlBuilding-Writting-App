import { useState, useEffect, useCallback } from 'react';
import { Proyecto } from '@domain/models/database';

const GENRES = ['FANTASÍA', 'SCI-FI', 'HORROR', 'LORE', 'MISTERIO', 'HISTÓRICO', 'STEAMPUNK'];

/**
 * 🧠 useEditWorkspaceModal
 * Hook to handle project workspace editing, managing state synchronization and updates.
 */
export const useEditWorkspaceModal = (
  project: Proyecto,
  onClose: () => void,
  onUpdate: (data: Partial<Proyecto>) => void
) => {
  const [imgError, setImgError] = useState(false);
  const [formData, setFormData] = useState({
    nombre: project?.nombre || '',
    descripcion: project?.descripcion || '',
    tag: project?.tag || 'FANTASÍA',
    image_url: project?.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
  });

  useEffect(() => {
    if (project) {
      setFormData({
        nombre: project.nombre,
        descripcion: project.descripcion || '',
        tag: project.tag || 'FANTASÍA',
        image_url: project.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
      });
    }
  }, [project]);

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUrlChange = useCallback((val: string) => {
    setFormData(prev => ({ ...prev, image_url: val }));
    setImgError(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      tag: formData.tag,
      image_url: formData.image_url
    });
    onClose();
  }, [formData, onUpdate, onClose]);

  return {
    formData,
    imgError,
    setImgError,
    handleFieldChange,
    handleImageUrlChange,
    handleSubmit,
    GENRES
  };
};
