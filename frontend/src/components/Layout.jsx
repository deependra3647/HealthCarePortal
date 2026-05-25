import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconDashboard,
  IconPatients,
  IconDoctors,
  IconCalendar,
  IconLogout,
  IconHeart,
} from './Icons';
import './Layout.css';

const nav = [
  { to: '/', label: 'Dashboard', end: true, Icon: IconDashboard },
  { to: '/patients', label: 'Patients', Icon: IconPatients },
  { to: '/doctors', label: 'Doctors', Icon: IconDoctors },
  { to: '/appointments', label: 'Appointments', Icon: IconCalendar },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name) {
  return (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <IconHeart />
          </span>
          <div>
            <h1>HealthCare</h1>
            <p>Hospital Portal</p>
          </div>
        </div>
        <nav>
          {nav.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <span className="user-avatar">{getInitials(user?.name)}</span>
            <div>
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role} account</p>
            </div>
          </div>
          <button type="button" className="btn-logout" onClick={logout}>
            <IconLogout />
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <div className="top-bar">
          <div className="greeting">
            <h2>
              {getGreeting()}, {user?.name?.split(' ')[0]}
            </h2>
            <p>Manage your hospital operations from one place</p>
          </div>
          <span className="top-bar-date">{today}</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
