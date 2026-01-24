import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportesService } from '../services/reportesService';
import { productosService } from '../services/productosService';
import { categoriasService } from '../services/categoriasService';
import toast from 'react-hot-toast';
import { calcularBaseSiguiente, formatearMoneda } from '../utils/reportes';
import './NuevoReporte.css';

/**
 * Página de creación de nuevo reporte diario.
 * Incluye formulario completo con gastos y ventas de productos.
 */
const NuevoReporte = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Datos del reporte
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [baseInicial, setBaseInicial] = useState(0);
  const [ventaTotal, setVentaTotal] = useState(0);
  const [entrega, setEntrega] = useState(0);
  const [observacion, setObservacion] = useState('');

  // Arrays dinámicos
  const [gastos, setGastos] = useState([{ descripcion: '', valor: 0, categoria: '' }]);
  // Cambiado: ventas ahora es un objeto con ID de producto como clave
  const [cantidadesProductos, setCantidadesProductos] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prodData, catData, reporteAnterior] = await Promise.all([
        productosService.obtenerProductos(),
        categoriasService.obtenerCategorias(),
        reportesService.obtenerUltimoReporte(),
      ]);

      setProductos(prodData);
      setCategorias(catData);

      // Inicializar cantidades en 0 para todos los productos
      const cantidadesIniciales = {};
      prodData.forEach(prod => {
        cantidadesIniciales[prod.id] = 0;
      });
      setCantidadesProductos(cantidadesIniciales);

      // Base inicial es la base siguiente del reporte anterior
      if (reporteAnterior) {
        setBaseInicial(reporteAnterior.base_siguiente);
      }
    } catch (error) {
      toast.error('Error al cargar datos iniciales');
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const agregarGasto = () => {
    setGastos([...gastos, { descripcion: '', valor: 0, categoria: '' }]);
  };

  const eliminarGasto = index => {
    setGastos(gastos.filter((_, i) => i !== index));
  };

  const actualizarGasto = (index, campo, valor) => {
    const nuevosGastos = [...gastos];
    nuevosGastos[index][campo] = valor;
    setGastos(nuevosGastos);
  };

  // Nuevas funciones para manejar cantidades de productos
  const incrementarProducto = idProducto => {
    setCantidadesProductos(prev => ({
      ...prev,
      [idProducto]: (prev[idProducto] || 0) + 1,
    }));
  };

  const decrementarProducto = idProducto => {
    setCantidadesProductos(prev => ({
      ...prev,
      [idProducto]: Math.max(0, (prev[idProducto] || 0) - 1),
    }));
  };

  const cambiarCantidadProducto = (idProducto, valor) => {
    const cantidad = parseInt(valor) || 0;
    setCantidadesProductos(prev => ({
      ...prev,
      [idProducto]: Math.max(0, cantidad),
    }));
  };

  const calcularTotalGastos = () => {
    return gastos.reduce((sum, gasto) => sum + parseFloat(gasto.valor || 0), 0);
  };

  const calcularBaseSiguientePreview = () => {
    const totalGastos = calcularTotalGastos();
    return calcularBaseSiguiente(
      parseFloat(baseInicial || 0),
      parseFloat(ventaTotal || 0),
      totalGastos,
      parseFloat(entrega || 0)
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validaciones
    if (!fecha) {
      toast.error('La fecha es obligatoria');
      return;
    }

    if (parseFloat(ventaTotal) < 0) {
      toast.error('La venta total no puede ser negativa');
      return;
    }

    // Validar que los gastos con valor tengan descripción
    const gastosInvalidos = gastos.some(g => parseFloat(g.valor) > 0 && !g.descripcion.trim());
    if (gastosInvalidos) {
      toast.error('Todos los gastos deben tener descripción');
      return;
    }

    try {
      setLoading(true);

      // Filtrar gastos válidos
      const gastosValidos = gastos.filter(g => parseFloat(g.valor) > 0 && g.descripcion.trim());

      // Convertir cantidades de productos a array
      const ventasValidas = Object.entries(cantidadesProductos)
        .filter(([, cantidad]) => cantidad > 0)
        .map(([idProducto, cantidad]) => ({
          producto: parseInt(idProducto),
          cantidad: cantidad,
        }));

      const datos = {
        fecha,
        base_inicial: parseFloat(baseInicial || 0),
        venta_total: parseFloat(ventaTotal || 0),
        entrega: parseFloat(entrega || 0),
        observacion: observacion.trim(),
        gastos: gastosValidos.map(g => ({
          descripcion: g.descripcion,
          valor: parseFloat(g.valor),
          categoria: g.categoria || null,
        })),
        ventas_productos: ventasValidas,
      };

      await reportesService.crearReporte(datos);
      toast.success('Reporte creado exitosamente');
      navigate('/reportes');
    } catch (error) {
      if (error.response?.data) {
        const errores = error.response.data;
        Object.keys(errores).forEach(campo => {
          toast.error(`${campo}: ${errores[campo]}`);
        });
      } else {
        toast.error('Error al crear el reporte');
      }
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="nuevo-reporte-container">
      <h1>Nuevo Reporte Diario</h1>

      <form onSubmit={handleSubmit} className="reporte-form">
        {/* Datos básicos */}
        <section className="form-section">
          <h2>Datos del Reporte</h2>

          <div className="form-group">
            <label htmlFor="fecha">Fecha *</label>
            <input
              type="date"
              id="fecha"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="baseInicial">Base Inicial</label>
            <input
              type="number"
              id="baseInicial"
              value={baseInicial}
              onChange={e => setBaseInicial(e.target.value)}
              step="0.01"
              min="0"
            />
            <small>Automático desde el reporte anterior</small>
          </div>

          <div className="form-group">
            <label htmlFor="ventaTotal">Venta Total *</label>
            <input
              type="number"
              id="ventaTotal"
              value={ventaTotal}
              onChange={e => setVentaTotal(e.target.value)}
              required
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="entrega">Entrega</label>
            <input
              type="number"
              id="entrega"
              value={entrega}
              onChange={e => setEntrega(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="observacion">Observación</label>
            <textarea
              id="observacion"
              value={observacion}
              onChange={e => setObservacion(e.target.value)}
              rows="3"
              placeholder="Notas adicionales del día..."
            />
          </div>
        </section>

        {/* Gastos */}
        <section className="form-section">
          <div className="section-header">
            <h2>Gastos del Día</h2>
            <button type="button" onClick={agregarGasto} className="btn-secondary">
              + Agregar Gasto
            </button>
          </div>

          {gastos.map((gasto, index) => (
            <div key={index} className="item-row">
              <div className="form-group flex-2">
                <input
                  type="text"
                  placeholder="Descripción del gasto"
                  value={gasto.descripcion}
                  onChange={e => actualizarGasto(index, 'descripcion', e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <input
                  type="number"
                  placeholder="Valor"
                  value={gasto.valor}
                  onChange={e => actualizarGasto(index, 'valor', e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group flex-1">
                <select
                  value={gasto.categoria}
                  onChange={e => actualizarGasto(index, 'categoria', e.target.value)}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {gastos.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarGasto(index)}
                  className="btn-delete"
                  title="Eliminar gasto"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <div className="total-row">
            <strong>Total Gastos:</strong>
            <span>{formatearMoneda(calcularTotalGastos())}</span>
          </div>
        </section>

        {/* Ventas de Productos */}
        <section className="form-section">
          <div className="section-header">
            <h2>Ventas de Productos</h2>
            <small>Indica la cantidad vendida de cada producto</small>
          </div>

          <div className="productos-grid">
            {productos.length === 0 ? (
              <p className="text-muted">
                No hay productos disponibles. Crea productos en la sección de Productos.
              </p>
            ) : (
              productos
                .filter(p => p.activo)
                .map(producto => (
                  <div key={producto.id} className="producto-item">
                    <div className="producto-info">
                      <strong>{producto.nombre}</strong>
                      <span className="producto-precio">
                        ${Number(producto.precio_unitario).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="producto-contador">
                      <button
                        type="button"
                        className="btn-contador"
                        onClick={() => decrementarProducto(producto.id)}
                        disabled={!cantidadesProductos[producto.id]}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="cantidad-input"
                        value={cantidadesProductos[producto.id] || 0}
                        onChange={e => cambiarCantidadProducto(producto.id, e.target.value)}
                        min="0"
                      />
                      <button
                        type="button"
                        className="btn-contador"
                        onClick={() => incrementarProducto(producto.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

        {/* Resumen */}
        <section className="form-section resumen">
          <h2>Resumen</h2>
          <div className="resumen-grid">
            <div className="resumen-item">
              <span>Base Inicial:</span>
              <strong>{formatearMoneda(parseFloat(baseInicial || 0))}</strong>
            </div>
            <div className="resumen-item">
              <span>Venta Total:</span>
              <strong>{formatearMoneda(parseFloat(ventaTotal || 0))}</strong>
            </div>
            <div className="resumen-item">
              <span>Total Gastos:</span>
              <strong className="negativo">-{formatearMoneda(calcularTotalGastos())}</strong>
            </div>
            <div className="resumen-item">
              <span>Entrega:</span>
              <strong className="negativo">-{formatearMoneda(parseFloat(entrega || 0))}</strong>
            </div>
            <div className="resumen-item destacado">
              <span>Base Siguiente:</span>
              <strong>{formatearMoneda(calcularBaseSiguientePreview())}</strong>
            </div>
          </div>
        </section>

        {/* Botones */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/reportes')} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : 'Guardar Reporte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoReporte;
