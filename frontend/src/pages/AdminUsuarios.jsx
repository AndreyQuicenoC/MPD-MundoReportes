import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import './AdminUsuarios.css';

/**
 * Panel de administración de usuarios.
 * Solo accesible para administradores.
 */
const AdminUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    cedula: '',
    edad: '',
    fecha_ingreso: '',
    fecha_fin: '',
    password: '',
    password_confirmacion: '',
    rol: 'usuario',
    is_active: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [usuariosRes, statsRes] = await Promise.all([
        api.get('/api/admin/usuarios/'),
        api.get('/api/admin/usuarios/estadisticas/'),
      ]);
      setUsuarios(usuariosRes.data);
      setEstadisticas(statsRes.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos de usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const abrirModalCrear = () => {
    setUsuarioEditando(null);
    setFormData({
      email: '',
      nombre: '',
      cedula: '',
      edad: '',
      fecha_ingreso: '',
      fecha_fin: '',
      password: '',
      password_confirmacion: '',
      rol: 'usuario',
      is_active: true,
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = usuario => {
    setUsuarioEditando(usuario);
    setFormData({
      email: usuario.email,
      nombre: usuario.nombre,
      cedula: usuario.cedula || '',
      edad: usuario.edad || '',
      fecha_ingreso: usuario.fecha_ingreso || '',
      fecha_fin: usuario.fecha_fin || '',
      password: '',
      password_confirmacion: '',
      rol: usuario.rol,
      is_active: usuario.is_active,
    });
    setMostrarModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      if (usuarioEditando) {
        // Actualizar usuario existente
        await api.put(`/api/admin/usuarios/${usuarioEditando.id}/`, formData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        await api.post('/api/admin/usuarios/', formData);
        toast.success('Usuario creado exitosamente');
      }

      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al guardar usuario:', error);
      const errores = error.response?.data;
      if (errores) {
        Object.keys(errores).forEach(campo => {
          toast.error(`${campo}: ${errores[campo]}`);
        });
      } else {
        toast.error('Error al guardar usuario');
      }
    }
  };

  const handleDesactivar = async id => {
    if (!window.confirm('¿Estás seguro de desactivar este usuario?')) return;

    try {
      await api.delete(`/api/admin/usuarios/${id}/`);
      toast.success('Usuario desactivado exitosamente');
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al desactivar usuario:', error);
      toast.error(
        error.response?.data?.error || 'Error al desactivar usuario'
      );
    }
  };

  const handleActivar = async id => {
    try {
      await api.post(`/api/admin/usuarios/${id}/activar/`);
      toast.success('Usuario activado exitosamente');
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al activar usuario:', error);
      toast.error('Error al activar usuario');
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }

  return (
    <div className="admin-usuarios-container">
      <div className="admin-header">
        <h1>Administración de Usuarios</h1>
        <button onClick={abrirModalCrear} className="btn btn-primary">
          + Nuevo Usuario
        </button>
      </div>

      {estadisticas && (
        <div className="estadisticas-grid">
          <div className="stat-card">
            <h3>Total Usuarios</h3>
            <p className="stat-numero">{estadisticas.total_usuarios}</p>
          </div>
          <div className="stat-card">
            <h3>Activos</h3>
            <p className="stat-numero success">
              {estadisticas.usuarios_activos}
            </p>
          </div>
          <div className="stat-card">
            <h3>Inactivos</h3>
            <p className="stat-numero warning">
              {estadisticas.usuarios_inactivos}
            </p>
          </div>
          <div className="stat-card">
            <h3>Próximos a Vencer</h3>
            <p className="stat-numero error">
              {estadisticas.usuarios_proximos_vencer}
            </p>
          </div>
        </div>
      )}

      <div className="tabla-usuarios">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Edad</th>
              <th>Fecha Ingreso</th>
              <th>Fecha Fin</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.email}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.cedula || '-'}</td>
                <td>{usuario.edad || '-'}</td>
                <td>{usuario.fecha_ingreso || '-'}</td>
                <td>{usuario.fecha_fin || '-'}</td>
                <td>
                  <span
                    className={`badge ${usuario.rol === 'admin' ? 'badge-admin' : 'badge-usuario'}`}
                  >
                    {usuario.rol === 'admin' ? 'Admin' : 'Usuario'}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${usuario.is_active ? 'badge-activo' : 'badge-inactivo'}`}
                  >
                    {usuario.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="acciones">
                  <button
                    onClick={() => abrirModalEditar(usuario)}
                    className="btn btn-sm btn-secondary"
                  >
                    Editar
                  </button>
                  {usuario.is_active ? (
                    <button
                      onClick={() => handleDesactivar(usuario.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivar(usuario.id)}
                      className="btn btn-sm btn-success"
                    >
                      Activar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {usuarioEditando ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              <button
                className="btn-close"
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="usuario-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={!!usuarioEditando}
                  />
                </div>

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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cédula</label>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Ingreso</label>
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={formData.fecha_ingreso}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Fin (opcional)</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                  />
                  <small>
                    Si se establece, el usuario no podrá acceder después de
                    esta fecha
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contraseña {!usuarioEditando && '*'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!usuarioEditando}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Confirmar Contraseña {!usuarioEditando && '*'}
                  </label>
                  <input
                    type="password"
                    name="password_confirmacion"
                    value={formData.password_confirmacion}
                    onChange={handleInputChange}
                    required={!usuarioEditando}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rol</label>
                  <select name="rol" value={formData.rol} onChange={handleInputChange}>
                    <option value="usuario">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    Usuario Activo
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {usuarioEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
