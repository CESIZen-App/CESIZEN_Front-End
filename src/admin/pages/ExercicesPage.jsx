// Page de gestion des exercices de respiration du back-office.
// Affiche la liste des exercices avec leur configuration (temps inspire/expire/pause, cycles).
// Permet de créer, modifier et supprimer des exercices et leurs configurations associées.
// Des presets (4-7-8, 5-5, 4-6) permettent de pré-remplir rapidement les champs de configuration.

import { useEffect, useState } from 'react'
import api from '../services/api'

// Valeurs par défaut pour la configuration d'un nouvel exercice
const EMPTY_CFG = { tempsInspire: 4, tempsExpire: 4, tempsPause: 0, nombreCycles: 8 }
// Valeurs par défaut pour un nouvel exercice complet (champs + config)
const EMPTY_EX  = { titre: '', description: '', isPublic: false, config: EMPTY_CFG }

// Presets de respiration prédéfinis (correspondant aux techniques connues)
const PRESETS = [
  { label: '4-7-8', type: 'Technique748', values: { tempsInspire: 4, tempsPause: 7, tempsExpire: 8, nombreCycles: 8 } },
  { label: '5-5',   type: 'Technique55',  values: { tempsInspire: 5, tempsPause: 0, tempsExpire: 5, nombreCycles: 8 } },
  { label: '4-6',   type: 'Technique46',  values: { tempsInspire: 4, tempsPause: 0, tempsExpire: 6, nombreCycles: 8 } },
]

