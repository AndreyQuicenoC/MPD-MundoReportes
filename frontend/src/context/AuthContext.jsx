/**
 * Contexto de autenticación.
 * 
 * Proporciona estado global de autenticación y usuario actual.
 */

import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado al cargar
    const usuarioGuardado = authService.getCurrentUser();
    if (usuarioGuardado) {
      setUsuario(usuarioGuardado);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const usuarioData = await authService.login(email, password);
    setUsuario(usuarioData);
    return usuarioData;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const updateUsuario = usuarioData => {
    setUsuario(usuarioData);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
  };

  const value = {
    usuario,
    loading,
    isAuthenticated: !!usuario,
    isAdmin: usuario?.rol === 'admin',
    login,
    logout,
    updateUsuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
