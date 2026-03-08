import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <nav>
      <Link to="/" className="nav-logo">Align</Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link${pathname === '/' ? ' active' : ''}`}>Scanner</Link>
        <Link to="/dashboard" className={`nav-link${pathname === '/dashboard' ? ' active' : ''}`}>Dashboard</Link>
        <span style={{ fontSize: '.78rem', color: 'var(--soft)' }}>
          {user?.display_name || user?.email}
        </span>
        <button
          onClick={logout}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '.72rem', padding: '7px 14px' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
