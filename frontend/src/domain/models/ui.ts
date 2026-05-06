import { ReactNode } from 'react';
import { Carpeta, FolderType } from './database';

export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

export interface BaseProps {
  children?: ReactNode;
  className?: string;
  id?: string;
}

export interface IconProps extends BaseProps {
  icon?: string;
}

export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

/**
 * Contexto compartido a través de OutletContext en el layout principal.
 */
export interface ArchitectContext {
  projectId: number;
  projectName: string | undefined;
  baseUrl: string;
  folders: Carpeta[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  handleCreateSimpleFolder: (parentId: number | null, type?: FolderType) => Promise<void>;
  handleCreateQuickEntity?: (parentId: number, name: string, type: string) => Promise<any>;
  handleDeleteFolder: (id: number, parentId?: number | null) => void;
  handleRenameFolder: (id: number, name: string) => void;
  handleCreateEntity: (parentId: number | string, type?: string) => void;
  handleDeleteEntity: (id: number, folderId: number) => void;
  toggleRightPanel?: () => void;
}
