import React from "react";
import { Entidad } from "@domain/database";
import { getHierarchyVisuals } from "@features/WorldBible";
import { GroupedEntities } from "../domain/cosmology.types";
import { getLevel, getLevelLabel } from "../application/cosmologyLayout";

// Colores de bullet CSS por nivel
const BULLET_COLORS = ["bg-indigo-400", "bg-yellow-400", "bg-purple-400", "bg-blue-400"];

interface CosmologyControlPanelProps {
  visibleEntities: Entidad[];
  groupedEntities: GroupedEntities;
  selectedEntityDetails: Entidad | null;
  selectedNodeId: number | null;
  onFocusNode: (id: number) => void;
  onDeselect: () => void;
}

const CosmologyControlPanel: React.FC<CosmologyControlPanelProps> = ({
  visibleEntities,
  groupedEntities,
  selectedEntityDetails,
  onFocusNode,
  onDeselect,
}) => (
  <div className="absolute top-4 right-4 bg-background/95 border border-foreground/10 p-4 flex flex-col gap-3.5 z-30 shadow-xl w-80 max-w-[90vw] rounded-none pointer-events-auto select-none max-h-[calc(100vh-32px)] overflow-hidden">
    {/* Cabecera */}
    <div className="flex flex-col gap-1">
      <h3 className="font-serif text-sm text-foreground flex items-center gap-2 font-medium">
        <span className="material-symbols-outlined text-primary text-[1.1rem]">motion_photos_on</span>
        Cosmología
      </h3>
      <p className="text-[10px] text-foreground/50 leading-relaxed font-sans">
        Visualiza los elementos contenidos espacial y conceptualmente según su escala de influencia.
      </p>
    </div>
    <div className="border-t border-foreground/10 my-0.5" />

    {/* Leyenda de escalas de arquetipos */}
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[8px] text-foreground/45 uppercase tracking-wider mb-0.5">Escala de Arquetipos</span>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-400" />
          <span className="font-mono text-[9px] text-foreground/70 uppercase">Cósmico</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
          <span className="font-mono text-[9px] text-foreground/70 uppercase">Territorial</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-400" />
          <span className="font-mono text-[9px] text-foreground/70 uppercase">Colectivo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
          <span className="font-mono text-[9px] text-foreground/70 uppercase">Individual</span>
        </div>
      </div>
    </div>
    <div className="border-t border-foreground/10 my-0.5" />

    {/* Índice de elementos con scroll interno */}
    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 min-h-0">
      <div className="space-y-4">
        <label className="font-mono text-[9px] text-foreground/45 uppercase tracking-wider block border-b border-foreground/5 pb-1">
          Índice de Elementos
        </label>
        {visibleEntities.length === 0 ? (
          <div className="text-[10px] text-foreground/30 font-mono py-4 text-center">
            Sin elementos con relaciones de contención
          </div>
        ) : (
          <div className="space-y-3.5">
            {[0, 1, 2, 3].map((level) => {
              const levelEntities = groupedEntities[level] || [];
              const hasEntities   = levelEntities.length > 0;

              return hasEntities ? (
                <div key={level} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${BULLET_COLORS[level]}`} />
                    <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/50 font-bold">
                      {getLevelLabel(level)} ({levelEntities.length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 pl-3 border-l border-foreground/5 space-y-0.5">
                    {levelEntities.map((ent) => {
                      const entLevel    = getLevel(ent.tipo);
                      const visuals     = getHierarchyVisuals(ent.tipo);
                      const isIndividual = entLevel === 3;

                      return (
                        <button
                          key={ent.id}
                          onClick={() => onFocusNode(ent.id)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 border border-foreground/5 bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-all text-left group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isIndividual ? (
                              <span className={`material-symbols-outlined text-[0.95rem] ${visuals.color}`}>
                                {visuals.icon}
                              </span>
                            ) : (
                              <span className={`w-1.5 h-1.5 rounded-full ${BULLET_COLORS[entLevel]}`} />
                            )}
                            <span className="text-xs truncate font-medium text-foreground/75 group-hover:text-foreground">
                              {ent.nombre}
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-[0.8rem] opacity-0 group-hover:opacity-60 transition-opacity text-foreground">
                            gps_fixed
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Detalles del elemento seleccionado */}
      {selectedEntityDetails && (
        <div className="border border-foreground/10 bg-foreground/[0.01] p-3 space-y-2.5 animate-in fade-in duration-200 mt-2">
          <div className="flex items-start justify-between gap-2 border-b border-foreground/10 pb-1.5">
            <div className="min-w-0">
              <h4 className="font-serif text-xs text-foreground truncate font-semibold">
                {selectedEntityDetails.nombre}
              </h4>
              <span className="font-mono text-[8px] text-primary uppercase tracking-wider">
                {selectedEntityDetails.tipo}
              </span>
            </div>
            <button
              onClick={onDeselect}
              className="text-foreground/40 hover:text-foreground text-[10px]"
            >
              Cerrar
            </button>
          </div>
          <p className="text-[10px] text-foreground/60 leading-relaxed font-sans max-h-32 overflow-y-auto custom-scrollbar">
            {selectedEntityDetails.descripcion || "Sin descripción disponible."}
          </p>
        </div>
      )}
    </div>
  </div>
);

export default CosmologyControlPanel;
