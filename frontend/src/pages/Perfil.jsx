import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Perfil.css';

/**
 * Página de perfil de usuario.
 * Permite ver y editar información personal y cambiar contraseña.
 */
const Perfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarCambiarContrasena, setMostrarCambiarContrasena] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    fecha_ingreso: '',
  });

  const [contrasenaData, setContrasenaData] = useState({
    contrasena_actual: '',
    contrasena_nueva: '',
    contrasena_confirmacion: '',
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const response = await api.get('/perfil/');
      setPerfil(response.data);
      setFormData({
        nombre: response.data.nombre,
        edad: response.data.edad || '',
        fecha_ingreso: response.data.fecha_ingreso || '',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContrasenaChange = e => {
    const { name, value } = e.target;
    setContrasenaData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActualizarPerfil = async e => {
    e.preventDefault();

    try {
      const response = await api.patch('/perfil/', formData);
      setPerfil(response.data);
      setModoEdicion(false);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al actualizar perfil:', error);
      const errores = error.response?.data;
      if (errores) {
        Object.keys(errores).forEach(campo => {
          toast.error(`${campo}: ${errores[campo]}`);
        });
      } else {
        toast.error('Error al actualizar perfil');
      }
    }
  };

  const handleCambiarContrasena = async e => {
    e.preventDefault();

    if (contrasenaData.contrasena_nueva !== contrasenaData.contrasena_confirmacion) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      await api.post('/perfil/cambiar-contrasena/', contrasenaData);
      toast.success('Contraseña cambiada exitosamente');
      setMostrarCambiarContrasena(false);
      setContrasenaData({
        contrasena_actual: '',
        contrasena_nueva: '',
        contrasena_confirmacion: '',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cambiar contraseña:', error);
      const errores = error.response?.data;
      if (errores) {
        Object.keys(errores).forEach(campo => {
          const mensaje = Array.isArray(errores[campo]) ? errores[campo][0] : errores[campo];
          toast.error(`${campo}: ${mensaje}`);
        });
      } else {
        toast.error('Error al cambiar contraseña');
      }
    }
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setFormData({
      nombre: perfil.nombre,
      edad: perfil.edad || '',
      fecha_ingreso: perfil.fecha_ingreso || '',
    });
  };

  if (loading) {
    return <div className="loading-container">Cargando perfil...</div>;
  }

  if (!perfil) {
    return <div className="error-container">No se pudo cargar el perfil</div>;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        {!modoEdicion && (
          <button onClick={() => setModoEdicion(true)} className="btn btn-primary">
            Editar Perfil
          </button>
        )}
      </div>

      <div className="perfil-content">
        <div className="perfil-card">
          <h2>Información Personal</h2>

          {modoEdicion ? (
            <form onSubmit={handleActualizarPerfil} className="perfil-form">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Edad</label>
                <input
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleInputChange}
                  min="18"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>Email (No editable)</label>
                <input type="email" value={perfil.email} disabled />
                <small>El email solo puede ser cambiado por un administrador</small>
              </div>

              <div className="form-group">
                <label>Cédula (No editable)</label>
                <input type="text" value={perfil.cedula || 'No asignada'} disabled />
                <small>La cédula solo puede ser cambiada por un administrador</small>
              </div>

              <div className="form-actions">
                <button type="button" onClick={cancelarEdicion} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          ) : (
            <div className="perfil-info">
              <div className="info-item">
                <label>Nombre:</label>
                <span>{perfil.nombre}</span>
              </div>

              <div className="info-item">
                <label>Email:</label>
                <span>{perfil.email}</span>
              </div>

              <div className="info-item">
                <label>Cédula:</label>
                <span>{perfil.cedula || 'No asignada'}</span>
              </div>

              <div className="info-item">
                <label>Edad:</label>
                <span>{perfil.edad || 'No especificada'}</span>
              </div>

              <div className="info-item">
                <label>Fecha de Ingreso:</label>
                <span>{perfil.fecha_ingreso || 'No especificada'}</span>
              </div>

              {perfil.fecha_fin && (
                <div className="info-item">
                  <label>Fecha de Fin:</label>
                  <span className="text-warning">{perfil.fecha_fin}</span>
                </div>
              )}

              <div className="info-item">
                <label>Rol:</label>
                <span
                  className={`badge ${perfil.rol === 'admin' ? 'badge-admin' : 'badge-usuario'}`}
                >
                  {perfil.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>

              <div className="info-item">
                <label>Miembro desde:</label>
                <span>{new Date(perfil.date_joined).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="perfil-card">
          <h2>Seguridad</h2>

          {!mostrarCambiarContrasena ? (
            <div className="seguridad-info">
              <p>Cambia tu contraseña regularmente para mantener tu cuenta segura.</p>
              <button
                onClick={() => setMostrarCambiarContrasena(true)}
                className="btn btn-secondary"
              >
                Cambiar Contraseña
              </button>
            </div>
          ) : (
            <form onSubmit={handleCambiarContrasena} className="contrasena-form">
              <div className="form-group">
                <label>Contraseña Actual *</label>
                <input
                  type="password"
                  name="contrasena_actual"
                  value={contrasenaData.contrasena_actual}
                  onChange={handleContrasenaChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nueva Contraseña *</label>
                <input
                  type="password"
                  name="contrasena_nueva"
                  value={contrasenaData.contrasena_nueva}
                  onChange={handleContrasenaChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  name="contrasena_confirmacion"
                  value={contrasenaData.contrasena_confirmacion}
                  onChange={handleContrasenaChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarCambiarContrasena(false);
                    setContrasenaData({
                      contrasena_actual: '',
                      contrasena_nueva: '',
                      contrasena_confirmacion: '',
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;
