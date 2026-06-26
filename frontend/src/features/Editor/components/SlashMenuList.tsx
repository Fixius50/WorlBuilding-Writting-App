import React, { forwardRef } from "react";
import {
  useSlashMenuList,
  SlashMenuItem,
  SlashMenuHandle,
} from "../hooks/useSlashMenuList";

interface SlashMenuListProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
}

const SlashMenuList = forwardRef<SlashMenuHandle, SlashMenuListProps>(
  (props, ref) => {
    const [activeGroupIndex, setActiveGroupIndex] = React.useState(0);

    React.useEffect(() => {
      if (props.items.length === 0) {
        setActiveGroupIndex(0);
        return;
      }

      if (activeGroupIndex > props.items.length - 1) {
        setActiveGroupIndex(0);
      }
    }, [props.items, activeGroupIndex]);

    const activeGroup = props.items[activeGroupIndex] || null;

    const visibleItems = React.useMemo(() => {
      if (!activeGroup) {
        return [] as SlashMenuItem[];
      }

      if (activeGroup.subItems && activeGroup.subItems.length > 0) {
        return activeGroup.subItems;
      }

      return [activeGroup];
    }, [activeGroup]);

    const { selectedIndex, selectItem } = useSlashMenuList(
      visibleItems,
      props.command,
      ref,
    );

    return (
      <div className="relative inline-flex animate-in fade-in zoom-in-95 duration-200">
        <div
          className={`bg-background border border-foreground/10 shadow-2xl p-1 w-56 ${props.items.length && activeGroup ? "rounded-l-lg rounded-r-none" : "rounded-lg"}`}
        >
          <div className="max-h-[320px] overflow-y-auto no-scrollbar flex flex-col gap-0.5">
            {props.items.length ? (
              props.items.map((item, index) => {
                const isActive = index === activeGroupIndex;

                return (
                  <button
                    key={`${item.title}-${index}`}
                    className={`w-full flex items-center gap-3.5 px-3 py-2 text-left rounded-md transition-colors outline-none font-sans ${
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-foreground/80 hover:bg-foreground/5"
                    }`}
                    onMouseEnter={() => setActiveGroupIndex(index)}
                    onClick={() => setActiveGroupIndex(index)}
                  >
                    <div
                      className={`size-7 shrink-0 flex items-center justify-center rounded-sm font-sans font-bold text-xs select-none ${isActive ? "text-primary/90" : "text-foreground/45"}`}
                    >
                      {item.label}
                    </div>
                    <span className="text-xs font-semibold flex-grow">
                      {item.title}
                    </span>
                    <span className="material-symbols-outlined text-xs text-foreground/45 shrink-0 ml-auto select-none">
                      chevron_right
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-xs text-foreground/30 italic text-center font-sans">
                No hay resultados
              </div>
            )}
          </div>
        </div>

        {props.items.length && activeGroup ? (
          <div className="absolute left-full top-0 z-10 bg-background border border-foreground/10 border-l-0 rounded-r-lg rounded-l-none shadow-2xl min-w-[260px]">
            <div className="max-h-[320px] overflow-y-auto no-scrollbar flex flex-col gap-0.5">
              {visibleItems.length ? (
                visibleItems.map((item, index) => (
                  <button
                    key={`${item.title}-${index}`}
                    className={`w-full flex items-center gap-3.5 px-3 py-2 text-left rounded-md transition-colors outline-none font-sans ${
                      index === selectedIndex
                        ? "bg-primary/20 text-primary"
                        : "text-foreground/80 hover:bg-foreground/5"
                    }`}
                    onClick={() => selectItem(index)}
                  >
                    <div
                      className={`size-7 shrink-0 flex items-center justify-center rounded-sm font-sans font-bold text-xs select-none ${index === selectedIndex ? "text-primary/90" : "text-foreground/45"}`}
                    >
                      {item.label}
                    </div>
                    <span className="text-xs font-semibold flex-grow">
                      {item.title}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-foreground/30 italic text-center font-sans">
                  No hay resultados
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

SlashMenuList.displayName = "SlashMenuList";

export default SlashMenuList;
