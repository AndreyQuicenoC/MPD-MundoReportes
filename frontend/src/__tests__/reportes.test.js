import { describe, it, expect } from 'vitest';
import { calcularBaseInicial } from '../utils/reportes';

/**
 * Tests de utilidades de reportes.
 */
describe('Utilidades de Reportes', () => {
  it('calcula la base inicial correctamente', () => {
    const reporteAnterior = {
      base_siguiente: 150000,
    };

    const baseInicial = calcularBaseInicial(reporteAnterior);
    expect(baseInicial).toBe(150000);
  });

  it('retorna 0 si no hay reporte anterior', () => {
    const baseInicial = calcularBaseInicial(null);
    expect(baseInicial).toBe(0);
  });
});