export default function ExercicesPage() {
  // Liste des exercices, chacun enrichi avec sa config de respiration (peut être null)
  const [exercices, setExercices] = useState([])
  // Indicateur de chargement initial
  const [loading, setLoading]     = useState(true)
  // Message d'erreur de chargement
  const [error, setError]         = useState('')
  // État de la modale : null = fermée, 'create' = création, objet exercice = édition
  const [modal, setModal]         = useState(null)
  // Données du formulaire dans la modale
  const [form, setForm]           = useState(EMPTY_EX)
  // Indicateur de sauvegarde en cours
  const [saving, setSaving]       = useState(false)

  /**
   * Charge tous les exercices depuis l'API, puis enrichit chacun avec sa configuration de respiration.
   * La config est récupérée en parallèle pour chaque exercice via Promise.all.
   */
  async function load() {
    try {
      const { data: exs } = await api.get('/exercice')
      // Pour chaque exercice, on tente de récupérer sa config (premier élément du tableau)
      const withConfigs = await Promise.all(
        exs.map(async (ex) => {
          try {
            const { data: cfgs } = await api.get(`/configrespiration/exercice/${ex.id}`)
            return { ...ex, config: cfgs[0] ?? null }
          } catch {
            return { ...ex, config: null }
          }
        })
      )
      setExercices(withConfigs)
    } catch {
      setError('Impossible de charger les exercices.')
    } finally {
      setLoading(false)
    }
  }

  // Chargement au montage du composant
  useEffect(() => { load() }, [])

  /**
   * Applique un preset de respiration sur les champs de configuration du formulaire.
   * Fusionne les valeurs du preset avec la config existante (préserve les autres champs).
   */
  function applyPreset(preset) {
    setForm(f => ({ ...f, config: { ...f.config, ...preset.values } }))
  }

  /** Ouvre la modale en mode création avec un formulaire vide. */
  function openCreate() {
    setForm(EMPTY_EX)
    setModal('create')
  }

  /** Ouvre la modale en mode édition, pré-remplie avec les données de l'exercice. */
  function openEdit(ex) {
    setForm({
      titre: ex.titre,
      description: ex.description ?? '',
      isPublic: ex.isPublic ?? false,
      // Si une config existe, on reprend ses valeurs ; sinon on utilise les valeurs par défaut
      config: ex.config
        ? { tempsInspire: ex.config.tempsInspire, tempsExpire: ex.config.tempsExpire, tempsPause: ex.config.tempsPause ?? 0, nombreCycles: ex.config.nombreCycles }
        : EMPTY_CFG,
    })
    setModal(ex)
  }

  /**
   * Soumet le formulaire : crée ou met à jour l'exercice ET sa configuration.
   * En création : POST exercice → POST config.
   * En édition   : PUT exercice → PUT config (si elle existe) ou POST config (si absente).
   */
  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      let exData
      if (modal === 'create') {
        // Création de l'exercice puis de sa configuration
        const { data } = await api.post('/exercice', { titre: form.titre, description: form.description, isPublic: form.isPublic })
        exData = data
        const { data: cfgData } = await api.post('/configrespiration', { exerciceId: exData.id, ...form.config })
        setExercices(p => [...p, { ...exData, config: cfgData }])
      } else {
        // Mise à jour de l'exercice
        const { data } = await api.put(`/exercice/${modal.id}`, { titre: form.titre, description: form.description, isPublic: form.isPublic })
        exData = data
        let cfgData
        if (modal.config) {
          // La config existe déjà : on la met à jour
          const res = await api.put(`/configrespiration/${modal.config.id}`, form.config)
          cfgData = res.data
        } else {
          // Pas encore de config : on en crée une
          const res = await api.post('/configrespiration', { exerciceId: modal.id, ...form.config })
          cfgData = res.data
        }
        // Remplacement de l'exercice modifié dans la liste locale
        setExercices(p => p.map(x => x.id === modal.id ? { ...exData, config: cfgData } : x))
      }
      setModal(null)
    } catch {
      alert('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Supprime un exercice après confirmation.
   * La suppression en cascade côté API supprime aussi la configuration associée.
   */
  async function handleDelete(id) {
    if (!confirm('Supprimer cet exercice ?')) return
    try {
      await api.delete(`/exercice/${id}`)
      setExercices(p => p.filter(x => x.id !== id))
    } catch {
      alert('Erreur lors de la suppression.')
    }
  }

  /**
   * Met à jour un champ de la configuration de respiration dans le formulaire.
   * Utilise le merge immuable pour ne modifier que le champ concerné.
   */
  function setCfg(field, value) {
    setForm(f => ({ ...f, config: { ...f.config, [field]: value } }))
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Exercices de respiration</h2>
          <p className="page-subtitle">{exercices.length} exercice(s)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouvel exercice</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titre</th>
              <th>Visibilité</th>
              <th>Inspire</th>
              <th>Expire</th>
              <th>Pause</th>
              <th>Cycles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercices.map(ex => (
              <tr key={ex.id}>
                <td className="td-muted">#{ex.id}</td>
                <td>
                  <div>{ex.titre}</div>
                  {ex.description && <div className="td-description">{ex.description}</div>}
                </td>
                <td>
                  <span className={`badge ${ex.isPublic ? 'badge-published' : 'badge-draft'}`}>
                    {ex.isPublic ? 'Public' : 'Privé'}
                  </span>
                </td>
                {/* Affichage des paramètres de configuration si elle existe */}
                {ex.config ? (
                  <>
                    <td className="td-cfg">{ex.config.tempsInspire}s</td>
                    <td className="td-cfg">{ex.config.tempsExpire}s</td>
                    <td className="td-cfg">{ex.config.tempsPause ?? 0}s</td>
                    <td className="td-cfg">{ex.config.nombreCycles}</td>
                  </>
                ) : (
                  <td colSpan={4} className="td-muted" style={{ fontStyle: 'italic' }}>
                    Aucune configuration
                  </td>
                )}
                <td>
                  <div className="td-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ex)}>Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ex.id)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {exercices.length === 0 && <div className="table-empty">Aucun exercice créé.</div>}
      </div>

      {/* Modale de création / édition */}
      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          {/* stopPropagation empêche la fermeture en cliquant dans la modale */}
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'create' ? 'Nouvel exercice' : "Modifier l'exercice"}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            <form onSubmit={handleSave} className="modal-body">

              {/* Champs principaux de l'exercice */}
              <div className="form-group">
                <label className="form-label">Titre</label>
                <input
                  className="form-input"
                  value={form.titre}
                  onChange={e => setForm({ ...form, titre: e.target.value })}
                  placeholder="Ex : Respiration 4-7-8"
                  required maxLength={100}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Description de l'exercice..."
                  rows={3}
                />
              </div>
              <div className="form-group form-group-inline">
                <input
                  type="checkbox" id="isPublic"
                  checked={form.isPublic}
                  onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                />
                <label htmlFor="isPublic" className="form-label-inline">
                  Rendre public (visible par tous les utilisateurs)
                </label>
              </div>

              {/* Section configuration de respiration */}
              <div className="cfg-divider">
                <span>Configuration de respiration</span>
              </div>

              {/* Boutons preset : pré-remplissent les champs de configuration */}
              <div className="preset-buttons" style={{ marginBottom: 16 }}>
                {PRESETS.map(p => (
                  <button key={p.type} type="button" className="btn-preset" onClick={() => applyPreset(p)}>
                    <span className="preset-label">{p.label}</span>
                    <span className="preset-desc">{p.values.tempsInspire}s · {p.values.tempsPause > 0 ? `${p.values.tempsPause}s · ` : ''}{p.values.tempsExpire}s</span>
                  </button>
                ))}
              </div>

              {/* Champs de saisie pour les paramètres de respiration */}
              <div className="cfg-grid">
                {[
                  ['Inspire (s)', 'tempsInspire', 1],
                  ['Expire (s)',  'tempsExpire',  1],
                  ['Pause (s)',   'tempsPause',   0],
                  ['Cycles',     'nombreCycles',  1],
                ].map(([label, key, min]) => (
                  <label key={key} className="cfg-field">
                    <span className="cfg-field-label">{label}</span>
                    <input
                      type="number" min={min} className="form-input"
                      value={form.config[key]}
                      onChange={e => setCfg(key, +e.target.value)}
                      required={min > 0}
                    />
                  </label>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Annuler</button>
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
