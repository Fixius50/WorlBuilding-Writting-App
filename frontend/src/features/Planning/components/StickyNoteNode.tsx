import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

interface StickyNoteData {
  text: string;
  color?: string;
  width?: number;
  height?: number;
  onChange?: (val: string) => void;
}

const StickyNoteNode: React.FC<NodeProps<any>> = ({ data, selected }) => {
  const { text, onChange, color } = data as StickyNoteData;
  const bgColor = color || 'rgb(253 224 71 / 0.9)'; // Default yellow

  return (
    <>
      <NodeResizer 
        color="#ffffff" 
        isVisible={selected} 
        minWidth={100} 
        minHeight={100} 
      />
      <div className={`
        relative p-4 shadow-2xl transition-all duration-300 w-full h-full
        ${selected ? 'ring-2 ring-primary scale-[1.02]' : 'scale-100'}
        backdrop-blur-sm border-l-4 border-black/10
      `}
      style={{
          backgroundColor: bgColor,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 90%, 90% 100%, 0% 100%)',
      }}>
      <Handle type="target" position={Position.Top} className="!bg-primary opacity-0 hover:opacity-100 transition-opacity" />
      
      <div className="flex flex-col h-full">
        <textarea
          className="w-full h-full bg-transparent border-none outline-none resize-none text-black dark:text-white font-handwriting text-sm leading-relaxed"
          placeholder="Escribe algo..."
          defaultValue={text}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary opacity-0 hover:opacity-100 transition-opacity" />
    </div>
    </>
  );
};

export default StickyNoteNode;
