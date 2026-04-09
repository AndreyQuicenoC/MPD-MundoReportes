import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../styles/ProductosTodosVendidos.css';

/**
 * Componente de Gráfico de Todos los Productos Vendidos.
 * Muestra barras horizontales de todos los productos ordenados por cantidad vendida.
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
      {productos.length > 0 ? (
        <Bar data={dataGrafico} options={opciones} />
      ) : (
        <p className="no-data">No hay datos de productos vendidos</p>
      )}
    </div>
  );
};

export default ProductosTodosVendidos;
