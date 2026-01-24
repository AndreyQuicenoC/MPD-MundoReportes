import { useState, useEffect } from 'react';
import { categoriasService } from '../services/categoriasService';
import toast from 'react-hot-toast';
import './Productos.css'; // Reutilizamos los mismos estilos

/**
 * Página de gestión de categorías de gastos.
 * CRUD completo de categorías.
 */
const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activa: true,
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriasService.obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      toast.error('Error al cargar categorías');
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setCategoriaEditando(null);
    setFormData({ nombre: '', descripcion: '', activa: true });
    setMostrarModal(true);
  };

  const abrirModalEditar = categoria => {
    setCategoriaEditando(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      activa: categoria.activa,
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setCategoriaEditando(null);
    setFormData({ nombre: '', descripcion: '', activa: true });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    try {
      if (categoriaEditando) {
        await categoriasService.actualizarCategoria(categoriaEditando.id, formData);
        toast.success('Categoría actualizada exitosamente');
      } else {
        await categoriasService.crearCategoria(formData);
        toast.success('Categoría creada exitosamente');
      }
      cerrarModal();
      cargarCategorias();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar categoría');
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleEliminar = async id => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      return;
    }

    try {
      await categoriasService.eliminarCategoria(id);
      toast.success('Categoría eliminada exitosamente');
      cargarCategorias();
    } catch (error) {
      toast.error('Error al eliminar categoría');
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="productos-container">
      <div className="productos-header">
        <h1>Categorías de Gastos</h1>
        <button className="btn btn-primary" onClick={abrirModalNuevo}>
          + Nueva Categoría
        </button>
      </div>

      <div className="productos-tabla-container">
        <table className="productos-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No hay categorías registradas
                </td>
              </tr>
            ) : (
              categorias.map(categoria => (
                <tr key={categoria.id}>
                  <td>{categoria.nombre}</td>
                  <td>{categoria.descripcion || '-'}</td>
                  <td>
                    <span className={`badge ${categoria.activa ? 'badge-success' : 'badge-danger'}`}>
                      {categoria.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => abrirModalEditar(categoria)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleEliminar(categoria.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button className="modal-close" onClick={cerrarModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Servicios Públicos"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                  placeholder="Descripción opcional de la categoría"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.activa}
                    onChange={e => setFormData({ ...formData, activa: e.target.checked })}
                  />
                  Categoría activa
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {categoriaEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categorias;

