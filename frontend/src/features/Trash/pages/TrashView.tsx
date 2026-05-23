import React from "react";
import { useOutletContext } from "react-router-dom";
import { useLanguage } from "@context/LanguageContext";
import { useTrashManager } from "./useTrashManager";

interface OutletContext {
  projectId: number | null;
  projectName?: string;
}

export default function TrashView() {
  const { projectId, projectName } = useOutletContext<OutletContext>();
  const { t } = useLanguage();

  const { items, loading, error, handleRestore, handleDelete } =
    useTrashManager(projectId);

  const folderCount = items.filter(
    (item) => item.item_tipo === "FOLDER",
  ).length;
  const entityCount = items.length - folderCount;
  const headerTitle = projectName?.trim() || t("trash.title");

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden animate-in fade-in duration-700">
      <div className="px-8 lg:px-12 py-6 border-b border-foreground/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              delete_outline
            </span>
            <span className="text-sm font-bold text-foreground/90">
              {headerTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-wider">
            <span className="px-2 py-1 bg-foreground/5 border border-foreground/10 text-foreground/70">
              Total: {items.length}
            </span>
            <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400">
              Carpetas: {folderCount}
            </span>
            <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              Entidades: {entityCount}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/5 border border-red-500/20 p-4 mb-8 flex items-center gap-4">
            <span className="material-symbols-outlined text-red-500">
              warning
            </span>
            <span className="text-[0.75rem] text-red-400 font-medium uppercase tracking-wider">
              {error}
            </span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20">
            <div className="size-20 border border-dashed border-foreground/20 flex items-center justify-center mb-4 text-foreground/40">
              <span className="material-symbols-outlined text-4xl">
                inventory_2
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/70">
              {t("trash.empty_state")}
            </p>
            <p className="text-[0.6875rem] mt-2 text-foreground/50">
              {t("trash.no_items_to_restore")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={`${item.item_tipo}-${item.id}`}
                className="group bg-foreground/[0.02] border border-foreground/10 hover:border-primary/30 p-5 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`size-10 flex items-center justify-center border ${item.item_tipo === "FOLDER" ? "border-amber-500/20 bg-amber-500/5 text-amber-500" : "border-indigo-500/20 bg-indigo-500/5 text-indigo-500"}`}
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">
                      {item.item_tipo === "FOLDER" ? "folder" : "description"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.5625rem] font-bold uppercase tracking-wider text-foreground/40 mb-1">
                      Eliminado
                    </div>
                    <div className="text-[0.625rem] font-mono text-foreground/50">
                      {item.deleted_date
                        ? new Date(item.deleted_date).toLocaleDateString()
                        : t("trash.unknown_date")}
                    </div>
                  </div>
                </div>

                <h3 className="text-[1rem] font-bold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                  {item.nombre || "Sin Nombre"}
                </h3>
                <p className="text-[0.625rem] font-bold uppercase tracking-wider text-foreground/50 mb-6">
                  {item.item_tipo === "FOLDER" ? "Carpeta" : "Entidad"}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(item.item_tipo, item.id)}
                    className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[0.625rem] font-black uppercase tracking-[0.15em] transition-all border border-emerald-500/20"
                  >
                    Restaurar
                  </button>
                  <button
                    onClick={() => handleDelete(item.item_tipo, item.id)}
                    className="flex-1 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[0.625rem] font-black uppercase tracking-[0.15em] transition-all border border-red-500/20"
                  >
                    Purgar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
