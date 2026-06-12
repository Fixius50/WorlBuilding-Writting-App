import { useState, useEffect, useCallback, useImperativeHandle } from 'react';

interface SlashMenuItem {
  title: string;
  command: (props: { editor: unknown; range: unknown }) => void;
  label: string;
}

/**
 * 🧠 useSlashMenuList
 * Hook to handle slash command menu navigation and selection, managing keyboard events for the command portal.
 */
export const useSlashMenuList = (
  items: SlashMenuItem[],
  command: (item: SlashMenuItem) => void,
  ref: React.ForwardedRef<any>
) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback((index: number) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  }, [items, command]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return {
    selectedIndex,
    selectItem
  };
};
