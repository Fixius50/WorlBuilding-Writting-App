import { useState, useEffect } from 'react';

export const useRightPanelPortal = () => {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Intentar obtener el portal inmediatamente
    const el = document.getElementById('global-right-panel-portal');
    if (el) {
      setPortalNode(el);
    }

    // Observar el DOM por si el panel se renderiza asíncronamente o cambia
    const observer = new MutationObserver(() => {
      const currentEl = document.getElementById('global-right-panel-portal');
      setPortalNode(currentEl);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return portalNode;
};
