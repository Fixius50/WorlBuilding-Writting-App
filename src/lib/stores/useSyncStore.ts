/**
 * Sync Store - Tracks local database synchronization status
 */

import { create } from 'zustand';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncState {
    status: SyncStatus;
    lastSyncTime: Date | null;
    pendingChanges: number;

    // Actions
    setSynced: () => void;
    setSyncing: () => void;
    setOffline: () => void;
    setError: () => void;
    incrementPending: () => void;
    decrementPending: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
    status: 'synced',
    lastSyncTime: null,
    pendingChanges: 0,

    setSynced: () => set({
        status: 'synced',
        lastSyncTime: new Date(),
        pendingChanges: 0
    }),

    setSyncing: () => set({ status: 'syncing' }),

    setOffline: () => set({ status: 'offline' }),

    setError: () => set({ status: 'error' }),

    incrementPending: () => set((state) => ({
        pendingChanges: state.pendingChanges + 1,
        status: 'syncing'
    })),

    decrementPending: () => set((state) => {
        const newPending = Math.max(0, state.pendingChanges - 1);
        return {
            pendingChanges: newPending,
            status: newPending === 0 ? 'synced' : 'syncing',
            lastSyncTime: newPending === 0 ? new Date() : state.lastSyncTime
        };
    }),
}));
