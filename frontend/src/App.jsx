/**
 * Componente principal de la aplicación.
 *
 * Configura las rutas, contexto de autenticación y layout global.
 * Controla el acceso por rol: admin solo ve usuarios, operarios ven reportes.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import Login from './pages/Login';
import Reportes from './pages/Reportes';
import NuevoReporte from './pages/NuevoReporte';
import Estadisticas from './pages/Estadisticas';
import Productos from './pages/Productos';
import Categorias from './pages/Categorias';
import Perfil from './pages/Perfil';
import AdminUsuarios from './pages/AdminUsuarios';
import './styles/global.css';

// Componente para redirigir según rol
const RoleBasedRedirect = () => {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;

  if (usuario.rol === 'admin') {
    return <Navigate to="/admin/usuarios" replace />;
  }

  // Dashboard eliminado, redirigir a reportes
  return <Navigate to="/reportes" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
            },
            success: {
              iconTheme: {
                primary: '#6B8E23',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#C94A4A',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<RoleBasedRedirect />} />

            {/* Rutas solo para operarios */}
            <Route
              path="reportes"
              element={
                <RoleRoute allowedRoles={['usuario']}>
                  <Reportes />
                </RoleRoute>
              }
            />
            <Route
              path="reportes/nuevo"
              element={
                <RoleRoute allowedRoles={['usuario']}>
                  <NuevoReporte />
                </RoleRoute>
              }
            />
            <Route
              path="estadisticas"
              element={
                <RoleRoute allowedRoles={['usuario']}>
                  <Estadisticas />
                </RoleRoute>
              }
            />
            <Route
              path="productos"
              element={
                <RoleRoute allowedRoles={['usuario']}>
                  <Productos />
                </RoleRoute>
              }
            />
            <Route
              path="categorias"
              element={
                <RoleRoute allowedRoles={['usuario']}>
                  <Categorias />
                </RoleRoute>
              }
            />

            {/* Rutas solo para administradores */}
            <Route
              path="admin/usuarios"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminUsuarios />
                </RoleRoute>
              }
            />

            {/* Perfil: accesible para todos */}
            <Route path="perfil" element={<Perfil />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
