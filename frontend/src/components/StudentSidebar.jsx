import { Link, NavLink, useNavigate } from 'react-router-dom';

import { USE_BACKEND } from '../constants/appConfig';
import { clearSession, getRolePrefix, getStoredRole } from '../utils/session';
import './StudentSidebar.css';

function getNavItems(prefix, role) {
  return [
    { to: `${prefix}/dashboard`, icon: '▦', label: 'Dashboard' },
    ...(USE_BACKEND
      ? [{ to: `${prefix}/overview`, icon: '◫', label: 'Overview' }]
      : []),
    { to: `${prefix}/bookings`, icon: '▣', label: 'Bookings' },
    { to: `${prefix}/history`, icon: '◷', label: 'History' },
    // Health quests are for students only, not university staff.
    ...(role === 'STUDENT'
      ? [{ to: `${prefix}/health-quests`, icon: '♡', label: 'Health Quests' }]
      : []),
    { to: `${prefix}/sick-notes`, icon: '▤', label: 'Sick Notes' },
    { to: `${prefix}/profile`, icon: '◉', label: 'My Profile' },
  ];
}

function StudentSidebar() {
  const navigate = useNavigate();

  const role = getStoredRole();

  const navItems = getNavItems(getRolePrefix(role) || '/student', role);

  function handleLogout() {
    clearSession();

    navigate('/login', { replace: true });
  }

  return (
    <aside className="student-sidebar">
      <h2 className="student-sidebar__brand">
        <Link to="/">PulseUp</Link>
      </h2>

      <nav className="student-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `student-sidebar__link${isActive ? ' active' : ''}`
            }
          >
            <span className="student-sidebar__icon" aria-hidden="true">
              {item.icon}
            </span>

            {item.label}
          </NavLink>
        ))}
      </nav>

      <Link to="/" className="student-sidebar__home">
        <span aria-hidden="true">←</span> Back to home
      </Link>

      <button
        className="student-sidebar__logout"
        type="button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </aside>
  );
}

export default StudentSidebar;
