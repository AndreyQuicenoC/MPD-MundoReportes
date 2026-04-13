/**
 * Main application component.
 *
 * Configures routes, authentication context and global layout.
 * Controls access by role: admin only sees users, operators see reports.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import Login from './pages/common/Login/Login';
import Reportes from './pages/operator/Reportes/Reportes';
import NuevoReporte from './pages/operator/NuevoReporte/NuevoReporte';
import DetalleReporte from './pages/operator/DetalleReporte/DetalleReporte';
import Estadisticas from './pages/operator/Estadisticas/Estadisticas';
import Productos from './pages/operator/Productos/Productos';
import Categorias from './pages/common/Categorias/Categorias';
import Automatico from './pages/operator/Automatico/Automatico';
import Deducibles from './pages/operator/Deducibles/Deducibles';
import Perfil from './pages/common/Perfil/Perfil';
import AdminUsuarios from './pages/admin/AdminUsuarios/AdminUsuarios';
import './styles/global.css';

// Component to redirect based on role
const RoleBasedRedirect = () => {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;

  if (usuario.rol === 'admin') {
    return <Navigate to="/admin/usuarios" replace />;
  }

  // Dashboard removed, redirect to reports
  return <Navigate to="/reportes" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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

            {/* Routes only for operators */}
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
              path="reportes/:id"
              element={
                <RoleRoute allowedRoles={['usuario']}>
                  <DetalleReporte />
                </RoleRoute>
              }
            />
            <Route
              path="reportes/:id/editar"
              element={
                <RoleRoute allowedRoles={['usuario']}>
                  <NuevoReporte esEdicion={true} />
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
            <Route
              path="automatico"
              element={
                <RoleRoute allowedRoles={['usuario']}>
                  <Automatico />
                </RoleRoute>
              }
            />
            <Route
              path="deducibles"
              element={
                <RoleRoute allowedRoles={['usuario', 'admin']}>
                  <Deducibles />
                </RoleRoute>
              }
            />

            {/* Routes only for administrators */}
            <Route
              path="admin/usuarios"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminUsuarios />
                </RoleRoute>
              }
            />

            {/* Profile: accessible to all */}
            <Route path="perfil" element={<Perfil />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
