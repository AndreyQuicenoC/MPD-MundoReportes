/**
 * Componente para proteger rutas por rol.
 * Verifica que el usuario tenga el rol adecuado para acceder.
 */

import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedRoles }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    // Redirigir según el rol
    if (usuario.rol === 'admin') {
      return <Navigate to="/admin/usuarios" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

RoleRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default RoleRoute;
