import { useState, useEffect, useCallback, useImperativeHandle } from 'react';

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
  command: (item: { id: string; label: string; type: string; desc: string | undefined }) => void,
  ref: React.ForwardedRef<any>
) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback((index: number) => {
    const item = items[index];
    if (item) {
      command({
        id: item.id,
        label: item.label,
        type: item.type,
        desc: item.description
      });
    }
  }, [items, command]);

  const upHandler = useCallback(() => {
    setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
  }, [items.length]);

  const downHandler = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex);
  }, [selectItem, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  const getIconAndColor = useCallback((type: string) => {
    switch (type?.toUpperCase()) {
      case 'PERSONAJE':
      case 'INDIVIDUAL': return { icon: 'person', color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
      case 'LUGAR':
      case 'LOCATION': return { icon: 'public', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'GRUPO':
      case 'GROUP': return { icon: 'groups', color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'TIMELINE':
      case 'CRONOLOGÍA': return { icon: 'history', color: 'text-orange-400', bg: 'bg-orange-500/10' };
      case 'EVENTO':
      case 'EVENT': return { icon: 'event', color: 'text-red-400', bg: 'bg-red-500/10' };
      case 'OBJETO':
      case 'ITEM': return { icon: 'token', color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'ORGANIZACIÓN': return { icon: 'account_balance', color: 'text-blue-400', bg: 'bg-blue-500/10' };
      default: return { icon: 'auto_stories', color: 'text-foreground/60', bg: 'bg-foreground/5' };
    }
  }, []);

  return {
    selectedIndex,
    selectItem,
    getIconAndColor
  };
};
