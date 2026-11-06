import { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import {
  Sprout,
  LayoutDashboard,
  ClipboardList,
  Plus,
  MapPinned,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../constants';
import { DashboardPage } from '../pages/DashboardPage';
import { DemandsPage } from '../pages/DemandsPage';
import { NewDemand } from '../pages/NewDemand';
import { DemandDetail } from '../pages/DemandDetail';
import { MapPage } from '../pages/MapPage';

export function Shell() {
  const { user, setUser } = useAuth();
  const [mobile, setMobile] = useState(false);
  const nav = useNavigate();

  function logout() {
    localStorage.removeItem('agro_token');
    setUser(null);
    nav('/login');
  }

  const links = [
    { to: '/', label: 'Visão geral', icon: LayoutDashboard },
    { to: '/demands', label: 'Demandas', icon: ClipboardList },
    { to: '/new', label: 'Nova solicitação', icon: Plus },
  ];
  if (user?.role !== 'farmer') {
    links.push({ to: '/map', label: 'Mapa de demandas', icon: MapPinned });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">
            <Sprout />
          </span>
          <span>
            AGRO<span>DEMANDA</span>
          </span>
          <button className="mobile-close" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>

        <div className="side-caption">MENU PRINCIPAL</div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              end={l.to === '/'}
              to={l.to}
              onClick={() => setMobile(false)}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="side-bottom">
          <div className="help-card">
            <div className="help-icon">
              <Leaf size={18} />
            </div>
            <b>Desenvolvimento rural</b>
            <p>Organizando necessidades, fortalecendo comunidades.</p>
          </div>
          <div className="profile">
            <div className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</div>
            <div className="profile-info">
              <b>{user?.name}</b>
              <span>{user ? ROLE_LABELS[user.role] : ''}</span>
            </div>
            <button title="Sair" onClick={logout}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div className="crumb">
            Secretaria de Agricultura <ChevronRight size={14} /> <b>AGRODEMANDA</b>
          </div>
          <div className="top-right">
            <span className="status-dot" /> Sistema operacional
            <div className="top-avatar">{user?.name?.slice(0, 1)}</div>
          </div>
        </header>

        <div className="page">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/demands" element={<DemandsPage />} />
            <Route path="/new" element={<NewDemand />} />
            <Route path="/demands/:id" element={<DemandDetail />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
