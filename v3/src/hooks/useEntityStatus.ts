/**
 * useEntityStatus - Hook que escucha cambios en tiempo real de una entidad
 * 
 * Permite saber si una entidad está "viva" o "muerta" en el tick actual
 */

import { useState, useEffect } from 'react';
import { useCosmosStore } from '@/lib/stores/useCosmosStore';
import { getEntityState } from '@/lib/db/local-database';
import { isTickInRange } from '@/lib/chrono/chrono-engine';

export type EntityStatus = 'alive' | 'dead' | 'unborn' | 'unknown';

export interface EntityInfo {
    status: EntityStatus;
    name: string;
    type: string;
    deathTick?: number;
    birthTick?: number;
}

/**
 * Hook para obtener el estado de una entidad en el tick actual
 */
export function useEntityStatus(entityId: string): EntityInfo {
    const { currentTick, currentSpacetimeId } = useCosmosStore();
    const [info, setInfo] = useState<EntityInfo>({
        status: 'unknown',
        name: '',
        type: '',
    });

    useEffect(() => {
        if (!entityId || !currentSpacetimeId) {
            setInfo({ status: 'unknown', name: '', type: '' });
            return;
        }

        // Query facts for this entity at current tick
        const facts = getEntityState(entityId, currentSpacetimeId, currentTick);

        // Find relevant facts
        const nameFact = facts.find(f => f.attribute === 'name');
        const typeFact = facts.find(f => f.attribute === 'type');
        const statusFact = facts.find(f => f.attribute === 'status');
        const deathFact = facts.find(f => f.attribute === 'death_tick');
        const birthFact = facts.find(f => f.attribute === 'birth_tick');

        // Determine status based on facts
        let status: EntityStatus = 'alive';

        // Check if entity has a death_tick and current is past it
        if (deathFact && typeof deathFact.value === 'number') {
            if (currentTick >= deathFact.value) {
                status = 'dead';
            }
        }

        // Check if entity hasn't been born yet
        if (birthFact && typeof birthFact.value === 'number') {
            if (currentTick < birthFact.value) {
                status = 'unborn';
            }
        }

        // Explicit status fact overrides
        if (statusFact) {
            const val = statusFact.value as { string?: string };
            if (val.string === 'dead') status = 'dead';
            if (val.string === 'alive') status = 'alive';
        }

        setInfo({
            status,
            name: (nameFact?.value as { string?: string })?.string || 'Unknown',
            type: (typeFact?.value as { string?: string })?.string || 'entity',
            deathTick: deathFact?.value as number | undefined,
            birthTick: birthFact?.value as number | undefined,
        });
    }, [entityId, currentTick, currentSpacetimeId]);

    return info;
}

/**
 * Hook simplificado que solo devuelve si está vivo o muerto
 */
export function useIsEntityAlive(entityId: string): boolean {
    const { status } = useEntityStatus(entityId);
    return status === 'alive';
}
