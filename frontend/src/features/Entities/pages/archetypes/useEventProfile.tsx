import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { TemplateUseCase } from '@application/useCases/TemplateUseCase';
import { Entidad, Valor } from '@domain/models/database';

// --- Interfaces ---
export interface ProfileOutletContext {
  setRightOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
  setRightPanelContent: (content: React.ReactNode) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
}

export interface SpecificEntityData extends Entidad {
  images?: string[];
  notes?: string[];
  [key: string]: unknown;
}

/**
 * 🧠 useEventProfile
 * Logic hook for EventProfileView.
 */
export const useEventProfile = (propEntityId?: string | number) => {
  const { entityId: paramEntityId, projectName } = useParams();
  const entityId = propEntityId || paramEntityId;
  const navigate = useNavigate();
  const { setRightOpen, setRightPanelTab, setRightPanelContent, setRightPanelTitle } = useOutletContext<ProfileOutletContext>();

  // --- States ---
  const [entity, setEntity] = useState<SpecificEntityData | null>(null);
  const [attributes, setAttributes] = useState<Valor[]>([]);
  const [subNodes, setSubNodes] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('REGISTRO');

  // --- Data Loading ---
  const loadEntityData = useCallback(async () => {
    if (entityId) {
      setLoading(true);
      try {
        const data = await EntityUseCase.getById(Number(entityId));
        if (data) {
          const extra = typeof data.contenido_json === 'string'
            ? JSON.parse(data.contenido_json)
            : (data.contenido_json || {});
          
          const vals = await TemplateUseCase.getEntityValues(data.id);
          
          setEntity({ ...data, ...extra });
          setAttributes(vals);

          const allEntities = await EntityUseCase.getAllByProject(data.project_id);
          const children = allEntities.filter(e => {
              const eExtra = typeof e.contenido_json === 'string' ? JSON.parse(e.contenido_json) : (e.contenido_json || {});
              return e.carpeta_id === data.id || eExtra.padre_id === data.id || eExtra.parent_id === data.id;
          });
          setSubNodes(children);
        }
      } catch (err) {
        console.error("Error loading entity:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [entityId]);

  useEffect(() => {
    loadEntityData();
  }, [loadEntityData]);

  // --- Right Panel Orchestration ---
  useEffect(() => {
    if (entity) {
      setRightOpen(true);
      setRightPanelTab('HIERARCHY');
      setRightPanelTitle(
        <div className="flex items-center justify-center gap-2 font-mono w-full">
          <span className="material-symbols-outlined text-foreground/40 text-sm">hub</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-center">HITOS VINCULADOS</span>
        </div>
      );
      
      setRightPanelContent(
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 border-b border-foreground/5">
             <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Sub-eventos de {entity.nombre}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {subNodes.length > 0 ? (
              subNodes.map(node => (
                <div 
                  key={node.id} 
                  onClick={() => navigate(`/local/${projectName}/bible/entity/${node.id}`)}
                  className="p-6 bg-background border-b border-foreground/5 hover:bg-foreground/[0.02] cursor-pointer group flex items-center justify-between transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-foreground/60 group-hover:text-foreground uppercase tracking-widest transition-colors">{node.nombre}</span>
                    <span className="text-[8px] font-bold text-foreground/20 uppercase mt-1">{node.tipo}</span>
                  </div>
                  <span className="material-symbols-outlined text-foreground/10 text-sm group-hover:text-foreground/40 transition-all">arrow_forward_ios</span>
                </div>
              ))
            ) : (
              <div className="p-16 text-center flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-foreground/5">event_repeat</span>
                <div className="text-[10px] uppercase tracking-widest font-black text-foreground/20">
                  Evento Aislado
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }, [entity, subNodes, projectName, navigate, setRightOpen, setRightPanelTab, setRightPanelTitle, setRightPanelContent]);

  // --- Actions ---
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    } else {
      try {
        await EntityUseCase.delete(Number(entityId));
        navigate(`/local/${projectName}/bible`);
      } catch (err) {
        console.error("Error deleting entity:", err);
      }
    }
  };

  return {
    entity,
    attributes,
    loading,
    confirmDelete,
    activeTab,
    setActiveTab,
    handleDelete,
    projectName,
    navigate,
    entityId
  };
};
