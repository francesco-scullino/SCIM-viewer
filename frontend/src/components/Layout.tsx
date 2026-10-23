import { AppstoreOutlined, ApartmentOutlined, ArrowRightOutlined, ClusterOutlined, TeamOutlined } from '@ant-design/icons';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Users & Groups', icon: <TeamOutlined /> },
  { to: '/applications', label: 'Applications', icon: <AppstoreOutlined /> },
  { to: '/environments', label: 'Environments', icon: <ClusterOutlined /> },
];

export function Layout() {
  const { pathname } = useLocation();
  const currentPage = navigation.find((item) => item.to === pathname)?.label ?? 'Page not found';
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="app-sidebar">
        <NavLink to="/" className="brand" aria-label="SCIM Viewer home">
          <span className="brand-mark" aria-hidden="true"><ApartmentOutlined /></span>
          <span>SCIM Viewer<span className="brand-caption">Identity administration</span></span>
        </NavLink>
        <nav className="main-navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
              <ArrowRightOutlined className="nav-arrow" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="sidebar-note-title">One context at a time.</span>
          <p>Manage identities across your applications and environments.</p>
        </div>
        <div className="sidebar-footer"><span className="protocol-mark">SCIM</span><span>System for Cross-domain<br />Identity Management</span></div>
      </aside>
      <div className="app-workspace">
        <header className="workspace-header">
          <div className="breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><span>{currentPage}</span></div>
          <span className="workspace-caption">Identity workspace</span>
        </header>
        <main className="app-main" id="main-content" tabIndex={-1}><Outlet /></main>
        <footer className="workspace-footer"><span>SCIM Viewer</span><span>Applications · Environments · Identities</span></footer>
      </div>
    </div>
  );
}
