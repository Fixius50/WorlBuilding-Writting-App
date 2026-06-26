import { useState, useEffect, useCallback, useImperativeHandle } from "react";
import type { Editor, Range } from "@tiptap/core";

export type SlashMenuHandle = {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean;
};

export interface SlashMenuItem {
  title: string;
  command?: (props: { editor: Editor; range: Range }) => void;
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
  ref: React.ForwardedRef<SlashMenuHandle>,
) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item && item.command) {
        command(item);
      }
    },
    [items, command],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (items.length === 0) {
        return false;
      }

      let handled = false;

      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        handled = true;
      } else if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        handled = true;
      } else if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        selectItem(selectedIndex);
        handled = true;
      }

      return handled;
    },
  }));

  return {
    selectedIndex,
    selectItem,
  };
};
