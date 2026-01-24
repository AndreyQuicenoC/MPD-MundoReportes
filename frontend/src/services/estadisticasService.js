/**
 * Servicio de estadísticas.
 *
 * Maneja consultas de métricas y análisis de datos.
 */

import apiClient from './api';

const estadisticasService = {
  /**
   * Obtener dashboard con KPIs del mes actual.
   *
   * @returns {Promise} Datos del dashboard
   */
  getDashboard: async () => {
    const response = await apiClient.get('/estadisticas/dashboard/');
    return response.data;
  },

  /**
   * Obtener estadísticas de ventas.
   *
   * @param {Object} params - Parámetros (fecha_inicio, fecha_fin)
   * @returns {Promise} Estadísticas de ventas
   */
  getEstadisticasVentas: async (params = {}) => {
    const response = await apiClient.get('/estadisticas/ventas/', { params });
    return response.data;
  },

  /**
   * Obtener estadísticas de gastos.
   *
   * @param {Object} params - Parámetros (fecha_inicio, fecha_fin)
   * @returns {Promise} Estadísticas de gastos
   */
  getEstadisticasGastos: async (params = {}) => {
    const response = await apiClient.get('/estadisticas/gastos/', { params });
    return response.data;
  },

  /**
   * Obtener gastos por categoría.
   *
   * @param {Object} params - Parámetros (fecha_inicio, fecha_fin)
   * @returns {Promise} Gastos agrupados por categoría
   */
  getGastosPorCategoria: async (params = {}) => {
    const response = await apiClient.get('/estadisticas/gastos/categorias/', { params });
    return response.data;
  },

  /**
   * Obtener ventas mensuales.
   *
   * @param {number} anio - Año a consultar
   * @returns {Promise} Ventas por mes
   */
  getVentasMensuales: async (anio = null) => {
    const params = anio ? { anio } : {};
    const response = await apiClient.get('/estadisticas/ventas/mensuales/', { params });
    return response.data;
  },

  /**
   * Obtener productos más vendidos.
   *
   * @param {Object} params - Parámetros (fecha_inicio, fecha_fin, limite)
   * @returns {Promise} Productos más vendidos
   */
  getProductosMasVendidos: async (params = {}) => {
    const response = await apiClient.get('/estadisticas/productos/mas-vendidos/', {
      params: { ...params, limite: params.limite || 100 },
    });
    return response.data;
  },

  /**
   * Obtener resumen completo de un periodo.
   *
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise} Resumen completo
   */
  getResumenPeriodo: async (fechaInicio, fechaFin) => {
    const response = await apiClient.get('/estadisticas/resumen/', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    });
    return response.data;
  },
};

export default estadisticasService;
export { estadisticasService };
