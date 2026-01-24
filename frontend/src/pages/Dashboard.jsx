/**
 * Página del Dashboard principal.
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import estadisticasService from '../services/estadisticasService';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const data = await estadisticasService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return <div className="alert alert-error">No se pudo cargar el dashboard</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="dashboard-subtitle">Resumen del mes: {dashboard.mes_actual}</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Ventas del Mes</h3>
          <p className="dashboard-value">${Number(dashboard.total_ventas_mes).toLocaleString('es-CO')}</p>
        </div>

        <div className="dashboard-card">
          <h3>Gastos del Mes</h3>
          <p className="dashboard-value">${Number(dashboard.total_gastos_mes).toLocaleString('es-CO')}</p>
        </div>

        <div className="dashboard-card">
          <h3>Promedio Diario</h3>
          <p className="dashboard-value">${Number(dashboard.promedio_ventas_diarias).toLocaleString('es-CO')}</p>
        </div>

        <div className="dashboard-card">
          <h3>Reportes Registrados</h3>
          <p className="dashboard-value">{dashboard.cantidad_reportes}</p>
        </div>
      </div>

      {dashboard.categoria_mayor_gasto && (
        <div className="card">
          <h3>Categoría con Mayor Gasto</h3>
          <p>
            <strong>{dashboard.categoria_mayor_gasto.categoria}</strong>: $
            {Number(dashboard.categoria_mayor_gasto.total).toLocaleString('es-CO')}
          </p>
        </div>
      )}

      {dashboard.productos_mas_vendidos && dashboard.productos_mas_vendidos.length > 0 && (
        <div className="card">
          <h3>Productos Más Vendidos</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.productos_mas_vendidos.map((producto, index) => (
                <tr key={index}>
                  <td>{producto.producto}</td>
                  <td>{producto.cantidad_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
