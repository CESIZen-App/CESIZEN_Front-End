// Service HTTP centralisé pour les appels à l'API back-end.
// Utilise axios avec une baseURL configurable via VITE_API_URL (build de prod),
// avec un fallback sur le port local 5001 pour le développement.
// Deux intercepteurs sont configurés :
//   - Requête  : injecte automatiquement le token JWT dans l'en-tête Authorization.
//   - Réponse  : intercepte les erreurs 401 (token expiré/invalide) et redirige vers la page de login.

import axios from 'axios'

// Instance axios partagée par toutes les pages et services du back-office
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
})

// Intercepteur de requête :
// Récupère le token stocké dans localStorage et l'ajoute à chaque requête sortante.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Intercepteur de réponse :
// En cas d'erreur 401 (non autorisé), supprime le token invalide et redirige vers /admin/login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default api
