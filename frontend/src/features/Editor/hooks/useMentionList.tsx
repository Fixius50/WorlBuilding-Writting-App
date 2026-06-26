import { useState, useEffect, useCallback, useImperativeHandle } from "react";

type MentionListHandle = {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean;
};

interface MentionItem {
  id: string;
  label: string;
  type: string;
  description?: string;
}

/**
 * 🧠 useMentionList
 * Hook to handle mention list navigation and selection, managing keyboard events for the mention portal.
 */
export const useMentionList = (
  items: MentionItem[],
  command: (item: {
    id: string;
    label: string;
    type: string;
    desc: string | undefined;
  }) => void,
  ref: React.ForwardedRef<MentionListHandle>,
) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        command({
          id: item.id,
          label: item.label,
          type: item.type,
          desc: item.description,
        });
      }
    },
    [items, command],
  );

  const upHandler = useCallback(() => {
    if (items.length === 0) {
      return;
    }
    setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
  }, [items.length]);

  const downHandler = useCallback(() => {
    if (items.length === 0) {
      return;
    }
    setSelectedIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const enterHandler = useCallback(() => {
    if (items.length === 0) {
      return;
    }
    selectItem(selectedIndex);
  }, [selectItem, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      switch (event.key) {
        case "ArrowUp":
          upHandler();
          return true;
        case "ArrowDown":
          downHandler();
          return true;
        case "Enter":
          enterHandler();
          return true;
        default:
          return false;
      }
    },
  }));

  return {
    selectedIndex,
    selectItem,
  };
};
