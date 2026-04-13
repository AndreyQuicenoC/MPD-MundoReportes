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
 *
 * Accesible a todos los usuarios operarios para configurar deducibles.
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

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [deduciblesRes, categoriasRes] = await Promise.all([
        api.get('/gastos/deducibles/'),
        api.get('/gastos/categorias/'),
      ]);

      let deduciblesData = deduciblesRes.data.results || deduciblesRes.data;
      // Filtrar solo deducibles activos (soft delete: marcar como inactivo)
      deduciblesData = deduciblesData.filter(d => d.activo === true);
      setDeducibles(deduciblesData);

      // Cargar TODAS las categorías para mostrar nombres
      const todasCategorias = (categoriasRes.data.results || categoriasRes.data).filter(c => c.activa);
      setCategorias(todasCategorias);

      // Filtrar categorías disponibles (sin deducible asignado)
      const deduciblesToIds = new Set(deduciblesData.map(d => d.categoria));
      const categoriasDisp = todasCategorias.filter(c => !deduciblesToIds.has(c.id));
      setCategoriasDisponibles(categoriasDisp);
      setPaginaActual(1);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar deducibles');
      setDeducibles([]);
    } finally {
      setLoading(false);
    }
  };

  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const deduciblesPaginados = deducibles.slice(indiceInicio, indiceFin);

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
      // eslint-disable-next-line no-console
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

  const handleEliminar = id => {
    setIdAEliminar(id);
    setMostrarConfirmacion(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await api.delete(`/gastos/deducibles/${idAEliminar}/`);
      toast.success('Deducible eliminado');
      setMostrarConfirmacion(false);
      setIdAEliminar(null);
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
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
        <button onClick={() => setMostrarModal(true)} className="btn btn-primary">
          + Nuevo Deducible
        </button>
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
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleInputChange}
            required
          >
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

      {deducibles.length === 0 ? ( 
        <div className="empty-state">
          <p>No hay deducibles configurados</p>
        </div>
      ) : (
        <>
          <div className="deducibles-grid">
            {deduciblesPaginados.map(deducible => (
              <div key={deducible.id} className="deducible-card">
                <div className="card-content">
                  <h3>{deducible.categoria_nombre || getNombreCategoria(deducible.categoria)}</h3>
                  <p className="tipo">{getTipoLabel(deducible.tipo)}</p>
                  {deducible.descripcion && (
                    <p className="descripcion">{deducible.descripcion}</p>
                  )}
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

          {deducibles.length > 0 && (
            <Pagination
              paginaActual={paginaActual}
              totalItems={deducibles.length}
              itemsPorPagina={itemsPorPagina}
              onPaginaChange={setPaginaActual}
            />
          )}
        </>
      )}

      <ModalConfirmacion
        isOpen={mostrarConfirmacion}
        titulo="Eliminar Deducible"
        mensaje="¿Estás seguro de que deseas eliminar este deducible? Esta acción no se puede deshacer."
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
