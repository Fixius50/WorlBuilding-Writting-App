'use client';

/**
 * EntityChip - Componente que renderiza dentro del editor TipTap
 * 
 * Muestra un chip clickeable para menciones de entidades (@Gandalf)
 * con indicadores visuales del estado temporal (vivo/muerto)
 */

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useEntityStatus, EntityStatus } from '@/hooks/useEntityStatus';

// Iconos inline para diferentes estados
const SkullIcon = () => (
    <svg className="inline w-3 h-3 ml-1" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.72c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
);

const BabyIcon = () => (
    <svg className="inline w-3 h-3 ml-1" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="6" r="3" />
        <path d="M12 11c-3.5 0-7 1.5-7 4v2h14v-2c0-2.5-3.5-4-7-4z" />
    </svg>
);

// Colores por tipo de entidad
const entityTypeColors: Record<string, { bg: string; text: string; border: string }> = {
    character: { bg: 'bg-green-900/50', text: 'text-green-200', border: 'border-green-500/30' },
    actor: { bg: 'bg-green-900/50', text: 'text-green-200', border: 'border-green-500/30' },
    location: { bg: 'bg-blue-900/50', text: 'text-blue-200', border: 'border-blue-500/30' },
    planet: { bg: 'bg-blue-900/50', text: 'text-blue-200', border: 'border-blue-500/30' },
    item: { bg: 'bg-yellow-900/50', text: 'text-yellow-200', border: 'border-yellow-500/30' },
    rule: { bg: 'bg-purple-900/50', text: 'text-purple-200', border: 'border-purple-500/30' },
    event: { bg: 'bg-orange-900/50', text: 'text-orange-200', border: 'border-orange-500/30' },
    default: { bg: 'bg-gray-900/50', text: 'text-gray-200', border: 'border-gray-500/30' },
};

// Estilos por estado
const statusStyles: Record<EntityStatus, string> = {
    alive: '',
    dead: 'opacity-60 line-through',
    unborn: 'opacity-40 italic',
    unknown: 'opacity-50',
};

export function EntityChip({ node, selected }: NodeViewProps) {
    const attrs = node.attrs as { id?: string; label?: string; type?: string };
    const entityId = attrs.id || '';
    const label = attrs.label || 'Unknown';
    const entityType = attrs.type || 'character';

    // Hook que escucha cambios en tiempo real de esa entidad
    const { status, name } = useEntityStatus(entityId);

    // Obtener colores según tipo
    const colors = entityTypeColors[entityType] || entityTypeColors.default;
    const statusClass = statusStyles[status];

    const handleClick = () => {
        // TODO: Abrir panel de detalles de la entidad
        console.log(`Clicked entity: ${entityId}`, { status, name });
    };

    return (
        <NodeViewWrapper as="span" className="inline">
            <span
                className={`
          inline-flex items-center
          ${colors.bg} ${colors.text}
          border ${colors.border}
          rounded px-1.5 py-0.5
          text-sm font-medium
          cursor-pointer
          transition-all duration-200
          hover:brightness-125
          ${statusClass}
          ${selected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
        `}
                onClick={handleClick}
                title={`${label} (${entityType}) - ${status}`}
                contentEditable={false}
            >
                <span className="mr-1">@</span>
                {name || label}

                {/* Indicadores de estado */}
                {status === 'dead' && <SkullIcon />}
                {status === 'unborn' && <BabyIcon />}
            </span>
        </NodeViewWrapper>
    );
}

export default EntityChip;
