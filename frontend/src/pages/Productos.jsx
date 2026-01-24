import { useState, useEffect } from 'react';
import { productosService } from '../services/productosService';
import toast from 'react-hot-toast';
import './Productos.css';

/**
 * Página de gestión de productos.
 * CRUD completo de productos del catálogo.
 */
const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio_unitario: '',
    activo: true,
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productosService.obtenerProductos();
      setProductos(data);
    } catch (error) {
      toast.error('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setProductoEditando(null);
    setFormData({ nombre: '', precio_unitario: '', activo: true });
    setMostrarModal(true);
  };

  const abrirModalEditar = producto => {
    setProductoEditando(producto);
    setFormData({
      nombre: producto.nombre,
      precio_unitario: producto.precio_unitario,
      activo: producto.activo,
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setProductoEditando(null);
    setFormData({ nombre: '', precio_unitario: '', activo: true });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!formData.precio_unitario || parseFloat(formData.precio_unitario) < 0) {
      toast.error('El precio debe ser mayor o igual a 0');
      return;
    }

    try {
      if (productoEditando) {
        await productosService.actualizarProducto(productoEditando.id, formData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await productosService.crearProducto(formData);
        toast.success('Producto creado exitosamente');
      }
      cerrarModal();
      cargarProductos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar producto');
      console.error(error);
    }
  };

  const handleEliminar = async id => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      await productosService.eliminarProducto(id);
      toast.success('Producto eliminado exitosamente');
      cargarProductos();
    } catch (error) {
      toast.error('Error al eliminar producto');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="productos-container">
      <div className="productos-header">
        <h1>Productos</h1>
        <button className="btn btn-primary" onClick={abrirModalNuevo}>
          + Nuevo Producto
        </button>
      </div>

      <div className="productos-tabla-container">
        <table className="productos-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio Unitario</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              productos.map(producto => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>${Number(producto.precio_unitario).toLocaleString('es-CO')}</td>
                  <td>
                    <span className={`badge ${producto.activo ? 'badge-success' : 'badge-danger'}`}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => abrirModalEditar(producto)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleEliminar(producto.id)}
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
              <h2>{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
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
                  placeholder="Ej: Pintura Blanca 1L"
                />
              </div>

              <div className="form-group">
                <label htmlFor="precio">Precio Unitario *</label>
                <input
                  type="number"
                  id="precio"
                  value={formData.precio_unitario}
                  onChange={e => setFormData({ ...formData, precio_unitario: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                  />
                  Producto activo
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {productoEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;

