import React, { useState } from "react";
import { Plantilla } from "@domain/database";
import { templateService } from "@repositories/templateService";
import "@assets/attributes.css";

interface TemplateSettingsModalProps {
  template: Plantilla;
  onClose: () => void;
  onSave: (updatedTemplate?: Plantilla) => void;
  isIndividual?: boolean;
  projectId?: number;
}

const TemplateSettingsModal: React.FC<TemplateSettingsModalProps> = ({
  template,
  onClose,
  onSave,
  isIndividual = false,
  projectId,
}) => {
  const [nombre, setNombre] = useState(template.nombre);
  const [tipo, setTipo] = useState(template.tipo);

  // Parsear opciones actuales de los metadatos JSON
  const initialMeta =
    typeof template.metadata === "string"
      ? JSON.parse(template.metadata || '{"options":[],"states":[]}')
      : template.metadata || { options: [], states: [] };

  const [options, setOptions] = useState<string[]>(initialMeta.options || []);
  const [newOption, setNewOption] = useState("");

  // Custom boolean states list
  const [statesList, setStatesList] = useState<
    Array<{ id: string; name?: string; trueLabel: string; falseLabel: string }>
  >(
    initialMeta.states && initialMeta.states.length > 0
      ? initialMeta.states
      : [
          {
            id: "default",
            name: "",
            trueLabel: initialMeta.trueLabel || "Confirmado",
            falseLabel: initialMeta.falseLabel || "Negativo",
          },
        ],
  );

  const handleAddState = () => {
    const newId = `state-${Date.now()}`;
    setStatesList([
      ...statesList,
      { id: newId, name: "", trueLabel: "Verdadero", falseLabel: "Falso" },
    ]);
  };

  const handleRemoveState = (id: string) => {
    setStatesList(statesList.filter((s) => s.id !== id));
  };

  const handleUpdateState = (
    id: string,
    field: "name" | "trueLabel" | "falseLabel",
    val: string,
  ) => {
    setStatesList(
      statesList.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    );
  };

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (opt: string) => {
    setOptions(options.filter((o) => o !== opt));
  };

  // Guarda la configuración local (clonando en caliente la plantilla) o actualiza la plantilla global según corresponda
  const handleSave = async () => {
    const updatedMeta = {
      ...initialMeta,
      options,
      states: statesList,
      trueLabel: statesList[0]?.trueLabel || "Confirmado",
      falseLabel: statesList[0]?.falseLabel || "Negativo",
    };
    isIndividual && projectId
      ? await (async () => {
          const newTemplate = await templateService.create({
            nombre,
            tipo: tipo as unknown as Plantilla["tipo"],
            metadata: JSON.stringify(updatedMeta),
            valor_defecto: template.valor_defecto || "",
            es_obligatorio: template.es_obligatorio || 0,
            project_id: projectId,
            aplica_a_todo: 0,
            tipo_objetivo: template.tipo_objetivo || null,
            categoria: "Individual",
            orden: template.orden || 0,
          });
          onSave(newTemplate);
        })()
      : await (async () => {
          await templateService.update(template.id, {
            nombre,
            tipo: tipo as unknown as Plantilla["tipo"],
            metadata: JSON.stringify(updatedMeta),
          });
          onSave();
        })();
  };

  return (
    <div className="attr-modal-overlay" onClick={onClose}>
      <div className="attr-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="attr-modal-header">
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span className="material-symbols-outlined text-primary">
              settings_suggest
            </span>
            <h2
              style={{
                fontSize: "0.625rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              Configurar Atributo
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "hsla(var(--foreground), 0.4)" }}
            >
              close
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="attr-modal-body">
          {/* Nombre */}
          <div className="attr-modal-section">
            <label
              className="attr-label-wrapper"
              style={{ color: "hsla(var(--foreground), 0.4)" }}
            >
              Nombre del Atributo
            </label>
            <input
              type="text"
              className="attr-modal-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* Tipo de Atributo */}
          <div className="attr-modal-section">
            <label
              className="attr-label-wrapper"
              style={{ color: "hsla(var(--foreground), 0.4)" }}
            >
              Tipo de Atributo
            </label>
            <select
              className="w-full monolithic-panel border border-[hsl(var(--foreground)/0.1)] rounded-none px-[0.5rem] py-[0.375rem] text-[0.75rem] text-[hsl(var(--foreground))] outline-none bg-background focus:border-[hsl(var(--primary))]"
              value={tipo}
              onChange={(e) =>
                setTipo(e.target.value as unknown as Plantilla["tipo"])
              }
            >
              <option value="text">Texto Largo</option>
              <option value="short_text">Texto Corto</option>
              <option value="number">Número</option>
              <option value="boolean">Booleano</option>
              <option value="date">Fecha</option>
              <option value="select">Selección Única</option>
              <option value="multi_select">Selección Múltiple</option>
            </select>
          </div>

          {/* Gestión de Booleanos Múltiples */}
          {tipo === "boolean" && (
            <div className="attr-modal-section space-y-4">
              <div className="flex items-center justify-between">
                <label
                  className="attr-label-wrapper"
                  style={{ color: "hsla(var(--foreground), 0.4)" }}
                >
                  Estados Booleanos
                </label>
                <button
                  type="button"
                  onClick={handleAddState}
                  className="flex items-center justify-center w-6 h-6 rounded-full border border-foreground/15 hover:border-foreground/30 hover:bg-foreground/5 text-foreground transition-all duration-200"
                  title="Añadir Estado"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">
                    add
                  </span>
                </button>
              </div>

              <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                {statesList.map((st, i) => (
                  <div
                    key={st.id}
                    className="border border-foreground/10 p-3 space-y-2 relative rounded-none"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-foreground/45">
                        Estado #{i + 1}
                      </span>
                      {statesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveState(st.id)}
                          className="text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none p-0 flex items-center"
                          title="Eliminar Estado"
                        >
                          <span className="material-symbols-outlined text-[1rem]">
                            delete
                          </span>
                        </button>
                      )}
                    </div>
                    <div>
                      <span className="text-[9px] text-foreground/50 block mb-1">
                        Nombre del Estado
                      </span>
                      <input
                        type="text"
                        className="attr-modal-input w-full text-xs py-1 mb-2"
                        value={st.name || ""}
                        onChange={(e) =>
                          handleUpdateState(st.id, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-foreground/50 block mb-1">
                          Verdadero (Activo)
                        </span>
                        <input
                          type="text"
                          className="attr-modal-input w-full text-xs py-1"
                          value={st.trueLabel}
                          onChange={(e) =>
                            handleUpdateState(
                              st.id,
                              "trueLabel",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-foreground/50 block mb-1">
                          Falso (Inactivo)
                        </span>
                        <input
                          type="text"
                          className="attr-modal-input w-full text-xs py-1"
                          value={st.falseLabel}
                          onChange={(e) =>
                            handleUpdateState(
                              st.id,
                              "falseLabel",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gestión de Opciones */}
          {(tipo === "select" || tipo === "multi_select") && (
            <div className="attr-modal-section">
              <label
                className="attr-label-wrapper"
                style={{ color: "hsla(var(--foreground), 0.4)" }}
              >
                Opciones del Desplegable
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <input
                  type="text"
                  className="attr-modal-input"
                  style={{ flex: 1 }}
                  placeholder="Nueva opción..."
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
                />
                <button
                  onClick={handleAddOption}
                  className="attr-btn-primary"
                  style={{ flex: "none", padding: "0 1rem" }}
                >
                  Add
                </button>
              </div>

              <div className="attr-modal-options-container custom-scrollbar">
                {options.map((opt, i) => (
                  <div key={i} className="attr-modal-option-row">
                    <span style={{ fontSize: "0.75rem" }}>{opt}</span>
                    <button
                      onClick={() => handleRemoveOption(opt)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "hsla(var(--foreground), 0.2)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1rem" }}
                      >
                        delete
                      </span>
                    </button>
                  </div>
                ))}
                {options.length === 0 && (
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontStyle: "italic",
                      opacity: 0.3,
                      textAlign: "center",
                      padding: "1rem 0",
                    }}
                  >
                    No hay opciones definidas aún
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="attr-modal-footer">
          <button onClick={onClose} className="attr-btn-secondary">
            Cancelar
          </button>
          <button onClick={handleSave} className="attr-btn-primary">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSettingsModal;
