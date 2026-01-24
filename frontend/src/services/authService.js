/**
 * Servicio de autenticación.
 *
 * Maneja login, logout y gestión de tokens.
 */

import apiClient from './api';

const authService = {
  /**
   * Iniciar sesión con email y contraseña.
   *
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} Datos del usuario y tokens
   */
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login/', {
      email,
      password,
    });

    const { access, refresh, usuario } = response.data;

    // Guardar tokens y datos del usuario
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    return usuario;
  },

  /**
   * Cerrar sesión.
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario');
  },

  /**
   * Obtener usuario actual desde localStorage.
   *
   * @returns {Object|null} Datos del usuario o null
   */
  getCurrentUser: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  /**
   * Verificar si el usuario está autenticado.
   *
   * @returns {boolean} True si está autenticado
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Obtener perfil del usuario.
   *
   * @returns {Promise} Datos del perfil
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/perfil/');
    return response.data;
  },

  /**
   * Actualizar perfil del usuario.
   *
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} Perfil actualizado
   */
  updateProfile: async data => {
    const response = await apiClient.patch('/auth/perfil/', data);

    // Actualizar usuario en localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const updatedUsuario = { ...usuario, ...response.data };
    localStorage.setItem('usuario', JSON.stringify(updatedUsuario));

    return response.data;
  },

  /**
   * Cambiar contraseña del usuario.
   *
   * @param {Object} data - password_actual, password_nueva, password_confirmacion
   * @returns {Promise} Confirmación
   */
  changePassword: async data => {
    const response = await apiClient.post('/auth/cambiar-password/', data);
    return response.data;
  },
};

export default authService;
