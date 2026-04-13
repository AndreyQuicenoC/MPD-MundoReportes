import { useState, useEffect } from 'react';
import { categoriasService } from '../../../services/categoriasService';
import FormModal from '../../../components/FormModal';
import Pagination from '../../../components/Pagination';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import toast from 'react-hot-toast';

/**
 * Categories management page.
 * CRUD with card layout and overlay for create/edit.
 */
const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const itemsPorPagina = 10;

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
      let categoriasData = Array.isArray(data) ? data : data?.results || [];
      // Filtrar solo categorías activas (soft delete: marcar como inactiva)
      categoriasData = categoriasData.filter(c => c.activa === true);
      setCategorias(categoriasData);
      setPaginaActual(1);
    } catch (error) {
      toast.error('Error al cargar categorías');
      console.error(error);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const categoriasPaginadas = categorias.slice(indiceInicio, indiceFin);

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

    try {
      if (categoriaEditando) {
        await categoriasService.actualizarCategoria(categoriaEditando.id, formData);
        toast.success('Categoría actualizada');
      } else {
        await categoriasService.crearCategoria(formData);
        toast.success('Categoría creada');
      }

      setFormData({ nombre: '', descripcion: '', activa: true });
      setCategoriaEditando(null);
      setMostrarForm(false);
      cargarCategorias();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
      console.error(error);
    }
  };

  const handleEditar = categoria => {
    setCategoriaEditando(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      activa: categoria.activa,
    });
    setMostrarForm(true);
  };

  const handleEliminar = id => {
    setIdAEliminar(id);
    setMostrarConfirmacion(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      console.log('Eliminando categoría con ID:', idAEliminar);
      await categoriasService.eliminarCategoria(idAEliminar);
      console.log('Categoría eliminada exitosamente');
      toast.success('Categoría eliminada');
      setMostrarConfirmacion(false);
      setIdAEliminar(null);
      cargarCategorias();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      console.error('Status:', error.response?.status);
      console.error('Datos:', error.response?.data);
      toast.error(error.response?.data?.detail || error.response?.data?.error || 'Error al eliminar categoría');
      setMostrarConfirmacion(false);
    }
  };

  const cancelar = () => {
    setMostrarForm(false);
    setCategoriaEditando(null);
    setFormData({ nombre: '', descripcion: '', activa: true });
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
          <h1>Categorías de Gastos</h1>
          <p>Gestiona las categorías disponibles para clasificar gastos</p>
        </div>
        {!mostrarForm && (
          <button onClick={() => setMostrarForm(true)} className="btn btn-primary">
            + Nueva Categoría
          </button>
        )}
      </div>

      <FormModal
        isOpen={mostrarForm}
        titulo={categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}
        submitText={categoriaEditando ? 'Actualizar' : 'Crear'}
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
            placeholder="Ej: Servicios Públicos"
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            rows="3"
            placeholder="Descripción opcional..."
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="activa"
              checked={formData.activa}
              onChange={handleInputChange}
            />
            Categoría activa
          </label>
        </div>
      </FormModal>

      {categorias.length === 0 ? (
        <div className="empty-state">
          <p>No hay categorías. Crea una para comenzar.</p>
        </div>
      ) : (
        <>
          <div className="productos-grid">
            {categoriasPaginadas.map(categoria => (
              <div key={categoria.id} className="producto-card">
                <div className="card-content">
                  <h3>{categoria.nombre}</h3>
                  {categoria.descripcion && (
                    <p className="descripcion">{categoria.descripcion}</p>
                  )}
                  <span className={`badge ${categoria.activa ? 'badge-success' : 'badge-danger'}`}>
                    {categoria.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEditar(categoria)}
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleEliminar(categoria.id)}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {categorias.length > 0 && (
            <Pagination
              paginaActual={paginaActual}
              totalItems={categorias.length}
              itemsPorPagina={itemsPorPagina}
              onPaginaChange={setPaginaActual}
            />
          )}
        </>
      )}

      <ModalConfirmacion
        isOpen={mostrarConfirmacion}
        titulo="Eliminar Categoría"
        mensaje="¿Estás seguro de que deseas eliminar esta categoría?"
        onConfirm={handleConfirmarEliminar}
        onCancel={() => setMostrarConfirmacion(false)}
        isDanger={true}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Categorias;
