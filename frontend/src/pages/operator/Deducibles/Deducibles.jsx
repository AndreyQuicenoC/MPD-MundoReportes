import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import FormModal from '../../../components/FormModal';
import Pagination from '../../../components/Pagination';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import toast from 'react-hot-toast';
import './Deducibles.css';

/**
 * Página de gestión de gastos deducibles.
 * Permite marcar categorías como deducibles (ingresos, ahorros, transferencias)
 * que se restan del total de gastos en cálculos.
 * Includes search and status filters.
 *
 * Accessible to all operator users for deductible configuration.
 */
const Deducibles = () => {
  const { usuario } = useAuth();

  const [deducibles, setDeducibles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [deducibleEditando, setDeducibleEditando] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const itemsPorPagina = 10;

  const [formData, setFormData] = useState({
    categoria: '',
    tipo: 'ingreso',
    descripcion: '',
    activo: true,
  });

  const TIPOS = [
    { value: 'ingreso', label: 'Ingreso' },
    { value: 'ahorro', label: 'Ahorro' },
    { value: 'transferencia', label: 'Transferencia' },
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  // Load all deductibles (both active and inactive)
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [deduciblesRes, categoriasRes] = await Promise.all([
        api.get('/gastos/deducibles/'),
        api.get('/gastos/categorias/'),
      ]);

      let deduciblesData = deduciblesRes.data.results || deduciblesRes.data;
      // Load all deductibles without filtering
      setDeducibles(deduciblesData);

      // Load all categories to show names
      const todasCategorias = (categoriasRes.data.results || categoriasRes.data).filter(
        c => c.activa
      );
      setCategorias(todasCategorias);

      // Filter available categories (without assigned deductible)
      const deduciblesToIds = new Set(deduciblesData.filter(d => d.activo).map(d => d.categoria));
      const categoriasDisp = todasCategorias.filter(c => !deduciblesToIds.has(c.id));
      setCategoriasDisponibles(categoriasDisp);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar deducibles');
      setDeducibles([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply search and status filters
  let deduciblesFiltrados = deducibles;

  if (busqueda.trim()) {
    const searchLower = busqueda.toLowerCase();
    deduciblesFiltrados = deduciblesFiltrados.filter(d => {
      const nombre = d.categoria_nombre || getNombreCategoria(d.categoria);
      return nombre.toLowerCase().includes(searchLower);
    });
  }

  if (filtroEstado === 'activos') {
    deduciblesFiltrados = deduciblesFiltrados.filter(d => d.activo === true);
  } else if (filtroEstado === 'inactivos') {
    deduciblesFiltrados = deduciblesFiltrados.filter(d => d.activo === false);
  }

  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const deduciblesPaginados = deduciblesFiltrados.slice(indiceInicio, indiceFin);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.categoria || !formData.tipo) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    try {
      const datos = {
        categoria: parseInt(formData.categoria),
        tipo: formData.tipo,
        descripcion: formData.descripcion.trim(),
        activo: formData.activo,
      };

      if (deducibleEditando) {
        await api.patch(`/gastos/deducibles/${deducibleEditando.id}/`, datos);
        toast.success('Deducible actualizado');
      } else {
        await api.post('/gastos/deducibles/', datos);
        toast.success('Deducible creado');
      }

      setFormData({ categoria: '', tipo: 'ingreso', descripcion: '', activo: true });
      setDeducibleEditando(null);
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar deducible');
    }
  };

  const handleEditar = deducible => {
    setDeducibleEditando(deducible);
    setFormData({
      categoria: deducible.categoria,
      tipo: deducible.tipo,
      descripcion: deducible.descripcion,
      activo: deducible.activo,
    });
    setMostrarModal(true);
  };

  // Toggle deductible active/inactive status via the desactivar endpoint
  const handleToggleEstado = async deducible => {
    try {
      await api.post(`/gastos/deducibles/${deducible.id}/desactivar/`);
      const accion = deducible.activo ? 'desactivado' : 'activado';
      toast.success(`Deducible ${accion} exitosamente`);
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const handleEliminar = id => {
    setIdAEliminar(id);
    setMostrarConfirmacion(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await api.delete(`/gastos/deducibles/${idAEliminar}/`);
      toast.success('Deducible eliminado permanentemente');
      setMostrarConfirmacion(false);
      setIdAEliminar(null);
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar');
      setMostrarConfirmacion(false);
    }
  };

  const cancelar = () => {
    setMostrarModal(false);
    setDeducibleEditando(null);
    setFormData({ categoria: '', tipo: 'ingreso', descripcion: '', activo: true });
  };

  const getNombreCategoria = id => {
    return categorias.find(c => c.id === id)?.nombre || 'Sin categoría';
  };

  const getTipoLabel = tipo => {
    return TIPOS.find(t => t.value === tipo)?.label || tipo;
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
    <div className="deducibles-container">
      <div className="page-header-flex">
        <div className="header-content">
          <h1>Gastos Deducibles</h1>
          <p>Categorías que aunque se registran como gastos, representan ingresos o ahorros</p>
        </div>
        {!mostrarModal && (
          <button onClick={() => setMostrarModal(true)} className="btn btn-primary">
            + Nuevo Deducible
          </button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="filter-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por categoría..."
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
        isOpen={mostrarModal}
        titulo={deducibleEditando ? 'Editar Deducible' : 'Nuevo Deducible'}
        submitText={deducibleEditando ? 'Actualizar' : 'Crear'}
        onClose={cancelar}
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor="categoria">Categoría *</label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleInputChange}
            required
            disabled={deducibleEditando}
          >
            <option value="">Selecciona una categoría</option>
            {categoriasDisponibles.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo de Deducible *</label>
          <select id="tipo" name="tipo" value={formData.tipo} onChange={handleInputChange} required>
            {TIPOS.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Por qué esta categoría es deducible..."
            rows="3"
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
            Deducible activo (se restará de gastos totales)
          </label>
        </div>
      </FormModal>

      {deduciblesFiltrados.length === 0 ? (
        <div className="empty-state">
          <p>
            {busqueda || filtroEstado !== 'todos'
              ? 'No se encontraron deducibles con los filtros aplicados'
              : 'No hay deducibles configurados'}
          </p>
        </div>
      ) : (
        <>
          <div className="deducibles-grid">
            {deduciblesPaginados.map(deducible => (
              <div key={deducible.id} className="deducible-card">
                <div className="card-content">
                  <h3>{deducible.categoria_nombre || getNombreCategoria(deducible.categoria)}</h3>
                  <p className="tipo">{getTipoLabel(deducible.tipo)}</p>
                  {deducible.descripcion && <p className="descripcion">{deducible.descripcion}</p>}
                  <span className={`badge badge-${deducible.tipo}`}>
                    {deducible.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEditar(deducible)}
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button
                    className={`btn btn-sm ${deducible.activo ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggleEstado(deducible)}
                    title={deducible.activo ? 'Desactivar' : 'Activar'}
                  >
                    {deducible.activo ? '○' : '●'}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleEliminar(deducible.id)}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {deduciblesFiltrados.length > 0 && (
            <Pagination
              paginaActual={paginaActual}
              totalItems={deduciblesFiltrados.length}
              itemsPorPagina={itemsPorPagina}
              onPaginaChange={setPaginaActual}
            />
          )}
        </>
      )}

      <ModalConfirmacion
        isOpen={mostrarConfirmacion}
        titulo="Eliminar Deducible"
        mensaje="¿Estás seguro de que deseas eliminar este deducible permanentemente? Esta acción no se puede deshacer."
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

export default Deducibles;
