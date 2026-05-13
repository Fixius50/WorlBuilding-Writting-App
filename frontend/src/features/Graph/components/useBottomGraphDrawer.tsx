import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 🧠 useBottomGraphDrawer
 * Hook to handle the resizing and state management of the bottom graph drawer.
 */
export const useBottomGraphDrawer = () => {
  const [heightVH, setHeightVH] = useState(70); // Default to 70vh
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    
    const newHeightPx = window.innerHeight - e.clientY;
    const newHeightVH = (newHeightPx / window.innerHeight) * 100;
    
    // Constraints: min 20vh, max 95vh
    if (newHeightVH > 20 && newHeightVH < 95) {
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
    startResizing
  };
};
