import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportesService } from '../services/reportesService';
import toast from 'react-hot-toast';
import { exportarReportePDF } from '../utils/pdf';
import './DetalleReporte.css';

/**
 * Página para ver el detalle completo de un reporte.
 */
const DetalleReporte = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef(null);

  useEffect(() => {
    cargarReporte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarReporte = async () => {
    try {
      setLoading(true);
      const data = await reportesService.getReporte(id);
      setReporte(data);
    } catch (error) {
      toast.error('Error al cargar el reporte');
      // eslint-disable-next-line no-console
      console.error(error);
      navigate('/reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este reporte?')) {
      return;
    }

    try {
      await reportesService.deleteReporte(id);
      toast.success('Reporte eliminado exitosamente');
      navigate('/reportes');
    } catch (error) {
      toast.error('Error al eliminar reporte');
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleExportPDF = async () => {
    if (!pdfRef.current) {
      toast.error('Error: no se puede exportar en este momento');
      return;
    }

    try {
      await exportarReportePDF(reporte, pdfRef.current);
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      toast.error(error.message || 'Error al descargar el PDF');
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando reporte...</p>
      </div>
    );
  }

  if (!reporte) {
    return <div className="alert alert-error">No se pudo cargar el reporte</div>;
  }

  return (
    <div className="detalle-reporte-container">
      <div className="detalle-header">
        <h1>Detalle del Reporte</h1>
        <div className="detalle-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/reportes')}>
            Volver
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/reportes/${id}/editar`)}>
            Editar
          </button>
          <button className="btn btn-danger" onClick={handleEliminar}>
            Eliminar
          </button>
          <button className="btn btn-action" onClick={handleExportPDF}>
            PDF
          </button>
        </div>
      </div>

      <div ref={pdfRef} className="pdf-content-wrapper">
        <div className="detalle-grid">
          {/* Información general */}
          <div className="detalle-card">
            <h2>Información General</h2>
            <div className="detalle-info">
              <div className="info-row">
                <span className="info-label">Fecha:</span>
                <span className="info-value">
                  {new Date(reporte.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Creado por:</span>
                <span className="info-value">{reporte.usuario_nombre || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Fecha de creación:</span>
                <span className="info-value">
                  {new Date(reporte.fecha_creacion).toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>

          {/* Resumen financiero */}
          <div className="detalle-card">
            <h2>Resumen Financiero</h2>
            <div className="detalle-info">
              <div className="info-row">
                <span className="info-label">Base Inicial:</span>
                <span className="info-value money">
                  ${Number(reporte.base_inicial || 0).toLocaleString('es-CO')}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Venta Total:</span>
                <span className="info-value money success">
                  ${Number(reporte.venta_total || 0).toLocaleString('es-CO')}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Total Gastos:</span>
                <span className="info-value money danger">
                  ${Number(reporte.total_gastos || 0).toLocaleString('es-CO')}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Entrega:</span>
                <span className="info-value money">
                  ${Number(reporte.entrega || 0).toLocaleString('es-CO')}
                </span>
              </div>
              <div className="info-row highlight">
                <span className="info-label">Base Siguiente:</span>
                <span className="info-value money">
                  ${Number(reporte.base_siguiente || 0).toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ventas de productos */}
        {reporte.ventas_productos && reporte.ventas_productos.length > 0 && (
          <div className="detalle-card full-width">
            <h2>Productos Vendidos</h2>
            <table className="productos-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {reporte.ventas_productos.map((venta, index) => (
                  <tr key={index}>
                    <td>{venta.producto_nombre}</td>
                    <td>{venta.cantidad}</td>
                    <td>${Number(venta.precio_unitario_momento || 0).toLocaleString('es-CO')}</td>
                    <td>
                      $
                      {Number(venta.cantidad * (venta.precio_unitario_momento || 0)).toLocaleString(
                        'es-CO'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Gastos */}
        {reporte.gastos && reporte.gastos.length > 0 && (
          <div className="detalle-card full-width">
            <h2>Gastos del Día</h2>
            <table className="productos-tabla">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {reporte.gastos.map((gasto, index) => (
                  <tr key={index}>
                    <td>{gasto.categoria_nombre || 'Sin categoría'}</td>
                    <td>{gasto.descripcion}</td>
                    <td>${Number(gasto.valor || 0).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Observaciones */}
        {reporte.observacion && (
          <div className="detalle-card full-width">
            <h2>Observaciones</h2>
            <p className="observacion-text">{reporte.observacion}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleReporte;
