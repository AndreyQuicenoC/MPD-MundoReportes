/**
 * Test rápido para verificar endpoints de estadísticas y dashboard
 */

import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Credenciales de prueba
const LOGIN = {
  email: 'operario@mundoreporte.com',
  password: 'operario123',
};

let token = '';

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, LOGIN);
    token = response.data.access;
    console.log('✓ Login exitoso');
    return token;
  } catch (error) {
    console.error('✗ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

async function testDashboard() {
  try {
    const response = await axios.get(`${API_URL}/estadisticas/dashboard/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('\n=== DASHBOARD ===');
    console.log('Mes actual:', response.data.mes_actual);
    console.log('Total ventas mes:', response.data.total_ventas_mes);
    console.log('Total gastos mes:', response.data.total_gastos_mes);
    console.log('Promedio diario:', response.data.promedio_ventas_diarias);
    console.log('Cantidad reportes:', response.data.cantidad_reportes);
    console.log('Categoría mayor gasto:', response.data.categoria_mayor_gasto);
    console.log('Productos más vendidos:', response.data.productos_mas_vendidos);
    return response.data;
  } catch (error) {
    console.error('✗ Error en dashboard:', error.response?.data || error.message);
    throw error;
  }
}

async function testReportes() {
  try {
    const response = await axios.get(`${API_URL}/reportes/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const reportes = Array.isArray(response.data) ? response.data : response.data?.results || [];
    console.log('\n=== REPORTES ===');
    console.log(`Total reportes: ${reportes.length}`);
    reportes.forEach((r, i) => {
      console.log(`\nReporte ${i + 1}:`);
      console.log('  Fecha:', r.fecha);
      console.log('  Venta total:', r.venta_total);
      console.log('  Total gastos:', r.total_gastos);
      console.log('  Base inicial:', r.base_inicial);
      console.log('  Base siguiente:', r.base_siguiente);
    });
    return reportes;
  } catch (error) {
    console.error('✗ Error en reportes:', error.response?.data || error.message);
    throw error;
  }
}

async function testEstadisticasVentas() {
  try {
    const response = await axios.get(`${API_URL}/estadisticas/ventas/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('\n=== ESTADÍSTICAS VENTAS ===');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('✗ Error en estadísticas ventas:', error.response?.data || error.message);
    throw error;
  }
}

async function testProductosMasVendidos() {
  try {
    const response = await axios.get(`${API_URL}/estadisticas/productos/mas-vendidos/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('\n=== PRODUCTOS MÁS VENDIDOS ===');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('✗ Error en productos más vendidos:', error.response?.data || error.message);
    throw error;
  }
}

async function testVentasMensuales() {
  try {
    const response = await axios.get(`${API_URL}/estadisticas/ventas/mensuales/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('\n=== VENTAS MENSUALES ===');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('✗ Error en ventas mensuales:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  console.log('==========================================');
  console.log('TEST DE DIAGNÓSTICO - ESTADÍSTICAS');
  console.log('==========================================\n');

  try {
    await login();
    await testReportes();
    await testDashboard();
    await testEstadisticasVentas();
    await testProductosMasVendidos();
    await testVentasMensuales();

    console.log('\n==========================================');
    console.log('✓ TODOS LOS TESTS COMPLETADOS');
    console.log('==========================================\n');
  } catch (error) {
    console.log('\n==========================================');
    console.log('✗ TESTS FALLIDOS');
    console.log('==========================================\n');
    process.exit(1);
  }
}

runTests();
