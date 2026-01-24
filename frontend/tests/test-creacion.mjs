/**
 * Tests de integración para creación de productos y categorías.
 * Verifica que el frontend puede crear elementos correctamente.
 */

import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

let authToken = null;
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

/**
 * Autenticarse como operario de prueba.
 */
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, {
      email: 'operario@mundoreporte.com',
      password: 'operario123',
    });

    authToken = response.data.access;
    log('✓ Login exitoso', 'green');
    return true;
  } catch (error) {
    log(`✗ Error en login: ${error.response?.data?.detail || error.message}`, 'red');
    return false;
  }
}

/**
 * Crear un producto de prueba.
 */
async function testCrearProducto() {
  testResults.total++;

  try {
    const producto = {
      nombre: `Producto Test ${Date.now()}`,
      precio_unitario: 5000,
      precio_venta: 8000,
      stock: 50,
      activo: true,
    };

    const response = await axios.post(`${API_URL}/productos/crear/`, producto, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201) {
      log(
        `✓ Test crear producto: PASÓ (Producto creado: ${response.data.nombre})`,
        'green'
      );
      testResults.passed++;
      return response.data;
    }
  } catch (error) {
    const status = error.response?.status || 'ERR';
    const detail = error.response?.data?.detail || error.message;
    log(`✗ Test crear producto: FALLÓ (${status}): ${detail}`, 'red');
    testResults.failed++;
    return null;
  }
}

/**
 * Crear una categoría de prueba.
 */
async function testCrearCategoria() {
  testResults.total++;

  try {
    const categoria = {
      nombre: `Categoría Test ${Date.now()}`,
      descripcion: 'Categoría creada por test automatizado',
      activa: true,
    };

    const response = await axios.post(`${API_URL}/gastos/categorias/crear/`, categoria, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201) {
      log(
        `✓ Test crear categoría: PASÓ (Categoría creada: ${response.data.nombre})`,
        'green'
      );
      testResults.passed++;
      return response.data;
    }
  } catch (error) {
    const status = error.response?.status || 'ERR';
    const detail = error.response?.data?.detail || error.message;
    log(`✗ Test crear categoría: FALLÓ (${status}): ${detail}`, 'red');
    testResults.failed++;
    return null;
  }
}

/**
 * Listar productos.
 */
async function testListarProductos() {
  testResults.total++;

  try {
    const response = await axios.get(`${API_URL}/productos/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status === 200) {
      const productos = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      log(`✓ Test listar productos: PASÓ (${productos.length} productos)`, 'green');
      testResults.passed++;
      return productos;
    }
  } catch (error) {
    const status = error.response?.status || 'ERR';
    log(`✗ Test listar productos: FALLÓ (${status})`, 'red');
    testResults.failed++;
    return null;
  }
}

/**
 * Listar categorías.
 */
async function testListarCategorias() {
  testResults.total++;

  try {
    const response = await axios.get(`${API_URL}/gastos/categorias/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status === 200) {
      const categorias = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      log(`✓ Test listar categorías: PASÓ (${categorias.length} categorías)`, 'green');
      testResults.passed++;
      return categorias;
    }
  } catch (error) {
    const status = error.response?.status || 'ERR';
    log(`✗ Test listar categorías: FALLÓ (${status})`, 'red');
    testResults.failed++;
    return null;
  }
}

/**
 * Ejecutar todos los tests.
 */
async function runTests() {
  log('\n' + '='.repeat(70), 'blue');
  log('TESTS DE INTEGRACIÓN - CREACIÓN DE PRODUCTOS Y CATEGORÍAS', 'blue');
  log('='.repeat(70) + '\n', 'blue');

  // Login
  log('--- Paso 1: Autenticación ---', 'yellow');
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n✗ No se pudo autenticar. Abortando tests.', 'red');
    process.exit(1);
  }

  log('\n--- Paso 2: Crear Producto ---', 'yellow');
  await testCrearProducto();

  log('\n--- Paso 3: Crear Categoría ---', 'yellow');
  await testCrearCategoria();

  log('\n--- Paso 4: Listar Productos ---', 'yellow');
  await testListarProductos();

  log('\n--- Paso 5: Listar Categorías ---', 'yellow');
  await testListarCategorias();

  // Resumen
  log('\n' + '='.repeat(70), 'blue');
  log('RESUMEN DE TESTS', 'blue');
  log('='.repeat(70), 'blue');
  log(`Total tests: ${testResults.total}`, 'blue');
  log(`Pasados: ${testResults.passed}`, 'green');
  log(`Fallidos: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log('='.repeat(70) + '\n', 'blue');

  if (testResults.failed > 0) {
    log('⚠️  Algunos tests fallaron. Revisa los errores arriba.', 'yellow');
    process.exit(1);
  } else {
    log('✓ TODOS LOS TESTS PASARON EXITOSAMENTE', 'green');
    process.exit(0);
  }
}

// Ejecutar tests
runTests().catch(error => {
  log(`\n✗ Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
