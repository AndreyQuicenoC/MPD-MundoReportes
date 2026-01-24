/**
 * Layout principal con navegación.
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
