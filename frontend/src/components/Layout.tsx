import { NavLink, Outlet } from 'react-router-dom';
import { EnvironmentAppSelector } from './EnvironmentAppSelector';

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>SCIM Viewer</h1>
        <nav>
          <NavLink to="/" end>
            Users &amp; Groups
          </NavLink>
          <NavLink to="/applications">Applications</NavLink>
          <NavLink to="/environments">Environments</NavLink>
        </nav>
      </header>
      <EnvironmentAppSelector />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
