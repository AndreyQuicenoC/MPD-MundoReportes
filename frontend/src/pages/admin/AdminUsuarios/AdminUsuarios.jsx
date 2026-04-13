import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Pagination from '../../../components/Pagination';
import './AdminUsuarios.css';

/**
 * Panel de administración de usuarios.
 * Solo accesible para administradores.
 */
const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

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
        api.get('/auth/admin/usuarios/'),
        api.get('/auth/admin/usuarios/estadisticas/'),
      ]);
      // Manejar respuesta paginada del backend
      const usuariosData = usuariosRes.data.results || usuariosRes.data;
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setEstadisticas(statsRes.data);
      setPaginaActual(1); // Resetear a primera página
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
      // Limpiar datos antes de enviar: convertir strings vacíos a null
      const dataToSend = {
        ...formData,
        cedula: formData.cedula || null,
        edad: formData.edad ? parseInt(formData.edad, 10) : null,
        fecha_ingreso: formData.fecha_ingreso || null,
        fecha_fin: formData.fecha_fin || null,
      };

      if (usuarioEditando) {
        // Actualizar usuario existente
        await api.put(`/auth/admin/usuarios/${usuarioEditando.id}/`, dataToSend);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        await api.post('/auth/admin/usuarios/', dataToSend);
        toast.success('Usuario creado exitosamente');
      }

      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al guardar usuario:', error);
      // eslint-disable-next-line no-console
      console.error('Respuesta del servidor:', error.response?.data);
      const errores = error.response?.data;
      if (errores) {
        // Si tiene estructura de error personalizado
        if (errores.error && errores.mensaje) {
          toast.error(errores.mensaje);
          if (errores.detalles && Object.keys(errores.detalles).length > 0) {
            Object.keys(errores.detalles).forEach(campo => {
              const mensajes = Array.isArray(errores.detalles[campo])
                ? errores.detalles[campo].join(', ')
                : errores.detalles[campo];
              toast.error(`${campo}: ${mensajes}`);
            });
          }
        } else {
          // Errores de validación directos
          Object.keys(errores).forEach(campo => {
            const mensajes = Array.isArray(errores[campo])
              ? errores[campo].join(', ')
              : errores[campo];
            toast.error(`${campo}: ${mensajes}`);
          });
        }
      } else {
        toast.error('Error al guardar usuario');
      }
    }
  };

  const handleDesactivar = async id => {
    if (!window.confirm('¿Estás seguro de desactivar este usuario?')) return;

    try {
      await api.delete(`/auth/admin/usuarios/${id}/`);
      toast.success('Usuario desactivado exitosamente');
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al desactivar usuario:', error);
      toast.error(error.response?.data?.error || 'Error al desactivar usuario');
    }
  };

  const handleActivar = async id => {
    try {
      await api.post(`/auth/admin/usuarios/${id}/activar/`);
      toast.success('Usuario activado exitosamente');
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al activar usuario:', error);
      toast.error('Error al activar usuario');
    }
  };

  const handleEliminar = async id => {
    const usuario = usuarios.find(u => u.id === id);
    const confirmacion = window.confirm(
      `¿Estás seguro de ELIMINAR PERMANENTEMENTE al usuario ${usuario?.nombre}?\n\n` +
        `Esta acción NO SE PUEDE DESHACER.\n\n` +
        `Si solo quieres desactivarlo temporalmente, usa el botón "Desactivar".`
    );

    if (!confirmacion) return;

    try {
      await api.delete(`/auth/admin/usuarios/${id}/eliminar_permanente/`);
      toast.success('Usuario eliminado permanentemente');
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al eliminar usuario:', error);
      const mensaje = error.response?.data?.error || 'Error al eliminar usuario';
      toast.error(mensaje);
    }
  };

  // Calcular índices para la paginación
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const usuariosPaginados = usuarios.slice(indiceInicio, indiceFin);

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }

  return (
    <div className="admin-usuarios-container">
      <div className="admin-header">
        <h1>Administración de Usuarios</h1>
        <button onClick={abrirModalCrear} className="btn btn-primary-opposite">
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
            <p className="stat-numero success">{estadisticas.usuarios_activos}</p>
          </div>
          <div className="stat-card">
            <h3>Inactivos</h3>
            <p className="stat-numero warning">{estadisticas.usuarios_inactivos}</p>
          </div>
          <div className="stat-card">
            <h3>Próximos a Vencer</h3>
            <p className="stat-numero error">{estadisticas.usuarios_proximos_vencer}</p>
          </div>
        </div>
      )}

      <div className="tabla-usuarios">
        <div className="tabla-usuarios-wrapper">
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
              {usuariosPaginados.map(usuario => (
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
                        className="btn btn-sm btn-warning"
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
                    <button
                      onClick={() => handleEliminar(usuario.id)}
                      className="btn btn-sm btn-danger"
                      title="Eliminar permanentemente"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {usuarios.length > 0 && (
        <Pagination
          paginaActual={paginaActual}
          totalItems={usuarios.length}
          itemsPorPagina={itemsPorPagina}
          onPaginaChange={setPaginaActual}
        />
      )}

      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{usuarioEditando ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
              <button className="btn-close" onClick={() => setMostrarModal(false)}>
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
                  <small>Si se establece, el usuario no podrá acceder después de esta fecha</small>
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
                  <label>Confirmar Contraseña {!usuarioEditando && '*'}</label>
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
