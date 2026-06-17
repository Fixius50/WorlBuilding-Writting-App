import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import { useSettingsStore } from '@features/Settings/store/useSettingsStore';

/**
 * ðŸ§  useSettings
 * Logic for managing application preferences, appearance, profiles, and data persistence.
 */
export const useSettings = () => {
  const navigate = useNavigate();
  const { projectName } = useParams<{ projectName: string }>();
  const { language, changeLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    user,
    projects,
    selectedProjects,
    settings,
    initialize,
    updateSetting,
    toggleProjectSelection,
    updateProfile,
    setAvatar,
    handleDownloadBackup,
    handleImportDatabase,
    addNotification
  } = useSettingsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      addNotification("Imagen demasiado grande (mÃ¡x 1MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      const newAvatar = ev.target?.result as string;
      setAvatar(newAvatar);
    };
    reader.readAsDataURL(file);
  }, [addNotification, setAvatar]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const success = await handleImportDatabase(file);
    if (success) {
      setTimeout(() => window.location.reload(), 1500);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleImportDatabase]);

  const handleExportZip = useCallback(async () => {
    const targetProject = projectName || 'worldbuilding_master';
    addNotification("Generando paquete ZIP del universo...", "info");
    window.location.href = `/api/db/export/${targetProject}`;
  }, [projectName, addNotification]);

  const goBack = useCallback(() => navigate(-1), [navigate]);

  return {
    user,
    projects,
    selectedProjects,
    settings,
    activeTab,
    setActiveTab,
    language,
    changeLanguage,
    fileInputRef,
    handleAvatarChange,
    handleImport,
    handleDownloadBackup,
    handleExportZip,
    updateSetting,
    toggleProjectSelection,
    updateProfile,
    goBack
  };
};

