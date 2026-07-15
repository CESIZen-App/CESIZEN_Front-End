// Page de gestion des pages d'information du back-office.
// Affiche la liste de toutes les pages (publiées et brouillons),
// permet de créer, modifier, supprimer et basculer le statut de publication.
// La modale est partagée pour la création et l'édition (modal = 'create' ou l'objet page).

import { useEffect, useState } from 'react'
import api from '../services/api'

// Formulaire vide utilisé lors de la création d'une nouvelle page
const EMPTY = { titre: '', contenu: '', isPublished: false }

export default function InformationPage() {
  // Liste des pages d'information
  const [pages, setPages] = useState([])
  // Indicateur de chargement initial
  const [loading, setLoading] = useState(true)
  // État de la modale : null = fermée, 'create' = création, objet = édition
  const [modal, setModal] = useState(null)
  // Données du formulaire dans la modale
  const [form, setForm] = useState(EMPTY)
  // Indicateur de sauvegarde en cours
  const [saving, setSaving] = useState(false)
  // Message d'erreur de chargement
  const [error, setError] = useState('')

  /**
   * Charge toutes les pages depuis l'API (y compris les brouillons — endpoint /all réservé admin).
   */
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

  // Chargement au montage du composant
  useEffect(() => { load() }, [])

  /** Ouvre la modale en mode création avec un formulaire vide. */
  function openCreate() {
    setForm(EMPTY)
    setModal('create')
  }

  /** Ouvre la modale en mode édition, pré-remplie avec les données de la page existante. */
  function openEdit(page) {
    setForm({ titre: page.titre, contenu: page.contenu, isPublished: page.isPublished })
    setModal(page)
  }

  /**
   * Soumet le formulaire : crée ou met à jour la page selon l'état de modal.
   * Met à jour la liste locale sans recharger depuis l'API.
   */
  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        // Création : POST puis ajout en fin de liste
        const { data } = await api.post('/information', form)
        setPages((p) => [...p, data])
      } else {
        // Édition : PUT puis remplacement dans la liste locale
        const { data } = await api.put(`/information/${modal.id}`, form)
        setPages((p) => p.map((x) => (x.id === modal.id ? data : x)))
      }
      setModal(null)
    } catch (err) {
      const msg = err?.response?.data?.error ?? err?.response?.data ?? err?.message ?? 'Erreur inconnue'
      console.error('handleSave error:', err?.response?.status, msg, err)
      alert(`Erreur lors de la sauvegarde (${err?.response?.status ?? 'réseau'}) : ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  /**
   * Supprime une page après confirmation.
   * Retire la page de la liste locale si l'API répond avec succès.
   */
  async function handleDelete(id) {
    if (!confirm('Supprimer cette page ?')) return
    try {
      await api.delete(`/information/${id}`)
      setPages((p) => p.filter((x) => x.id !== id))
    } catch (err) {
      const msg = err?.response?.data?.error ?? err?.response?.data ?? err?.message ?? 'Erreur inconnue'
      console.error('handleDelete error:', err?.response?.status, msg, err)
      alert(`Erreur lors de la suppression (${err?.response?.status ?? 'réseau'}) : ${msg}`)
    }
  }

  /**
   * Bascule le statut de publication d'une page (publié ↔ brouillon).
   * Envoie uniquement le champ isPublished modifié.
   */
  async function togglePublish(page) {
    try {
      const { data } = await api.put(`/information/${page.id}`, {
        isPublished: !page.isPublished,
      })
      setPages((p) => p.map((x) => (x.id === page.id ? data : x)))
    } catch (err) {
      const msg = err?.response?.data?.error ?? err?.response?.data ?? err?.message ?? 'Erreur inconnue'
      console.error('togglePublish error:', err?.response?.status, msg, err)
      alert(`Erreur (${err?.response?.status ?? 'réseau'}) : ${msg}`)
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
                  {/* Badge cliquable pour basculer le statut sans ouvrir la modale */}
                  <button
                    className={`badge badge-clickable ${p.isPublished ? 'badge-published' : 'badge-draft'}`}
                    onClick={() => togglePublish(p)}
                    title="Cliquer pour changer le statut"
                  >
                    {p.isPublished ? 'Publié' : 'Brouillon'}
                  </button>
                </td>
                <td className="td-muted">
                  {/* Formatage de la date en locale française */}
                  {new Date(p.updatedAt).toLocaleDateString('fr-FR')}
                </td>
                <td>
                  <div className="td-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                      Modifier
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && (
          <div className="table-empty">Aucune page créée.</div>
        )}
      </div>

      {/* Modale de création / édition — fermée en cliquant sur l'overlay */}
      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          {/* stopPropagation empêche la fermeture en cliquant dans la modale */}
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
                {/* Désactivé pendant la sauvegarde pour éviter les double-soumissions */}
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
