import api from './api';

/**
 * Servicio para gestión de productos.
 */
const productosService = {
  /**
   * Obtiene todos los productos activos.
   * @returns {Promise<Array>} Lista de productos
   */
  obtenerProductos: async () => {
    const response = await api.get('/productos/');
    return response.data;
  },

  /**
   * Obtiene un producto por ID.
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Datos del producto
   */
  obtenerProducto: async id => {
    const response = await api.get(`/productos/${id}/`);
    return response.data;
  },

  /**
   * Crea un nuevo producto.
   * @param {Object} datos - Datos del producto
   * @returns {Promise<Object>} Producto creado
   */
  crearProducto: async datos => {
    const response = await api.post('/productos/crear/', datos);
    return response.data;
  },

  /**
   * Actualiza un producto existente.
   * @param {number} id - ID del producto
   * @param {Object} datos - Datos actualizados
   * @returns {Promise<Object>} Producto actualizado
   */
  actualizarProducto: async (id, datos) => {
    const response = await api.put(`/productos/${id}/`, datos);
    return response.data;
  },

  /**
   * Desactiva o activa un producto.
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Respuesta del servidor
   */
  toggleProductoEstado: async id => {
    const response = await api.post(`/productos/${id}/desactivar/`);
    return response.data;
  },

  /**
   * Elimina un producto (hard delete).
   * @param {number} id - ID del producto
   * @returns {Promise<void>}
   */
  eliminarProducto: async id => {
    await api.delete(`/productos/${id}/`);
  },
};

export { productosService };
