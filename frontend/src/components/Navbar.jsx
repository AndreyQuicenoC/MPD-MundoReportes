/**
 * Navbar principal de la aplicación.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src="/logo.svg" alt="Mundo Reporte" className="navbar-logo" />
          <span className="navbar-title">Mundo Reporte</span>
        </div>

        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/reportes/nuevo" className="navbar-link">
            Nuevo Reporte
          </Link>
          <Link to="/reportes" className="navbar-link">
            Reportes
          </Link>
          <Link to="/estadisticas" className="navbar-link">
            Estadísticas
          </Link>
          <Link to="/productos" className="navbar-link">
            Productos
          </Link>
          <Link to="/categorias" className="navbar-link">
            Categorías
          </Link>
          {usuario?.rol === 'admin' && (
            <Link to="/admin/usuarios" className="navbar-link navbar-link-admin">
              Usuarios
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <Link to="/perfil" className="navbar-username">
            {usuario?.nombre}
          </Link>
          <button onClick={handleLogout} className="navbar-logout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
