import { useAuth } from '../hooks/useAuth.jsx';

export default function UserBar() {
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'localhost:4000';

  return (
    <div className="user-bar">
      <span>ALIGN MVP</span>
      <span className="user-bar-sep">|</span>
      <span>User: <span style={{ color: 'var(--accent)' }}>{user?.display_name || '—'}</span></span>
      <span className="user-bar-sep">|</span>
      <span>
        <span className="sdot sdot-good" style={{ marginRight: 6 }} />
        API: {apiUrl}
      </span>
      <span className="user-bar-sep">|</span>
      <span>Sessions: {user?.total_sessions ?? 0}</span>
    </div>
  );
}
