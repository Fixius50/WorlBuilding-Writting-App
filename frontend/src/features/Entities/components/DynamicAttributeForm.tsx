import React from "react";
import { useLanguage } from "@context/LanguageContext";
import { Entidad, Plantilla } from "@domain/database";
import { useDynamicAttributeForm } from "../hooks/useDynamicAttributeForm";

interface DynamicAttributeFormProps {
  entity: Entidad;
  onUpdate?: () => void;
}

const formatDate = (val: string): string => {
  const parts = val.split("-");
  return parts.length === 3 ? `${parts[2]} / ${parts[1]} / ${parts[0]}` : val;
};

const getCategoryTitle = (category: string, t: (key: string) => string): string => {
  const normalized = category.trim().toLowerCase();
  const key = `bible.categories.${normalized}`;
  const translated = t(key);
  return translated === key ? category : translated;
};


const renderAttributeValue = (tpl: Plantilla, value: string, allEntities: Entidad[]): React.ReactNode => {
  const cleanValue = (value || "").trim();

  return cleanValue === "" ? (
    <span className="font-serif italic text-foreground/35 text-[1rem]">
      -
    </span>
  ) : (() => {
    switch (tpl.tipo) {
      case "boolean":
        return (() => {
          const boolMeta = typeof tpl.metadata === 'string'
            ? JSON.parse(tpl.metadata || '{}')
            : (tpl.metadata || {});
          
          const states = Array.isArray(boolMeta.states) && boolMeta.states.length > 0
            ? boolMeta.states
            : [{ id: "default", trueLabel: boolMeta.trueLabel || "Confirmado", falseLabel: boolMeta.falseLabel || "Negativo" }];

          const valuesMap = (() => {
            try {
              return cleanValue.startsWith("{") ? JSON.parse(cleanValue) : { default: cleanValue === "true" };
            } catch (e) {
              return { default: cleanValue === "true" };
            }
          })();

          return (
            <div className="flex flex-col gap-1.5 mt-1">
              {states.map((st: { id: string; name?: string; trueLabel: string; falseLabel: string }) => {
                const isTrue = !!valuesMap[st.id];
                return (
                  <div key={st.id} className="font-serif text-[1rem] text-foreground/65 leading-relaxed flex items-center gap-1.5">
                    {st.name && <span className="font-sans text-[0.875rem] font-bold text-foreground/45 mr-1.5 uppercase tracking-wide">{st.name}:</span>}
                    {isTrue ? (
                      <>
                        <span className="text-emerald-500/80">âœ“</span> {st.trueLabel}
                      </>
                    ) : (
                      <>
                        <span className="text-foreground/35">âŠ—</span> {st.falseLabel}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })();

      case "date":
        return (
          <span className="font-serif text-[1rem] text-foreground/65 leading-relaxed">
            {formatDate(cleanValue)}
          </span>
        );

      case "text":
      case "textarea":
      case "long_text":
        return (
          <blockquote className="border-l-2 border-primary/30 pl-4 py-1 italic font-serif text-[1.15rem] text-foreground/80 leading-relaxed w-full whitespace-pre-line">
            {cleanValue}
          </blockquote>
        );
      
      case "multi_select":
        return (() => {
          try {
            const parsed = JSON.parse(cleanValue);
            const optionsList = Array.isArray(parsed) ? parsed : [];
            return optionsList.length === 0 ? (
              <span className="font-serif italic text-foreground/35 text-[1rem]">-</span>
            ) : (
              <span className="font-serif text-[1rem] text-foreground/65 leading-relaxed">
                {optionsList.join(", ")}
              </span>
            );
          } catch (e) {
            return (
              <span className="font-serif text-[1rem] text-foreground/65 leading-relaxed">
                {cleanValue}
              </span>
            );
          }
        })();

      case "image":
        return (
          <div className="size-40 overflow-hidden mt-1">
            <img
              src={cleanValue}
              alt={tpl.nombre}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        );

      case "entity_link":
        return (() => {
          try {
            const parsed = JSON.parse(cleanValue);
            const idsList = Array.isArray(parsed) ? parsed : [];
            const namesList = idsList
              .map((id) => allEntities.find((e) => String(e.id) === String(id))?.nombre)
              .filter(Boolean);

            return namesList.length === 0 ? (
              <span className="font-serif italic text-foreground/35 text-[1rem]">-</span>
            ) : (
              <span className="font-serif text-[1rem] text-foreground/65 leading-relaxed">
                {namesList.join(", ")}
              </span>
            );
          } catch (e) {
            const ent = allEntities.find((e) => String(e.id) === String(cleanValue));
            return (
              <span className="font-serif text-[1rem] text-foreground/65 leading-relaxed">
                {ent?.nombre || cleanValue}
              </span>
            );
          }
        })();

      default:
        return (
          <span className="font-serif text-[1rem] text-foreground/65 leading-relaxed">
            {cleanValue}
          </span>
        );
    }
  })();
};

const DynamicAttributeForm: React.FC<DynamicAttributeFormProps> = ({
  entity,
  onUpdate,
}) => {
  const { t } = useLanguage();
  const { loading, categories, values, allEntities } = useDynamicAttributeForm(entity, onUpdate);

  return loading ? (
    <div className="p-4 animate-pulse italic opacity-30 text-[10px]">
      Cargando atributos...
    </div>
  ) : Object.keys(categories).length === 0 ? (
    <div className="p-10 border border-dashed border-foreground/10 text-foreground/40 text-[2.5rem] font-black uppercase tracking-[0.2em] text-center">
      Sin datos. Vaya al modo de editar para agregarlos.
    </div>
  ) : (
    <div className="max-w-4xl mx-auto space-y-12 pb-16 font-sans text-foreground">
      {Object.entries(categories).map(([category, tpls]) => (
        <div key={category} className="space-y-6">
          <div className="mb-2">
            <h3 className="font-serif text-[2.7rem] font-normal text-foreground inline-block border-b border-foreground/30 pb-1">
              {getCategoryTitle(category, t)}
            </h3>
          </div>

          <div className="border-l border-foreground/80 pl-5 ml-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
              {tpls.map((tpl) => {
                const valueObj = values.find((v) => v.plantilla_id === tpl.id);
                const currentValue = valueObj?.valor ?? "";
                const isLongText = tpl.tipo === "text" || tpl.tipo === "textarea" || tpl.tipo === "long_text";

                return (
                  <div
                    key={tpl.id}
                    className={`flex flex-col items-start ${
                      isLongText ? "md:col-span-3 gap-2" : "gap-1"
                    }`}
                  >
                    <label className="font-sans text-[1.3rem] font-normal text-foreground/90">
                      {tpl.nombre}
                    </label>
                    {renderAttributeValue(tpl, currentValue, allEntities)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DynamicAttributeForm;

