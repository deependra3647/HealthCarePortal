import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconHeart, IconShield } from '../components/Icons';
import './Login.css';

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('deependrakansana2004@gmail.com');
  const [password, setPassword] = useState('Deep@3647');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="login-hero-content">
          <span className="login-hero-badge">
            <IconShield />
            Secure hospital management
          </span>
          <h1>Care smarter. Operate faster.</h1>
          <p>
            A modern portal for patients, doctors, and appointments — built for hospital staff who
            need clarity, speed, and reliable digital records.
          </p>
          <div className="login-hero-stats">
            <div className="login-hero-stat">
              <strong>24/7</strong>
              <span>Digital access</span>
            </div>
            <div className="login-hero-stat">
              <strong>100%</strong>
              <span>Cloud ready</span>
            </div>
            <div className="login-hero-stat">
              <strong>HIPAA</strong>
              <span>Style security</span>
            </div>
          </div>
        </div>
      </section>
      <section className="login-form-panel">
        <div className="card login-card">
          <div className="login-card-logo">
            <IconHeart />
          </div>
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to your HealthCare Portal account</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in to portal'}
            </button>
          </form>
          <p className="login-hint">Sign in with your admin account — run seed after first setup</p>
        </div>
      </section>
    </div>
  );
}
