import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { EnvironmentAppSelector } from './EnvironmentAppSelector';

export function Layout() {
  const location = useLocation();
  const showSelector = location.pathname === '/';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <h1>SCIM Viewer</h1>
          <nav>
            <NavLink to="/" end>
              Users &amp; Groups
            </NavLink>
            <NavLink to="/applications">Applications</NavLink>
            <NavLink to="/environments">Environments</NavLink>
          </nav>
        </div>
      </header>
      <div className="app-container">
        {showSelector && <EnvironmentAppSelector />}
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
