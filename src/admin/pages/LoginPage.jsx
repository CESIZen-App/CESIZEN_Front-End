import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/user/login', form)
      const token = data.token

      // Vérification du rôle avant d'autoriser l'accès
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      const role =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        payload.role

      if (role !== 'ADMIN') {
        setError("Accès refusé. Ce back-office est réservé aux administrateurs.")
        return
      }

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
      <div className="login-card">
        <div className="login-logo">
          <span>🪷</span>
        </div>
        <h1 className="login-title">CESIZen</h1>
        <p className="login-subtitle">Accès administrateur</p>

        <form onSubmit={handleSubmit} className="login-form">
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

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Connexion'}
          </button>
        </form>
      </div>
    </div>
  )
}
