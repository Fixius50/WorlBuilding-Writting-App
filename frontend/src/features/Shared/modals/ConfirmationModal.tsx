import React from "react";
import ConfirmModal from "./ConfirmModal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning";
}

/**
 * 📦 ConfirmationModal
 * Wrapper ligero sobre ConfirmModal que emula la API del antiguo modal
 * para no romper las más de 20 páginas que lo consumen.
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
}) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      isDestructive={type === "danger"}
    />
  );
};

export default ConfirmationModal;
