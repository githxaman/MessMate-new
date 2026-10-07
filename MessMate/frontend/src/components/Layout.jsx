import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ showFooter = true }) => (
  <div className="app-layout">
    <Header />
    <main className="main-content">
      <Outlet />
    </main>
    {showFooter && <Footer />}
  </div>
);

export default Layout;
