import { useEffect, useState } from 'react'
import api from '../services/api'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)

  async function load() {
    try {
      const { data } = await api.get('/user')
      setUsers(data)
    } catch {
      setError('Impossible de charger les utilisateurs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return
    setDeleting(id)
    try {
      await api.delete(`/user/${id}`)
      setUsers((u) => u.filter((x) => x.id !== id))
    } catch {
      alert('Erreur lors de la suppression.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Utilisateurs</h2>
          <p className="page-subtitle">{users.length} compte(s) enregistré(s)</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="td-muted">#{u.id}</td>
                <td>{u.nom ?? '—'}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.roleId === 1 ? 'badge-admin' : 'badge-user'}`}>
                    {u.roleId === 1 ? 'ADMIN' : 'USER'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(u.id)}
                    disabled={deleting === u.id || u.roleId === 1}
                    title={u.roleId === 1 ? 'Impossible de supprimer un admin' : ''}
                  >
                    {deleting === u.id ? '...' : 'Supprimer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="table-empty">Aucun utilisateur trouvé.</div>
        )}
      </div>
    </div>
  )
}
