import { useState, useEffect, useCallback } from 'react';
import { WorldBibleUseCase } from '@application/WorldBibleUseCase';
import { Carpeta, Entidad } from '@domain/database';

interface FolderUpdateEvent extends CustomEvent {
  detail: {
    folderId: number;
  };
}

/**
 * 🧠 useFolderItem
 * Logic for the hierarchical folder tree, including expansion, content loading, and context menu management.
 */
export const useFolderItem = (
  folder: Carpeta,
  searchTerm: string,
  filterType: string,
  onMoveEntity: (entityId: number, targetFolderId: number, sourceFolderId: number) => void
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<{ folders: Carpeta[], entities: Entidad[] }>({ folders: [], entities: [] });
  const [loaded, setLoaded] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'folder' | 'entity', id: number, name: string } | null>(null);
  const [itemName, setItemName] = useState(folder.nombre);
  const [isEditing, setIsEditing] = useState(false);
  const [renamingEntityId, setRenamingEntityId] = useState<number | null>(null);

  useEffect(() => { setItemName(folder.nombre); }, [folder.nombre]);

  const loadContent = useCallback(async () => {
    try {
      const { folders: subs, entities: ents } = await WorldBibleUseCase.getFolderContent(folder.id);
      setContent({ folders: subs, entities: ents });
      setLoaded(true);
    } catch (err) { }
  }, [folder.id]);

  // Auto-expand on search
  useEffect(() => {
    if (searchTerm && !isOpen) {
      const hasMatch = content.entities.some(e =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterType === 'ALL' || e.tipo === filterType)
      );
      if (hasMatch) {
        setIsOpen(true);
        if (!loaded) loadContent();
      }
    }
  }, [searchTerm, content.entities, isOpen, loaded, loadContent, filterType]);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (!loaded && nextState) loadContent();
  }, [isOpen, loaded, loadContent]);

  // Listen for global updates to refresh tree
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as FolderUpdateEvent;
      const { folderId } = customEvent.detail || {};
      if (folderId === folder.id) {
        loadContent();
      }
    };
    window.addEventListener('folder-update', handleUpdate);
    return () => window.removeEventListener('folder-update', handleUpdate);
  }, [folder.id, loadContent]);

  const handleContextMenu = useCallback((e: React.MouseEvent, type: 'folder' | 'entity', id: number, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, id, name });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    if (contextMenu) {
      window.addEventListener('click', closeContextMenu);
      return () => window.removeEventListener('click', closeContextMenu);
    }
  }, [contextMenu, closeContextMenu]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('bg-indigo-500/20');
    const entityId = e.dataTransfer.getData('entityId');
    const sourceFolderId = e.dataTransfer.getData('sourceFolderId');
    if (entityId && sourceFolderId && sourceFolderId !== String(folder.id)) {
      onMoveEntity(Number(entityId), folder.id, Number(sourceFolderId));
    }
  }, [folder.id, onMoveEntity]);

  return {
    isOpen, setIsOpen,
    content,
    loaded,
    contextMenu,
    itemName, setItemName,
    isEditing, setIsEditing,
    renamingEntityId, setRenamingEntityId,
    toggle,
    handleContextMenu,
    closeContextMenu,
    handleDrop
  };
};
