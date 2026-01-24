/**
 * Tests para verificar que estadísticas y dashboard cargan datos correctamente.
 * 
 * Verifica:
 * - Dashboard muestra datos del mes
 * - Estadísticas incluyen todos los campos (total_gastos, total_entregas)
 * - Gráficos reciben datos en formato correcto
 * - Reportes incluyen base_inicial
 */

import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
let authToken = null;

/**
 * Login para obtener token de autenticación.
 */
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, {
      email: 'operario@mundoreporte.com',
      password: 'operario123',
    });
    authToken = response.data.access;
    console.log('✓ Login exitoso');
    return true;
  } catch (error) {
    console.error('✗ Error en login:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test: Dashboard devuelve datos del mes.
 */
async function testDashboard() {
  try {
    const response = await axios.get(`${API_URL}/estadisticas/dashboard/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log('\n--- Test Dashboard ---');
    console.log('Status:', response.status);
    console.log('Datos:', response.data);

    // Verificar campos requeridos
    const requiredFields = [
      'total_ventas_mes',
      'total_gastos_mes',
      'promedio_ventas_diarias',
      'cantidad_reportes',
    ];

    const missingFields = requiredFields.filter(field => !(field in response.data));
    
    if (missingFields.length > 0) {
      console.error('✗ Faltan campos en dashboard:', missingFields);
      return false;
    }

    // Verificar que los valores no sean undefined o null
    const nullFields = requiredFields.filter(field => 
      response.data[field] === null || response.data[field] === undefined
    );

    if (nullFields.length > 0) {
      console.error('✗ Campos con valores null/undefined:', nullFields);
      return false;
    }

    console.log('✓ Dashboard tiene todos los campos requeridos');
    console.log(`  - Total ventas mes: $${response.data.total_ventas_mes}`);
    console.log(`  - Total gastos mes: $${response.data.total_gastos_mes}`);
    console.log(`  - Promedio diario: $${response.data.promedio_ventas_diarias}`);
    console.log(`  - Cantidad reportes: ${response.data.cantidad_reportes}`);
    
    return true;
  } catch (error) {
    console.error('✗ Error al obtener dashboard:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test: Estadísticas de ventas incluye total_gastos y total_entregas.
 */
async function testEstadisticasVentas() {
  try {
    const response = await axios.get(`${API_URL}/estadisticas/ventas/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log('\n--- Test Estadísticas Ventas ---');
    console.log('Status:', response.status);
    console.log('Datos:', response.data);

    const requiredFields = [
      'total_ventas',
      'promedio_ventas',
      'total_gastos',
      'total_entregas',
      'total_reportes',
      'cantidad_reportes',
    ];

    const missingFields = requiredFields.filter(field => !(field in response.data));
    
    if (missingFields.length > 0) {
      console.error('✗ Faltan campos en estadísticas:', missingFields);
      return false;
    }

    console.log('✓ Estadísticas tienen todos los campos');
    console.log(`  - Total ventas: $${response.data.total_ventas}`);
    console.log(`  - Total gastos: $${response.data.total_gastos}`);
    console.log(`  - Total entregas: $${response.data.total_entregas}`);
    console.log(`  - Total reportes: ${response.data.total_reportes}`);

    return true;
  } catch (error) {
    console.error('✗ Error al obtener estadísticas:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test: Gastos por categoría devuelve datos.
 */
async function testGastosPorCategoria() {
  try {
    const response = await axios.get(`${API_URL}/estadisticas/gastos/categorias/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log('\n--- Test Gastos por Categoría ---');
    console.log('Status:', response.status);
    console.log('Cantidad de categorías:', response.data.length);

    if (!Array.isArray(response.data)) {
      console.error('✗ Respuesta no es un array');
      return false;
    }

    if (response.data.length > 0) {
      console.log('Primera categoría:', response.data[0]);
      
      const firstCategory = response.data[0];
      if (!('categoria' in firstCategory) || !('total' in firstCategory)) {
        console.error('✗ Falta estructura en categoría');
        return false;
      }
    }

    console.log('✓ Gastos por categoría OK');
    return true;
  } catch (error) {
    console.error('✗ Error al obtener gastos por categoría:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test: Productos más vendidos devuelve datos.
 */
async function testProductosMasVendidos() {
  try {
    const response = await axios.get(`${API_URL}/estadisticas/productos/mas-vendidos/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log('\n--- Test Productos Más Vendidos ---');
    console.log('Status:', response.status);
    console.log('Cantidad de productos:', response.data.length);

    if (!Array.isArray(response.data)) {
      console.error('✗ Respuesta no es un array');
      return false;
    }

    if (response.data.length > 0) {
      console.log('Primer producto:', response.data[0]);
      
      const firstProduct = response.data[0];
      if (!('producto' in firstProduct) || !('cantidad_total' in firstProduct)) {
        console.error('✗ Falta estructura en producto');
        return false;
      }
    }

    console.log('✓ Productos más vendidos OK');
    return true;
  } catch (error) {
    console.error('✗ Error al obtener productos más vendidos:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test: Ventas mensuales tiene formato correcto (mes y año separados).
 */
async function testVentasMensuales() {
  try {
    const response = await axios.get(`${API_URL}/estadisticas/ventas/mensuales/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log('\n--- Test Ventas Mensuales ---');
    console.log('Status:', response.status);
    console.log('Cantidad de meses:', response.data.length);

    if (!Array.isArray(response.data)) {
      console.error('✗ Respuesta no es un array');
      return false;
    }

    if (response.data.length > 0) {
      console.log('Primer mes:', response.data[0]);
      
      const firstMonth = response.data[0];
      
      // Verificar que mes y año son números, no strings
      if (typeof firstMonth.mes !== 'number' || typeof firstMonth.anio !== 'number') {
        console.error('✗ mes y anio deben ser números, no strings');
        console.error('  mes es:', typeof firstMonth.mes);
        console.error('  anio es:', typeof firstMonth.anio);
        return false;
      }

      if (!('total_ventas' in firstMonth)) {
        console.error('✗ Falta total_ventas');
        return false;
      }
    }

    console.log('✓ Ventas mensuales formato correcto');
    return true;
  } catch (error) {
    console.error('✗ Error al obtener ventas mensuales:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test: Lista de reportes incluye base_inicial.
 */
async function testListaReportes() {
  try {
    const response = await axios.get(`${API_URL}/reportes/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log('\n--- Test Lista Reportes ---');
    console.log('Status:', response.status);

    // Puede ser array directo o paginado
    const reportes = Array.isArray(response.data) ? response.data : response.data.results || [];
    
    console.log('Cantidad de reportes:', reportes.length);

    if (reportes.length > 0) {
      console.log('Primer reporte:', reportes[0]);
      
      const firstReport = reportes[0];
      
      if (!('base_inicial' in firstReport)) {
        console.error('✗ Falta base_inicial en reporte');
        console.error('  Campos disponibles:', Object.keys(firstReport));
        return false;
      }

      if (firstReport.base_inicial === null || firstReport.base_inicial === undefined) {
        console.error('✗ base_inicial es null o undefined');
        return false;
      }

      console.log(`  Base inicial: $${firstReport.base_inicial}`);
    }

    console.log('✓ Lista de reportes incluye base_inicial');
    return true;
  } catch (error) {
    console.error('✗ Error al obtener lista de reportes:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Ejecutar todos los tests.
 */
async function runTests() {
  console.log('==========================================');
  console.log('TESTS DE ESTADÍSTICAS Y DASHBOARD');
  console.log('==========================================\n');

  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('\n✗ No se pudo autenticar. Abortando tests.');
    return;
  }

  // Ejecutar tests
  const results = {
    dashboard: await testDashboard(),
    estadisticas: await testEstadisticasVentas(),
    gastos: await testGastosPorCategoria(),
    productos: await testProductosMasVendidos(),
    ventas: await testVentasMensuales(),
    reportes: await testListaReportes(),
  };

  // Resumen
  console.log('\n==========================================');
  console.log('RESUMEN DE TESTS');
  console.log('==========================================');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([name, result]) => {
    console.log(`${result ? '✓' : '✗'} ${name}`);
  });

  console.log('\n==========================================');
  console.log(`Total tests: ${total}`);
  console.log(`Pasados: ${passed}`);
  console.log(`Fallidos: ${total - passed}`);
  console.log('==========================================\n');

  if (passed === total) {
    console.log('✓ TODOS LOS TESTS PASARON EXITOSAMENTE');
  } else {
    console.error('✗ ALGUNOS TESTS FALLARON');
  }
}

// Ejecutar tests
runTests();
