import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reportesService } from '../services/reportesService';
import { productosService } from '../services/productosService';
import { categoriasService } from '../services/categoriasService';
import { gastosService } from '../services/gastosService';
import toast from 'react-hot-toast';
import { calcularBaseSiguiente, formatearMoneda } from '../utils/reportes';
import './NuevoReporte.css';

/**
 * Página de creación/edición de reporte diario.
 * Incluye formulario completo con gastos y ventas de productos.
 */
const NuevoReporte = ({ esEdicion = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [gastosAutomaticos, setGastosAutomaticos] = useState([]);

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
      const [prodData, catData, gastosAutoData] = await Promise.all([
        productosService.obtenerProductos(),
        categoriasService.obtenerCategorias(),
        gastosService.obtenerAutomaticos(),
      ]);

      // Asegurar que sean arrays
      const productosArray = Array.isArray(prodData) ? prodData : prodData?.results || [];
      const categoriasArray = Array.isArray(catData) ? catData : catData?.results || [];
      const gastosAutoArray = Array.isArray(gastosAutoData)
        ? gastosAutoData
        : gastosAutoData?.results || [];

      setProductos(productosArray);
      setCategorias(categoriasArray);
      setGastosAutomaticos(gastosAutoArray);

      // Inicializar cantidades en 0 para todos los productos
      const cantidadesIniciales = {};
      productosArray.forEach(prod => {
        cantidadesIniciales[prod.id] = 0;
      });

      if (esEdicion && id) {
        // Cargar datos del reporte existente
        const reporteData = await reportesService.getReporte(id);

        // Cargar datos básicos
        setFecha(reporteData.fecha);
        setBaseInicial(reporteData.base_inicial || 0);
        setVentaTotal(reporteData.venta_total || 0);
        setEntrega(reporteData.entrega || 0);
        setObservacion(reporteData.observacion || '');

        // Cargar gastos
        if (reporteData.gastos && reporteData.gastos.length > 0) {
          const gastosFormato = reporteData.gastos.map(g => ({
            descripcion: g.descripcion,
            valor: g.valor,
            categoria: g.categoria ? String(g.categoria) : '', // Guardar como string, el select lo requiere
          }));
          setGastos(gastosFormato);
        }

        // Cargar ventas de productos
        if (reporteData.ventas_productos && reporteData.ventas_productos.length > 0) {
          const cantidadesReporte = { ...cantidadesIniciales };
          reporteData.ventas_productos.forEach(venta => {
            cantidadesReporte[venta.producto] = venta.cantidad;
          });
          setCantidadesProductos(cantidadesReporte);
        } else {
          setCantidadesProductos(cantidadesIniciales);
        }
      } else {
        // Modo creación: cargar último reporte para base inicial
        setCantidadesProductos(cantidadesIniciales);
        const reporteAnterior = await reportesService.obtenerUltimoReporte();
        if (reporteAnterior) {
          setBaseInicial(reporteAnterior.base_siguiente);
        }
      }
    } catch (error) {
      toast.error('Error al cargar datos iniciales');
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

  const agregarGastoAutomatico = gastoAuto => {
    setGastos([
      ...gastos,
      {
        descripcion: gastoAuto.descripcion,
        valor: gastoAuto.valor,
        categoria: gastoAuto.categoria,
      },
    ]);
    toast.success(`Gasto automático "${gastoAuto.descripcion}" agregado`);
  };

  const actualizarGasto = (index, campo, valor) => {
    const nuevosGastos = [...gastos];
    nuevosGastos[index][campo] = valor;
    setGastos(nuevosGastos);
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

      // Filtrar gastos válidos (solo los que tienen valor > 0)
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
        gastos: gastosValidos.map((g, idx) => {
          // Convertir categoría a número
          let categoriaFinal = null;
          if (g.categoria && g.categoria !== '') {
            const categoriaNum = parseInt(g.categoria, 10);
            if (!isNaN(categoriaNum) && categoriaNum > 0) {
              categoriaFinal = categoriaNum;
            }
          }

          console.log(`Gasto ${idx + 1}: descripcion="${g.descripcion}", valor=${g.valor}, categoria="${g.categoria}" -> ${categoriaFinal}`);

          return {
            descripcion: g.descripcion.trim(),
            valor: parseFloat(g.valor),
            categoria: categoriaFinal,
          };
        }),
        ventas_productos: ventasValidas,
      };

      if (esEdicion && id) {
        await reportesService.updateReporte(id, datos);
        toast.success('Reporte actualizado exitosamente');
      } else {
        await reportesService.crearReporte(datos);
        toast.success('Reporte creado exitosamente');
      }
      navigate('/reportes');
    } catch (error) {

      if (error.response?.data) {
        const datos = error.response.data;

        // Manejo específico de reporte duplicado
        if (datos.codigo_error === 'REPORTE_EXISTE') {
          toast.error(
            `Ya existe un reporte para la fecha ${fecha}. Por favor selecciona otra fecha.`
          );
        } else if (datos.error) {
          toast.error(datos.error);
        } else if (datos.mensaje) {
          toast.error(datos.mensaje);
        } else {
          // Si es validación de campos
          Object.keys(datos).forEach(campo => {
            toast.error(`${campo}: ${datos[campo]}`);
          });
        }
      } else {
        toast.error(esEdicion ? 'Error al actualizar el reporte' : 'Error al crear el reporte');
      }
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
      <h1>{esEdicion ? 'Editar Reporte Diario' : 'Nuevo Reporte Diario'}</h1>

      <form onSubmit={handleSubmit} className="reporte-form">
        {/* Datos básicos */}
        <section className="form-section">
          <h2>Datos del Reporte</h2>

          <div className="datos-grid">
            <div className="form-group">
              <label htmlFor="fecha">Fecha *</label>
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                disabled={esEdicion}
                required
              />
              {esEdicion && <small style={{ marginTop: '5px', color: '#666' }}>La fecha no se puede cambiar al editar</small>}
            </div>

            <div className="form-group">
              <label htmlFor="baseInicial">Base Inicial</label>
              <input
                type="text"
                id="baseInicial"
                value={baseInicial}
                onChange={e => {
                  const valor = e.target.value.replace(/[^0-9.]/g, '');
                  setBaseInicial(valor);
                }}
                placeholder="0.00"
              />
              <small>Automático desde el reporte anterior</small>
            </div>

            <div className="form-group">
              <label htmlFor="ventaTotal">Venta Total *</label>
              <input
                type="text"
                id="ventaTotal"
                value={ventaTotal}
                onChange={e => {
                  const valor = e.target.value.replace(/[^0-9.]/g, '');
                  setVentaTotal(valor);
                }}
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="entrega">Entrega</label>
              <input
                type="text"
                id="entrega"
                value={entrega}
                onChange={e => {
                  const valor = e.target.value.replace(/[^0-9.]/g, '');
                  setEntrega(valor);
                }}
                placeholder="0.00"
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
          </div>
        </section>

        {/* Gastos */}
        <section className="form-section">
          <div className="section-header">
            <h2>Gastos del Día</h2>
            <button type="button" onClick={agregarGasto} className="btn btn-action">
              Agregar Gasto
            </button>
          </div>

          {/* Gastos Automáticos disponibles */}
          {gastosAutomaticos.length > 0 && (
            <div className="gastos-automaticos">
              <p className="gastos-automaticos-label">Gastos automáticos disponibles:</p>
              <div className="gastos-automaticos-list">
                {gastosAutomaticos.map(gastoAuto => (
                  <button
                    key={gastoAuto.id}
                    type="button"
                    onClick={() => agregarGastoAutomatico(gastoAuto)}
                    className="btn btn-sm btn-gasto-auto"
                    title={`${gastoAuto.descripcion} - ${formatearMoneda(gastoAuto.valor)}`}
                  >
                    + {gastoAuto.descripcion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gastos.map((gasto, index) => (
            <div key={index} className="item-row">
              <div className="form-group flex-1">
                <input
                  type="text"
                  placeholder="Descripción del gasto"
                  value={gasto.descripcion}
                  onChange={e => actualizarGasto(index, 'descripcion', e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <input
                  type="text"
                  placeholder="Valor"
                  value={gasto.valor}
                  onChange={e => {
                    const valor = e.target.value.replace(/[^0-9.]/g, '');
                    actualizarGasto(index, 'valor', valor);
                  }}
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
                        onClick={() => cambiarCantidadProducto(producto.id, Math.max(0, (cantidadesProductos[producto.id] || 0) - 1))}
                        disabled={cantidadesProductos[producto.id] <= 0}
                        title="Disminuir cantidad"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        className="cantidad-input"
                        value={cantidadesProductos[producto.id] || 0}
                        onChange={e => {
                          const valor = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                          cambiarCantidadProducto(producto.id, valor);
                        }}
                        placeholder="0"
                      />
                      <button
                        type="button"
                        className="btn-contador"
                        onClick={() => cambiarCantidadProducto(producto.id, (cantidadesProductos[producto.id] || 0) + 1)}
                        title="Aumentar cantidad"
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
          <button type="button" onClick={() => navigate('/reportes')} className="btn btn-secondary">
            ✕ Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? '⏳ Guardando...' : '✓ Guardar Reporte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoReporte;
