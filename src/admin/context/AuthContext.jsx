// Contexte d'authentification pour le back-office admin.
// Gère le token JWT stocké dans localStorage, expose l'utilisateur décodé,
// son rôle, et les fonctions login/logout.
// Le rôle est extrait du payload JWT (claim Microsoft ou claim générique).

import { createContext, useContext, useState, useCallback } from 'react'

// Contexte partagé dans toute l'arborescence de l'application
const AuthContext = createContext(null)

/**
 * Décode le payload d'un token JWT (partie base64 entre les deux points).
 * Retourne null si le token est invalide ou mal formé.
 */
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/**
 * Fournisseur du contexte d'authentification.
 * Initialise le token depuis localStorage au premier rendu.
 * Décode le payload pour exposer l'utilisateur et son rôle.
 */
export function AuthProvider({ children }) {
  // Lecture initiale du token persisté (survit aux rechargements de page)
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))

  // Décodage du payload JWT pour accéder aux informations utilisateur
  const user = token ? parseJwt(token) : null

  // Extraction du rôle : supporte le claim long Microsoft (API .NET) ou le claim court
  const role =
    user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    user?.role ??
    null

  /**
   * Persiste le token JWT dans le state et dans localStorage.
   * Appelée après une connexion réussie.
   */
  const login = useCallback((jwt) => {
    localStorage.setItem('admin_token', jwt)
    setToken(jwt)
  }, [])

  /**
   * Supprime le token du state et de localStorage.
   * Appelée lors de la déconnexion.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setToken(null)
  }, [])

  // Booléen pratique pour vérifier l'accès admin sans répéter la comparaison
  const isAdmin = role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ token, user, role, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook personnalisé pour consommer le contexte d'authentification.
 * À utiliser dans tous les composants enfants de <AuthProvider>.
 */
// eslint-disable-next-line react-refresh/only-export-components -- hook colocalisé avec son provider, pattern standard
export function useAuth() {
  return useContext(AuthContext)
}
