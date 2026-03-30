import { useEffect, useState } from 'react'
import api from '../services/api'

const EMPTY = { titre: '', description: '', isPublic: false }

export default function ExercicesPage() {
  const [exercices, setExercices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | { ...exercice }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const { data } = await api.get('/exercice')
      setExercices(data)
    } catch {
      setError('Impossible de charger les exercices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(EMPTY)
    setModal('create')
  }

  function openEdit(ex) {
    setForm({ titre: ex.titre, description: ex.description ?? '', isPublic: ex.isPublic })
    setModal(ex)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        const { data } = await api.post('/exercice', form)
        setExercices((p) => [...p, data])
      } else {
        const { data } = await api.put(`/exercice/${modal.id}`, form)
        setExercices((p) => p.map((x) => (x.id === modal.id ? data : x)))
      }
      setModal(null)
    } catch {
      alert('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet exercice ?')) return
    try {
      await api.delete(`/exercice/${id}`)
      setExercices((p) => p.filter((x) => x.id !== id))
    } catch {
      alert('Erreur lors de la suppression.')
    }
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Exercices de respiration</h2>
          <p className="page-subtitle">{exercices.length} exercice(s)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouvel exercice
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titre</th>
              <th>Description</th>
              <th>Visibilité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercices.map((ex) => (
              <tr key={ex.id}>
                <td className="td-muted">#{ex.id}</td>
                <td>{ex.titre}</td>
                <td className="td-truncate">{ex.description ?? '—'}</td>
                <td>
                  <span className={`badge ${ex.isPublic ? 'badge-published' : 'badge-draft'}`}>
                    {ex.isPublic ? 'Public' : 'Privé'}
                  </span>
                </td>
                <td className="td-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ex)}>
                    Modifier
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ex.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {exercices.length === 0 && (
          <div className="table-empty">Aucun exercice créé.</div>
        )}
      </div>

      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'create' ? 'Nouvel exercice' : 'Modifier l\'exercice'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group">
                <label className="form-label">Titre</label>
                <input
                  className="form-input"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  placeholder="Ex : Respiration 4-7-8"
                  required
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description de l'exercice..."
                  rows={5}
                />
              </div>
              <div className="form-group form-group-inline">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={form.isPublic}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                />
                <label htmlFor="isPublic" className="form-label-inline">
                  Rendre public (visible par tous les utilisateurs)
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
