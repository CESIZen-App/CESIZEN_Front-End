// Page Tableau de bord du back-office.
// Affiche trois statistiques globales (nombre d'utilisateurs, d'exercices et de pages d'information)
// récupérées en parallèle depuis l'API au chargement du composant.
// En cas d'échec pour l'une des requêtes, la statistique correspondante affiche "—".

import { useEffect, useState } from 'react'
import api from '../services/api'

/**
 * Carte de statistique affichant une valeur, un libellé et une icône colorée.
 * @param {string} label - Libellé affiché sous la valeur
 * @param {number|string} value - Valeur numérique (ou "—" si indisponible)
 * @param {string} icon - Chemin vers l'icône
 * @param {string} color - Couleur principale de la carte (bordure et fond d'icône)
 */
function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-card-icon" style={{ backgroundColor: color + '20' }}>
        <img src={icon} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
      </div>
      <div>
        <div className="stat-card-value">{value ?? '—'}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  // État des statistiques : initialisées à null (affichage "—" pendant le chargement)
  const [stats, setStats] = useState({ users: null, exercices: null, pages: null })

  useEffect(() => {
    /**
     * Charge les statistiques en parallèle avec Promise.allSettled.
     * allSettled garantit que toutes les promesses sont attendues même si l'une échoue.
     */
    async function load() {
      try {
        const [u, e, p] = await Promise.allSettled([
          api.get('/user'),
          api.get('/exercice'),
          api.get('/information/all'),
        ])
        setStats({
          // Si la requête a réussi, on compte les éléments ; sinon "—"
          users:    u.status === 'fulfilled' ? u.value.data.length : '—',
          exercices: e.status === 'fulfilled' ? e.value.data.length : '—',
          pages:    p.status === 'fulfilled' ? p.value.data.length : '—',
        })
      } catch {}
    }
    load()
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Tableau de bord</h2>
        <p className="page-subtitle">Vue d'ensemble de l'application</p>
      </div>

      {/* Grille des statistiques */}
      <div className="stat-grid">
        <StatCard label="Utilisateurs"       value={stats.users}     icon="/utilisateur(2).png" color="#8B5CF6" />
        <StatCard label="Exercices"           value={stats.exercices} icon="/poumons.png"         color="#06B6D4" />
        <StatCard label="Pages d'information" value={stats.pages}     icon="/information.png"    color="#10B981" />
      </div>

      {/* Message de bienvenue */}
      <div className="dashboard-welcome">
        <h3>Bienvenue dans le back-office CESIZen</h3>
        <p>
          Gérez les utilisateurs, les pages d'information et les exercices de respiration
          depuis ce tableau de bord.
        </p>
      </div>
    </div>
  )
}
