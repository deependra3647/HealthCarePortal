import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/client';
import PageHeader from '../components/PageHeader';
import {
  IconPatients,
  IconDoctors,
  IconCalendar,
  IconDashboard,
  IconShield,
} from '../components/Icons';

const statConfig = [
  { key: 'patients', label: 'Total Patients', className: 'stat-patients', Icon: IconPatients, trend: 'Active records' },
  { key: 'doctors', label: 'Doctors on staff', className: 'stat-doctors', Icon: IconDoctors, trend: 'All departments' },
  { key: 'appointments', label: 'Appointments', className: 'stat-appointments', Icon: IconCalendar, trend: 'All time' },
  { key: 'scheduled', label: 'Upcoming', className: 'stat-scheduled', Icon: IconDashboard, trend: 'Scheduled visits' },
];

const quickLinks = [
  { to: '/patients', label: 'Patients', desc: 'Manage records', color: '#ccfbf1', iconColor: '#0d9488', Icon: IconPatients },
  { to: '/doctors', label: 'Doctors', desc: 'Staff profiles', color: '#dbeafe', iconColor: '#2563eb', Icon: IconDoctors },
  { to: '/appointments', label: 'Appointments', desc: 'Book visits', color: '#ede9fe', iconColor: '#7c3aed', Icon: IconCalendar },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .stats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Real-time overview of hospital operations"
      />
      {error && <p className="error-msg">{error}</p>}
      <div className="stats-grid">
        {statConfig.map(({ key, label, className, Icon, trend }) => (
          <div key={key} className={`stat-card ${className}`}>
            <div className="stat-card-inner">
              <div>
                <h3>{loading ? '—' : (stats?.[key] ?? 0)}</h3>
                <p>{label}</p>
                <span className="stat-trend">{trend}</span>
              </div>
              <div className="stat-icon">
                <Icon />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="welcome-banner">
          <div>
            <h3>Your hospital command center</h3>
            <p>
              Track patients, coordinate doctors, and schedule appointments from a single secure
              platform powered by MongoDB and containerized services.
            </p>
          </div>
          <div className="welcome-features">
            <span className="welcome-feature">
              <IconShield />
              Encrypted authentication
            </span>
            <span className="welcome-feature">
              <IconPatients />
              Centralized patient records
            </span>
            <span className="welcome-feature">
              <IconCalendar />
              Smart appointment booking
            </span>
          </div>
        </section>
        <section>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-soft)' }}>
            Quick actions
          </h3>
          <div className="quick-links">
            {quickLinks.map(({ to, label, desc, color, iconColor, Icon }) => (
              <Link key={to} to={to} className="quick-link">
                <span className="quick-link-icon" style={{ background: color, color: iconColor }}>
                  <Icon />
                </span>
                <span>{label}</span>
                <span>{desc}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
