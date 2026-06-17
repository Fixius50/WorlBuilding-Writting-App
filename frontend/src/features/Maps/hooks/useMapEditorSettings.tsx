import { useCallback } from 'react';

export interface MapSettings {
  showGrid?: boolean;
  gridSize?: number;
  width?: number;
  height?: number;
  bgImage?: string;
}

/**
 * 🧠 useMapEditorSettings
 * Handles configuration updates for the map editor settings panel.
 */
export const useMapEditorSettings = (
  settings: MapSettings,
  onUpdate: (s: MapSettings) => void
) => {
  const handleChange = useCallback((key: keyof MapSettings, value: MapSettings[keyof MapSettings]) => {
    onUpdate({ ...settings, [key]: value });
  }, [settings, onUpdate]);

  return {
    handleChange
  };
};
