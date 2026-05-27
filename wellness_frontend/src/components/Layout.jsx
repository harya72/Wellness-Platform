import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: '🍽️', label: 'Meal Entries', end: true },
  { to: '/users', icon: '👥', label: 'Users' },
]

export default function Layout() {
  const { user, signOut } = useAuth()

  const initial = user?.email?.[0]?.toUpperCase() || 'A'

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🥗</div>
          <div>
            <div className="sidebar-logo-text">Wellness</div>
            <div className="sidebar-logo-sub">Admin Dashboard</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-link-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{initial}</div>
            <div className="user-email">{user?.email}</div>
            <button className="btn-signout" onClick={signOut} title="Sign out">⏏</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
