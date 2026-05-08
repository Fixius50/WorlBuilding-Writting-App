import { create } from 'zustand';
import { ReactNode } from 'react';

export type RightPanelMode = 'entity' | 'event' | 'notes' | 'bulk' | 'dictionary' | 'custom' | null;

interface RightPanelState {
  isOpen: boolean;
  mode: RightPanelMode;
  activeId: number | string | null;
  content: ReactNode | null;
  title: ReactNode | null;
  activeTab: string;

  // Acciones
  openPanel: (mode: RightPanelMode, activeId?: number | string | null, title?: ReactNode | null) => void;
  setCustomContent: (content: ReactNode, title?: ReactNode | null) => void;
  closePanel: () => void;
  togglePanel: () => void;
  setActiveTab: (tab: string) => void;
  reset: () => void;
}

export const useRightPanelStore = create<RightPanelState>((set) => ({
  isOpen: false,
  mode: null,
  activeId: null,
  content: null,
  title: null,
  activeTab: 'CONTEXT',

  openPanel: (mode, activeId = null, title = null) => set({
    isOpen: true,
    mode,
    activeId,
    title,
    content: null, // Limpiar contenido custom al cambiar de modo
    activeTab: 'CONTEXT'
  }),

  setCustomContent: (content, title = null) => set({
    isOpen: true,
    mode: 'custom',
    content,
    title,
    activeId: null,
    activeTab: 'CONTEXT'
  }),

  closePanel: () => set({ isOpen: false }),
  
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

  setActiveTab: (activeTab) => set({ activeTab }),

  reset: () => set({
    isOpen: false,
    mode: null,
    activeId: null,
    content: null,
    title: null,
    activeTab: 'CONTEXT'
  })
}));
