import React, { forwardRef } from 'react';
import { useSlashMenuList, SlashMenuItem, SlashMenuHandle } from '../hooks/useSlashMenuList';

interface SlashMenuListProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
}

const SlashMenuList = forwardRef<SlashMenuHandle, SlashMenuListProps>((props, ref) => {
  const { selectedIndex, selectItem, currentItems } = useSlashMenuList(props.items, props.command, ref);

  return (
    <div className="bg-background border border-foreground/10 shadow-2xl p-1 w-56 rounded-lg animate-in fade-in zoom-in-95 duration-200">
      <div className="max-h-80 overflow-y-auto no-scrollbar flex flex-col gap-0.5">
        {currentItems.length ? (
          currentItems.map((item, index) => (
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
              <span className="text-xs font-semibold flex-grow">{item.title}</span>
              {item.subItems && item.subItems.length > 0 && (
                <span className="material-symbols-outlined text-xs text-foreground/45 shrink-0 ml-auto select-none">
                  chevron_right
                </span>
              )}
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


