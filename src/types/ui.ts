import { ReactNode } from 'react';

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
