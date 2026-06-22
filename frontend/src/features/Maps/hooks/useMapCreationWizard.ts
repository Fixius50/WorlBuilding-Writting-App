import React, { useState, useEffect } from 'react';

/**
 * 🧠 useMapCreationWizard
 * Logic for the map creation flow, including file handling and configuration.
 */
export const useMapCreationWizard = (
  onCreate: (
    mapName: string,
    config: { bgImage: string; mapType: string; description: string; parentId?: number; is3D: boolean }
  ) => Promise<void> | void,
  projectName: string
) => {
  const [mapType, setMapType] = useState('TERRITORY');
  const [canvasSource, setCanvasSource] = useState('url');
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mapName, setMapName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [is3D, setIs3D] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatusText, setCreationStatusText] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkUrl = (): void => {
      const isEmpty = !bgImageUrl;

      isEmpty ? (() => {
        setUrlError(null);
        setIsValidatingUrl(false);
      })() : (() => {
        setIsValidatingUrl(true);
        setUrlError(null);

        const img = new Image();
        img.src = bgImageUrl;
        img.onload = () => {
          setUrlError(null);
          setIsValidatingUrl(false);
        };
        img.onerror = () => {
          const cleanUrl = bgImageUrl.toLowerCase().split('?')[0];
          const hasImageExtension = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].some(ext => cleanUrl.endsWith(ext));

          const errorMsg = hasImageExtension
            ? null
            : "La URL no apunta a una imagen válida. Asegúrate de enlazar un archivo de imagen (.jpg, .png) y no una página web.";

          setUrlError(errorMsg);
          setIsValidatingUrl(false);
        };
      })();
    };

    const timer = setTimeout(checkUrl, 500);
    return () => clearTimeout(timer);
  }, [bgImageUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const cleanName = file.name.toLowerCase();
      const is3DFile = ['.glb', '.gltf', '.obj', '.fbx', '.stl'].some(ext => cleanName.endsWith(ext));

      if (isImage || is3DFile) {
        setUploadedFile(file);
        setCanvasSource('upload');
      }
    }
  };

  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleCreate = async (): Promise<void> => {
    setIsCreating(true);
    try {
      let finalBgImage = 'placeholder-map.png';

      switch (canvasSource) {
        case 'upload':
          if (uploadedFile) {
            setCreationStatusText('Subiendo imagen al servidor...');
            const formData = new FormData();
            formData.append('file', uploadedFile);
            formData.append('name', mapName);

            const response = await fetch(`/api/mapeditor/assets/${projectName}/upload`, {
              method: 'POST',
              body: formData
            });

            if (response.ok) {
              const asset = await response.json();
              finalBgImage = `/api/mapeditor/assets/${projectName}/download/${asset.fileName}`;
            } else {
              throw new Error('Error al subir el archivo al servidor.');
            }
          }
          break;
        case 'url':
          if (bgImageUrl) {
            setCreationStatusText('Descargando imagen remota en el servidor...');
            const urlParams = new URLSearchParams();
            urlParams.append('name', mapName);
            urlParams.append('url', bgImageUrl);

            const response = await fetch(`/api/mapeditor/assets/${projectName}/upload-url`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: urlParams
            });

            if (response.ok) {
              const asset = await response.json();
              finalBgImage = `/api/mapeditor/assets/${projectName}/download/${asset.fileName}`;
            } else {
              throw new Error('Error al descargar la imagen remota.');
            }
          }
          break;
        case 'blank': {
          setCreationStatusText('Generando lienzo blanco en el servidor...');
          const blankParams = new URLSearchParams();
          blankParams.append('name', mapName);

          const response = await fetch(`/api/mapeditor/assets/${projectName}/blank`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: blankParams
          });

          if (response.ok) {
            const asset = await response.json();
            finalBgImage = `/api/mapeditor/assets/${projectName}/download/${asset.fileName}`;
          } else {
            throw new Error('Error al crear el lienzo en blanco en el servidor.');
          }
          break;
        }
        default:
          break;
      }

      await onCreate(mapName, {
        bgImage: finalBgImage,
        mapType,
        description,
        parentId,
        is3D
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al procesar el mapa.');
      setIsCreating(false);
      setCreationStatusText('');
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
    urlError,
    isValidatingUrl,
    isCreating,
    creationStatusText,
    fileInputRef,
    handleFileSelect,
    handleUploadClick,
    handleCreate
  };
};
