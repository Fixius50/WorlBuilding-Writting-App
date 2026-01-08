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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4 animate-in zoom-in-95 duration-200 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                <h3 className="text-xl font-bold text-white">{title}</h3>

                {message && (
                    <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono text-sm"
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
