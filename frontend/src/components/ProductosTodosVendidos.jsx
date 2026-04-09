import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../styles/ProductosTodosVendidos.css';

/**
 * Componente de Gráfico de Todos los Productos Vendidos.
 * Muestra barras de todos los productos ordenados por cantidad vendida.
 */
const ProductosTodosVendidos = ({ productos = [], chartOptions = {} }) => {
  // Paleta de colores mejorada
  const paletaColores = [
    '#9b933b', '#2563eb', '#dc2626', '#16a34a', '#f59e0b',
    '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6',
    '#ca8a04', '#7c3aed', '#059669', '#e11d48', '#7c2d12',
  ];

  const dataGrafico = {
    labels: productos.map((p) => p.producto),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: productos.map((p) => p.cantidad_total),
        backgroundColor: productos.map((_, idx) => paletaColores[idx % paletaColores.length]),
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const opciones = {
    ...chartOptions,
    indexAxis: 'y',
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: Math.ceil((Math.max(...productos.map((p) => p.cantidad_total)) || 1) / 5),
        },
      },
    },
  };

  return (
    <div className="productos-todos-vendidos">
      <div className="chart-card full-width">
        <h2>Todos los Productos Vendidos</h2>
        <p className="subtitle">Cantidad total vendida por producto durante el período seleccionado</p>
        <div className="chart-container-horizontal">
          {productos.length > 0 ? (
            <Bar data={dataGrafico} options={opciones} />
          ) : (
            <p className="no-data">No hay datos de productos vendidos</p>
          )}
        </div>
      </div>

      {/* Estadísticas resumidas */}
      {productos.length > 0 && (
        <div className="productos-stats">
          <div className="stat-item">
            <p className="stat-label">Total de Productos</p>
            <p className="stat-value">{productos.length}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Total Unidades Vendidas</p>
            <p className="stat-value">
              {productos.reduce((sum, p) => sum + p.cantidad_total, 0)}
            </p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Promedio por Producto</p>
            <p className="stat-value">
              {(productos.reduce((sum, p) => sum + p.cantidad_total, 0) / productos.length).toFixed(0)}
            </p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Producto Más Vendido</p>
            <p className="stat-value">{productos[0]?.producto}</p>
            <p className="stat-detail">{productos[0]?.cantidad_total} unidades</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosTodosVendidos;
