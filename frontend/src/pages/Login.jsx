/**
 * Página de inicio de sesión.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async e => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Por favor ingrese email y contraseña');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      toast.success('¡Bienvenido a Mundo Reporte!');
      navigate('/dashboard');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error de login:', error);
      const mensaje =
        error.response?.data?.detail || 'Error al iniciar sesión. Verifique sus credenciales.';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.svg" alt="Mundo Reporte" className="login-logo" />
          <h1 className="login-title">Mundo Reporte</h1>
          <p className="login-subtitle">Sistema de Reporte Diario de Ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
