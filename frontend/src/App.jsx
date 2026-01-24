/**
 * Componente principal de la aplicación.
 *
 * Configura las rutas, contexto de autenticación y layout global.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reportes from './pages/Reportes';
import NuevoReporte from './pages/NuevoReporte';
import Estadisticas from './pages/Estadisticas';
import Productos from './pages/Productos';
import Categorias from './pages/Categorias';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="reportes/nuevo" element={<NuevoReporte />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="productos" element={<Productos />} />
            <Route path="categorias" element={<Categorias />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
