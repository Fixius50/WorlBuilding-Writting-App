import { useState, useEffect, useRef, useCallback } from 'react';

type PanelSection = 'graph' | 'database' | 'notes' | 'stats';

/**
 * 🧠 useControlPanel
 * Hook to handle control panel state, section navigation, time updates, and resize logic.
 */
export const useControlPanel = () => {
  const [heightVH, setHeightVH] = useState(65);
  const [activeSection, setActiveSection] = useState<PanelSection>('database');
  const [currentTime, setCurrentTime] = useState(new Date());
  const isResizing = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    if (!isResizing.current) return;
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newHeightPx = window.innerHeight - e.clientY;
    const newHeightVH = (newHeightPx / window.innerHeight) * 100;
    if (newHeightVH > 20 && newHeightVH < 90) {
      setHeightVH(newHeightVH);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return {
    heightVH,
    activeSection,
    setActiveSection,
    currentTime,
    startResizing
  };
};
