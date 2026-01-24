import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportesService } from '../services/reportesService';
import estadisticasService from '../services/estadisticasService';
import toast from 'react-hot-toast';
import './Reportes.css';

/**
 * Página principal de Reportes.
 * Muestra dashboard con métricas y tabla de reportes con CRUD.
 */
const Reportes = () => {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [reportesData, dashboardData] = await Promise.all([
        reportesService.getReportes(),
        estadisticasService.getDashboard(),
      ]);
      // Asegurar que reportesData sea un array
      setReportes(Array.isArray(reportesData) ? reportesData : reportesData?.results || []);
      setDashboard(dashboardData);
    } catch (error) {
      toast.error('Error al cargar datos');
      // eslint-disable-next-line no-console
      console.error(error);
      setReportes([]); // Asegurar que reportes sea array en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async id => {
    if (!window.confirm('¿Estás seguro de eliminar este reporte?')) {
      return;
    }

    try {
      await reportesService.deleteReporte(id);
      toast.success('Reporte eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      toast.error('Error al eliminar reporte');
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleEditar = id => {
    navigate(`/reportes/${id}/editar`);
  };

  const handleVerDetalle = id => {
    navigate(`/reportes/${id}`);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="reportes-container">
      {/* Header con botón de nuevo reporte */}
      <div className="reportes-header">
        <div>
          <h1>Reportes Diarios</h1>
          {dashboard && <p className="reportes-subtitle">Resumen del mes: {dashboard.mes_actual}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/reportes/nuevo')}>
          + Nuevo Reporte
        </button>
      </div>

      {/* Dashboard - Métricas principales */}
      {dashboard && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Ventas del Mes</h3>
            <p className="dashboard-value">
              ${Number(dashboard.total_ventas_mes).toLocaleString('es-CO')}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Gastos del Mes</h3>
            <p className="dashboard-value">
              ${Number(dashboard.total_gastos_mes).toLocaleString('es-CO')}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Promedio Diario</h3>
            <p className="dashboard-value">
              ${Number(dashboard.promedio_ventas_diarias).toLocaleString('es-CO')}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Reportes Registrados</h3>
            <p className="dashboard-value">{dashboard.cantidad_reportes}</p>
          </div>
        </div>
      )}

      {/* Tabla de reportes */}
      <div className="reportes-tabla-section">
        <h2>Historial de Reportes</h2>
        <div className="productos-tabla-container">
          <table className="productos-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Base Inicial</th>
                <th>Venta Total</th>
                <th>Gastos</th>
                <th>Base Siguiente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No hay reportes registrados
                  </td>
                </tr>
              ) : (
                reportes.map(reporte => (
                  <tr key={reporte.id}>
                    <td>{new Date(reporte.fecha).toLocaleDateString('es-CO')}</td>
                    <td>${Number(reporte.base_inicial).toLocaleString('es-CO')}</td>
                    <td>${Number(reporte.venta_total).toLocaleString('es-CO')}</td>
                    <td>${Number(reporte.total_gastos).toLocaleString('es-CO')}</td>
                    <td>${Number(reporte.base_siguiente).toLocaleString('es-CO')}</td>
                    <td className="acciones-cell">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleVerDetalle(reporte.id)}
                        title="Ver detalle"
                      >
                        Ver
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEditar(reporte.id)}
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleEliminar(reporte.id)}
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reportes;

