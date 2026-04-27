import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

interface ImageNodeData {
  url?: string;
  width?: number;
  height?: number;
  onUpdate?: (updates: any) => void;
}

const ImageNode: React.FC<NodeProps<any>> = ({ data, selected }) => {
  const { url, onUpdate } = data as ImageNodeData;
  return (
    <>
      <NodeResizer 
        color="#ffffff" 
        isVisible={selected} 
        minWidth={100} 
        minHeight={100} 
      />
      <div className={`
        relative overflow-hidden shadow-2xl transition-all duration-300 w-full h-full
        ${selected ? 'ring-2 ring-primary scale-[1.02]' : 'scale-100'}
        bg-background/80 backdrop-blur-md border border-foreground/10
      `}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      
      <div className="w-full h-full relative group">
        {url ? (
            <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-foreground/40 italic p-4 text-center">
                <span className="material-symbols-outlined text-4xl">image</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">Configurar Imagen</span>
                
                <div className="flex flex-col gap-2 w-full max-w-[180px]">
                    <button 
                        className="bg-primary/20 hover:bg-primary/40 text-primary text-[8px] font-black uppercase py-1.5 border border-primary/20 transition-colors"
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (re) => onUpdate?.({ url: re.target?.result });
                                    reader.readAsDataURL(file);
                                }
                            };
                            input.click();
                        }}
                    >
                        Subir desde local
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-foreground/10" />
                        <span className="text-[7px]">O</span>
                        <div className="h-px flex-1 bg-foreground/10" />
                    </div>

                    <input 
                        type="text" 
                        placeholder="Pesta URL externa..."
                        className="w-full bg-foreground/5 border border-foreground/10 px-2 py-1 text-[8px] outline-none text-center"
                        onBlur={(e) => onUpdate?.({ url: e.target.value })}
                    />
                </div>
            </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
    </>
  );
};

export default ImageNode;
