/**
 * Servicio de reportes.
 * 
 * Maneja todas las operaciones CRUD de reportes diarios.
 */

import apiClient from './api';

const reportesService = {
  /**
   * Obtener todos los reportes con filtros opcionales.
   * 
   * @param {Object} params - Parámetros de filtro (fecha_inicio, fecha_fin, etc.)
   * @returns {Promise} Lista de reportes
   */
  getReportes: async (params = {}) => {
    const response = await apiClient.get('/reportes/', { params });
    return response.data;
  },

  /**
   * Obtener detalle de un reporte específico.
   * 
   * @param {number} id - ID del reporte
   * @returns {Promise} Detalle del reporte
   */
  getReporte: async id => {
    const response = await apiClient.get(`/reportes/${id}/`);
    return response.data;
  },

  /**
   * Crear un nuevo reporte.
   * 
   * @param {Object} data - Datos del reporte
   * @returns {Promise} Reporte creado
   */
  createReporte: async data => {
    const response = await apiClient.post('/reportes/crear/', data);
    return response.data;
  },

  /**
   * Actualizar un reporte existente.
   * 
   * @param {number} id - ID del reporte
   * @param {Object} data - Datos actualizados
   * @returns {Promise} Reporte actualizado
   */
  updateReporte: async (id, data) => {
    const response = await apiClient.put(`/reportes/${id}/actualizar/`, data);
    return response.data;
  },

  /**
   * Eliminar un reporte.
   * 
   * @param {number} id - ID del reporte
   * @returns {Promise} Confirmación
   */
  deleteReporte: async id => {
    const response = await apiClient.delete(`/reportes/${id}/eliminar/`);
    return response.data;
  },

  /**
   * Obtener estadísticas de un reporte.
   * 
   * @param {number} id - ID del reporte
   * @returns {Promise} Estadísticas del reporte
   */
  getEstadisticasReporte: async id => {
    const response = await apiClient.get(`/reportes/${id}/estadisticas/`);
    return response.data;
  },
};

export default reportesService;
