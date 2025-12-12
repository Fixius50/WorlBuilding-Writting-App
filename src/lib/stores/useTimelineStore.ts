/**
 * Zustand store for Timeline state management
 * Context-aware: The entire app knows the current timeline_id and game_tick
 */

import { create } from 'zustand';

interface Timeline {
    id: string;
    name: string;
    type: 'canon' | 'divergent' | 'whatif';
    parentId?: string;
}

interface TimelineState {
    // Current selection
    activeTimelineId: string | null;
    currentGameTick: number;
    maxGameTick: number;
    isPlaying: boolean;

    // Available timelines
    timelines: Timeline[];

    // Actions
    setActiveTimeline: (id: string) => void;
    setGameTick: (tick: number) => void;
    setMaxGameTick: (max: number) => void;
    togglePlay: () => void;
    addTimeline: (timeline: Timeline) => void;
    removeTimeline: (id: string) => void;

    // Derived
    getActiveTimeline: () => Timeline | undefined;
    isDivergent: () => boolean;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
    // Initial state
    activeTimelineId: null,
    currentGameTick: 0,
    maxGameTick: 1000,
    isPlaying: false,
    timelines: [
        { id: 'canon', name: 'Canon', type: 'canon' },
    ],

    // Actions
    setActiveTimeline: (id) => set({ activeTimelineId: id }),

    setGameTick: (tick) => set((state) => ({
        currentGameTick: Math.max(0, Math.min(tick, state.maxGameTick))
    })),

    setMaxGameTick: (max) => set({ maxGameTick: max }),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    addTimeline: (timeline) => set((state) => ({
        timelines: [...state.timelines, timeline]
    })),

    removeTimeline: (id) => set((state) => ({
        timelines: state.timelines.filter((t) => t.id !== id),
        activeTimelineId: state.activeTimelineId === id ? 'canon' : state.activeTimelineId
    })),

    // Derived
    getActiveTimeline: () => {
        const state = get();
        return state.timelines.find((t) => t.id === state.activeTimelineId);
    },

    isDivergent: () => {
        const timeline = get().getActiveTimeline();
        return timeline?.type !== 'canon';
    },
}));
