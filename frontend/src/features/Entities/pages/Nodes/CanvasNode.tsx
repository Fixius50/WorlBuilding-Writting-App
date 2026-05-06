import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import AttributeField from '../AttributeField';

type CanvasNodeData = { attribute: unknown; value: string; onChange: (v: string) => void; linkableEntities?: unknown[] };

const CanvasNode = ({ data, selected }: { data: CanvasNodeData, selected?: boolean }) => {
 // data contains: attribute (model), value, onChange (fn), linkableEntities (array)

 return (
 <div className={`shadow-xl rounded-none min-w-[300px] transition-all duration-300 ${selected ? 'ring-2 ring-primary scale-105' : ''}`}>
 {/* Input Handle (Target) */}
 <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3" />

 {/* Content using extracted component */}
 <AttributeField
 attribute={data.attribute}
 value={data.value}
 onChange={data.onChange}
 linkableEntities={data.linkableEntities}
 />

 {/* Output Handle (Source) */}
 <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3" />
 </div>
 );
};

export default memo(CanvasNode);
