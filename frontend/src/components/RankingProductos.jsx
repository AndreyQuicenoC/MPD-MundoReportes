import React from 'react';
import '../styles/RankingProductos.css';

/**
 * Component for Product Rankings.
 * Displays top 5 most and least sold products in ranking format.
 */
const RankingProductos = ({ productosTop = [], productosBajo = [] }) => {
  const coloresRanking = ['#9B933B', '#2563eb', '#f59e0b', '#8b5cf6', '#ec4899'];

  const RankingCard = ({ titulo, productos, icono }) => {
    // Calculate max quantity in the list for proper percentage calculation
    const maxCantidad = productos.length > 0
      ? Math.max(...productos.map(p => p.cantidad_total || 1))
      : 1;

    return (
      <div className="ranking-card">
        <div className="ranking-header">
          <span className="ranking-icon">{icono}</span>
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
                  <p className="product-quantity">{producto.cantidad_total} units</p>
                </div>
                <div className="product-bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(producto.cantidad_total / maxCantidad) * 100}%`,
                      backgroundColor: coloresRanking[index],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No data available</p>
        )}
      </div>
    );
  };

  return (
    <div className="ranking-productos-container">
      <RankingCard
        titulo="Most Sold Products"
        productos={productosTop}
        icono="★"
      />
      <RankingCard
        titulo="Least Sold Products"
        productos={productosBajo}
        icono="▼"
      />
    </div>
  );
};

export default RankingProductos;
