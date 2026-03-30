import { useEffect, useState } from 'react'
import api from '../services/api'

const EMPTY = { titre: '', contenu: '', isPublished: false }

export default function InformationPage() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | { ...page }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const { data } = await api.get('/information/all')
      setPages(data)
    } catch {
      setError('Impossible de charger les pages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(EMPTY)
    setModal('create')
  }

  function openEdit(page) {
    setForm({ titre: page.titre, contenu: page.contenu, isPublished: page.isPublished })
    setModal(page)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        const { data } = await api.post('/information', form)
        setPages((p) => [...p, data])
      } else {
        const { data } = await api.put(`/information/${modal.id}`, form)
        setPages((p) => p.map((x) => (x.id === modal.id ? data : x)))
      }
      setModal(null)
    } catch {
      alert('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette page ?')) return
    try {
      await api.delete(`/information/${id}`)
      setPages((p) => p.filter((x) => x.id !== id))
    } catch {
      alert('Erreur lors de la suppression.')
    }
  }

  async function togglePublish(page) {
    try {
      const { data } = await api.put(`/information/${page.id}`, {
        isPublished: !page.isPublished,
      })
      setPages((p) => p.map((x) => (x.id === page.id ? data : x)))
    } catch {
      alert('Erreur.')
    }
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Pages d'information</h2>
          <p className="page-subtitle">{pages.length} page(s)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouvelle page
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titre</th>
              <th>Statut</th>
              <th>Mise à jour</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td className="td-muted">#{p.id}</td>
                <td>{p.titre}</td>
                <td>
                  <button
                    className={`badge badge-clickable ${p.isPublished ? 'badge-published' : 'badge-draft'}`}
                    onClick={() => togglePublish(p)}
                    title="Cliquer pour changer le statut"
                  >
                    {p.isPublished ? 'Publié' : 'Brouillon'}
                  </button>
                </td>
                <td className="td-muted">
                  {new Date(p.updatedAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="td-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                    Modifier
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && (
          <div className="table-empty">Aucune page créée.</div>
        )}
      </div>

      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'create' ? 'Nouvelle page' : 'Modifier la page'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group">
                <label className="form-label">Titre</label>
                <input
                  className="form-input"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  placeholder="Titre de la page"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contenu</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.contenu}
                  onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                  placeholder="Contenu de la page..."
                  rows={8}
                />
              </div>
              <div className="form-group form-group-inline">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                <label htmlFor="isPublished" className="form-label-inline">
                  Publier immédiatement
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
