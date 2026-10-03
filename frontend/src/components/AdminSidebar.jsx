import { Link, NavLink, useNavigate } from 'react-router-dom';

import { USE_BACKEND } from '../constants/appConfig';
import { clearSession, getRolePrefix, getStoredRole } from '../utils/session';
import './AdminSidebar.css';

function AdminSidebar() {
  const navigate = useNavigate();

  const role = getStoredRole();

  const prefix = getRolePrefix(role) || '/staff';

  const links = [
    ['Dashboard', `${prefix}/dashboard`, '▦'],
    ...(role === 'ADMIN' && USE_BACKEND
      ? [['Create Account', '/admin/create-account', '✚']]
      : []),
    ['Profile', `${prefix}/profile`, '◉'],
    ...(USE_BACKEND ? [['Bookings', `${prefix}/bookings`, '▣']] : []),
    ...(role === 'ADMIN'
      ? [['Health Quests', `${prefix}/health-quests`, '♡']]
      : []),
    ...(role === 'ADMIN'
      ? [['Sick Notes', `${prefix}/sick-notes`, '▤']]
      : []),
    ['History', `${prefix}/history`, '◷'],
  ];

  function handleLogout() {
    clearSession();

    navigate('/login', { replace: true });
  }

  return (
    <aside className="admin-sidebar">
      <Link to="/" className="admin-brand">
        <div className="admin-brand-mark">P+</div>

        <div>
          <strong>PulseUp</strong>

          <small>Campus Clinic</small>
        </div>
      </Link>

      <nav>
        {links.map(([label, to, icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span>{icon}</span>

            {label}
          </NavLink>
        ))}
      </nav>

      <Link to="/" className="admin-back-home">
        <span aria-hidden="true">←</span> Back to home
      </Link>

      <button className="admin-logout" type="button" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

export default AdminSidebar;
