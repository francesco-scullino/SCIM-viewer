import { NavLink, Outlet } from 'react-router-dom';
import { EnvironmentAppSelector } from './EnvironmentAppSelector';

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>SCIM Viewer</h1>
        <nav>
          <NavLink to="/" end>
            Utenti &amp; Gruppi
          </NavLink>
          <NavLink to="/applications">Applicazioni</NavLink>
          <NavLink to="/environments">Ambienti</NavLink>
        </nav>
      </header>
      <EnvironmentAppSelector />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
