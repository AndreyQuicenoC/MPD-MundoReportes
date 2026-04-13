import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../styles/ProductosTodosVendidos.css';

/**
 * Componente de Gráfico de Todos los Productos Vendidos.
 * Muestra barras horizontales de todos los productos ordenados por cantidad vendida.
 * Diseño preciso basado en imagen de referencia.
 */
const ProductosTodosVendidos = ({ productos = [], chartOptions = {} }) => {
  // Paleta de colores en degradado oliva/amarillo (similar a la imagen)
  const paletaColores = [
    '#9B933B', // Oliva oscuro (principal)
    '#A9A347', // Oliva
    '#B7B353', // Oliva claro
    '#C5C35F', // Amarillo oliva
    '#D3D36B', // Amarillo oliva claro
    '#BFBA4F', // Oliva medio
    '#A89E43', // Oliva oscuro
    '#918237', // Marrón oliva
    '#7A662B', // Marrón oscuro
    '#C4BF59', // Amarillo
    '#D4CE6D', // Amarillo claro
    '#AA9F39', // Oliva
  ];

  const dataGrafico = {
    labels: productos.map((p) => p.producto),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: productos.map((p) => p.cantidad_total),
        backgroundColor: productos.map((_, idx) => paletaColores[idx % paletaColores.length]),
        borderRadius: 3,
        borderSkipped: false,
      },
    ],
  };

  const opciones = {
    indexAxis: 'x', // Barras verticales (eje X: productos, eje Y: cantidad)
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 12,
          },
          color: '#666',
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: Math.ceil((Math.max(...productos.map((p) => p.cantidad_total)) || 1) / 5),
        },
        grid: {
          drawBorder: true,
        },
      },
      x: {
        grid: {
          display: false,
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
