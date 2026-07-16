// Mise en page principale du back-office.
// Affiche la barre latérale (Sidebar) à gauche et la zone de contenu à droite.
// L'en-tête affiche l'email de l'administrateur connecté, extrait du JWT.
// Le contenu de chaque page est injecté via la prop {children}.

import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

/**
 * Composant de layout partagé par toutes les pages protégées du back-office.
 * @param {React.ReactNode} children - Le contenu de la page courante (Dashboard, Users, etc.)
 */
export default function AdminLayout({ children }) {
  const { user } = useAuth()

  // Extraction de l'email depuis le payload JWT :
  // Supporte le claim long (Microsoft .NET) ou le claim court générique
  const email =
    user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
    user?.email ??
    'Admin'

  return (
    <div className="admin-layout">
      {/* Navigation latérale avec les liens du back-office */}
      <Sidebar />

      <div className="admin-main">
        {/* En-tête avec le titre et l'email de l'administrateur connecté */}
        <header className="admin-header">
          <h1 className="admin-header-title">Back-office CESIZen</h1>
          <div className="admin-header-user">
            <span className="admin-header-email">{email}</span>
          </div>
        </header>

        {/* Zone de contenu : chaque page y est rendue dynamiquement */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
