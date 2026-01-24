#!/usr/bin/env node
/**
 * Script de verificación de endpoints del API.
 * Verifica que todos los endpoints respondan correctamente.
 */

import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
const testResults = [];

// Colores para consola
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

const testEndpoint = async (method, endpoint, data = null, description) => {
  try {
    let response;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    switch (method.toUpperCase()) {
      case 'GET':
        response = await axios.get(`${API_URL}${endpoint}`, config);
        break;
      case 'POST':
        response = await axios.post(`${API_URL}${endpoint}`, data, config);
        break;
      case 'PUT':
        response = await axios.put(`${API_URL}${endpoint}`, data, config);
        break;
      case 'DELETE':
        response = await axios.delete(`${API_URL}${endpoint}`, config);
        break;
      default:
        throw new Error(`Método HTTP no soportado: ${method}`);
    }

    testResults.push({
      success: true,
      method,
      endpoint,
      status: response.status,
      description,
    });

    log(`✓ ${method} ${endpoint} - ${description} (${response.status})`, 'green');
    return response.data;
  } catch (error) {
    const status = error.response?.status || 'ERR';
    const errorMsg = error.response?.data?.detail || error.message;

    testResults.push({
      success: false,
      method,
      endpoint,
      status,
      description,
      error: errorMsg,
    });

    log(`✗ ${method} ${endpoint} - ${description} (${status}): ${errorMsg}`, 'red');
    return null;
  }
};

const runTests = async () => {
  log('\n=== Verificación de Endpoints del API ===\n', 'blue');

  // Endpoints públicos (sin autenticación)
  log('\n--- Endpoints Públicos ---', 'yellow');
  
  await testEndpoint('GET', '/productos/', null, 'Listar productos');
  await testEndpoint('GET', '/gastos/categorias/', null, 'Listar categorías');
  await testEndpoint('GET', '/reportes/', null, 'Listar reportes');

  // Endpoints de creación (requieren autenticación, esperamos 401)
  log('\n--- Endpoints de Creación (esperamos 401 sin auth) ---', 'yellow');
  
  await testEndpoint(
    'POST',
    '/productos/crear/',
    { nombre: 'Test', precio_venta: 1000, stock: 10 },
    'Crear producto'
  );
  
  await testEndpoint(
    'POST',
    '/gastos/categorias/crear/',
    { nombre: 'Test', descripcion: 'Test', activa: true },
    'Crear categoría'
  );
  
  await testEndpoint(
    'POST',
    '/reportes/crear/',
    { fecha: '2026-01-24', base_inicial: 100000 },
    'Crear reporte'
  );

  // Resumen
  log('\n=== Resumen ===\n', 'blue');
  
  const successful = testResults.filter(r => r.success || r.status === 401).length;
  const failed = testResults.filter(r => !r.success && r.status !== 401).length;
  
  log(`Total pruebas: ${testResults.length}`, 'blue');
  log(`Exitosas o esperadas: ${successful}`, 'green');
  log(`Fallidas inesperadas: ${failed}`, failed > 0 ? 'red' : 'green');

  if (failed > 0) {
    log('\n⚠️  Algunos endpoints tienen errores inesperados', 'yellow');
    process.exit(1);
  } else {
    log('\n✓ Todos los endpoints responden correctamente', 'green');
    process.exit(0);
  }
};

// Ejecutar tests
runTests().catch(error => {
  log(`\n✗ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});
