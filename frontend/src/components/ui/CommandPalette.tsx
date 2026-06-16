import React, { useState, useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { useNavigate, useParams } from "react-router-dom";

// --- Interfaces ---
interface CommandItem {
  id: string;
  label: string;
  icon: string;
  keywords?: string;
  action: () => void;
  group: string;
}

interface CommandPaletteProps {
  folders?: { id: number; nombre: string; tipo: string }[];
  entities?: { id: number; nombre: string; tipo: string }[];
}

/**
 * ⌨️ CommandPalette
 * Paleta de comandos global (Ctrl+K / Cmd+K) estilo Obsidian/VS Code.
 * Se activa desde cualquier punto de la app sin necesidad de usar el ratón.
 *
 * Uso: Añadir <CommandPalette /> en ArchitectLayout y pasarle los datos del contexto.
 */
const CommandPalette = ({
  folders = [],
  entities = [],
}: CommandPaletteProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { username, projectName } = useParams();
  const base = `/${username || "local"}/${projectName}`;

  // Activar con Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeAndNavigate = useCallback(
    (path: string) => {
      setOpen(false);
      setSearch("");
      navigate(path);
    },
    [navigate],
  );

  // Comandos de navegación estática
  const navCommands: CommandItem[] = [
    {
      id: "nav-bible",
      label: "Ir a la Biblia del Mundo",
      icon: "auto_stories",
      group: "Navegación",
      action: () => closeAndNavigate(`${base}/bible`),
    },
    {
      id: "nav-timeline",
      label: "Ir a Líneas Temporales",
      icon: "timeline",
      group: "Navegación",
      action: () => closeAndNavigate(`${base}/timeline`),
    },
    {
      id: "nav-graph",
      label: "Ir al Grafo de Relaciones",
      icon: "hub",
      group: "Navegación",
      action: () => closeAndNavigate(`${base}/graph`),
    },
    {
      id: "nav-maps",
      label: "Ir a Mapas",
      icon: "map",
      group: "Navegación",
      action: () => closeAndNavigate(`${base}/map`),
    },
    {
      id: "nav-writing",
      label: "Ir a Escritura",
      icon: "edit_note",
      group: "Navegación",
      action: () => closeAndNavigate(`${base}/writing`),
    },
    {
      id: "nav-settings",
      label: "Abrir Configuración",
      icon: "settings",
      group: "Sistema",
      keywords: "ajustes config",
      action: () => closeAndNavigate(`${base}/settings`),
    },
  ];

  // Comandos generados dinámicamente desde carpetas
  const folderCommands: CommandItem[] = folders.map((f) => ({
    id: `folder-${f.id}`,
    label: `Abrir carpeta: ${f.nombre}`,
    icon:
      f.tipo === "TIMELINE" ? "timeline" : f.tipo === "MAPS" ? "map" : "folder",
    group: "Carpetas",
    action: () => closeAndNavigate(`${base}/bible/folder/${f.id}`),
  }));

  // Comandos generados dinámicamente desde entidades recientes
  const entityCommands: CommandItem[] = entities.slice(0, 20).map((e) => ({
    id: `entity-${e.id}`,
    label: e.nombre,
    icon: "person",
    group: "Entidades",
    keywords: e.tipo,
    action: () => closeAndNavigate(`${base}/bible/entity/${e.id}`),
  }));

  const allCommands = [...navCommands, ...folderCommands, ...entityCommands];

  // Agrupar comandos
  const groups = Array.from(new Set(allCommands.map((c) => c.group)));

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] bg-background/95"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-background border border-foreground/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={true} className="[&_[cmdk-root]]:p-0">
          {/* Barra de búsqueda */}
          <div className="flex items-center gap-3 px-4 border-b border-foreground/10">
            <span className="material-symbols-outlined text-primary text-lg opacity-60">
              search
            </span>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Buscar comandos, entidades, carpetas..."
              className="flex-1 bg-transparent py-4 text-sm outline-none text-foreground placeholder:text-foreground/20 font-medium"
              autoFocus
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-foreground/20 border border-foreground/10">
              ESC
            </kbd>
          </div>

          {/* Lista de resultados */}
          <Command.List className="max-h-[50vh] overflow-y-auto custom-scrollbar py-2">
            <Command.Empty className="py-10 text-center text-[10px] font-black uppercase tracking-widest text-foreground/20">
              Sin resultados — prueba otro término
            </Command.Empty>

            {groups.map((group) => (
              <Command.Group
                key={group}
                heading={group}
                className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-foreground/20"
              >
                {allCommands
                  .filter((c) => c.group === group)
                  .map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      value={`${cmd.label} ${cmd.keywords || ""}`}
                      onSelect={cmd.action}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-foreground/60 cursor-pointer hover:bg-primary/10 hover:text-primary data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary transition-colors group"
                    >
                      <span className="material-symbols-outlined text-base opacity-40 group-data-[selected=true]:opacity-100 group-data-[selected=true]:text-primary">
                        {cmd.icon}
                      </span>
                      <span className="flex-1 font-medium text-xs">
                        {cmd.label}
                      </span>
                      {cmd.keywords && (
                        <span className="text-[9px] uppercase tracking-widest text-foreground/20">
                          {cmd.keywords}
                        </span>
                      )}
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-foreground/5 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-foreground/20">
            <span className="flex items-center gap-1">
              <kbd className="px-1 border border-foreground/10">↑↓</kbd> Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 border border-foreground/10">↵</kbd> Abrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 border border-foreground/10">ESC</kbd> Cerrar
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
