// Barre de navigation latérale du back-office.
// Affiche le logo CESIZen, les liens de navigation vers les sections admin,
// et un bouton de déconnexion qui efface la session et redirige vers le login.
// Utilise NavLink de React Router pour mettre en évidence le lien actif.

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Liste des sections du back-office : chemin, libellé et icône associée
const links = [
  { to: '/admin',             label: 'Tableau de bord', icon: '/tableau-de-bord.png', end: true },
  { to: '/admin/users',       label: 'Utilisateurs',    icon: '/utilisateur(2).png' },
  { to: '/admin/information', label: 'Pages info',      icon: '/information.png' },
  { to: '/admin/exercices',   label: 'Exercices',       icon: '/poumons.png' },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  /**
   * Déconnecte l'administrateur : supprime le token et redirige vers le login.
   */
  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <aside className="sidebar">
      {/* Entête du logo */}
      <div className="sidebar-logo">
        <img src="/fleur.png" alt="logo" className="sidebar-logo-img" />
        <span className="sidebar-logo-text">CESIZen</span>
        <span className="sidebar-logo-badge">Admin</span>
      </div>

      {/* Navigation principale : chaque lien est actif si la route correspond exactement (end) ou partiellement */}
      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              // Ajoute la classe active sur le lien de la page courante
              'sidebar-link' + (isActive ? ' sidebar-link--active' : '')
            }
          >
            <img src={l.icon} alt="" className="sidebar-link-icon" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Bouton de déconnexion en bas de la sidebar */}
      <button className="sidebar-logout" onClick={handleLogout}>
        <span>⎋</span> Déconnexion
      </button>
    </aside>
  )
}
