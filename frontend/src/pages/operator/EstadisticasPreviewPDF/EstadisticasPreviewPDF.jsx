import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import './EstadisticasPreviewPDF.css';

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
 * Página de previsualización de PDF de estadísticas.
 * Organiza la información en tabla y gráficos de página completa con márgenes profesionales.
 */
const EstadisticasPreviewPDF = () => {
  const navigate = useNavigate();
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

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoGraficoVentas, setTipoGraficoVentas] = useState('bar');

  const pdfRef = useRef(null);

  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;

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

      const deduciblesArr = deduciblesRes.data.results || deduciblesRes.data;
      setDeducibles(deduciblesArr);

      setGastosParaDeducir({
        ingreso: deduciblesCalc.ingreso || 0,
        ahorro: deduciblesCalc.ahorro || 0,
        transferencia: deduciblesCalc.transferencia || 0,
      });

      if (Array.isArray(productos)) {
        const todosProd = [...productos].reverse();
        setProductosMenosVendidos(todosProd.slice(0, 5));
      }
    } catch (error) {
      toast.error('Error al cargar estadísticas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

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
      console.error(error);
    }
  };

  const paletaColores = [
    '#9b933b',
    '#2563eb',
    '#dc2626',
    '#16a34a',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#6366f1',
    '#14b8a6',
    '#ca8a04',
    '#7c3aed',
  ];

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

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="preview-pdf-container">
      <div className="preview-toolbar">
        <button onClick={() => navigate('/estadisticas')} className="btn btn-secondary">
          ← Volver
        </button>
        <button onClick={handleExportPDF} className="btn btn-primary">
          ⬇ Descargar PDF
        </button>
        <div className="filtros-mini">
          <input
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            placeholder="Desde"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            placeholder="Hasta"
          />
          <button onClick={cargarEstadisticas} className="btn btn-action">
            Filtrar
          </button>
        </div>
      </div>

      <div className="preview-document" ref={pdfRef}>
        {/* Página 1: Portada y tabla de métricas */}
        <div className="pdf-page">
          <div className="pdf-header">
            <h1>Reporte de Estadísticas</h1>
            <p className="pdf-date">
              Generado el{' '}
              {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {estadisticas && (
            <div className="metrics-table-container">
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Métrica</th>
                    <th>Valor</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="metric-name">Total Ventas</td>
                    <td className="metric-value">{formatearMoneda(estadisticas.total_ventas)}</td>
                    <td>Suma total de todas las ventas</td>
                  </tr>
                  <tr>
                    <td className="metric-name">Promedio Ventas</td>
                    <td className="metric-value">
                      {formatearMoneda(estadisticas.promedio_ventas)}
                    </td>
                    <td>Promedio por reporte ({estadisticas.total_reportes} reportes)</td>
                  </tr>
                  <tr>
                    <td className="metric-name">Total Gastos</td>
                    <td className="metric-value danger">
                      {formatearMoneda(estadisticas.total_gastos)}
                    </td>
                    <td>Suma total de todos los gastos</td>
                  </tr>
                  <tr>
                    <td className="metric-name">Total Entregas</td>
                    <td className="metric-value">{formatearMoneda(estadisticas.total_entregas)}</td>
                    <td>Dinero entregado acumulado</td>
                  </tr>
                  <tr className="highlight-row">
                    <td className="metric-name">Margen de Ganancia</td>
                    <td className="metric-value success">
                      {(
                        ((estadisticas.total_ventas - estadisticas.total_gastos) /
                          estadisticas.total_ventas) *
                          100 || 0
                      ).toFixed(1)}
                      %
                    </td>
                    <td>Beneficio dividido ventas</td>
                  </tr>
                  <tr>
                    <td className="metric-name">Ratio Gastos</td>
                    <td className="metric-value">
                      {((estadisticas.total_gastos / estadisticas.total_ventas) * 100 || 0).toFixed(
                        1
                      )}
                      %
                    </td>
                    <td>Gastos vs Ventas</td>
                  </tr>

                  {deducibles.length > 0 && (
                    <>
                      <tr className="section-divider">
                        <td colSpan="3">
                          <strong>Gastos Deducibles</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className="metric-name">Ingresos Deducibles</td>
                        <td className="metric-value">
                          ${Number(gastosParaDeducir.ingreso).toLocaleString('es-CO')}
                        </td>
                        <td>No restados del total</td>
                      </tr>
                      <tr>
                        <td className="metric-name">Ahorros Deducibles</td>
                        <td className="metric-value">
                          ${Number(gastosParaDeducir.ahorro).toLocaleString('es-CO')}
                        </td>
                        <td>No restados del total</td>
                      </tr>
                      <tr>
                        <td className="metric-name">Transferencias Deducibles</td>
                        <td className="metric-value">
                          ${Number(gastosParaDeducir.transferencia).toLocaleString('es-CO')}
                        </td>
                        <td>No restados del total</td>
                      </tr>
                      <tr className="highlight-row">
                        <td className="metric-name">Gasto Ajustado</td>
                        <td className="metric-value">
                          $
                          {(
                            Number(estadisticas.total_gastos) -
                            (gastosParaDeducir.ingreso +
                              gastosParaDeducir.ahorro +
                              gastosParaDeducir.transferencia)
                          ).toLocaleString('es-CO')}
                        </td>
                        <td>Gastos reales después deducibles</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Página 2: Gráfico Gastos por Categoría */}
        {gastosPorCategoria.length > 0 && (
          <div className="pdf-page">
            <div className="chart-page-header">
              <h2>Gastos por Categoría</h2>
              <p>Distribución de gastos acumulados por categoría</p>
            </div>
            <div className="chart-full-page">
              <Pie data={gastosData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Página 3: Gráfico Todos los Productos */}
        {todosProductosVendidos.length > 0 && (
          <div className="pdf-page">
            <div className="chart-page-header">
              <h2>Todos los Productos Vendidos</h2>
              <p>Ranking completo ordenado por cantidad vendida</p>
            </div>
            <div className="chart-full-page horizontal">
              <ProductosTodosVendidos
                productos={todosProductosVendidos}
                chartOptions={chartOptions}
              />
            </div>
          </div>
        )}

        {/* Página 4: Rankings de Productos */}
        <div className="pdf-page full-ranking">
          <div className="chart-page-header">
            <h2>Rankings de Productos</h2>
            <p>Top 5 más vendidos y menos vendidos</p>
          </div>
          <div className="ranking-page-content">
            <RankingProductos
              productosTop={productosMasVendidos}
              productosBajo={productosMenosVendidos}
            />
          </div>
        </div>

        {/* Página 5: Evolución de Ventas */}
        {ventasPorMes.length > 0 && (
          <div className="pdf-page">
            <div className="chart-page-header">
              <h2>Evolución de Ventas (Acumulado Mensual)</h2>
              <p>Análisis temporal de ventas por mes</p>
            </div>
            <div className="chart-controls-page">
              <button
                className={tipoGraficoVentas === 'bar' ? 'active' : ''}
                onClick={() => setTipoGraficoVentas('bar')}
              >
                Barras
              </button>
              <button
                className={tipoGraficoVentas === 'line' ? 'active' : ''}
                onClick={() => setTipoGraficoVentas('line')}
              >
                Líneas
              </button>
              <button
                className={tipoGraficoVentas === 'area' ? 'active' : ''}
                onClick={() => setTipoGraficoVentas('area')}
              >
                Área
              </button>
            </div>
            <div className="chart-full-page">
              {tipoGraficoVentas === 'bar' ? (
                <Bar data={ventasData} options={chartOptions} />
              ) : (
                <Line data={ventasData} options={chartOptions} />
              )}
            </div>
          </div>
        )}

        {/* Página 6: % Mejora Entre Meses */}
        {ventasPorMes.length > 0 && (
          <div className="pdf-page">
            <div className="chart-page-header">
              <h2>% Mejora Entre Meses</h2>
              <p>Comparativa de cambios porcentuales mes a mes</p>
            </div>
            <div className="chart-full-page">
              <RankingMeses ventasPorMes={ventasPorMes} chartOptions={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadisticasPreviewPDF;
