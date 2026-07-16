// Page de connexion du back-office administrateur.
// Envoie les identifiants à l'API, décode le JWT retourné pour vérifier le rôle,
// puis redirige vers le tableau de bord si l'utilisateur est bien ADMIN.
// Un utilisateur avec un rôle USER verra un message d'accès refusé sans être connecté.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // Champs du formulaire de connexion
  const [form, setForm] = useState({ email: '', password: '' })
  // Message d'erreur affiché si les identifiants sont incorrects ou le rôle insuffisant
  const [error, setError] = useState('')
  // Indicateur de chargement pendant l'appel API
  const [loading, setLoading] = useState(false)

  /**
   * Gère la soumission du formulaire de connexion.
   * Vérifie que le rôle est ADMIN avant d'autoriser l'accès au back-office.
   */
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/user/login', form)
      const token = data.token

      // Décodage du payload JWT pour vérifier le rôle sans appel supplémentaire
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      const role =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        payload.role

      // Vérification du rôle avant d'autoriser l'accès
      if (role !== 'ADMIN') {
        setError("Accès refusé. Ce back-office est réservé aux administrateurs.")
        return
      }

      // Stockage du token et redirection vers le tableau de bord
      login(token)
      navigate('/admin')
    } catch {
      setError("Email ou mot de passe incorrect.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* Panneau gauche — branding */}
      <div className="login-brand">
        <img src="/fleur.png" alt="CESIZen" className="login-brand-logo" />
        <h2 className="login-brand-title">CESIZen</h2>
        <p className="login-brand-sub">Espace d'administration</p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="login-panel">
        <div className="login-form-wrap">
          <h1 className="login-title">Connexion</h1>
          <p className="login-subtitle">Réservé aux administrateurs</p>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Message d'erreur affiché si la connexion échoue */}
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Adresse mail</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@cesizen.fr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {/* Bouton désactivé pendant le chargement pour éviter les double-soumissions */}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
