import React, { useState, useEffect, useCallback, useRef } from 'react';
import { estadisticasService } from '../services/estadisticasService';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { formatearMoneda } from '../utils/reportes';
import { exportarEstadisticasPDF } from '../utils/pdf';
import './Estadisticas.css';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

/**
 * Página de estadísticas y análisis de datos.
 * Muestra gráficos de ventas, gastos y productos.
 */
const Estadisticas = () => {
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [ventasPorMes, setVentasPorMes] = useState([]);
  const [periodoVentas, setPeriodoVentas] = useState('mensual'); // mensual, semanal, diario

  // Filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const pdfRef = useRef(null);

  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;

      const [stats, gastos, productos, ventas] = await Promise.all([
        estadisticasService.getEstadisticasVentas(params),
        estadisticasService.getGastosPorCategoria(params),
        estadisticasService.getProductosMasVendidos(params),
        estadisticasService.getVentasMensuales(),
      ]);

      setEstadisticas(stats);
      setGastosPorCategoria(gastos);
      setProductosMasVendidos(productos);
      setVentasPorMes(ventas);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const handleFiltrar = e => {
    e.preventDefault();
    cargarEstadisticas();
  };

  const handleLimpiar = () => {
    setFechaInicio('');
    setFechaFin('');
    cargarEstadisticas();
  };

  const handleExportPDF = async () => {
    if (!pdfRef.current) {
      toast.error('Error: no se puede exportar en este momento');
      return;
    }

    try {
      await exportarEstadisticasPDF(estadisticas, pdfRef.current);
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      toast.error(error.message || 'Error al descargar el PDF');
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  // Configuración de gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const gastosData = {
    labels: gastosPorCategoria.map(g => g.categoria || 'Sin Categoría'),
    datasets: [
      {
        label: 'Total Gastos',
        data: gastosPorCategoria.map(g => g.total),
        backgroundColor: [
          'var(--chart-color-1)', // Oliva
          'var(--chart-color-2)', // Azul
          'var(--chart-color-3)', // Rojo
          'var(--chart-color-4)', // Verde
          'var(--chart-color-5)', // Naranja
          'var(--chart-color-6)', // Púrpura
          'var(--chart-color-7)', // Cian
          'var(--chart-color-8)', // Rosa
        ].map(color => {
          // Convertir las variables CSS a colores reales
          const colorMap = {
            'var(--chart-color-1)': '#9b933b',
            'var(--chart-color-2)': '#2563eb',
            'var(--chart-color-3)': '#dc2626',
            'var(--chart-color-4)': '#16a34a',
            'var(--chart-color-5)': '#f59e0b',
            'var(--chart-color-6)': '#8b5cf6',
            'var(--chart-color-7)': '#06b6d4',
            'var(--chart-color-8)': '#ec4899',
          };
          return colorMap[color];
        }),
      },
    ],
  };

  const productosData = {
    labels: productosMasVendidos.map(p => p.producto),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: productosMasVendidos.map(p => p.cantidad_total),
        backgroundColor: [
          '#9b933b',
          '#2563eb',
          '#dc2626',
          '#16a34a',
          '#f59e0b',
          '#8b5cf6',
          '#06b6d4',
          '#ec4899',
        ],
      },
    ],
  };

  const ventasData = {
    labels: ventasPorMes.map(v => `${v.mes}/${v.anio}`),
    datasets: [
      {
        label: 'Ventas Totales',
        data: ventasPorMes.map(v => v.total_ventas),
        borderColor: '#9B933B',
        backgroundColor: 'rgba(155, 147, 59, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#9B933B',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="estadisticas-container">
      <h1>Estadísticas y Análisis</h1>

      {/* Filtros */}
      <div className="filtros-section">
        <form onSubmit={handleFiltrar} className="filtros-form">
          <div className="form-group">
            <label htmlFor="fechaInicio">Fecha Inicio</label>
            <input
              type="date"
              id="fechaInicio"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fechaFin">Fecha Fin</label>
            <input
              type="date"
              id="fechaFin"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
            />
          </div>

          <div className="filtros-actions">
            <button type="submit" className="btn-primary">
              Filtrar
            </button>
            <button type="button" onClick={handleLimpiar} className="btn-secondary">
              Limpiar
            </button>
            <button type="button" onClick={handleExportPDF} className="btn-action">
              PDF
            </button>
          </div>
        </form>
      </div>

      {/* Tarjetas de resumen */}
      {estadisticas && (
        <div ref={pdfRef}>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Ventas</h3>
              <p className="stat-value">{formatearMoneda(estadisticas.total_ventas)}</p>
              <small>{estadisticas.total_reportes} reportes</small>
            </div>

            <div className="stat-card">
              <h3>Promedio Ventas</h3>
              <p className="stat-value">{formatearMoneda(estadisticas.promedio_ventas)}</p>
              <small>Por reporte</small>
            </div>

            <div className="stat-card">
              <h3>Total Gastos</h3>
              <p className="stat-value danger">{formatearMoneda(estadisticas.total_gastos)}</p>
              <small>Acumulado</small>
            </div>

            <div className="stat-card">
              <h3>Total Entregas</h3>
              <p className="stat-value">{formatearMoneda(estadisticas.total_entregas)}</p>
              <small>Acumulado</small>
            </div>
          </div>

          {/* Gráficos */}
          <div className="charts-grid">
            <div className="chart-card">
              <h2>Gastos por Categoría</h2>
              <div className="chart-container">
                {gastosPorCategoria.length > 0 ? (
                  <Pie data={gastosData} options={chartOptions} />
                ) : (
                  <p className="no-data">No hay datos de gastos</p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h2>Productos Más Vendidos</h2>
              <div className="chart-container">
                {productosMasVendidos.length > 0 ? (
                  <Bar data={productosData} options={chartOptions} />
                ) : (
                  <p className="no-data">No hay datos de ventas de productos</p>
                )}
              </div>
            </div>

            <div className="chart-card full-width">
              <h2>Evolución de Ventas (Acumulado Mensual)</h2>
              <div className="chart-container">
                {ventasPorMes.length > 0 ? (
                  <Bar data={ventasData} options={chartOptions} />
                ) : (
                  <p className="no-data">No hay datos de ventas mensuales</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estadisticas;
