import React from 'react';
import Button from './Button';
import GlassPanel from './GlassPanel';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDestructive = true }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-300">
                <GlassPanel className="p-6 border-red-500/20 shadow-2xl shadow-black/50">
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`
                            size-12 rounded-xl flex items-center justify-center shrink-0
                            ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}
                        `}>
                            <span className="material-symbols-outlined text-2xl">
                                {isDestructive ? 'warning' : 'help'}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white mb-2 leading-tight">{title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
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
                </GlassPanel>
            </div>
        </div>
    );
};

export default ConfirmModal;
