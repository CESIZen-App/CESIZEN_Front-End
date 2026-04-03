import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function UsersPage() {
  const { user: me } = useAuth()
  const myId = me?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    ?? me?.nameid
    ?? null

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [togglingRole, setTogglingRole] = useState(null)

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

  async function handleToggleRole(u) {
    const newRoleId = u.roleId === 1 ? 2 : 1
    const label = newRoleId === 1 ? 'ADMIN' : 'USER'
    if (!confirm(`Changer le rôle de ${u.email} en ${label} ?`)) return
    setTogglingRole(u.id)
    try {
      const { data } = await api.patch(`/user/${u.id}/role`, { roleId: newRoleId })
      setUsers((list) => list.map((x) => (x.id === u.id ? data : x)))
    } catch {
      alert('Erreur lors du changement de rôle.')
    } finally {
      setTogglingRole(null)
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
            {users.map((u) => {
              const isSelf = String(u.id) === String(myId)
              return (
                <tr key={u.id}>
                  <td className="td-muted">#{u.id}</td>
                  <td>{u.nom ?? '—'}</td>
                  <td>{u.email} {isSelf && <span className="badge badge-self">moi</span>}</td>
                  <td>
                    <button
                      className={`badge badge-clickable ${u.roleId === 1 ? 'badge-admin' : 'badge-user'}`}
                      onClick={() => !isSelf && handleToggleRole(u)}
                      disabled={togglingRole === u.id || isSelf}
                      title={isSelf ? 'Impossible de modifier votre propre rôle' : 'Cliquer pour changer le rôle'}
                    >
                      {togglingRole === u.id ? '...' : u.roleId === 1 ? 'ADMIN' : 'USER'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(u.id)}
                      disabled={deleting === u.id || isSelf}
                      title={isSelf ? 'Impossible de supprimer votre propre compte' : ''}
                    >
                      {deleting === u.id ? '...' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="table-empty">Aucun utilisateur trouvé.</div>
        )}
      </div>
    </div>
  )
}
