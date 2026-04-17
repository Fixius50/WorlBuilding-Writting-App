import React from 'react';
import Button from './Button';
import GlassPanel from './GlassPanel';
import { ModalProps } from '../../types/ui';

interface ConfirmModalProps extends ModalProps {
 onConfirm: () => void;
 message: string;
 confirmText?: string;
 cancelText?: string;
 isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDestructive = true }) => {
 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-background/60 animate-in fade-in duration-300"
 onClick={onClose}
 ></div>

 {/* Modal Card */}
 <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-300">
 <div className="p-6 monolithic-panel border-destructive/20 shadow-2xl">
 <div className="flex items-start gap-4 mb-6">
 <div className={`
 size-12 rounded-none flex items-center justify-center shrink-0
 ${isDestructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}
 `}>
 <span className="material-symbols-outlined text-2xl">
 {isDestructive ? 'warning' : 'help'}
 </span>
 </div>
 <div>
 <h3 className="text-lg font-black text-foreground mb-2 leading-tight">{title}</h3>
 <p className="text-sm text-foreground/60 leading-relaxed">{message}</p>
 </div>
 </div>

 <div className="flex items-center justify-end gap-3">
 <Button
 variant="ghost"
 onClick={onClose}
 >
 {cancelText}
 </Button>
 <Button
 variant={isDestructive ? 'danger' : 'primary'}
 onClick={() => {
 onConfirm();
 onClose();
 }}
 icon={isDestructive ? 'delete' : 'check'}
 >
 {confirmText}
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
};

export default ConfirmModal;
