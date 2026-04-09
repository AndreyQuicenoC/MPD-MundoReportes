import React from 'react';
import '../styles/RankingProductos.css';

/**
 * Componente de Ranking de Productos.
 * Muestra top 5 productos más y menos vendidos en formato de ranking.
 */
const RankingProductos = ({ productosTop = [], productosBajo = [] }) => {
  const coloresRanking = ['#9B933B', '#2563eb', '#f59e0b', '#8b5cf6', '#ec4899'];

  const RankingCard = ({ titulo, productos, icono }) => (
    <div className="ranking-card">
      <div className="ranking-header">
        <div className="ranking-icon">{icono}</div>
        <h3>{titulo}</h3>
      </div>

      {productos && productos.length > 0 ? (
        <div className="ranking-list">
          {productos.slice(0, 5).map((producto, index) => (
            <div key={index} className="ranking-item">
              <div className="rank-number" style={{ backgroundColor: coloresRanking[index] }}>
                {index + 1}
              </div>
              <div className="product-info">
                <p className="product-name">{producto.producto}</p>
                <p className="product-quantity">{producto.cantidad_total} unidades</p>
              </div>
              <div className="product-bar">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(producto.cantidad_total / (productosTop[0]?.cantidad_total || 1)) * 100}%`,
                    backgroundColor: coloresRanking[index],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">Sin datos disponibles</p>
      )}
    </div>
  );

  return (
    <div className="ranking-productos-container">
      <RankingCard
        titulo="Top Productos Más Vendidos"
        productos={productosTop}
        icono="🔝"
      />
      <RankingCard
        titulo="Top Productos Menos Vendidos"
        productos={productosBajo}
        icono="📉"
      />
    </div>
  );
};

export default RankingProductos;
