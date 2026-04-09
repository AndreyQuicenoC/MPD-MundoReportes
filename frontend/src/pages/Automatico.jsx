import { useState, useEffect } from 'react';
import api from '../services/api';
import FormModal from '../components/FormModal';
import Pagination from '../components/Pagination';
import ModalConfirmacion from '../components/ModalConfirmacion';
import toast from 'react-hot-toast';
import './Automatico.css';

/**
 * Página de gestión de gastos automáticos predefinidos.
 * Permite crear, editar y eliminar gastos que se pueden insertar automáticamente en reportes.
 */
const Automatico = () => {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [gastoEditando, setGastoEditando] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const itemsPorPagina = 10;

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
      setPaginaActual(1);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar gastos automáticos');
      setGastos([]);
    } finally {
      setLoading(false);
    }
  };

  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const gastosPaginados = gastos.slice(indiceInicio, indiceFin);

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

      if (gastoEditando) {
        await api.patch(`/gastos/automaticos/${gastoEditando.id}/`, datos);
        toast.success('Gasto automático actualizado');
      } else {
        await api.post('/gastos/automaticos/', datos);
        toast.success('Gasto automático creado');
      }

      setFormData({ categoria: '', descripcion: '', valor: '', activo: true });
      setGastoEditando(null);
      setMostrarForm(false);
      cargarDatos();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      toast.error('Error al guardar gasto automático');
    }
  };

  const handleEditar = gasto => {
    setGastoEditando(gasto);
    setFormData({
      categoria: gasto.categoria,
      descripcion: gasto.descripcion,
      valor: gasto.valor,
      activo: gasto.activo,
    });
    setMostrarForm(true);
  };

  const handleEliminar = id => {
    setIdAEliminar(id);
    setMostrarConfirmacion(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await api.delete(`/gastos/automaticos/${idAEliminar}/`);
      toast.success('Gasto automático eliminado');
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
    setMostrarForm(false);
    setGastoEditando(null);
    setFormData({ categoria: '', descripcion: '', valor: '', activo: true });
  };

  const getNombreCategoria = id => {
    return categorias.find(c => c.id === id)?.nombre || 'Sin categoría';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="automatico-container">
      <div className="page-header-flex">
        <div className="header-content">
          <h1>Gastos Automáticos</h1>
          <p>Define gastos predefinidos que se pueden insertar rápidamente en reportes</p>
        </div>
        {!mostrarForm && (
          <button onClick={() => setMostrarForm(true)} className="btn btn-primary">
            + Nuevo Gasto
          </button>
        )}
      </div>

      <FormModal
        isOpen={mostrarForm}
        titulo={gastoEditando ? 'Editar Gasto Automático' : 'Nuevo Gasto Automático'}
        submitText={gastoEditando ? 'Actualizar' : 'Crear'}
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

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleInputChange}
            />
            Gasto activo
          </label>
        </div>
      </FormModal>

      {gastos.length === 0 ? (
        <div className="empty-state">
          <p>No hay gastos automáticos. Crea uno para comenzar.</p>
        </div>
      ) : (
        <>
          <div className="gastos-grid">
            {gastosPaginados.map(gasto => (
              <div key={gasto.id} className="gasto-card">
                <div className="card-content">
                  <h3>{gasto.descripcion}</h3>
                  <p className="valor">${Number(gasto.valor).toLocaleString('es-CO')}</p>
                  <p className="categoria">{getNombreCategoria(gasto.categoria)}</p>
                  <span className={`badge ${gasto.activo ? 'badge-success' : 'badge-danger'}`}>
                    {gasto.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEditar(gasto)}
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleEliminar(gasto.id)}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {gastos.length > 0 && (
            <Pagination
              paginaActual={paginaActual}
              totalItems={gastos.length}
              itemsPorPagina={itemsPorPagina}
              onPaginaChange={setPaginaActual}
            />
          )}
        </>
      )}

      <ModalConfirmacion
        isOpen={mostrarConfirmacion}
        titulo="Eliminar Gasto Automático"
        mensaje="¿Estás seguro de que deseas eliminar este gasto automático? Esta acción no se puede deshacer."
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

export default Automatico;
