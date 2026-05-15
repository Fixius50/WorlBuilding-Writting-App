import { useDashboardData } from '../hooks/useDashboardData';

/**
 * 🧠 useDashboard
 * Logic for managing dashboard statistics, loading states, and activity logs.
 * Now powered by TanStack Query for instant caching and performance.
 */
export const useDashboard = (projectId: number) => {
  const { data: stats, isLoading, error, refetch } = useDashboardData(projectId);

  const defaultStats = {
    entityCount: 0,
    folderCount: 0,
    entitiesByType: [],
    recentActivity: [],
    wordCount: 0,
    pageCount: 0,
    notebookCount: 0
  };

  return {
    stats: stats || defaultStats,
    isLoading,
    error,
    reloadStats: refetch
  };
};
