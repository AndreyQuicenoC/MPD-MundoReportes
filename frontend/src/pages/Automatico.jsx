import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Automatico.css';

/**
 * Página de gestión de gastos automáticos predefinidos.
 * Permite crear, editar y eliminar gastos que se pueden insertar
 * automáticamente en nuevos reportes.
 */
const Automatico = () => {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);

  const [formData, setFormData] = useState({
    categoria: '',
    descripcion: '',
    valor: '',
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [gastosRes, categoriasRes] = await Promise.all([
        api.get('/gastos/automaticos/'),
        api.get('/gastos/categorias/activas/'),
      ]);

      setGastos(gastosRes.data.results || gastosRes.data);
      setCategorias(categoriasRes.data.results || categoriasRes.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar gastos automáticos');
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

    if (!formData.categoria || !formData.descripcion.trim() || !formData.valor) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const datos = {
        categoria: parseInt(formData.categoria),
        descripcion: formData.descripcion.trim(),
        valor: parseFloat(formData.valor),
        activo: formData.activo,
      };

      if (editando) {
        await api.patch(`/gastos/automaticos/${editando}/`, datos);
        toast.success('Gasto automático actualizado');
      } else {
        await api.post('/gastos/automaticos/', datos);
        toast.success('Gasto automático creado');
      }

      setFormData({ categoria: '', descripcion: '', valor: '', activo: true });
      setEditando(null);
      setMostrarForm(false);
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      toast.error('Error al guardar gasto automático');
    }
  };

  const handleEditar = gasto => {
    setEditando(gasto.id);
    setFormData({
      categoria: gasto.categoria,
      descripcion: gasto.descripcion,
      valor: gasto.valor,
      activo: gasto.activo,
    });
    setMostrarForm(true);
  };

  const handleEliminar = async id => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) return;

    try {
      await api.delete(`/gastos/automaticos/${id}/`);
      toast.success('Gasto automático eliminado');
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
    setFormData({ categoria: '', descripcion: '', valor: '', activo: true });
  };

  const getNombreCategoria = id => {
    return categorias.find(c => c.id === id)?.nombre || 'Sin categoría';
  };

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }

  return (
    <div className="automatico-container">
      <div className="page-header">
        <h1>Gastos Automáticos</h1>
        <p>Define gastos predefinidos que se pueden insertar rápidamente en reportes</p>
      </div>

      {!mostrarForm && (
        <button onClick={() => setMostrarForm(true)} className="btn btn-primary">
          Agregar Gasto Automático
        </button>
      )}

      {mostrarForm && (
        <div className="form-card">
          <h2>{editando ? 'Editar' : 'Nuevo'} Gasto Automático</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="categoria">Categoría *</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción *</label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del gasto"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="valor">Valor *</label>
              <input
                type="number"
                id="valor"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                required
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
              <label htmlFor="activo">Activo</label>
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

      {gastos.length === 0 ? (
        <div className="empty-state">
          <p>No hay gastos automáticos configurados</p>
        </div>
      ) : (
        <div className="gastos-grid">
          {gastos.map(gasto => (
            <div key={gasto.id} className="gasto-card">
              <div className="gasto-header">
                <h3>{gasto.descripcion}</h3>
                <span className={`badge ${gasto.activo ? 'badge-success' : 'badge-inactive'}`}>
                  {gasto.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="gasto-info">
                <p>
                  <strong>Categoría:</strong> {getNombreCategoria(gasto.categoria)}
                </p>
                <p>
                  <strong>Valor:</strong> ${Number(gasto.valor).toLocaleString('es-CO')}
                </p>
              </div>

              <div className="gasto-actions">
                <button onClick={() => handleEditar(gasto)} className="btn btn-small btn-secondary">
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(gasto.id)}
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

export default Automatico;
