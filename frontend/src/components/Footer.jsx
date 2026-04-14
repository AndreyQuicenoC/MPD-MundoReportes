/**
 * Footer de la aplicación.
 * Muestra información de la empresa y mapa de sitio.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Footer.css';

const Footer = () => {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Mundo Pinturas Diana</h3>
          <p className="footer-description">
            Software de gestión empresarial para el control de reportes diarios, inventarios y
            estadísticas de ventas.
          </p>
          <p className="footer-description">
            <strong>Mundo Reporte</strong> - Sistema de reportes profesional
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Navegación</h3>
          <ul className="footer-links">
            {esAdmin ? (
              <>
                <li>
                  <Link to="/admin/usuarios">Gestión de Usuarios</Link>
                </li>
                <li>
                  <Link to="/perfil">Mi Perfil</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/dashboard">Reportes</Link>
                </li>
                <li>
                  <Link to="/productos">Productos</Link>
                </li>
                <li>
                  <Link to="/estadisticas">Estadísticas</Link>
                </li>
                <li>
                  <Link to="/perfil">Mi Perfil</Link>
                </li>
                <li>
                  <a href="/docs/manual_usuario.pdf" target="_blank" rel="noopener noreferrer">
                    Manual de Usuario
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Información</h3>
          <ul className="footer-links">
            <li>
              <span>Contacto: mundopinturasdiana@gmail.com</span>
            </li>
            <li>
              <span>Soporte: andreyquic@gmail.com</span>
            </li>
            <li>
              <span>Teléfono: +57 312 248 6627</span>
            </li>
            <li>
              <span>Ubicación: Colombia</span>
            </li>
            <li>
              <span>Horario: Lun - Sáb, 8am - 5pm</span>
              <span>Horario: Dom, 8am - 12pm</span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Sistema</h3>
          <ul className="footer-links">
            <li>
              <span>Versión: 1.0.0</span>
            </li>
            <li>
              <span>Usuario: {usuario?.nombre}</span>
            </li>
            <li>
              <span className="footer-role">Rol: {esAdmin ? 'Administrador' : 'Operario'}</span>
            </li>
            <li>
              <span>© {currentYear} Mundo Pinturas Diana</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          Desarrollado para <strong>Mundo Pinturas Diana</strong> | Todos los derechos reservados ©{' '}
          {currentYear}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
