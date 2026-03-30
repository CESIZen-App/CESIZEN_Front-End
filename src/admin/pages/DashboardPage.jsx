import { useEffect, useState } from 'react'
import api from '../services/api'

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-card-icon" style={{ backgroundColor: color + '20', color }}>
        {icon}
      </div>
      <div>
        <div className="stat-card-value">{value ?? '—'}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ users: null, exercices: null, pages: null })

  useEffect(() => {
    async function load() {
      try {
        const [u, e, p] = await Promise.allSettled([
          api.get('/user'),
          api.get('/exercice'),
          api.get('/information/all'),
        ])
        setStats({
          users: u.status === 'fulfilled' ? u.value.data.length : '—',
          exercices: e.status === 'fulfilled' ? e.value.data.length : '—',
          pages: p.status === 'fulfilled' ? p.value.data.length : '—',
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

      <div className="stat-grid">
        <StatCard label="Utilisateurs" value={stats.users} icon="👤" color="#8B5CF6" />
        <StatCard label="Exercices" value={stats.exercices} icon="🫁" color="#06B6D4" />
        <StatCard label="Pages d'information" value={stats.pages} icon="📄" color="#10B981" />
      </div>

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
