import { useState, useCallback } from 'react';

/**
 * 🧠 useCreateProjectModal
 * Hook to handle project creation form state and submission.
 */
export const useCreateProjectModal = (
  onClose: () => void,
  onCreate: (project: { title: string; genre: string }) => void
) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Fantasy');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ title, genre });
    setTitle('');
    onClose();
  }, [title, genre, onCreate, onClose]);

  const handleTitleChange = useCallback((val: string) => setTitle(val), []);
  const handleGenreChange = useCallback((val: string) => setGenre(val), []);

  return {
    title,
    genre,
    handleTitleChange,
    handleGenreChange,
    handleSubmit
  };
};
