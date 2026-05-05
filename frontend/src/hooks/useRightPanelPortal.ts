// import { useState, useEffect } from 'react';
// 
// /**
//  * @deprecated Este hook ha sido sustituido por useRightPanelStore (Zustand)
//  * en la migración hacia la arquitectura Monolithic Zen.
//  * Se mantiene por trazabilidad histórica.
//  */
// export const useRightPanelPortal = () => {
//   const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
// 
//   useEffect(() => {
//     const el = document.getElementById('global-right-panel-portal');
//     if (el) {
//       setPortalNode(el);
//     }
// 
//     const observer = new MutationObserver(() => {
//       const currentEl = document.getElementById('global-right-panel-portal');
//       setPortalNode(currentEl);
//     });
// 
//     observer.observe(document.body, { childList: true, subtree: true });
// 
//     return () => observer.disconnect();
//   }, []);
// 
//   return portalNode;
// };
