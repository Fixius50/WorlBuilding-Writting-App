import { useEffect, useCallback, useMemo } from 'react';
import { useDashboardStore } from '@features/Dashboard/store/useDashboardStore';

/**
 * ðŸ§  useAnalyticsDashboard
 * Logic for processing complex metrics, word count progress, and entity distribution.
 */
export const useAnalyticsDashboard = (projectId: number) => {
  const { stats, isLoading, loadStats } = useDashboardStore();

  const reloadStats = useCallback(() => {
    if (projectId) {
      loadStats(projectId);
    }
  }, [projectId, loadStats]);

  useEffect(() => {
    reloadStats();
  }, [reloadStats]);

  const cards = useMemo(() => [
    { label: 'Palabras Totales', value: stats.wordCount.toLocaleString(), icon: 'description', color: 'text-primary' },
    { label: 'Entidades Creadas', value: stats.entityCount, icon: 'account_tree', color: 'text-purple-400' },
    { label: 'Hojas de Archivador', value: stats.pageCount, icon: 'auto_stories', color: 'text-amber-400' },
    { label: 'Archivadores Activos', value: stats.notebookCount, icon: 'folder_open', color: 'text-emerald-400' },
  ], [stats]);

  const progress = useMemo(() => ({
    codex: Math.min(100, Math.round((stats.entityCount / 50) * 100)),
    chronicles: Math.min(100, Math.round((stats.wordCount / 10000) * 100))
  }), [stats.entityCount, stats.wordCount]);

  return {
    stats,
    isLoading,
    cards,
    progress,
    reloadStats
  };
};

