import { useState, useMemo, useCallback } from 'react';

/**
 * 🧠 useEditorTopBar
 * Hook to handle editor top bar logic, including word count progress, snapshots menu and back navigation.
 */
export const useEditorTopBar = (
  wordCount: number,
  wordGoal: number,
  onManualSnapshot: () => void,
  onRestoreSnapshot: (id: number) => void
) => {
  const [showSnapshots, setShowSnapshots] = useState(false);

  const progress = useMemo(() => {
    return Math.min((wordCount / wordGoal) * 100, 100);
  }, [wordCount, wordGoal]);

  const toggleSnapshots = useCallback(() => {
    setShowSnapshots(prev => !prev);
  }, []);

  const handleManualSnapshot = useCallback(() => {
    onManualSnapshot();
    setShowSnapshots(false);
  }, [onManualSnapshot]);

  const handleRestoreSnapshot = useCallback((id: number) => {
    onRestoreSnapshot(id);
    setShowSnapshots(false);
  }, [onRestoreSnapshot]);

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  return {
    progress,
    showSnapshots,
    setShowSnapshots,
    toggleSnapshots,
    handleManualSnapshot,
    handleRestoreSnapshot,
    handleBack
  };
};
