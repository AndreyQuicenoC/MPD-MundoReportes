import api from './api';

/**
 * Servicio para gestión de gastos automáticos y deducibles.
 */
const gastosService = {
  /**
   * Obtiene todos los gastos automáticos activos.
   * @returns {Promise<Array>} Lista de gastos automáticos
   */
  obtenerAutomaticos: async () => {
    const response = await api.get('/gastos/automaticos/');
    return response.data;
  },

  /**
   * Obtiene todos los gastos deducibles.
   * @returns {Promise<Array>} Lista de gastos deducibles
   */
  obtenerDeducibles: async () => {
    const response = await api.get('/gastos/deducibles/');
    return response.data;
  },
};

export { gastosService };
