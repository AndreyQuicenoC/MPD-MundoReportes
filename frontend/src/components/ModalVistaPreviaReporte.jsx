import { useNavigate } from 'react-router-dom';
import './ModalVistaPreviaReporte.css';

/**
 * Modal de vista previa rápida de reporte
 * Muestra datos esenciales con opciones para ver detalle o cancelar
 */
const ModalVistaPreviaReporte = ({ reporte, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !reporte) return null;

  const handleVerDetalle = () => {
    onClose();
    navigate(`/reportes/${reporte.id}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenido" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Vista Previa de Reporte</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="preview-row">
            <div className="preview-item">
              <label>Fecha</label>
              <p className="preview-value">
                {new Date(reporte.fecha + 'T00:00:00').toLocaleDateString('es-CO')}
              </p>
            </div>
            <div className="preview-item">
              <label>Base Inicial</label>
              <p className="preview-value">
                ${Number(reporte.base_inicial || 0).toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          <div className="preview-row">
            <div className="preview-item">
              <label>Venta Total</label>
              <p className="preview-value">
                ${Number(reporte.venta_total).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="preview-item">
              <label>Gastos</label>
              <p className="preview-value">
                ${Number(reporte.total_gastos).toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          <div className="preview-row">
            <div className="preview-item">
              <label>Entrega</label>
              <p className="preview-value">
                ${Number(reporte.entrega || 0).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="preview-item">
              <label>Base Siguiente</label>
              <p className="preview-value">
                ${Number(reporte.base_siguiente).toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          {reporte.observacion && (
            <div className="preview-item full-width">
              <label>Observación</label>
              <p className="preview-value observation">{reporte.observacion}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleVerDetalle}>
            Ver al Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalVistaPreviaReporte;
