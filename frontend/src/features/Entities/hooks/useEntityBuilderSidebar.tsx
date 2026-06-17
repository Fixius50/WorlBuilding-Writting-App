import { useState } from "react";
import { Plantilla } from "@domain/database";
import { TemplateUseCase } from "@features/Settings";

/**
 * Hook useEntityBuilderSidebar
 * Logic for managing entity templates, including searching, creating, editing, and deleting.
 */
export const useEntityBuilderSidebar = (
  templates: Plantilla[],
  onAddTemplate: (tpl: Plantilla) => void,
  onRefresh?: () => void,
  projectId: number = 1,
) => {
  const [filter, setFilter] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTpl, setNewTpl] = useState({ nombre: "", tipo: "text" });
  const [editingTpl, setEditingTpl] = useState<Plantilla | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // --- PRESERVATION ORIGINAL CODE ---
  // const filteredTemplates = (templates || []).filter(tpl =>
  //   tpl.nombre?.toLowerCase().includes(filter.toLowerCase())
  // );
  const filteredTemplates = (templates || []).filter(
    (tpl) =>
      tpl.categoria !== "Individual" &&
      tpl.nombre?.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleDragStart = (e: React.DragEvent, template: Plantilla) => {
    const data = JSON.stringify(template);
    e.dataTransfer.setData("application/worldbuilder/attribute", data);
    e.dataTransfer.setData("text/plain", data);
    e.dataTransfer.effectAllowed = "copy";

    const ghost = document.createElement("div");
    ghost.style.position = "absolute";
    ghost.style.top = "-1000px";
    ghost.className =
      "px-3 py-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-black uppercase text-[9px] tracking-widest pointer-events-none shadow-2xl skew-x-[-10deg]";
    ghost.innerText = template.nombre;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => {
      if (document.body.contains(ghost)) document.body.removeChild(ghost);
    }, 0);
  };

  const handleCreateTemplate = async () => {
    if (!newTpl.nombre.trim()) return;
    try {
      const created = await TemplateUseCase.createTemplate({
        nombre: newTpl.nombre,
        tipo: newTpl.tipo,
        project_id: projectId,
        valor_defecto: "",
        metadata: null,
        es_obligatorio: 0,
        aplica_a_todo: 0,
        tipo_objetivo: null,
        categoria: "General",
        orden: 0,
      });

      if (onRefresh) await onRefresh();
      onAddTemplate(created);
      setNewTpl({ nombre: "", tipo: "text" });
      setIsCreating(false);
    } catch (err) {}
  };

  const handleUpdateTemplate = async () => {
    if (!editingTpl || !editingTpl.nombre.trim()) return;
    try {
      await TemplateUseCase.updateTemplate(editingTpl.id, {
        nombre: editingTpl.nombre,
        tipo: editingTpl.tipo,
      });
      if (onRefresh) await onRefresh();
      setEditingTpl(null);
    } catch (err) {}
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await TemplateUseCase.deleteTemplate(deletingId);
      if (onRefresh) await onRefresh();
      setDeletingId(null);
    } catch (err) {}
  };

  return {
    filter,
    setFilter,
    isCreating,
    setIsCreating,
    newTpl,
    setNewTpl,
    editingTpl,
    setEditingTpl,
    deletingId,
    setDeletingId,
    filteredTemplates,
    handleDragStart,
    handleCreateTemplate,
    handleUpdateTemplate,
    confirmDelete,
  };
};
