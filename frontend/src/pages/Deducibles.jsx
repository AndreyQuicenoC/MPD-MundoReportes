import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Deducibles.css';

/**
 * Página de gestión de gastos deducibles.
 * Permite marcar categorías como deducibles (ingresos, ahorros, transferencias)
 * que se restan del total de gastos en cálculos.
 */
const Deducibles = () => {
  const [deducibles, setDeducibles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);

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

      setDeducibles(deduciblesRes.data.results || deduciblesRes.data);

      // Filtrar categorías que no tengan deducible asignado
      const deduciblesToIds = new Set((deduciblesRes.data.results || deduciblesRes.data).map(d => d.categoria));
      const categoriasDisponibles = (categoriasRes.data.results || categoriasRes.data).filter(
        c => c.activa && !deduciblesToIds.has(c.id)
      );
      setCategorias(categoriasDisponibles);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar deducibles');
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

      if (editando) {
        await api.patch(`/gastos/deducibles/${editando}/`, datos);
        toast.success('Deducible actualizado');
      } else {
        await api.post('/gastos/deducibles/', datos);
        toast.success('Deducible creado');
      }

      setFormData({ categoria: '', tipo: 'ingreso', descripcion: '', activo: true });
      setEditando(null);
      setMostrarForm(false);
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      toast.error('Error al guardar deducible');
    }
  };

  const handleEditar = deducible => {
    setEditando(deducible.id);
    setFormData({
      categoria: deducible.categoria,
      tipo: deducible.tipo,
      descripcion: deducible.descripcion,
      activo: deducible.activo,
    });
    setMostrarForm(true);
  };

  const handleEliminar = async id => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este deducible?')) return;

    try {
      await api.delete(`/gastos/deducibles/${id}/`);
      toast.success('Deducible eliminado');
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      toast.error('Error al eliminar');
    }
  };

  const cancelar = () => {
    setMostrarForm(false);
    setEditando(null);
    setFormData({ categoria: '', tipo: 'ingreso', descripcion: '', activo: true });
  };

  const getNombreCategoria = id => {
    // Buscar primero en deducibles, luego en categorías
    const deducible = deducibles.find(d => d.categoria === id);
    if (deducible) return deducible.categoria_nombre;
    return categorias.find(c => c.id === id)?.nombre || 'Sin categoría';
  };

  const getTipoLabel = tipo => {
    return TIPOS.find(t => t.value === tipo)?.label || tipo;
  };

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }

  return (
    <div className="deducibles-container">
      <div className="page-header">
        <h1>Gastos Deducibles</h1>
        <p>
          Marca categorías que aunque se registran como gastos, representan
          ingresos o ahorros
        </p>
      </div>

      {!mostrarForm && (
        <button onClick={() => setMostrarForm(true)} className="btn btn-primary">
          Marcar Categoría como Deducible
        </button>
      )}

      {mostrarForm && (
        <div className="form-card">
          <h2>{editando ? 'Editar' : 'Nuevo'} Deducible</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="categoria">Categoría *</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                required
                disabled={editando}
              >
                <option value="">Selecciona una categoría</option>
                {(editando ? categorias : categorias).map(cat => (
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

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
              />
              <label htmlFor="activo">Activo (se restará de gastos totales)</label>
            </div>

            <div className="form-actions">
              <button type="button" onClick={cancelar} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editando ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deducibles.length === 0 ? (
        <div className="empty-state">
          <p>No hay deducibles configurados</p>
        </div>
      ) : (
        <div className="deducibles-grid">
          {deducibles.map(deducible => (
            <div key={deducible.id} className="deducible-card">
              <div className="deducible-header">
                <h3>{deducible.categoria_nombre}</h3>
                <span className={`badge badge-${deducible.tipo}`}>
                  {getTipoLabel(deducible.tipo)}
                </span>
              </div>

              <div className="deducible-info">
                <p>
                  <strong>Estado:</strong>{' '}
                  <span className={deducible.activo ? 'text-success' : 'text-muted'}>
                    {deducible.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
                {deducible.descripcion && (
                  <p>
                    <strong>Descripción:</strong> {deducible.descripcion}
                  </p>
                )}
              </div>

              <div className="deducible-actions">
                <button
                  onClick={() => handleEditar(deducible)}
                  className="btn btn-small btn-secondary"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(deducible.id)}
                  className="btn btn-small btn-danger"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deducibles;
