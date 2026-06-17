import React, { forwardRef } from 'react';
import { useMentionList } from '../hooks/useMentionList';

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
  const { selectedIndex, selectItem } = useMentionList(props.items, props.command, ref);

  return (
    <div className="items bg-background border border-foreground/10 rounded-lg shadow-2xl overflow-hidden min-w-[220px] p-1 animate-in zoom-in-95 duration-200">
      <div className="px-3 py-2 border-b border-foreground/5 mb-1">
        <span className="text-[10px] font-semibold text-foreground/45 uppercase tracking-wider font-sans">Enlazar referencia...</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {props.items.length ? (
          props.items.map((item, index) => {
            return (
              <button
                className={`flex flex-col w-full px-3 py-2 rounded-md outline-none text-left transition-all ${index === selectedIndex
                  ? 'bg-primary/20 text-primary'
                  : 'text-foreground/80 hover:bg-foreground/5'
                }`}
                key={index}
                onClick={() => selectItem(index)}
              >
                <span className="font-sans font-bold text-sm leading-tight">{item.label}</span>
                <span className={`text-[10px] italic font-sans leading-tight mt-0.5 ${index === selectedIndex ? 'text-primary/70' : 'text-foreground/40'}`}>
                  {item.type}
                </span>
              </button>
            );
          })
        ) : (
          <div className="item text-xs px-4 py-3 text-foreground/40 italic text-center font-sans">No results found</div>
        )}
      </div>
    </div>
  );
});

export default MentionList;


