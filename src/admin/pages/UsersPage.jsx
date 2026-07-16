// Page de gestion des utilisateurs du back-office.
// Affiche la liste complète des comptes, permet de changer le rôle (ADMIN ↔ USER)
// et de supprimer un utilisateur.
// L'administrateur connecté ne peut pas modifier ou supprimer son propre compte.

import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function UsersPage() {
  const { user: me } = useAuth()

  // Extraction de l'identifiant de l'administrateur connecté depuis le payload JWT
  // (supporte le claim Microsoft long ou le claim court)
  const myId = me?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    ?? me?.nameid
    ?? null

  // Liste des utilisateurs chargée depuis l'API
  const [users, setUsers] = useState([])
  // Indicateur de chargement initial
  const [loading, setLoading] = useState(true)
  // Message d'erreur de chargement
  const [error, setError] = useState('')
  // ID de l'utilisateur en cours de suppression (pour désactiver le bouton pendant l'opération)
  const [deleting, setDeleting] = useState(null)
  // ID de l'utilisateur dont le rôle est en cours de changement
  const [togglingRole, setTogglingRole] = useState(null)

  /**
   * Charge la liste complète des utilisateurs depuis l'API.
   */
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

  // Chargement au montage du composant
  useEffect(() => { load() }, [])

  /**
   * Supprime un utilisateur après confirmation.
   * Désactive le bouton pendant l'opération pour éviter les doubles clics.
   */
  async function handleDelete(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return
    setDeleting(id)
    try {
      await api.delete(`/user/${id}`)
      // Mise à jour locale sans recharger toute la liste
      setUsers((u) => u.filter((x) => x.id !== id))
    } catch {
      alert('Erreur lors de la suppression.')
    } finally {
      setDeleting(null)
    }
  }

  /**
   * Bascule le rôle d'un utilisateur entre ADMIN (roleId=1) et USER (roleId=2).
   * roleId 1 = ADMIN, roleId 2 = USER (cohérent avec les données SQL).
   */
  async function handleToggleRole(u) {
    const newRoleId = u.roleId === 1 ? 2 : 1
    const label = newRoleId === 1 ? 'ADMIN' : 'USER'
    if (!confirm(`Changer le rôle de ${u.email} en ${label} ?`)) return
    setTogglingRole(u.id)
    try {
      const { data } = await api.patch(`/user/${u.id}/role`, { roleId: newRoleId })
      // Remplace uniquement l'utilisateur modifié dans la liste locale
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
              // Comparaison en chaîne pour éviter les problèmes de type int/string
              const isSelf = String(u.id) === String(myId)
              return (
                <tr key={u.id}>
                  <td className="td-muted">#{u.id}</td>
                  <td>{u.nom ?? '—'}</td>
                  {/* Badge "moi" sur la ligne de l'admin connecté */}
                  <td>{u.email} {isSelf && <span className="badge badge-self">moi</span>}</td>
                  <td>
                    {/* Badge cliquable pour changer le rôle — désactivé pour son propre compte */}
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
                    <div className="td-actions">
                      {/* Suppression désactivée pour l'admin connecté (évite l'auto-suppression) */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id || isSelf}
                        title={isSelf ? 'Impossible de supprimer votre propre compte' : ''}
                      >
                        {deleting === u.id ? '...' : 'Supprimer'}
                      </button>
                    </div>
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
