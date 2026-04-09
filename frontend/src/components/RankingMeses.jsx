import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../styles/RankingMeses.css';

/**
 * Componente de Rankings Comparativos Entre Meses.
 * Muestra el cambio porcentual mes a mes para ventas y gastos.
 */
const RankingMeses = ({
  ventasPorMes = [],
  chartOptions = {}
}) => {
  // Calcular cambios porcentuales mes a mes
  const calcularCambiosMeses = (datos) => {
    if (!datos || datos.length < 2) return [];

    const cambios = [];
    for (let i = 1; i < datos.length; i++) {
      const anterior = datos[i - 1];
      const actual = datos[i];
      const cambioVentas = ((actual.total_ventas - anterior.total_ventas) / anterior.total_ventas) * 100;
      const cambioGastos = ((actual.total_gastos - anterior.total_gastos) / anterior.total_gastos) * 100;

      cambios.push({
        periodo: `${anterior.mes}/${anterior.anio} → ${actual.mes}/${actual.anio}`,
        cambioVentas,
        cambioGastos,
      });
    }
    return cambios;
  };

  const cambios = calcularCambiosMeses(ventasPorMes);

  // Preparar datos para el gráfico
  const dataGrafico = {
    labels: cambios.map((c) => c.periodo),
    datasets: [
      {
        label: 'Cambio Ventas %',
        data: cambios.map((c) => c.cambioVentas),
        backgroundColor: cambios.map((c) => (c.cambioVentas >= 0 ? '#10B981' : '#EF4444')),
      },
      {
        label: 'Cambio Gastos %',
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
        <p className="no-data">Insuficientes datos para comparar</p>
      )}
    </div>
  );
};

export default RankingMeses;
