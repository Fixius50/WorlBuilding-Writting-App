import { create } from 'zustand';
import { DashboardUseCase, DashboardStats } from '@application/useCases/DashboardUseCase';

interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: unknown | null;
  loadStats: (projectId: number) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    entityCount: 0,
    folderCount: 0,
    entitiesByType: [],
    recentActivity: []
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
  }
}));
