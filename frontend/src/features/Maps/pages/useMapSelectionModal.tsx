import { useCallback } from 'react';

export interface MapPreview {
  id: number;
  nombre: string;
  iconUrl?: string;
  attributes?: {
    snapshotUrl?: string;
    bgImage?: string;
    layers?: unknown[];
  };
}

/**
 * 🧠 useMapSelectionModal
 * Handles preview image sanitization and selection logic for the map selector.
 */
export const useMapSelectionModal = () => {
  const getPreviewImage = useCallback((map: MapPreview) => {
    let previewImage = map.attributes?.snapshotUrl || map.attributes?.bgImage || map.iconUrl;
    if (previewImage && (previewImage.includes('duckdns') || previewImage.includes('nopreview'))) {
      previewImage = undefined;
    }
    return previewImage;
  }, []);

  return {
    getPreviewImage
  };
};
