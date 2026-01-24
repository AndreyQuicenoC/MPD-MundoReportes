/**
 * Test final para verificar que todos los endpoints funcionen correctamente.
 */

import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';
let token = '';

async function login() {
  console.log('\n=== LOGIN ===');
  try {
    const response = await axios.post(`${API_URL}/usuarios/login/`, {
      username: 'operario1',
      password: 'admin1234',
    });
    token = response.data.token;
    console.log('✅ Login exitoso');
    return token;
  } catch (error) {
    console.log('❌ Error en login:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testDashboard() {
  console.log('\n=== DASHBOARD ===');
  try {
    const response = await axios.get(`${API_URL}/estadisticas/dashboard/`, {
      headers: { Authorization: `Token ${token}` },
    });
    console.log('✅ Dashboard cargado correctamente');
    console.log(`   Total ventas mes: $${response.data.total_ventas_mes.toLocaleString('es-CO')}`);
    console.log(
      `   Total gastos mes: $${response.data.total_gastos_mes.toLocaleString('es-CO')}`
    );
    console.log(`   Cantidad reportes: ${response.data.cantidad_reportes}`);
    console.log(
      `   Promedio diario: $${response.data.promedio_ventas_diarias.toLocaleString('es-CO')}`
    );

    if (response.data.total_ventas_mes === 0) {
      console.log('⚠️  ADVERTENCIA: Dashboard muestra 0 ventas');
    }
  } catch (error) {
    console.log('❌ Error en dashboard:', error.response?.data || error.message);
  }
}

async function testReportes() {
  console.log('\n=== REPORTES ===');
  try {
    const response = await axios.get(`${API_URL}/reportes/`, {
      headers: { Authorization: `Token ${token}` },
    });
    console.log(`✅ Reportes: ${response.data.length} reportes encontrados`);

    if (response.data.length > 0) {
      const reporte = response.data[0];
      console.log(`   Primer reporte:`);
      console.log(`     - Fecha: ${reporte.fecha}`);
      console.log(
        `     - Base inicial: ${reporte.base_inicial ? '$' + reporte.base_inicial.toLocaleString('es-CO') : 'NO DEFINIDA'}`
      );
      console.log(`     - Venta total: $${reporte.venta_total.toLocaleString('es-CO')}`);
      console.log(`     - Total gastos: $${reporte.total_gastos.toLocaleString('es-CO')}`);

      if (!reporte.base_inicial) {
        console.log('   ❌ ERROR: base_inicial no está presente');
      }
    }
  } catch (error) {
    console.log('❌ Error en reportes:', error.response?.data || error.message);
  }
}

async function testProductosMasVendidos() {
  console.log('\n=== PRODUCTOS MÁS VENDIDOS ===');
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await axios.get(`${API_URL}/estadisticas/productos/mas-vendidos/`, {
      headers: { Authorization: `Token ${token}` },
      params: {
        fecha_inicio: hace30Dias,
        fecha_fin: hoy,
        limite: 100,
      },
    });

    console.log(`✅ Productos: ${response.data.length} productos encontrados`);

    if (response.data.length > 0) {
      console.log(`   Top 5 productos:`);
      response.data.slice(0, 5).forEach((p, i) => {
        console.log(
          `   ${i + 1}. ${p.producto} - ${p.cantidad_total} unidades ($${p.valor_total.toLocaleString('es-CO')})`
        );
      });
    } else {
      console.log('   ⚠️  No hay productos vendidos en el periodo');
    }
  } catch (error) {
    console.log('❌ Error en productos:', error.response?.data || error.message);
  }
}

async function testVentasMensuales() {
  console.log('\n=== VENTAS MENSUALES ===');
  try {
    const response = await axios.get(`${API_URL}/estadisticas/ventas/mensuales/`, {
      headers: { Authorization: `Token ${token}` },
    });

    console.log(`✅ Ventas mensuales: ${response.data.length} meses encontrados`);

    if (response.data.length > 0) {
      console.log(`   Últimos meses:`);
      response.data.forEach(v => {
        console.log(
          `   ${v.mes}/${v.anio}: $${v.total_ventas.toLocaleString('es-CO')} (${v.cantidad_reportes} reportes)`
        );
      });
    } else {
      console.log('   ⚠️  No hay ventas mensuales');
    }
  } catch (error) {
    console.log('❌ Error en ventas mensuales:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   TEST FINAL - VERIFICACIÓN COMPLETA      ║');
  console.log('╚════════════════════════════════════════════╝');

  await login();
  await testDashboard();
  await testReportes();
  await testProductosMasVendidos();
  await testVentasMensuales();

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   TESTS COMPLETADOS                        ║');
  console.log('╚════════════════════════════════════════════╝\n');
}

runTests();
