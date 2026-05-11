import React from 'react';
import UniversalCanvas from '@presentation/organisms/editor/UniversalCanvas';

const GenealogyView: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-background">
       <UniversalCanvas />
       
       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-background/90 px-6 py-3 border border-primary/20 backdrop-blur-md shadow-2xl text-center">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-1">Genealogía Ancestral</h2>
          <p className="text-[9px] text-foreground/50 tracking-widest uppercase">Motor Konva Enlazado</p>
       </div>
    </div>
  );
};

export default GenealogyView;
