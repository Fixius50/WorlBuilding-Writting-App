import React from "react";
import { Link } from "react-router-dom";
import { Edit2, ArrowRight, Trash2 } from "lucide-react";

interface BibleCardItem {
  id: number | string;
  nombre: string;
  tipo?: string;
  iconUrl?: string;
  itemCount?: number;
}

interface BibleCardProps {
  item: BibleCardItem;
  type: "entity" | "folder";
  linkTo: string;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDelete?: (item: BibleCardItem) => void;
  onRename?: (item: BibleCardItem) => void;
  onMove?: (item: BibleCardItem) => void;
}

const useBibleCard = (item: BibleCardItem, type: string) => {
  const normalizedTipo = (item.tipo || "").toLowerCase();
  const isFolder =
    type === "folder" ||
    normalizedTipo === "folder" ||
    normalizedTipo === "carpeta";
  const hasCount = (item.itemCount || 0) > 0;
  const label = item.tipo ? item.tipo : isFolder ? "carpeta" : "entidad";

  const colorClass = isFolder
    ? "text-[color:var(--bible-card-folder-color)] group-hover:text-[color:var(--bible-card-folder-color-hover)]"
    : "text-[color:var(--bible-card-entity-color)] group-hover:text-[color:var(--bible-card-entity-color-hover)]";

  return { isFolder, hasCount, label, colorClass };
};

const BibleCard: React.FC<BibleCardProps> = ({
  item,
  type,
  linkTo,
  onContextMenu,
  onDelete,
  onRename,
  onMove,
}) => {
  const { isFolder, hasCount, label, colorClass } = useBibleCard(item, type);
  const cardImageUrl =
    typeof item.iconUrl === "string" && item.iconUrl.trim().length > 0
      ? item.iconUrl
      : undefined;

  const alignmentClass = isFolder ? "left-[95%]" : "left-[85%]";

  return (
    <Link
      to={linkTo}
      onContextMenu={onContextMenu}
      className="group relative flex flex-col items-center w-36 hover:z-50 outline-none cursor-pointer"
    >
      <div
        className={`relative flex items-center justify-center w-full h-32 ${colorClass}`}
      >
        <div
          className={`absolute ${alignmentClass} top-1/2 -translate-y-1/2 z-0 pointer-events-auto flex flex-col text-current border border-current translate-x-[-30px] group-hover:translate-x-1`}
          style={{
            backgroundColor: "var(--bible-card-bookmark-bg)",
            transition: "none",
          }}
        >
          {onRename && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRename(item);
              }}
              className="w-8 h-8 flex items-center justify-center hover:bg-[var(--bible-card-action-hover-bg)] hover:text-[var(--bible-card-action-hover-fg)] border-b border-current"
              title="Renombrar"
              style={{ transition: "none" }}
            >
              <Edit2 size={13} strokeWidth={2.5} />
            </button>
          )}

          {onMove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMove(item);
              }}
              className="w-8 h-8 flex items-center justify-center hover:bg-[var(--bible-card-action-hover-bg)] hover:text-[var(--bible-card-action-hover-fg)] border-b border-current"
              title="Mover"
              style={{ transition: "none" }}
            >
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(item);
              }}
              className="w-8 h-8 flex items-center justify-center hover:bg-[var(--bible-card-action-hover-bg)] hover:text-red-500"
              title="Eliminar"
              style={{ transition: "none" }}
            >
              <Trash2 size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {!cardImageUrl && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {isFolder ? (
              <>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "var(--bible-card-shell-bg)",
                    clipPath:
                      "polygon(5% 10%, 35% 10%, 45% 20%, 95% 20%, 95% 90%, 5% 90%)",
                  }}
                />
                <div className="absolute left-[5%] top-[10%] bottom-[10%] w-[1px] bg-current" />
                <div className="absolute left-[5%] right-[5%] bottom-[10%] h-[1px] bg-current" />
                <div className="absolute right-[5%] top-[20%] bottom-[10%] w-[1px] bg-current" />
                <div className="absolute left-[5%] top-[10%] w-[30%] h-[1px] bg-current" />
                <div
                  className="absolute bg-current h-[1px]"
                  style={{
                    left: "35%",
                    top: "10%",
                    width: "14.14%",
                    transform: "rotate(45deg)",
                    transformOrigin: "top left",
                  }}
                />
                <div className="absolute left-[45%] right-[5%] top-[20%] h-[1px] bg-current" />
                <div className="absolute left-[5%] top-[5%] h-[10px] w-[1px] bg-current opacity-40" />
                <div className="absolute left-0 top-[10%] w-[10px] h-[1px] bg-current opacity-40" />
                <div className="absolute right-[5%] bottom-[5%] h-[10px] w-[1px] bg-current opacity-40" />
                <div className="absolute right-0 bottom-[10%] w-[10px] h-[1px] bg-current opacity-40" />
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "var(--bible-card-shell-bg)",
                    clipPath:
                      "polygon(15% 10%, 65% 10%, 85% 30%, 85% 90%, 15% 90%)",
                  }}
                />
                <div className="absolute left-[15%] top-[10%] bottom-[10%] w-[1px] bg-current" />
                <div className="absolute left-[15%] right-[15%] bottom-[10%] h-[1px] bg-current" />
                <div className="absolute right-[15%] top-[30%] bottom-[10%] w-[1px] bg-current" />
                <div className="absolute left-[15%] top-[10%] right-[35%] h-[1px] bg-current" />
                <div
                  className="absolute bg-current h-[1px]"
                  style={{
                    left: "65%",
                    top: "10%",
                    width: "28.28%",
                    transform: "rotate(45deg)",
                    transformOrigin: "top left",
                  }}
                />
                <div className="absolute right-[15%] top-[30%] w-[20%] h-[1px] bg-current" />
                <div className="absolute right-[35%] top-[10%] w-[1px] h-[20%] bg-current" />
                <div className="absolute left-[15%] top-[10%] w-[3px] h-[3px] bg-current -translate-x-[1px] -translate-y-[1px] rounded-full" />
                <div className="absolute right-[15%] bottom-[10%] w-[3px] h-[3px] bg-current translate-x-[1px] translate-y-[1px] rounded-full" />
                <div className="absolute left-[15%] bottom-[10%] w-[3px] h-[3px] bg-current -translate-x-[1px] translate-y-[1px] rounded-full" />
              </>
            )}
          </div>
        )}

        {cardImageUrl && (
          <div
            className="absolute inset-[15%] z-[15] overflow-hidden pointer-events-none grayscale group-hover:grayscale-0"
            style={{
              mixBlendMode:
                "var(--bible-card-image-blend)" as React.CSSProperties["mixBlendMode"],
            }}
          >
            <img
              src={cardImageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="relative z-20 pointer-events-none flex flex-col items-center justify-center p-5 text-center w-[90%] mx-auto">
          <div className="bible-name-scroll pointer-events-auto inline-flex max-w-full overflow-x-auto overflow-y-hidden whitespace-nowrap">
            <span className="inline-block min-w-max text-sm font-bold leading-tight select-none">
              {item.nombre}
            </span>
          </div>

          {isFolder && hasCount && (
            <span className="text-[10px] font-mono mt-1 select-none">
              [{item.itemCount}]
            </span>
          )}
        </div>
      </div>

      <div className="mt-1 text-center relative z-10">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[color:var(--bible-card-meta-color)] group-hover:text-[color:var(--bible-card-meta-color-hover)]">
          {label}
        </span>
      </div>
    </Link>
  );
};

export default BibleCard;
