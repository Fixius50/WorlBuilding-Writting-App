// Exportaciones públicas del módulo Dashboard
export { default as Dashboard } from "./pages/Dashboard";
export { default as ProjectView } from "./pages/ProjectView";
export { DashboardUseCase } from "./application/DashboardUseCase";
export type { DashboardStats } from "./application/DashboardUseCase";
export { useDashboardStore } from "./store/useDashboardStore";
