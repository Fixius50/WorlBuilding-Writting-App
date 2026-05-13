import React, { useState } from 'react';

/**
 * 🧠 useMapCreationWizard
 * Logic for the map creation flow, including file handling and configuration.
 */
export const useMapCreationWizard = (
  onCreate: (
    mapName: string, 
    config: { bgImage: string; mapType: string; description: string; parentId?: number; is3D: boolean }
  ) => void
) => {
  const [mapType, setMapType] = useState('TERRITORY');
  const [canvasSource, setCanvasSource] = useState('url');
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mapName, setMapName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [is3D, setIs3D] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
      setCanvasSource('upload');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreate = () => {
    if (canvasSource === 'upload' && uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onCreate(mapName, {
          bgImage: e.target?.result as string,
          mapType,
          description,
          parentId,
          is3D
        });
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      onCreate(mapName, {
        bgImage: canvasSource === 'url' ? bgImageUrl : 'placeholder-map.png',
        mapType,
        description,
        parentId,
        is3D
      });
    }
  };

  return {
    mapType, setMapType,
    canvasSource, setCanvasSource,
    bgImageUrl, setBgImageUrl,
    uploadedFile,
    mapName, setMapName,
    description, setDescription,
    parentId, setParentId,
    is3D, setIs3D,
    fileInputRef,
    handleFileSelect,
    handleUploadClick,
    handleCreate
  };
};
