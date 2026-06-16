import React from "react";
import { Carpeta, Entidad } from "@domain/database";
import { useLanguage } from "@context/LanguageContext";
import { useNavigate, useOutletContext } from "react-router-dom";
import BibleCard from "../components/BibleCard";
import { useBibleGridView } from "./useBibleGridView";

interface BibleContext {
  handleOpenCreateModal: (
    parentId: string | number | null,
    type: string,
  ) => void;
  handleDeleteFolder: (id: string | number) => void;
  handleCreateSimpleFolder: (
    parentId: string | number | null,
    type: string,
  ) => void;
  handleRenameFolder: (id: string | number, name: string) => void;
  handleDeleteEntity: (id: number) => void;
  folders: Carpeta[];
  entities: Entidad[];
  projectId: number;
  searchTerm: string;
  filterType: string;
}

const BibleGridView = () => {
  const navigate = useNavigate();
  const context = useOutletContext<BibleContext>();
  const {
    handleDeleteFolder,
    handleDeleteEntity,
    handleOpenCreateModal,
    folders,
  } = context;

  const { t } = useLanguage();

  const {
    username,
    projectName,
    isInsideFolder,
    filteredFolders,
    filteredEntities,
    renamingFolderId,
    renameValue,
    setRenameValue,
    handleRenameSubmit,
    startRenaming,
  } = useBibleGridView(context);

  if (folders === undefined)
    return (
      <div className="p-20 text-center animate-pulse text-text-muted">
        {t("common.loading")}
      </div>
    );

  const getEntityFirstImage = (targetEntity: Entidad): string | undefined => {
    const parseJsonPayload = (
      payload: unknown,
    ): Record<string, unknown> | null => {
      let parsedPayload: unknown = null;

      switch (typeof payload) {
        case "string": {
          try {
            parsedPayload = JSON.parse(payload);
          } catch {
            parsedPayload = null;
          }
          break;
        }
        default: {
          parsedPayload = payload;
          break;
        }
      }

      switch (
        typeof parsedPayload === "object" &&
        parsedPayload !== null &&
        !Array.isArray(parsedPayload)
      ) {
        case true:
          return parsedPayload as Record<string, unknown>;
        default:
          return null;
      }
    };

    const parsedPayload = parseJsonPayload(targetEntity.contenido_json);
    const payloadImages = parsedPayload?.images as unknown[];

    switch (
      Array.isArray(payloadImages) &&
      typeof payloadImages[0] === "string" &&
      payloadImages[0].trim().length > 0
    ) {
      case true:
        return payloadImages[0] as string;
      default:
        break;
    }

    switch (
      typeof targetEntity.imagen_url === "string" &&
      targetEntity.imagen_url.trim().length > 0
    ) {
      case true:
        return targetEntity.imagen_url as string;
      default:
        return undefined;
    }
  };

  return (
    <div className="flex-1 p-8 pt-0 max-w-[1600px] mx-auto w-full h-full overflow-y-auto custom-scrollbar">
      {/* Content Grid */}
      <div className="flex flex-wrap gap-6 items-start justify-center">
        {/* Add Card (Dynamic) */}
        <div
          onClick={() =>
            handleOpenCreateModal(null, isInsideFolder ? "node" : "folder")
          }
          className="group relative flex flex-col items-center w-48 cursor-pointer"
        >
          <div
            className="relative flex items-center justify-center w-full h-40 border border-dashed group-hover:border-[color:var(--bible-card-folder-color-hover)]"
            style={{
              borderColor: "hsl(var(--foreground) / 0.2)",
              color: "var(--bible-card-meta-color)",
              backgroundColor: "hsl(var(--foreground) / 0.01)",
            }}
          >
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>

          <div className="mt-1 text-center relative z-10">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[color:var(--bible-card-meta-color)] group-hover:text-[color:var(--bible-card-meta-color-hover)]">
              {isInsideFolder ? "NUEVO NODO" : "NUEVA CARPETA"}
            </span>
          </div>
        </div>

        {filteredFolders.map((folder) =>
          renamingFolderId === folder.id ? (
            <div
              key={folder.id}
              className="p-4 rounded-none monolithic-panel border border-primary/50"
            >
              <input
                autoFocus
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    handleRenameSubmit(folder.id, renameValue);
                  if (e.key === "Escape") handleRenameSubmit(folder.id, "");
                }}
                onBlur={() => handleRenameSubmit(folder.id, renameValue)}
                className="w-full monolithic-panel rounded-none p-3 text-sm text-foreground focus:border-primary/50 outline-none"
                placeholder={t("common.rename")}
              />
            </div>
          ) : (
            <BibleCard
              key={folder.id}
              item={folder}
              type="folder"
              linkTo={
                folder.tipo === "TIMELINE"
                  ? `/${username}/${projectName}/bible/timeline/${folder.id}`
                  : `/${username}/${projectName}/bible/folder/${folder.id}`
              }
              onDelete={() => handleDeleteFolder(folder.id)}
              onRename={() => startRenaming(folder)}
            />
          ),
        )}

        {filteredEntities.map((entity) => {
          const entityIconUrl = getEntityFirstImage(entity);

          return (
            <BibleCard
              key={`ent-${entity.id}`}
              item={{ ...entity, iconUrl: entityIconUrl }}
              type="entity"
              linkTo={`/${username}/${projectName}/bible/folder/${entity.carpeta_id}/entity/${entity.id}`}
              onDelete={() => handleDeleteEntity(entity.id)}
              onRename={() =>
                navigate(
                  entity.carpeta_id
                    ? `/${username}/${projectName}/bible/folder/${entity.carpeta_id}/entity/${entity.id}/edit`
                    : `/${username}/${projectName}/bible/entity/${entity.id}/edit`,
                )
              }
            />
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFolders.length === 0 && filteredEntities.length === 0 && (
        <div className="col-span-full py-12 text-center opacity-20">
          <p className="text-xs font-bold uppercase tracking-widest">
            {t("bible.empty_archive")}
          </p>
        </div>
      )}
    </div>
  );
};

export default BibleGridView;
