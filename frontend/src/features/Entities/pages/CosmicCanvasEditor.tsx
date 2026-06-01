import React from "react";
import UniversalCanvas from "@presentation/organisms/editor/UniversalCanvas";
import DynamicAttributeForm from "../components/DynamicAttributeForm";
import ConfirmationModal from "@organisms/ConfirmationModal";
import { useCosmicCanvasEditor } from "./useCosmicCanvasEditor";

const CosmicCanvasEditor: React.FC<{ entityId: number }> = ({ entityId }) => {
  const {
    entity,
    nodes,
    edges,
    searchQuery,
    setSearchQuery,
    filteredEntities,
    selectedEntity,
    loading,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    setEntityToDelete,
    onNodeClick,
    addEntityToCanvas,
    handleDeleteConfirm,
    navigate,
  } = useCosmicCanvasEditor(entityId);

  if (loading || !entity) return null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-mono text-foreground">
      {/* ZONA IZQUIERDA: Inyector de Entidades */}
      <aside className="w-[280px] border-r border-foreground/10 bg-background flex flex-col z-20 text-foreground">
        <div className="p-6 border-b border-foreground/10 bg-foreground/5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">database</span>
            Inyector de Nodos
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="BUSCAR_ENTIDAD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-foreground/20 p-3 text-[10px] text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredEntities.map((e) => (
            <div
              key={e.id}
              className="group p-3 border border-transparent hover:border-foreground/10 hover:bg-foreground/[0.02] flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground/80 truncate max-w-[150px] uppercase">
                  {e.nombre}
                </span>
                <span className="text-[8px] text-foreground/30 uppercase">
                  {e.tipo}
                </span>
              </div>
              <button
                onClick={() => addEntityToCanvas(e)}
                className="size-8 flex items-center justify-center bg-foreground/5 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-primary/5 border-t border-primary/10">
          <button
            onClick={() => navigate(-1)}
            className="w-full h-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              keyboard_return
            </span>
            SALIR_EDITOR
          </button>
        </div>
      </aside>

      {/* ZONA CENTRAL: Canvas Visual */}
      <main className="flex-1 relative bg-background">
        <UniversalCanvas
          initialNodes={nodes}
          initialEdges={edges}
          onNodeClick={onNodeClick}
          backgroundColor="hsl(var(--background))"
        />
        <div className="absolute top-4 px-6 w-full pointer-events-none flex justify-center">
          <div className="px-6 py-2 bg-background border border-primary/30 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
            MODO_DISEÑO_COSMICO: {entity.nombre}
          </div>
        </div>
      </main>

      {/* ZONA DERECHA: Atributos Flotantes */}
      <aside className="w-[320px] border-l border-foreground/10 bg-background flex flex-col z-20 text-foreground">
        {selectedEntity ? (
          <>
            <div className="p-6 border-b border-foreground/10 bg-foreground/5 flex justify-between items-center">
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/50 mb-2 block">
                  NODO_SELECCIONADO // {selectedEntity.tipo}
                </span>
                <h2 className="text-xl font-black text-foreground truncate uppercase">
                  {selectedEntity.nombre}
                </h2>
              </div>
              <button
                onClick={() => {
                  setEntityToDelete(selectedEntity.id);
                  setIsDeleteModalOpen(true);
                }}
                className="size-10 flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-primary-foreground transition-all border border-red-500/20"
                title="Eliminar Entidad"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <DynamicAttributeForm entity={selectedEntity} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
              SELECCIONA_UN_NODO_PARA_EDITAR
            </p>
          </div>
        )}
      </aside>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Entidad"
        message="¿Estás seguro de que quieres eliminar esta entidad del universo? Esta acción no se puede deshacer."
        type="danger"
      />
    </div>
  );
};

export default CosmicCanvasEditor;
