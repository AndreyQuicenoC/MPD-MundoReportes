import React from 'react';
import '../styles/FormModal.css';

/**
 * Componente Modal Profesional Reutilizable.
 * Overlay que cubre toda la pantalla con backdrop y modal centered.
 */
const FormModal = ({
  isOpen,
  titulo,
  onClose,
  onSubmit,
  children,
  submitText = 'Crear',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className="form-modal-backdrop" onClick={handleBackdropClick}>
      <div className="form-modal-container">
        <div className="form-modal-header">
          <h2>{titulo}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-modal-form">
          <div className="form-modal-content">{children}</div>

          <div className="form-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
