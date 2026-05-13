import { useState, useCallback } from 'react';

const GENRES = ['FANTASÍA', 'SCI-FI', 'HORROR', 'LORE', 'MISTERIO', 'HISTÓRICO', 'CYBERPUNK', 'STEAMPUNK'];

/**
 * 🧠 useCreateWorkspaceModal
 * Hook to handle project workspace creation, including slug generation and custom genre management.
 */
export const useCreateWorkspaceModal = (
  onClose: () => void,
  onCreate: (formData: { name: string, title: string, genre: string, imageUrl?: string }) => void
) => {
  const [imgError, setImgError] = useState(false);
  const [isCustomGenre, setIsCustomGenre] = useState(false);
  const [formData, setFormData] = useState({
    name: '', // Internal filename/ID
    title: '', // Display title
    genre: 'FANTASÍA',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
  });

  const slugify = useCallback((text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'title') {
        newData.name = slugify(value);
      }
      return newData;
    });
  }, [slugify]);

  const handleGenreChange = useCallback((genre: string) => {
    setFormData(prev => ({ ...prev, genre }));
  }, []);

  const handleCustomGenreChange = useCallback((val: string) => {
    setFormData(prev => ({ ...prev, genre: val.toUpperCase() }));
  }, []);

  const handleImageUrlChange = useCallback((val: string) => {
    setFormData(prev => ({ ...prev, imageUrl: val }));
    setImgError(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      alert("El título del proyecto es obligatorio");
      return;
    }

    const finalName = formData.name || slugify(formData.title);

    onCreate({
      ...formData,
      name: finalName
    });
    onClose();
    // Reset
    setFormData({
      name: '',
      title: '',
      genre: 'FANTASÍA',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
    });
  }, [formData, onCreate, onClose, slugify]);

  return {
    formData,
    imgError,
    setImgError,
    isCustomGenre,
    setIsCustomGenre,
    handleChange,
    handleGenreChange,
    handleCustomGenreChange,
    handleImageUrlChange,
    handleSubmit,
    GENRES
  };
};
