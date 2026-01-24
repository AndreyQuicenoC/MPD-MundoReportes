/**
 * Navbar principal de la aplicación.
 * Muestra diferentes opciones según el rol del usuario.
 * Incluye menú hamburguesa responsive.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuAbierto(false);
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const esAdmin = usuario?.rol === 'admin';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src="/logo.svg" alt="Mundo Reporte" className="navbar-logo" />
          <span className="navbar-title">Mundo Reporte</span>
        </div>

        <button
          className={`navbar-toggle ${menuAbierto ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${menuAbierto ? 'active' : ''}`}>
          {esAdmin ? (
            // Menú para administradores: solo usuarios
            <Link
              to="/admin/usuarios"
              className="navbar-link navbar-link-admin"
              onClick={cerrarMenu}
            >
              Usuarios
            </Link>
          ) : (
            // Menú para operarios: acceso a reportes y productos
            <>
              <Link to="/dashboard" className="navbar-link" onClick={cerrarMenu}>
                Dashboard
              </Link>
              <Link to="/reportes" className="navbar-link" onClick={cerrarMenu}>
                Reportes
              </Link>
              <Link to="/estadisticas" className="navbar-link" onClick={cerrarMenu}>
                Estadísticas
              </Link>
              <Link to="/productos" className="navbar-link" onClick={cerrarMenu}>
                Productos
              </Link>
              <Link to="/categorias" className="navbar-link" onClick={cerrarMenu}>
                Categorías
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          <Link to="/perfil" className="navbar-username" title="Mi Perfil" onClick={cerrarMenu}>
            Editar Perfil
          </Link>
          <button onClick={handleLogout} className="navbar-logout">
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
