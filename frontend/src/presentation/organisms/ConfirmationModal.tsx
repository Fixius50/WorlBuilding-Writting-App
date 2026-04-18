import React from 'react';
import { createPortal } from 'react-dom';
import Button from '@atoms/Button';
import GlassPanel from '@atoms/GlassPanel';

interface ConfirmationModalProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: () => void;
 title: string;
 message: string;
 confirmText?: string;
 cancelText?: string;
 type?: 'danger' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
 if (!isOpen) return null;

 return createPortal(
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-background/60 animate-in fade-in duration-200"
 onClick={onClose}
 />

 {/* Modal Content */}
 <div className="relative w-full max-w-md monolithic-panel rounded-none shadow-2xl p-6 animate-in zoom-in-95 duration-200 overflow-hidden">
 {/* Decorative Background */}
 <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

 <div className="relative z-10 text-center">
 <div className={`mx-auto mb-4 size-16 rounded-none flex items-center justify-center ${type === 'danger' ? 'bg-red-500/10 text-destructive' : 'bg-yellow-500/10 text-yellow-500'}`}>
 <span className="material-symbols-outlined text-3xl">
 {type === 'danger' ? 'delete_forever' : 'warning'}
 </span>
 </div>

 <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
 <p className="text-text-muted text-sm mb-8 leading-relaxed">
 {message}
 </p>

 <div className="flex gap-3">
 <button
 onClick={onClose}
 className="flex-1 px-4 py-3 rounded-none sunken-panel hover:bg-foreground/10 text-text-muted hover:text-foreground text-xs font-bold transition-all border border-foreground/10"
 >
 {cancelText}
 </button>
 <button
 onClick={() => { onConfirm(); onClose(); }}
 className={`flex-1 px-4 py-3 rounded-none text-foreground text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2
 ${type === 'danger'
 ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
 : 'bg-primary hover:bg-primary-light shadow-primary/20'
 }`}
 >
 <span>{confirmText}</span>
 </button>
 </div>
 </div>
 </div>
 </div>,
 document.body
 );
};

export default ConfirmationModal;
