// Exportaciones públicas del módulo Settings
export { default as Settings } from "./pages/Settings";
export { default as ArchetypeManager } from "./pages/ArchetypeManager";
export { TemplateUseCase } from "./application/TemplateUseCase";
export { SettingsUseCase } from "./application/SettingsUseCase";
export type { UserData, AppSettings } from "./application/SettingsUseCase";
export { useSettingsStore } from "./store/useSettingsStore";
