import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../styles/RankingMeses.css';

/**
 * Component for Comparative Rankings Between Months.
 * Displays the percentage change month by month for sales and expenses.
 */
const RankingMeses = ({
  ventasPorMes = [],
  chartOptions = {}
}) => {
  // Calculate percentage changes month by month
  const calcularCambiosMeses = (datos) => {
    if (!datos || datos.length < 2) return [];

    const cambios = [];
    for (let i = 1; i < datos.length; i++) {
      const anterior = datos[i - 1];
      const actual = datos[i];

      // Guard against division by zero
      const cambioVentas = anterior.total_ventas !== 0
        ? ((actual.total_ventas - anterior.total_ventas) / anterior.total_ventas) * 100
        : 0;
      const cambioGastos = anterior.total_gastos !== 0
        ? ((actual.total_gastos - anterior.total_gastos) / anterior.total_gastos) * 100
        : 0;

      cambios.push({
        periodo: `${anterior.mes}/${anterior.anio} → ${actual.mes}/${actual.anio}`,
        cambioVentas,
        cambioGastos,
      });
    }
    return cambios;
  };

  const cambios = calcularCambiosMeses(ventasPorMes);

  // Prepare chart data
  const dataGrafico = {
    labels: cambios.map((c) => c.periodo),
    datasets: [
      {
        label: 'Sales Change %',
        data: cambios.map((c) => c.cambioVentas),
        backgroundColor: cambios.map((c) => (c.cambioVentas >= 0 ? '#10B981' : '#EF4444')),
      },
      {
        label: 'Expenses Change %',
        data: cambios.map((c) => c.cambioGastos),
        backgroundColor: cambios.map((c) => (c.cambioGastos >= 0 ? '#3B82F6' : '#F97316')),
      },
    ],
  };

  const opciones = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value + '%',
        },
      },
    },
  };

  return (
    <div className="ranking-meses-container">
      {cambios.length > 0 ? (
        <Bar data={dataGrafico} options={opciones} />
      ) : (
        <p className="no-data">Insufficient data to compare</p>
      )}
    </div>
  );
};

export default RankingMeses;
