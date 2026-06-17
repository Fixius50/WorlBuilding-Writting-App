import React from "react";
import { MonolithicPanel } from "@components";
import { getHierarchyVisuals } from "@features/WorldBible";
import { useFolderView } from "./useFolderView";

const FolderView: React.FC = () => {
  const { folderId, projectName, loading, filteredContent, navigate } =
    useFolderView();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-8 lg:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredContent.folders.map((folder) => (
          <MonolithicPanel
            key={folder.id}
            className="group cursor-pointer hover:border-primary/30 transition-all p-5 flex items-center gap-4"
            onClick={() =>
              navigate(`/local/${projectName}/bible/folder/${folder.id}`)
            }
          >
            <div className="size-10 rounded bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">folder</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{folder.nombre}</div>
              <div className="text-[10px] text-foreground/40 uppercase font-black">
                {folder.tipo === "FOLDER" ? "Espacio" : folder.tipo}
              </div>
            </div>
          </MonolithicPanel>
        ))}

        {filteredContent.entities.map((entity) => {
          const visuals = getHierarchyVisuals(entity.tipo);
          return (
            <MonolithicPanel
              key={entity.id}
              className="group cursor-pointer hover:border-primary/30 transition-all p-5 flex items-center gap-4"
              onClick={() =>
                navigate(
                  `/local/${projectName}/bible/folder/${folderId}/entity/${entity.id}`,
                )
              }
            >
              <div
                className={`size-10 rounded bg-foreground/5 flex items-center justify-center ${visuals.color}`}
              >
                <span className="material-symbols-outlined text-xl">
                  {visuals.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">
                  {entity.nombre}
                </div>
                <div className="text-[10px] text-foreground/40 uppercase font-black">
                  {entity.tipo}
                </div>
              </div>
            </MonolithicPanel>
          );
        })}
      </div>
    </div>
  );
};

export default FolderView;


