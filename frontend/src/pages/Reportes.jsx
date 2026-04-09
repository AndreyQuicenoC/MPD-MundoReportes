import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportesService } from '../services/reportesService';
import estadisticasService from '../services/estadisticasService';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import './Reportes.css';

/**
 * Página principal de Reportes.
 * Muestra dashboard con métricas y tabla de reportes con CRUD y paginación.
 */
const Reportes = () => {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Estados para filtros
  const [filtroMes, setFiltroMes] = useState('actual'); // 'actual' o 'todos'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroActivo, setFiltroActivo] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      let reportesPromise;

      // Si hay filtro de fechas personalizado
      if (filtroActivo && (fechaInicio || fechaFin)) {
        reportesPromise = reportesService.getReportes({
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        });
      } else {
        // Cargar todos y filtrar por mes en el cliente
        reportesPromise = reportesService.getReportes();
      }

      const [reportesData, dashboardData] = await Promise.all([
        reportesPromise,
        estadisticasService.getDashboard(),
      ]);

      let reportesProcessados = Array.isArray(reportesData)
        ? reportesData
        : reportesData?.results || [];

      // Si filtro de mes actual, filtrar por el mes actual
      if (!filtroActivo && filtroMes === 'actual') {
        const ahora = new Date();
        const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
        reportesProcessados = reportesProcessados.filter(r => r.fecha.startsWith(mesActual));
      }

      setReportes(reportesProcessados);
      setDashboard(dashboardData);
      setPaginaActual(1);
    } catch (error) {
      toast.error('Error al cargar datos');
      // eslint-disable-next-line no-console
      console.error(error);
      setReportes([]);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    if (filtroMes === 'actual') {
      setFiltroActivo(false);
    } else if (fechaInicio || fechaFin) {
      setFiltroActivo(true);
    }
    cargarDatos();
  };

  const limpiarFiltros = () => {
    setFiltroMes('actual');
    setFechaInicio('');
    setFechaFin('');
    setFiltroActivo(false);
    cargarDatos();
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Calcular índices para la paginación
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const reportesPaginados = reportes.slice(indiceInicio, indiceFin);

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

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-group">
          <div className="filtro-item">
            <label htmlFor="filtroMes">Filtrar por:</label>
            <select
              id="filtroMes"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="filtro-select"
            >
              <option value="actual">Mes Actual</option>
              <option value="todos">Todos los reportes</option>
              <option value="personalizado">Rango personalizado</option>
            </select>
          </div>

          {filtroMes === 'personalizado' && (
            <>
              <div className="filtro-item">
                <label htmlFor="fechaInicio">Fecha Inicio:</label>
                <input
                  type="date"
                  id="fechaInicio"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="filtro-input"
                />
              </div>

              <div className="filtro-item">
                <label htmlFor="fechaFin">Fecha Fin:</label>
                <input
                  type="date"
                  id="fechaFin"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="filtro-input"
                />
              </div>
            </>
          )}

          <div className="filtros-acciones">
            <button onClick={aplicarFiltros} className="btn btn-sm btn-primary">
              Aplicar Filtro
            </button>
            {filtroActivo && (
              <button onClick={limpiarFiltros} className="btn btn-sm btn-secondary">
                Limpiar
              </button>
            )}
          </div>
        </div>
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
              ${Math.round(Number(dashboard.promedio_ventas_diarias)).toLocaleString('es-CO')}
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
                reportesPaginados.map(reporte => (
                  <tr key={reporte.id}>
                    <td>{new Date(reporte.fecha + 'T00:00:00').toLocaleDateString('es-CO')}</td>
                    <td>${Number(reporte.base_inicial || 0).toLocaleString('es-CO')}</td>
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

        {reportes.length > 0 && (
          <Pagination
            paginaActual={paginaActual}
            totalItems={reportes.length}
            itemsPorPagina={itemsPorPagina}
            onPaginaChange={setPaginaActual}
          />
        )}
      </div>
    </div>
  );
};

export default Reportes;

