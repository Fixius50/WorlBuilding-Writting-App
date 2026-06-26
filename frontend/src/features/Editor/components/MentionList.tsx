import React, { forwardRef } from "react";
import { getHierarchyVisuals } from "@components";
import { useMentionList } from "../hooks/useMentionList";

interface MentionItem {
  id: string;
  label: string;
  type: string;
  description?: string;
}

interface MentionListProps {
  items: MentionItem[];
  command: (item: {
    id: string;
    label: string;
    type: string;
    desc: string | undefined;
  }) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

type MentionGroup = {
  key: string;
  label: string;
  items: MentionItem[];
};

const normalizeGroupKey = (type: string): string => {
  return (type || "__empty__")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};

const buildMentionGroups = (items: MentionItem[]): MentionGroup[] => {
  const groupsMap = new Map<string, MentionGroup>();

  items.forEach((item) => {
    const key = normalizeGroupKey(item.type);
    const existing = groupsMap.get(key);

    if (existing) {
      existing.items.push(item);
      return;
    }

    groupsMap.set(key, {
      key,
      label: item.type || "",
      items: [item],
    });
  });

  return Array.from(groupsMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
};

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  (props, ref) => {
    const groups = React.useMemo(
      () => buildMentionGroups(props.items),
      [props.items],
    );

    const [activeGroupKey, setActiveGroupKey] = React.useState<string | null>(
      null,
    );

    React.useEffect(() => {
      if (groups.length === 0) {
        setActiveGroupKey(null);
        return;
      }

      const stillExists = groups.some((group) => group.key === activeGroupKey);
      if (!stillExists) {
        setActiveGroupKey(groups[0].key);
      }
    }, [groups, activeGroupKey]);

    const activeGroup = React.useMemo(() => {
      if (!activeGroupKey) {
        return null;
      }
      return groups.find((group) => group.key === activeGroupKey) || null;
    }, [groups, activeGroupKey]);

    const visibleItems = React.useMemo(() => {
      return activeGroup ? activeGroup.items : [];
    }, [activeGroup]);

    const { selectedIndex, selectItem } = useMentionList(
      visibleItems,
      props.command,
      ref,
    );

    const selectedItemId = visibleItems[selectedIndex]?.id;

    const renderGroupHeader = (group: MentionGroup): React.ReactNode => {
      const visuals = getHierarchyVisuals(
        group.key === "__empty__" ? "folder" : group.key,
      );
      const isActive = group.key === activeGroupKey;

      return (
        <button
          type="button"
          onClick={() => setActiveGroupKey(group.key)}
          onMouseEnter={() => setActiveGroupKey(group.key)}
          className={`w-full px-3 py-2 flex items-center justify-between rounded-md transition-colors ${isActive ? "bg-primary/15" : "hover:bg-foreground/5"}`}
        >
          <span className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-[14px] ${visuals.color}`}
            >
              {visuals.icon}
            </span>
            <span className="text-[10px] font-black text-foreground/55 uppercase tracking-wider">
              {group.label}
            </span>
            <span className="text-[10px] text-foreground/35">
              ({group.items.length})
            </span>
          </span>
          <span className="material-symbols-outlined text-[14px] text-foreground/40">
            {isActive ? "chevron_right" : "chevron_right"}
          </span>
        </button>
      );
    };

    return (
      <div className="relative inline-flex animate-in zoom-in-95 duration-200">
        <div
          className={`items bg-background border border-foreground/10 shadow-2xl overflow-hidden min-w-[240px] p-1 ${props.items.length && activeGroup ? "rounded-l-lg rounded-r-none" : "rounded-lg"}`}
        >
          <div className="max-h-[320px] overflow-y-auto space-y-0.5">
            {props.items.length ? (
              groups.map((group) => (
                <div key={group.key}>{renderGroupHeader(group)}</div>
              ))
            ) : (
              <div className="item text-xs px-4 py-3 text-foreground/40 italic text-center font-sans">
                No results found
              </div>
            )}
          </div>
        </div>

        {props.items.length && activeGroup ? (
          <div className="items absolute left-full top-0 z-10 bg-background border border-foreground/10 border-l-0 rounded-r-lg rounded-l-none shadow-2xl overflow-hidden min-w-[300px]">
            <div className="max-h-[320px] overflow-y-auto flex flex-col gap-0.5">
              {visibleItems.length ? (
                visibleItems.map((item, index) => {
                  const itemIsSelected = selectedItemId === item.id;

                  return (
                    <button
                      className={`flex w-full px-3 py-2 rounded-md outline-none text-left transition-all ${
                        itemIsSelected
                          ? "bg-primary/20 text-primary"
                          : "text-foreground/80 hover:bg-foreground/5"
                      }`}
                      key={item.id}
                      onClick={() => selectItem(index)}
                    >
                      <span className="font-sans font-bold text-sm leading-tight">
                        {item.label}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="item text-xs px-4 py-3 text-foreground/40 italic text-center font-sans">
                  No results found
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

export default MentionList;
