/**
 * Página de inicio de sesión.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tiempoEspera, setTiempoEspera] = useState(0);
  const [tiempoAgotado, setTiempoAgotado] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Efecto para el timer del servidor
  useEffect(() => {
    let contador;
    let inicioTiempo;

    if (loading) {
      inicioTiempo = Date.now();
      contador = setInterval(() => {
        const tiempoTranscurrido = Math.floor((Date.now() - inicioTiempo) / 1000);
        setTiempoEspera(tiempoTranscurrido);

        if (tiempoTranscurrido >= 60) {
          setTiempoAgotado(true);
          clearInterval(contador);
        }
      }, 1000);
    }

    return () => {
      if (contador) clearInterval(contador);
    };
  }, [loading]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Por favor ingrese email y contraseña');
      return;
    }

    console.log('🔐 [LOGIN PAGE] Intentando login:', { email, password: '***' });
    setLoading(true);
    setTiempoEspera(0);
    setTiempoAgotado(false);

    try {
      console.log('🔐 [LOGIN PAGE] Llamando a login()...');
      await login(email, password);
      console.log('✅ [LOGIN PAGE] Login exitoso');
      toast.success('¡Bienvenido a Mundo Reporte!');
      navigate('/dashboard');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ [LOGIN PAGE] Error completo:', error);
      console.error('❌ [LOGIN PAGE] Response data:', error.response?.data);
      console.error('❌ [LOGIN PAGE] Response status:', error.response?.status);
      const mensaje =
        error.response?.data?.detail || 'Error al iniciar sesión. Verifique sus credenciales.';
      toast.error(mensaje);
    } finally {
      setLoading(false);
      setTiempoEspera(0);
      setTiempoAgotado(false);
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

        {/* Indicador de espera del servidor */}
        {loading && tiempoEspera >= 3 && (
          <div className="servidor-espera">
            {!tiempoAgotado ? (
              <>
                <div className="espera-spinner"></div>
                <p className="espera-mensaje">
                  El servidor se está activando...
                </p>
                <p className="espera-tiempo">
                  {tiempoEspera < 60 ? `Esperando: ${tiempoEspera}s / 60s` : 'Tiempo agotado'}
                </p>
              </>
            ) : (
              <>
                <p className="espera-error">⚠️ Le está tomando más de lo esperado</p>
                <p className="espera-contacto">
                  El servidor no responde. Por favor contacta con soporte.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
