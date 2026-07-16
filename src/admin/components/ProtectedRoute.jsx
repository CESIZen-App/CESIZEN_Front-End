// Composant de garde pour les routes protégées du back-office.
// Vérifie que l'utilisateur est authentifié ET qu'il possède le rôle ADMIN.
// Si l'une des deux conditions n'est pas remplie, redirige vers la page de login.
// En cas de succès, rend les composants enfants normalement.

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Enveloppe une route pour la rendre accessible aux administrateurs uniquement.
 * @param {React.ReactNode} children - Le composant page à afficher si autorisé.
 */
export default function ProtectedRoute({ children }) {
  const { token, isAdmin } = useAuth()

  // Pas de token → utilisateur non connecté
  if (!token) return <Navigate to="/admin/login" replace />

  // Token présent mais rôle insuffisant → accès refusé
  if (!isAdmin) return <Navigate to="/admin/login" replace />

  // Accès accordé
  return children
}
