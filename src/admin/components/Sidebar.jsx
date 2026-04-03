import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/admin',             label: 'Tableau de bord', icon: '/tableau-de-bord.png', end: true },
  { to: '/admin/users',       label: 'Utilisateurs',    icon: '/utilisateur(2).png' },
  { to: '/admin/information', label: 'Pages info',      icon: '/information.png' },
  { to: '/admin/exercices',   label: 'Exercices',       icon: '/poumons.png' },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/fleur.png" alt="logo" className="sidebar-logo-img" />
        <span className="sidebar-logo-text">CESIZen</span>
        <span className="sidebar-logo-badge">Admin</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' sidebar-link--active' : '')
            }
          >
            <img src={l.icon} alt="" className="sidebar-link-icon" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <span>⎋</span> Déconnexion
      </button>
    </aside>
  )
}
