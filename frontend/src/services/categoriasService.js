import api from './api';

/**
 * Servicio para gestión de categorías de gastos.
 */
const categoriasService = {
  /**
   * Obtiene todas las categorías.
   * @returns {Promise<Array>} Lista de categorías
   */
  obtenerCategorias: async () => {
    const response = await api.get('/api/gastos/categorias/');
    return response.data;
  },

  /**
   * Obtiene una categoría por ID.
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object>} Datos de la categoría
   */
  obtenerCategoria: async (id) => {
    const response = await api.get(`/api/gastos/categorias/${id}/`);
    return response.data;
  },

  /**
   * Crea una nueva categoría.
   * @param {Object} datos - Datos de la categoría
   * @returns {Promise<Object>} Categoría creada
   */
  crearCategoria: async (datos) => {
    const response = await api.post('/api/gastos/categorias/', datos);
    return response.data;
  },

  /**
   * Actualiza una categoría existente.
   * @param {number} id - ID de la categoría
   * @param {Object} datos - Datos actualizados
   * @returns {Promise<Object>} Categoría actualizada
   */
  actualizarCategoria: async (id, datos) => {
    const response = await api.put(`/api/gastos/categorias/${id}/`, datos);
    return response.data;
  },

  /**
   * Elimina una categoría.
   * @param {number} id - ID de la categoría
   * @returns {Promise<void>}
   */
  eliminarCategoria: async (id) => {
    await api.delete(`/api/gastos/categorias/${id}/`);
  },
};

export { categoriasService };
