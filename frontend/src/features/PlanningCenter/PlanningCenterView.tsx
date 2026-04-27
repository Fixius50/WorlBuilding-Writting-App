import React, { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import GlassPanel from '@atoms/GlassPanel';
import GraphView from '@features/Graph/pages/GeneralGraphView';
import { WhiteboardView } from '@features/Planning';
import { GenealogyView } from '@features/Genealogy';

type PlanningTab = 'NETWORK' | 'WHITEBOARD' | 'GENEALOGY';

const PlanningCenterView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PlanningTab>('WHITEBOARD');
  const { projectId, projectName } = useOutletContext<{ projectId: number, projectName: string }>();

  const TABS = [
    { id: 'NETWORK', label: 'Red Neuronal', icon: 'hub' },
    { id: 'WHITEBOARD', label: 'Pizarra de Ideas', icon: 'inventory_2' },
    { id: 'GENEALOGY', label: 'Árbol de Linaje', icon: 'account_tree' },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-background relative overflow-hidden">
      {/* Barra de Pestañas Superior - Pegada arriba, pero sin extenderse lateralmente */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[60] flex justify-center">
        <div className="border-x border-b border-foreground/10 bg-background/60 backdrop-blur-xl flex items-stretch gap-0.5 h-10 px-2 shadow-xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PlanningTab)}
              className={`
                relative flex items-center gap-2.5 px-8 transition-all duration-500
                text-[9px] font-black uppercase tracking-[0.2em]
                ${activeTab === tab.id 
                  ? 'text-primary bg-primary/5' 
                  : 'text-foreground/30 hover:text-foreground/60 hover:bg-white/[0.02]'}
              `}
            >
              {/* Indicador de pestaña activa */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary animate-in fade-in slide-in-from-bottom-2 duration-300" />
              )}
              
              <span className={`material-symbols-outlined text-[1.1rem] transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'scale-90 opacity-40'}`}>
                {tab.icon}
              </span>
              <span className="hidden md:inline whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenedor de Contenido - Sangrado total */}
      <div className="w-full h-full relative">
        <div className={`absolute inset-0 ${activeTab === 'NETWORK' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <GraphView projectId={projectId} projectName={projectName} />
        </div>
        
        <div className={`absolute inset-0 ${activeTab === 'WHITEBOARD' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <WhiteboardView />
        </div>

        <div className={`absolute inset-0 ${activeTab === 'GENEALOGY' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <GenealogyView />
        </div>
      </div>
    </div>
  );
};

export default PlanningCenterView;
