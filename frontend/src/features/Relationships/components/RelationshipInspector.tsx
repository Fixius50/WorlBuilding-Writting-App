/**
 * 📚 COMPONENTE: RelationshipInspector
 *
 * 📌 PROPÓSITO:
 * Este componente actúa como el panel lateral interactivo (Inspector) dedicado a la visualización,
 * edición y disolución de relaciones (aristas) entre las entidades de la biblia del proyecto.
 *
 * 🎮 ESCENARIOS DE USO Y FLUJO FRONT-TO-BACK:
 * 1. 🖲️ Lienzo Interactivo (Konva Canvas):
 *    Al hacer clic sobre una arista/línea de conexión en el canvas global (`UniversalCanvas.tsx`),
 *    se ejecuta el callback `onEdgeClick` el cual activa el almacén de Zustand (`useRightPanelStore.ts`)
 *    y abre el panel derecho con el modo `'relationship'` y el ID correspondiente.
 * 2. 🔀 Enrutador Central (`UniversalInspector.tsx`):
 *    Recibe el modo `'relationship'` y monta dinámicamente este componente pasándole el ID de la relación.
 * 3. 💾 Base de Datos SQLite y Reactividad:
 *    - Al cargar, solicita a la capa de aplicación (`RelationshipUseCase.getRelationshipDetails`) los
 *      datos de la relación enriquecidos asíncronamente con los nombres legibles de origen y destino.
 *    - Al guardar cambios (Tipo de vínculo o descripción), persiste en SQLite a través del repositorio.
 *    - Despacha el evento global `window.dispatchEvent(new CustomEvent('relationships-update'))` para que
 *      cualquier componente reactivo (ej. el canvas) se redespeje e incorpore los cambios al instante.
 *    - Al eliminar el vínculo, invoca a la capa de servicio, despacha el evento de actualización y cierra el panel.
 *
 * ⚙️ ESTÁNDARES Y DIRECTIVAS DE CALIDAD CUMPLIDOS:
 * - 🎯 Tipado estricto: Uso de interfaces y modelos estrictamente tipados.
 * - 🔀 Flujo de control: Prohibición de declaraciones 'return' dentro de bloques 'if' en el código nuevo;
 *   empleo de bloques 'switch' para la selección lógica.
 * - ⚡ Exclusividad Lambda: Uso estricto de funciones arrow para las operaciones y manejadores de eventos.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@context/LanguageContext";
import { RelationshipUseCase } from "@application/RelationshipUseCase";
import { RelacionEnriquecida } from "@domain/database";
import Button from "@components/ui/Button";
import ConfirmationModal from "@components/ui/ConfirmationModal";

interface RelationshipInspectorProps {
  relationshipId: number;
  onUpdate?: () => void;
  onClose?: () => void;
}

const RelationshipInspector: React.FC<RelationshipInspectorProps> = ({
  relationshipId,
  onUpdate,
  onClose,
}) => {
  const { t } = useLanguage();
  const closePanel = () => {
    // Panel derecho eliminado: antes cerraba el inspector lateral de relación.
  };

  const [rel, setRel] = useState<RelacionEnriquecida | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Estados de edición
  const [tipo, setTipo] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");

  // Modal de confirmación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);

  const loadRelationship = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        await RelationshipUseCase.getRelationshipDetails(relationshipId);
      switch (!!data) {
        case true:
          setRel(data);
          setTipo(data!.tipo || "");
          setDescripcion(data!.descripcion || "");
          break;
        default:
          setRel(null);
          break;
      }
    } catch (error) {
      console.error("Error al cargar la relación:", error);
    } finally {
      setLoading(false);
    }
  }, [relationshipId]);

  useEffect(() => {
    loadRelationship();
  }, [loadRelationship]);

  const handleSave = useCallback(async () => {
    if (!rel) {
      return;
    }
    setSaving(true);
    try {
      await RelationshipUseCase.updateRelationship(relationshipId, {
        tipo: tipo.trim(),
        descripcion: descripcion.trim(),
      });
      if (onUpdate) {
        onUpdate();
      }
      // Emitir evento para actualizar el canvas
      window.dispatchEvent(new CustomEvent("relationships-update"));
    } catch (error) {
      console.error("Error al guardar la relación:", error);
    } finally {
      setSaving(false);
    }
  }, [rel, relationshipId, tipo, descripcion, onUpdate]);

  const handleDelete = useCallback(async () => {
    try {
      await RelationshipUseCase.deleteRelationship(relationshipId);
      setDeleteConfirmOpen(false);
      if (onUpdate) {
        onUpdate();
      }
      // Emitir evento para actualizar el canvas
      window.dispatchEvent(new CustomEvent("relationships-update"));
      if (onClose) {
        onClose();
      } else {
        closePanel();
      }
    } catch (error) {
      console.error("Error al eliminar la relación:", error);
    }
  }, [relationshipId, onUpdate, onClose, closePanel]);

  const handleCerrar = useCallback(() => {
    switch (!!onClose) {
      case true:
        onClose!();
        break;
      default:
        closePanel();
        break;
    }
  }, [onClose, closePanel]);

  switch (loading) {
    case true:
      return (
        <div className="flex-1 flex items-center justify-center p-10">
          <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
            Analizando Conexión...
          </div>
        </div>
      );
    default:
      break;
  }

  switch (!rel) {
    case true:
      return (
        <div className="p-10 text-center text-rose-500 text-xs font-bold uppercase tracking-widest">
          Error: Conexión no hallada en la trama.
        </div>
      );
    default:
      break;
  }

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      {/* Cabecera */}
      <div className="p-6 border-b border-foreground/5 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center gap-4 mb-4">
          <div className="size-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">share</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">
              Vínculo del Destino
            </span>
            <h2 className="text-sm font-black text-foreground uppercase tracking-tight truncate">
              Naturaleza de Conexión
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCerrar}
            className="flex-1 py-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-[9px] font-black uppercase tracking-widest transition-all text-foreground/75 hover:text-foreground"
          >
            Cerrar Inspector
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Nodos de Conexión */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
            Entidades Vinculadas
          </h3>
          <div className="flex items-center justify-between p-4 bg-foreground/[0.02] border border-foreground/5 relative overflow-hidden">
            <div className="flex flex-col max-w-[40%]">
              <span className="text-[8px] font-black uppercase tracking-wider text-primary/60 mb-1">
                Origen
              </span>
              <span className="text-xs font-bold text-foreground truncate">
                {rel!.nombre_origen}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center px-2">
              <div className="w-full flex items-center justify-center relative">
                <div className="w-full h-[1px] bg-foreground/10 border-t border-dashed" />
                <span className="material-symbols-outlined text-xs text-primary absolute bg-background px-1.5 animate-pulse">
                  arrow_right_alt
                </span>
              </div>
            </div>

            <div className="flex flex-col max-w-[40%] text-right">
              <span className="text-[8px] font-black uppercase tracking-wider text-primary/60 mb-1">
                Destino
              </span>
              <span className="text-xs font-bold text-foreground truncate">
                {rel!.nombre_destino}
              </span>
            </div>
          </div>
        </section>

        {/* Tipo de Relación */}
        <section className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
            Tipo de Vínculo
          </label>
          <input
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder="Ej. Aliados, Rivales, Mentor y Aprendiz..."
            className="w-full bg-foreground/[0.03] border border-foreground/10 py-3 px-4 text-xs font-mono outline-none focus:border-primary/50 transition-all text-white placeholder:text-foreground/20"
          />
        </section>

        {/* Notas / Descripción */}
        <section className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
            Detalles de la Relación
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe las interacciones, conflictos, secretos o historia que comparten estas dos entidades..."
            rows={8}
            className="w-full bg-foreground/[0.03] border border-foreground/10 p-4 text-xs font-serif leading-relaxed outline-none focus:border-primary/50 transition-all text-foreground/80 placeholder:text-foreground/20 resize-none custom-scrollbar"
          />
        </section>
      </div>

      {/* Botones de Acción */}
      <div className="p-6 border-t border-foreground/5 bg-foreground/[0.01] space-y-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-background font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/10 disabled:opacity-50 disabled:scale-100"
        >
          {saving ? (
            <span className="material-symbols-outlined text-sm animate-spin">
              sync
            </span>
          ) : (
            <span className="material-symbols-outlined text-sm">save</span>
          )}
          <span>GUARDAR CAMBIOS</span>
        </button>

        <button
          onClick={() => setDeleteConfirmOpen(true)}
          className="w-full py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-sm">link_off</span>
          <span>ELIMINAR VÍNCULO</span>
        </button>
      </div>

      {/* Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Romper Vínculo"
        message={`¿Estás seguro de que quieres disolver la relación entre "${rel!.nombre_origen}" y "${rel!.nombre_destino}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  );
};

export default RelationshipInspector;
