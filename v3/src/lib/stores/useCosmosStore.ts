/**
 * Cosmos Store - Estado global del contexto multiverso
 * 
 * El usuario siempre está navegando dentro de un contexto específico:
 * Universo → Espacio-Tiempo → Planeta (opcional)
 */

import { create } from 'zustand';
import { TimeConfig, ticksToCalendar, formatLocalDate, formatUniversalTick, getFullConfig, DEFAULT_TIME_CONFIG } from '@/lib/chrono/chrono-engine';

export interface SpacetimeInfo {
    id: string;
    name: string;
    isCanon: boolean;
    timeConfig: TimeConfig;
}

interface CosmosState {
    // Proyecto activo
    projectId: string | null;
    projectName: string;

    // Contexto jerárquico actual
    currentUniverseId: string | null;
    currentSpacetimeId: string | null;
    currentPlanetId: string | null;

    // Espacios-Tiempo disponibles (pestañas)
    spacetimes: SpacetimeInfo[];

    // Tiempo
    currentTick: number;
    maxTick: number;
    isPlaying: boolean;

    // Acciones de navegación
    setProject: (id: string, name: string) => void;
    setUniverse: (id: string) => void;
    setSpacetime: (id: string) => void;
    setPlanet: (id: string | null) => void;
    addSpacetime: (spacetime: SpacetimeInfo) => void;
    removeSpacetime: (id: string) => void;

    // Acciones de tiempo
    setTick: (tick: number) => void;
    setMaxTick: (max: number) => void;
    togglePlay: () => void;
    stepForward: (amount?: number) => void;
    stepBackward: (amount?: number) => void;

    // Getters derivados
    getCurrentSpacetime: () => SpacetimeInfo | undefined;
    getLocalTime: () => string;
    getUniversalTime: () => string;
    isDivergent: () => boolean;
    getContextPath: () => string[];
}

export const useCosmosStore = create<CosmosState>((set, get) => ({
    // Estado inicial
    projectId: null,
    projectName: 'Untitled Project',
    currentUniverseId: 'default-universe',
    currentSpacetimeId: 'canon',
    currentPlanetId: null,
    spacetimes: [
        {
            id: 'canon',
            name: 'Canon',
            isCanon: true,
            timeConfig: DEFAULT_TIME_CONFIG,
        },
    ],
    currentTick: 0,
    maxTick: 1_000_000,
    isPlaying: false,

    // Acciones de navegación
    setProject: (id, name) => set({ projectId: id, projectName: name }),

    setUniverse: (id) => set({ currentUniverseId: id }),

    setSpacetime: (id) => set({
        currentSpacetimeId: id,
        currentPlanetId: null, // Reset planet when changing spacetime
    }),

    setPlanet: (id) => set({ currentPlanetId: id }),

    addSpacetime: (spacetime) => set((state) => ({
        spacetimes: [...state.spacetimes, spacetime],
    })),

    removeSpacetime: (id) => set((state) => ({
        spacetimes: state.spacetimes.filter((st) => st.id !== id),
        currentSpacetimeId: state.currentSpacetimeId === id
            ? state.spacetimes.find(st => st.isCanon)?.id ?? null
            : state.currentSpacetimeId,
    })),

    // Acciones de tiempo
    setTick: (tick) => set((state) => ({
        currentTick: Math.max(0, Math.min(tick, state.maxTick)),
    })),

    setMaxTick: (max) => set({ maxTick: max }),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    stepForward: (amount = 1) => set((state) => ({
        currentTick: Math.min(state.currentTick + amount, state.maxTick),
    })),

    stepBackward: (amount = 1) => set((state) => ({
        currentTick: Math.max(state.currentTick - amount, 0),
    })),

    // Getters derivados
    getCurrentSpacetime: () => {
        const state = get();
        return state.spacetimes.find((st) => st.id === state.currentSpacetimeId);
    },

    getLocalTime: () => {
        const state = get();
        const spacetime = state.spacetimes.find((st) => st.id === state.currentSpacetimeId);
        if (!spacetime) return 'Unknown';

        const config = getFullConfig(spacetime.timeConfig);
        const localDate = ticksToCalendar(state.currentTick, config);
        return formatLocalDate(localDate, 'full');
    },

    getUniversalTime: () => {
        const state = get();
        return `Tick ${formatUniversalTick(state.currentTick)}`;
    },

    isDivergent: () => {
        const spacetime = get().getCurrentSpacetime();
        return spacetime ? !spacetime.isCanon : false;
    },

    getContextPath: () => {
        const state = get();
        const path: string[] = [];

        if (state.currentUniverseId) {
            path.push('Universe');
        }

        const spacetime = state.getCurrentSpacetime();
        if (spacetime) {
            path.push(spacetime.name);
        }

        if (state.currentPlanetId) {
            path.push('Planet'); // TODO: Get actual planet name from DB
        }

        return path;
    },
}));

// Hook helpers
export function useCurrentSpacetime() {
    return useCosmosStore((state) => state.getCurrentSpacetime());
}

export function useLocalTime() {
    return useCosmosStore((state) => state.getLocalTime());
}

export function useUniversalTime() {
    return useCosmosStore((state) => state.getUniversalTime());
}

export function useIsDivergent() {
    return useCosmosStore((state) => state.isDivergent());
}
