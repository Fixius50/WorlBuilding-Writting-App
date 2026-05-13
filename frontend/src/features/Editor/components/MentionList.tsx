import React, { forwardRef } from 'react';
import { useMentionList } from './useMentionList';

interface MentionItem {
  id: string;
  label: string;
  type: string;
  description?: string;
}

interface MentionListProps {
  items: MentionItem[];
  command: (item: { id: string; label: string; type: string; desc: string | undefined }) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const { selectedIndex, selectItem, getIconAndColor } = useMentionList(props.items, props.command, ref);

  return (
    <div className="items bg-background border border-foreground/10 rounded-none shadow-2xl overflow-hidden min-w-[200px] p-2 animate-in zoom-in-95 duration-200">
      {props.items.length ? (
        props.items.map((item, index) => {
          const style = getIconAndColor(item.type);

          return (
            <button
              className={`flex w-full items-center text-xs px-3 py-2.5 rounded-none outline-none text-left transition-all gap-3 border-b border-foreground/5 last:border-0 ${index === selectedIndex
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-foreground/80 hover:bg-foreground/5'
              }`}
              key={index}
              onClick={() => selectItem(index)}
            >
              <div className={`size-8 flex-shrink-0 rounded-none border flex items-center justify-center ${index === selectedIndex ? 'bg-primary-foreground/20 border-primary-foreground/20' : `${style.bg} border-foreground/5`}`}>
                <span className={`material-symbols-outlined text-[16px] ${index === selectedIndex ? 'text-primary-foreground' : style.color}`}>
                  {style.icon}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-bold text-sm truncate">{item.label}</span>
                <div className="flex items-center gap-2 opacity-60">
                  <span className="text-[8px] uppercase tracking-[0.1em] font-black">{item.type}</span>
                  {item.description && (
                    <>
                      <span className="size-1 rounded-full bg-current opacity-30" />
                      <span className="text-[8px] truncate italic">{item.description}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })
      ) : (
        <div className="item text-xs px-4 py-3 text-foreground/60 italic text-center">No results found</div>
      )}
    </div>
  );
});

export default MentionList;
