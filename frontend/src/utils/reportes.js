/**
 * Utilidades para cálculos de reportes.
 */

/**
 * Calcula la base inicial desde el reporte anterior.
 * @param {Object|null} reporteAnterior - Reporte anterior o null
 * @returns {number} Base inicial
 */
export const calcularBaseInicial = reporteAnterior => {
  return reporteAnterior?.base_siguiente || 0;
};

/**
 * Calcula la base siguiente usando la fórmula:
 * base_siguiente = base_inicial + venta - gastos - entrega
 * @param {number} baseInicial
 * @param {number} venta
 * @param {number} gastos
 * @param {number} entrega
 * @returns {number} Base siguiente
 */
export const calcularBaseSiguiente = (baseInicial, venta, gastos, entrega) => {
  return baseInicial + venta - gastos - entrega;
};

/**
 * Formatea un valor monetario en pesos colombianos.
 * @param {number} valor - Valor a formatear
 * @returns {string} Valor formateado
 */
export const formatearMoneda = valor => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor);
};
