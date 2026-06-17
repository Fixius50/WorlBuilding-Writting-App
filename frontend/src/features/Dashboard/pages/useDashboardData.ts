import { useQuery } from '@tanstack/react-query';
import { DashboardUseCase, DashboardStats } from '@features/Dashboard';

/**
 * ðŸ§  useDashboardData
 * Hook de TanStack Query para gestionar las estadÃ­sticas del proyecto.
 * Proporciona cachÃ© automÃ¡tica y estados de carga optimizados.
 */
export const useDashboardData = (projectId: number) => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', projectId],
    queryFn: () => DashboardUseCase.getStats(projectId),
    enabled: !!projectId,
    // Como es Local-First, podemos considerar los datos frescos por un buen tiempo
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

