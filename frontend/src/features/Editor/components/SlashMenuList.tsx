import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

interface SlashMenuItem {
  title: string;
  command: (props: { editor: any; range: any }) => void;
  icon: string;
}

interface SlashMenuListProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
}

const SlashMenuList = forwardRef((props: SlashMenuListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-background border border-foreground/10 shadow-2xl p-1 w-64 animate-in fade-in zoom-in-95 duration-200">
      <div className="p-2 border-b border-foreground/5 mb-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Comandos Rápidos</span>
      </div>
      <div className="max-h-80 overflow-y-auto no-scrollbar">
        {props.items.length ? (
          props.items.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                index === selectedIndex ? 'bg-primary/20 text-primary' : 'text-foreground/60 hover:bg-foreground/5'
              }`}
              onClick={() => selectItem(index)}
            >
              <div className={`size-8 flex items-center justify-center border ${index === selectedIndex ? 'border-primary/30 bg-primary/10' : 'border-foreground/10 bg-foreground/5'}`}>
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
              </div>
              <span className="text-xs font-bold">{item.title}</span>
            </button>
          ))
        ) : (
          <div className="p-3 text-xs text-foreground/30 italic">No hay resultados</div>
        )}
      </div>
    </div>
  );
});

SlashMenuList.displayName = 'SlashMenuList';

export default SlashMenuList;
