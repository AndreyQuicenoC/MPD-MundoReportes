import { useEffect } from 'react';
import './ModalConfirmacion.css';

/**
 * Modal de confirmación reutilizable
 * Reemplaza window.confirm por un overlay profesional
 */
const ModalConfirmacion = ({
  isOpen,
  titulo,
  mensaje,
  onConfirm,
  onCancel,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  isDanger = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-confirm" onClick={onCancel}>
      <div className="modal-contenido-confirm" onClick={e => e.stopPropagation()}>
        <div className="modal-header-confirm">
          <h2>{titulo}</h2>
          <button className="modal-close-confirm" onClick={onCancel} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body-confirm">
          <p>{mensaje}</p>
        </div>

        <div className="modal-footer-confirm">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
