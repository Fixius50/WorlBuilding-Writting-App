import { useState, useEffect, useCallback, useImperativeHandle } from 'react';

export interface SlashMenuItem {
  title: string;
  command?: (props: { editor: any; range: any }) => void;
  label: string;
  subItems?: SlashMenuItem[];
}

/**
 * 🧠 useSlashMenuList
 * Hook to handle slash command menu navigation and selection, managing keyboard events for the command portal.
 * Soporta navegación de submenús anidados interactivos y retroceso.
 */
export const useSlashMenuList = (
  items: SlashMenuItem[],
  command: (item: SlashMenuItem) => void,
  ref: React.ForwardedRef<any>
) => {
  const [activeSubItems, setActiveSubItems] = useState<SlashMenuItem[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Determinar los ítems a renderizar actualmente
  const currentItems = activeSubItems 
    ? [{ title: 'Volver atrás', label: '⬅' }, ...activeSubItems]
    : items;

  const selectItem = useCallback((index: number) => {
    const item = currentItems[index];
    if (item) {
      if (activeSubItems && index === 0) {
        setActiveSubItems(null);
        setSelectedIndex(0);
      } else if (item.subItems) {
        setActiveSubItems(item.subItems);
        setSelectedIndex(0);
      } else {
        command(item);
      }
    }
  }, [currentItems, activeSubItems, command]);

  useEffect(() => {
    setActiveSubItems(null);
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      let handled = false;

      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev + currentItems.length - 1) % currentItems.length);
        handled = true;
      } else if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % currentItems.length);
        handled = true;
      } else if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        selectItem(selectedIndex);
        handled = true;
      } else if ((event.key === 'Backspace' || event.key === 'ArrowLeft') && activeSubItems) {
        event.preventDefault();
        setActiveSubItems(null);
        setSelectedIndex(0);
        handled = true;
      }

      return handled;
    },
  }));

  return {
    selectedIndex,
    selectItem,
    currentItems
  };
};
