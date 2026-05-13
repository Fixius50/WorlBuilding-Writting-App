import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '@store/useDashboardStore';

/**
 * 🧠 useDashboard
 * Logic for managing dashboard statistics, loading states, and activity logs.
 */
export const useDashboard = (projectId: number) => {
  const { stats, isLoading, error, loadStats } = useDashboardStore();

  const reloadStats = useCallback(() => {
    if (projectId) {
      loadStats(projectId);
    }
  }, [projectId, loadStats]);

  useEffect(() => {
    reloadStats();
  }, [reloadStats]);

  return {
    stats,
    isLoading,
    error,
    reloadStats
  };
};
