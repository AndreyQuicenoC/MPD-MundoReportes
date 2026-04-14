import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportesService } from '../../../services/reportesService';
import estadisticasService from '../../../services/estadisticasService';
import api from '../../../services/api';
import Pagination from '../../../components/Pagination';
import ModalVistaPreviaReporte from '../../../components/ModalVistaPreviaReporte';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import toast from 'react-hot-toast';
import './Reportes.css';

/**
 * Main Reports page.
 * Displays dashboard with metrics and reports table with CRUD and pagination.
 */
const Reportes = () => {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [deducibles, setDeducibles] = useState([]);
  const [gastosParaDeducir, setGastosParaDeducir] = useState({
    ingreso: 0,
    ahorro: 0,
    transferencia: 0,
  });
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const itemsPorPagina = 10;

  // Filter states
  const [filtroMes, setFiltroMes] = useState('todos'); // 'actual' or 'todos' - DEFAULT: todos
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroActivo, setFiltroActivo] = useState(false);

  const cargarDatos = async (
    filtroMesParam = null,
    filtroActivoParam = null,
    fechaInicioParam = null,
    fechaFinParam = null
  ) => {
    try {
      setLoading(true);

      // Use parameters if provided, otherwise use state
      const mes = filtroMesParam !== null ? filtroMesParam : filtroMes;
      const activo = filtroActivoParam !== null ? filtroActivoParam : filtroActivo;
      const inicio = fechaInicioParam !== null ? fechaInicioParam : fechaInicio;
      const fin = fechaFinParam !== null ? fechaFinParam : fechaFin;

      let reportesPromise;

      // If there is custom date filter
      if (activo && (inicio || fin)) {
        reportesPromise = reportesService.getReportes({
          fecha_inicio: inicio,
          fecha_fin: fin,
        });
      } else {
        // Load all without backend filter
        reportesPromise = reportesService.getReportes();
      }

      // DEDUCTIBLES ALWAYS FROM CURRENT MONTH (for the cards)
      const ahora = new Date();
      const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
      const deduciblesParams = {
        fecha_inicio: primerDia.toISOString().split('T')[0],
        fecha_fin: ultimoDia.toISOString().split('T')[0],
      };

      const [reportesData, dashboardData, deduciblesCalc] = await Promise.all([
        reportesPromise,
        estadisticasService.getDashboard(),
        estadisticasService.getDeducibles(deduciblesParams),
      ]);

      let reportesProcessados = Array.isArray(reportesData)
        ? reportesData
        : reportesData?.results || [];

      // Filter by selected month - ONLY if mes is 'actual' AND no custom active filter
      if (mes === 'actual' && !activo) {
        const ahora = new Date();
        const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
        reportesProcessados = reportesProcessados.filter(r => r.fecha.startsWith(mesActual));
      }

      setReportes(reportesProcessados);
      setDashboard(dashboardData);
      setGastosParaDeducir({
        ingreso: deduciblesCalc.ingreso || 0,
        ahorro: deduciblesCalc.ahorro || 0,
        transferencia: deduciblesCalc.transferencia || 0,
      });
      setPaginaActual(1);
    } catch (error) {
      toast.error('Error al cargar datos');
      setReportes([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const aplicarFiltros = () => {
    let nuevoFiltroActivo = false;

    if (filtroMes === 'actual') {
      nuevoFiltroActivo = false;
    } else if (filtroMes === 'personalizado' && (fechaInicio || fechaFin)) {
      nuevoFiltroActivo = true;
    } else if (filtroMes === 'todos') {
      nuevoFiltroActivo = false;
    }

    cargarDatos(filtroMes, nuevoFiltroActivo, fechaInicio, fechaFin);
    toast.success('Filtro aplicado correctamente');
  };

  const limpiarFiltros = () => {
    setFiltroMes('todos');
    setFechaInicio('');
    setFechaFin('');
    setFiltroActivo(false);
    cargarDatos('todos', false, '', '');
    toast.success('Filtros limpiados');
  };

  useEffect(() => {
    cargarDatos('todos', false, '', '');
  }, []);

  // Calculate pagination indices
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const reportesPaginados = reportes.slice(indiceInicio, indiceFin);

  const handleEliminar = id => {
    setIdAEliminar(id);
    setMostrarConfirmacion(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await reportesService.deleteReporte(idAEliminar);
      toast.success('Reporte eliminado');
      setMostrarConfirmacion(false);
      setIdAEliminar(null);
      // Recargar con los filtros actuales
      cargarDatos(filtroMes, filtroActivo, fechaInicio, fechaFin);
    } catch (error) {
      toast.error('Error al eliminar reporte');
      setMostrarConfirmacion(false);
    }
  };

  const handleEditar = id => {
    navigate(`/reportes/${id}/editar`);
  };

  const handleVerDetalle = id => {
    navigate(`/reportes/${id}`);
  };

  const handleVistaPreviaReporte = reporte => {
    setReporteSeleccionado(reporte);
    setMostrarModal(true);
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
      {/* Header with new report button */}
      <div className="reportes-header">
        <div>
          <h1>Reportes Diarios</h1>
          {dashboard && (
            <p className="reportes-subtitle">Resumen del Mes: {dashboard.mes_actual}</p>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/reportes/nuevo')}>
          + Nuevo Reporte
        </button>
      </div>

      {/* Filters */}
      <div className="filtros-section">
        <div className="filtros-group">
          <div className="filtro-item">
            <label htmlFor="filtroMes">Filtrar por:</label>
            <select
              id="filtroMes"
              value={filtroMes}
              onChange={e => setFiltroMes(e.target.value)}
              className="filtro-select"
            >
              <option value="actual">Mes Actual</option>
              <option value="todos">Todos los Reportes</option>
              <option value="personalizado">Rango Personalizado</option>
            </select>
          </div>

          {filtroMes === 'personalizado' && (
            <>
              <div className="filtro-item">
                <label htmlFor="fechaInicio">Fecha de Inicio:</label>
                <input
                  type="date"
                  id="fechaInicio"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="filtro-input"
                />
              </div>

              <div className="filtro-item">
                <label htmlFor="fechaFin">Fecha Final:</label>
                <input
                  type="date"
                  id="fechaFin"
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
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

      {/* Dashboard - Main Metrics */}
      {dashboard && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Ventas Mensuales</h3>
              <p className="dashboard-value">
                ${Number(dashboard.total_ventas_mes).toLocaleString('es-CO')}
              </p>
            </div>

            <div className="dashboard-card">
              <h3>Gastos Mensuales</h3>
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

          {/* Deductibles Summary */}
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Ingresos (No Gastos)</h3>
              <p className="dashboard-value">
                ${Number(gastosParaDeducir.ingreso).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="dashboard-card">
              <h3>Ahorros (No Gastos)</h3>
              <p className="dashboard-value">
                ${Number(gastosParaDeducir.ahorro).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="dashboard-card">
              <h3>Transferencias (No Gastos)</h3>
              <p className="dashboard-value">
                ${Number(gastosParaDeducir.transferencia).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="dashboard-card">
              <h3>Gastos Ajustados</h3>
              <p className="dashboard-value">
                $
                {(
                  Number(dashboard.total_gastos_mes) -
                  (gastosParaDeducir.ingreso +
                    gastosParaDeducir.ahorro +
                    gastosParaDeducir.transferencia)
                ).toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Reports Table */}
      <div className="reportes-tabla-section">
        <h2>Historial de Reportes</h2>
        <div className="productos-tabla-container">
          <table className="productos-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Saldo Inicial</th>
                <th>Ventas Totales</th>
                <th>Gastos</th>
                <th>Siguiente Saldo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    Sin reportes registrados
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
                        onClick={() => handleVistaPreviaReporte(reporte)}
                        title="Ver vista previa del reporte"
                        aria-label="Ver vista previa"
                      >
                        <svg className="icon-eye" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEditar(reporte.id)}
                        title="Editar este reporte"
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleEliminar(reporte.id)}
                        title="Eliminar este reporte"
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

      <ModalVistaPreviaReporte
        reporte={reporteSeleccionado}
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
      />

      <ModalConfirmacion
        isOpen={mostrarConfirmacion}
        titulo="Eliminar Reporte"
        mensaje="¿Está seguro de que desea eliminar este reporte? Esta acción no se puede deshacer."
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleConfirmarEliminar}
        onCancel={() => {
          setMostrarConfirmacion(false);
          setIdAEliminar(null);
        }}
      />
    </div>
  );
};

export default Reportes;
