import React, { useState, useEffect, useCallback, useRef } from 'react';
import { estadisticasService } from '../../../services/estadisticasService';
import api from '../../../services/api';
import RankingProductos from '../../../components/RankingProductos';
import RankingMeses from '../../../components/RankingMeses';
import ProductosTodosVendidos from '../../../components/ProductosTodosVendidos';
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
import { formatearMoneda } from '../../../utils/reportes';
import { exportarEstadisticasPDF } from '../../../utils/pdf';
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
  const [productosMenosVendidos, setProductosMenosVendidos] = useState([]);
  const [todosProductosVendidos, setTodosProductosVendidos] = useState([]);
  const [ventasPorMes, setVentasPorMes] = useState([]);
  const [deducibles, setDeducibles] = useState([]);
  const [gastosParaDeducir, setGastosParaDeducir] = useState({
    ingreso: 0,
    ahorro: 0,
    transferencia: 0,
  });
  const [periodoVentas, setPeriodoVentas] = useState('mensual');
  const [tipoGraficoVentas, setTipoGraficoVentas] = useState('bar'); // bar, line, area

  // Filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());

  const pdfRef = useRef(null);

  const cargarEstadisticas = useCallback(async (inicio = null, fin = null) => {
    try {
      setLoading(true);

      // Solo usar fechas si se especifican explícitamente
      let params = {};
      if (inicio) params.fecha_inicio = inicio;
      if (fin) params.fecha_fin = fin;
      // Si no hay fechas, se envía {} y trae TODO el período

      const [stats, gastos, productos, productosTotal, ventas, deduciblesRes, deduciblesCalc] =
        await Promise.all([
          estadisticasService.getEstadisticasVentas(params),
          estadisticasService.getGastosPorCategoria(params),
          estadisticasService.getProductosMasVendidos(params),
          estadisticasService.getTodosProductosVendidos(params),
          estadisticasService.getVentasMensuales(),
          api.get('/gastos/deducibles/'),
          estadisticasService.getDeducibles(params),
        ]);

      setEstadisticas(stats);
      setGastosPorCategoria(gastos);
      setProductosMasVendidos(productos);
      setTodosProductosVendidos(productosTotal);
      setVentasPorMes(ventas);

      // Procesar deducibles (configuración)
      const deduciblesArr = deduciblesRes.data.results || deduciblesRes.data;
      setDeducibles(deduciblesArr);

      // Usar los deducibles calculados del backend
      setGastosParaDeducir({
        ingreso: deduciblesCalc.ingreso || 0,
        ahorro: deduciblesCalc.ahorro || 0,
        transferencia: deduciblesCalc.transferencia || 0,
      });

      // Calcular productos menos vendidos (inverso de más vendidos)
      if (Array.isArray(productos)) {
        const todosProd = [...productos].reverse();
        setProductosMenosVendidos(todosProd.slice(0, 5));
      }
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial - TODO el período sin filtros
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const handleFiltrar = e => {
    e.preventDefault();
    // Solo llamar cuando se presiona el botón, con las fechas especificadas
    cargarEstadisticas(fechaInicio || null, fechaFin || null);
    toast.success('Filtro aplicado correctamente');
  };

  const handleLimpiar = () => {
    setFechaInicio('');
    setFechaFin('');
    setAnoFiltro(new Date().getFullYear());
    // Volver a cargar sin filtros (TODO el período)
    cargarEstadisticas();
    toast.success('Filtros limpiados');
  };

  const handleExportPDF = async () => {
    if (!pdfRef.current) {
      toast.error('Error: no se puede exportar en este momento');
      return;
    }

    try {
      await exportarEstadisticasPDF(pdfRef.current);
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      toast.error(error.message || 'Error al descargar el PDF');
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  // Paleta de colores mejorada (12 colores variados)
  const paletaColores = [
    '#9b933b', // Oliva
    '#2563eb', // Azul
    '#dc2626', // Rojo
    '#16a34a', // Verde
    '#f59e0b', // Naranja
    '#8b5cf6', // Púrpura
    '#06b6d4', // Cian
    '#ec4899', // Rosa
    '#6366f1', // Índigo
    '#14b8a6', // Turquesa
    '#ca8a04', // Amber
    '#7c3aed', // Violeta
  ];

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
        backgroundColor: gastosPorCategoria.map(
          (_, idx) => paletaColores[idx % paletaColores.length]
        ),
      },
    ],
  };

  const productosData = {
    labels: productosMasVendidos.map(p => p.producto),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: productosMasVendidos.map(p => p.cantidad_total),
        backgroundColor: productosMasVendidos.map(
          (_, idx) => paletaColores[idx % paletaColores.length]
        ),
      },
    ],
  };

  const productosMenosData = {
    labels: productosMenosVendidos.map(p => p.producto),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: productosMenosVendidos.map(p => p.cantidad_total),
        backgroundColor: productosMenosVendidos.map(
          (_, idx) => paletaColores[(idx + 6) % paletaColores.length]
        ),
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
        backgroundColor:
          tipoGraficoVentas === 'area' ? 'rgba(155, 147, 59, 0.15)' : 'rgba(155, 147, 59, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: tipoGraficoVentas === 'area' || tipoGraficoVentas === 'line',
        pointBackgroundColor: '#9B933B',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  // Calcular incremento/decremento mes a mes
  const calcularCambios = datos => {
    if (!datos || datos.length < 2) return [];

    return datos.slice(1).map((actual, idx) => {
      const anterior = datos[idx];
      const cambio = ((actual - anterior) / anterior) * 100;
      return {
        mes: `${datos[idx + 1]?.mes || actual}/${datos[idx + 1]?.anio || actual}`,
        cambio: cambio,
      };
    });
  };

  const cambiosVentas = calcularCambios(ventasPorMes.map(v => v.total_ventas));
  const cambiosGastos =
    ventasPorMes.length > 0 ? calcularCambios(ventasPorMes.map(v => v.total_ventas)) : [];

  const cambiosVentasData = {
    labels: cambiosVentas.map((_, idx) => {
      if (idx + 1 < ventasPorMes.length) {
        return `${ventasPorMes[idx].mes}/${ventasPorMes[idx].anio}`;
      }
      return '';
    }),
    datasets: [
      {
        label: 'Cambio %',
        data: cambiosVentas.map(c => c.cambio),
        backgroundColor: cambiosVentas.map(c => (c.cambio >= 0 ? '#10B981' : '#EF4444')),
      },
    ],
  };

  const cambiosGastosData = {
    labels:
      gastosPorCategoria.length > 0
        ? gastosPorCategoria
            .slice(0, gastosPorCategoria.length - 1)
            .map((g, idx) => `${g.categoria || 'Sin cat'} vs siguiente`)
        : [],
    datasets: [
      {
        label: 'Cambio %',
        data:
          gastosPorCategoria.length > 0
            ? gastosPorCategoria.slice(0, -1).map((g, idx) => {
                const siguiente = gastosPorCategoria[idx + 1]?.total || 0;
                return ((siguiente - g.total) / g.total) * 100;
              })
            : [],
        backgroundColor:
          gastosPorCategoria.length > 0
            ? gastosPorCategoria.slice(0, -1).map((g, idx) => {
                const siguiente = gastosPorCategoria[idx + 1]?.total || 0;
                const cambio = ((siguiente - g.total) / g.total) * 100;
                return cambio >= 0 ? '#10B981' : '#EF4444';
              })
            : [],
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
            <button type="button" onClick={handleExportPDF} className="btn-action" data-export-btn>
              PDF
            </button>
          </div>
        </form>
      </div>

      {/* Tarjetas de resumen */}
      {estadisticas && (
        <div ref={pdfRef}>
          {/* Sección inicial con margen */}
          <div className="pdf-header-section">
            <h1 className="pdf-title">Reporte de Estadísticas</h1>
            <p className="pdf-date">Generado el {new Date().toLocaleDateString('es-CO')}</p>
          </div>

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

          {/* Tarjetas de Deducibles */}
          {deducibles.length > 0 && (
            <div className="stats-cards">
              <div className="stat-card">
                <h3>Ingresos Deducibles</h3>
                <p className="stat-value">
                  ${Number(gastosParaDeducir.ingreso).toLocaleString('es-CO')}
                </p>
                <small>No restados</small>
              </div>
              <div className="stat-card">
                <h3>Ahorros Deducibles</h3>
                <p className="stat-value">
                  ${Number(gastosParaDeducir.ahorro).toLocaleString('es-CO')}
                </p>
                <small>No restados</small>
              </div>
              <div className="stat-card">
                <h3>Transferencias Deducibles</h3>
                <p className="stat-value">
                  ${Number(gastosParaDeducir.transferencia).toLocaleString('es-CO')}
                </p>
                <small>No restados</small>
              </div>
              <div className="stat-card">
                <h3>Gasto Ajustado</h3>
                <p className="stat-value">
                  $
                  {(
                    Number(estadisticas.total_gastos) -
                    (gastosParaDeducir.ingreso +
                      gastosParaDeducir.ahorro +
                      gastosParaDeducir.transferencia)
                  ).toLocaleString('es-CO')}
                </p>
                <small>Gastos reales</small>
              </div>
              <div className="stat-card">
                <h3>Margen de Ganancia</h3>
                <p className="stat-value success">
                  {(
                    ((estadisticas.total_ventas -
                      (Number(estadisticas.total_gastos) -
                        (gastosParaDeducir.ingreso +
                          gastosParaDeducir.ahorro +
                          gastosParaDeducir.transferencia))) /
                      estadisticas.total_ventas) *
                      100 || 0
                  ).toFixed(1)}
                  %
                </p>
                <small>Beneficio/Ventas</small>
              </div>

              <div className="stat-card">
                <h3>Ratio Gastos</h3>
                <p className="stat-value">
                  {(
                    ((Number(estadisticas.total_gastos) -
                      (gastosParaDeducir.ingreso +
                        gastosParaDeducir.ahorro +
                        gastosParaDeducir.transferencia)) /
                      estadisticas.total_ventas) *
                      100 || 0
                  ).toFixed(1)}
                  %
                </p>
                <small>Gastos vs Ventas</small>
              </div>
            </div>
          )}

          {/* Gráficos con descripciones */}
          <div className="charts-grid">
            {/* Fila 1: Gastos por Categoría + Todos los Productos Vendidos */}
            <div className="chart-card">
              <div className="pdf-section-header">
                <h2>Gastos por Categoría</h2>
                <p className="pdf-description">
                  Distribución de gastos acumulados por categoría. Identifica qué áreas generan
                  mayor gasto.
                </p>
              </div>
              <div className="chart-container">
                {gastosPorCategoria.length > 0 ? (
                  <Pie data={gastosData} options={chartOptions} />
                ) : (
                  <p className="no-data">No hay datos de gastos</p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="pdf-section-header">
                <h2>Todos los Productos Vendidos</h2>
                <p className="pdf-description">
                  Ranking completo de productos ordenados por cantidad vendida en el período.
                </p>
              </div>
              <div className="chart-container-horizontal">
                <ProductosTodosVendidos
                  productos={todosProductosVendidos}
                  chartOptions={chartOptions}
                />
              </div>
            </div>

            {/* Fila 2: Rankings de Productos */}
            <RankingProductos
              productosTop={productosMasVendidos}
              productosBajo={productosMenosVendidos}
            />

            {/* Fila 3: Evolución de Ventas */}
            <div className="chart-card full-width">
              <div className="pdf-section-header">
                <h2>Evolución de Ventas (Acumulado Mensual)</h2>
                <p className="pdf-description">
                  Análisis temporal de ventas por mes. Visualiza tendencias y variaciones en el
                  rendimiento a lo largo del período.
                </p>
              </div>
              <div className="chart-header">
                <div className="chart-controls">
                  <button
                    className={`btn-chart-type ${tipoGraficoVentas === 'bar' ? 'active' : ''}`}
                    onClick={() => setTipoGraficoVentas('bar')}
                  >
                    Barras
                  </button>
                  <button
                    className={`btn-chart-type ${tipoGraficoVentas === 'line' ? 'active' : ''}`}
                    onClick={() => setTipoGraficoVentas('line')}
                  >
                    Líneas
                  </button>
                  <button
                    className={`btn-chart-type ${tipoGraficoVentas === 'area' ? 'active' : ''}`}
                    onClick={() => setTipoGraficoVentas('area')}
                  >
                    Área
                  </button>
                </div>
              </div>
              <div className="chart-container">
                {ventasPorMes.length > 0 ? (
                  tipoGraficoVentas === 'bar' ? (
                    <Bar data={ventasData} options={chartOptions} />
                  ) : (
                    <Line data={ventasData} options={chartOptions} />
                  )
                ) : (
                  <p className="no-data">No hay datos de ventas mensuales</p>
                )}
              </div>
            </div>

            {/* Fila 4: % Mejora Entre Meses */}
            <div className="chart-card full-width">
              <div className="pdf-section-header">
                <h2>% Mejora Entre Meses</h2>
                <p className="pdf-description">
                  Comparativa de cambios porcentuales mes a mes en ventas y gastos. Positivo =
                  mejora, Negativo = declive.
                </p>
              </div>
              <div className="chart-container">
                <RankingMeses ventasPorMes={ventasPorMes} chartOptions={chartOptions} />
              </div>
            </div>
          </div>

          {/* Margen final */}
          <div className="pdf-footer-section"></div>
        </div>
      )}
    </div>
  );
};

export default Estadisticas;
