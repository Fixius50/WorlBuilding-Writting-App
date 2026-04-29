import { create } from 'zustand';
import { DashboardUseCase, DashboardStats } from '@application/useCases/DashboardUseCase';

interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: unknown | null;
  loadStats: (projectId: number) => Promise<void>;
  updateWordCount: (count: number) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    entityCount: 0,
    folderCount: 0,
    entitiesByType: [],
    recentActivity: [],
    wordCount: 0,
    pageCount: 0,
    notebookCount: 0
  },
  isLoading: false,
  error: null,
  loadStats: async (projectId: number) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await DashboardUseCase.getStats(projectId);
      set({ stats, isLoading: false });
    } catch (error: unknown) {
      console.error("Error loading dashboard stats", error);
      set({ error, isLoading: false });
    }
  },
  updateWordCount: (count: number) => {
    set((state) => ({
      stats: {
        ...state.stats,
        wordCount: count
      }
    }));
  }
}));
