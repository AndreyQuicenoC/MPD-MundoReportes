import { useState, useEffect } from 'react';
import { productosService } from '../../../services/productosService';
import FormModal from '../../../components/FormModal';
import Pagination from '../../../components/Pagination';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import toast from 'react-hot-toast';
import './Productos.css';

/**
 * Página de gestión de productos.
 * CRUD con layout de cards, búsqueda y filtros de estado.
 */
const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const itemsPorPagina = 10;

  const [formData, setFormData] = useState({
    nombre: '',
    precio_unitario: '',
    activo: true,
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  // Load all products (both active and inactive)
  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productosService.obtenerProductos();
      let productosData = Array.isArray(data) ? data : data?.results || [];
      // Load all products without filtering
      setProductos(productosData);
      setPaginaActual(1);
    } catch (error) {
      toast.error('Error al cargar productos');
      console.error(error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply search and status filters
  let productosFiltrados = productos;

  if (busqueda.trim()) {
    productosFiltrados = productosFiltrados.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  if (filtroEstado === 'activos') {
    productosFiltrados = productosFiltrados.filter(p => p.activo === true);
  } else if (filtroEstado === 'inactivos') {
    productosFiltrados = productosFiltrados.filter(p => p.activo === false);
  }

  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!formData.precio_unitario || parseFloat(formData.precio_unitario) < 0) {
      toast.error('El precio debe ser válido');
      return;
    }

    try {
      if (productoEditando) {
        await productosService.actualizarProducto(productoEditando.id, formData);
        toast.success('Producto actualizado');
      } else {
        await productosService.crearProducto(formData);
        toast.success('Producto creado');
      }

      setFormData({ nombre: '', precio_unitario: '', activo: true });
      setProductoEditando(null);
      setMostrarForm(false);
      cargarProductos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
      console.error(error);
    }
  };

  const handleEditar = producto => {
    setProductoEditando(producto);
    setFormData({
      nombre: producto.nombre,
      precio_unitario: producto.precio_unitario,
      activo: producto.activo,
    });
    setMostrarForm(true);
  };

  // Toggle product active/inactive status
  const handleToggleEstado = async producto => {
    try {
      const nuevoEstado = !producto.activo;
      await productosService.actualizarProducto(producto.id, {
        ...producto,
        activo: nuevoEstado,
      });
      toast.success(nuevoEstado ? 'Producto activado' : 'Producto desactivado');
      cargarProductos();
    } catch (error) {
      toast.error('Error al cambiar estado');
      console.error(error);
    }
  };

  const handleEliminar = id => {
    setIdAEliminar(id);
    setMostrarConfirmacion(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await productosService.eliminarProducto(idAEliminar);
      toast.success('Producto eliminado');
      setMostrarConfirmacion(false);
      setIdAEliminar(null);
      cargarProductos();
    } catch (error) {
      toast.error('Error al eliminar');
      console.error(error);
      setMostrarConfirmacion(false);
    }
  };

  const cancelar = () => {
    setMostrarForm(false);
    setProductoEditando(null);
    setFormData({ nombre: '', precio_unitario: '', activo: true });
  };

  const handleLimpiarBusqueda = () => {
    setBusqueda('');
    setFiltroEstado('todos');
    setPaginaActual(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="productos-container">
      <div className="page-header-flex">
        <div className="header-content">
          <h1>Productos</h1>
          <p>Gestiona el catálogo de productos disponibles</p>
        </div>
        {!mostrarForm && (
          <button onClick={() => setMostrarForm(true)} className="btn btn-primary">
            + Nuevo Producto
          </button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="filter-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={e => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filtroEstado === 'todos' ? 'active' : ''}`}
            onClick={() => {
              setFiltroEstado('todos');
              setPaginaActual(1);
            }}
          >
            Todos
          </button>
          <button
            className={`filter-btn ${filtroEstado === 'activos' ? 'active' : ''}`}
            onClick={() => {
              setFiltroEstado('activos');
              setPaginaActual(1);
            }}
          >
            Activos
          </button>
          <button
            className={`filter-btn ${filtroEstado === 'inactivos' ? 'active' : ''}`}
            onClick={() => {
              setFiltroEstado('inactivos');
              setPaginaActual(1);
            }}
          >
            Inactivos
          </button>
          {(busqueda || filtroEstado !== 'todos') && (
            <button className="filter-btn reset" onClick={handleLimpiarBusqueda}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <FormModal
        isOpen={mostrarForm}
        titulo={productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
        submitText={productoEditando ? 'Actualizar' : 'Crear'}
        onClose={cancelar}
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor="nombre">Nombre *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
            placeholder="Ej: Pintura Blanca 1L"
          />
        </div>

        <div className="form-group">
          <label htmlFor="precio_unitario">Precio Unitario *</label>
          <input
            type="text"
            id="precio_unitario"
            name="precio_unitario"
            value={formData.precio_unitario}
            onChange={e => {
              const valor = e.target.value.replace(/[^0-9.]/g, '');
              setFormData({ ...formData, precio_unitario: valor });
            }}
            required
            placeholder="0.00"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleInputChange}
            />
            Producto activo
          </label>
        </div>
      </FormModal>

      {productosFiltrados.length === 0 ? (
        <div className="empty-state">
          <p>
            {busqueda || filtroEstado !== 'todos'
              ? 'No se encontraron productos con los filtros aplicados'
              : 'No hay productos. Crea uno para comenzar.'}
          </p>
        </div>
      ) : (
        <>
          <div className="productos-grid">
            {productosPaginados.map(producto => (
              <div key={producto.id} className="producto-card">
                <div className="card-content">
                  <h3>{producto.nombre}</h3>
                  <p className="precio">
                    ${Number(producto.precio_unitario).toLocaleString('es-CO')}
                  </p>
                  <span className={`badge ${producto.activo ? 'badge-success' : 'badge-danger'}`}>
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEditar(producto)}
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button
                    className={`btn btn-sm ${producto.activo ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggleEstado(producto)}
                    title={producto.activo ? 'Desactivar' : 'Activar'}
                  >
                    {producto.activo ? '○' : '●'}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleEliminar(producto.id)}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {productosFiltrados.length > 0 && (
            <Pagination
              paginaActual={paginaActual}
              totalItems={productosFiltrados.length}
              itemsPorPagina={itemsPorPagina}
              onPaginaChange={setPaginaActual}
            />
          )}
        </>
      )}

      <ModalConfirmacion
        isOpen={mostrarConfirmacion}
        titulo="Eliminar Producto"
        mensaje="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleConfirmarEliminar}
        onCancel={() => {
          setMostrarConfirmacion(false);
          setIdAEliminar(null);
        }}
      />
    </div>
  );
};

export default Productos;
