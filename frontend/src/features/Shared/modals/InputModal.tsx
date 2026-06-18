import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "../primitives/Button";

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message?: string;
  initialValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * 📦 InputModal
 * Componente modal genérico para entrada de datos de texto.
 * Ubicado en Shared para ser consumido de manera global.
 */
const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  initialValue = "",
  placeholder = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  useEffect(() => {
    switch (isOpen) {
      case true:
        if (inputRef.current) {
          setTimeout(() => inputRef.current?.focus(), 50);
        }
        break;
      default:
        break;
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(value);
    onClose();
  };

  switch (isOpen) {
    case true:
      return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-300">
          <div
            className="monolithic-panel shadow-2xl p-6 w-full max-w-md space-y-5 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 relative overflow-hidden ring-1 ring-foreground/5"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

            <div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">
                {title}
              </h3>
              {message && (
                <p className="text-sm text-foreground/60 leading-relaxed mt-2">
                  {message}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValue(e.target.value)
                }
                placeholder={placeholder}
                className="w-full sunken-panel bg-foreground/[0.02] px-4 py-3.5 text-foreground placeholder-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-sans text-sm"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
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
        document.body,
      );
    default:
      return null;
  }
};

export default InputModal;
