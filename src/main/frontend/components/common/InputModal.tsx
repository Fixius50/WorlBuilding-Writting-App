import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

const InputModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    initialValue = '',
    placeholder = '',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
}) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef(null);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Focus input after a small delay to ensure animation/mounting
            setTimeout(() => inputRef.current.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(value);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className="bg-[#0f0f13] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50 w-full max-w-md space-y-5 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 relative overflow-hidden ring-1 ring-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
                <div className="absolute -top-10 -right-10 size-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                    {message && (
                        <p className="text-sm text-slate-400 leading-relaxed mt-2">{message}</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-sans text-sm shadow-inner"
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {cancelText}
                        </button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!value.trim()}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default InputModal;
