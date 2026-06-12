import React, { forwardRef } from 'react';
import { useSlashMenuList } from './useSlashMenuList';

interface SlashMenuItem {
  title: string;
  command: (props: { editor: unknown; range: unknown }) => void;
  label: string;
}

interface SlashMenuListProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
}

const SlashMenuList = forwardRef((props: SlashMenuListProps, ref) => {
  const { selectedIndex, selectItem } = useSlashMenuList(props.items, props.command, ref);

  return (
    <div className="bg-background border border-foreground/10 shadow-2xl p-1 w-56 rounded-lg animate-in fade-in zoom-in-95 duration-200">
      <div className="max-h-80 overflow-y-auto no-scrollbar flex flex-col gap-0.5">
        {props.items.length ? (
          props.items.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center gap-3.5 px-3 py-2 text-left rounded-md transition-colors outline-none font-sans ${
                index === selectedIndex ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-foreground/5'
              }`}
              onClick={() => selectItem(index)}
            >
              <div className={`size-7 shrink-0 flex items-center justify-center rounded-sm font-sans font-bold text-xs select-none ${index === selectedIndex ? 'text-primary/90' : 'text-foreground/45'}`}>
                {item.label}
              </div>
              <span className="text-xs font-semibold">{item.title}</span>
            </button>
          ))
        ) : (
          <div className="p-3 text-xs text-foreground/30 italic text-center font-sans">No hay resultados</div>
        )}
      </div>
    </div>
  );
});

SlashMenuList.displayName = 'SlashMenuList';

export default SlashMenuList;

