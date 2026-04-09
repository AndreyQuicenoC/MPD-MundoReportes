import React from 'react';
import './Pagination.css';

/**
 * Componente de paginación reutilizable.
 *
 * Props:
 *  - paginaActual: número de página actual (basado en 1)
 *  - totalItems: total de items a paginar
 *  - itemsPorPagina: cantidad de items por página
 *  - onPaginaChange: callback cuando cambia la página
 */
const Pagination = ({ paginaActual, totalItems, itemsPorPagina, onPaginaChange }) => {
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina);

  if (totalPaginas <= 1) {
    return null; // No mostrar paginación si cabe en una página
  }

  const handleAnterior = () => {
    if (paginaActual > 1) {
      onPaginaChange(paginaActual - 1);
    }
  };

  const handleSiguiente = () => {
    if (paginaActual < totalPaginas) {
      onPaginaChange(paginaActual + 1);
    }
  };

  const handlePagina = (pagina) => {
    onPaginaChange(pagina);
  };

  // Generar números de página (mostrar máx 5 números)
  const getNumerosPagina = () => {
    const numeros = [];
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, paginaActual + 2);

    if (inicio > 1) {
      numeros.push(1);
      if (inicio > 2) numeros.push('...');
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    if (fin < totalPaginas) {
      if (fin < totalPaginas - 1) numeros.push('...');
      numeros.push(totalPaginas);
    }

    return numeros;
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn"
        onClick={handleAnterior}
        disabled={paginaActual === 1}
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      <div className="pagination-numeros">
        {getNumerosPagina().map((numero, idx) => (
          numero === '...' ? (
            <span key={`dots-${idx}`} className="pagination-dots">
              ...
            </span>
          ) : (
            <button
              key={numero}
              className={`pagination-numero ${paginaActual === numero ? 'active' : ''}`}
              onClick={() => handlePagina(numero)}
              aria-label={`Página ${numero}`}
              aria-current={paginaActual === numero ? 'page' : undefined}
            >
              {numero}
            </button>
          )
        ))}
      </div>

      <button
        className="pagination-btn"
        onClick={handleSiguiente}
        disabled={paginaActual === totalPaginas}
        aria-label="Página siguiente"
      >
        Siguiente →
      </button>

      <div className="pagination-info">
        Página {paginaActual} de {totalPaginas} ({totalItems} items)
      </div>
    </div>
  );
};

export default Pagination;
