// Composant racine de l'application.
// Définit le routeur principal et enveloppe l'arborescence dans le contexte d'authentification (AuthProvider).
// Toutes les routes du back-office sont protégées via <ProtectedRoute> qui vérifie que l'utilisateur est ADMIN.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './admin/context/AuthContext'
import ProtectedRoute from './admin/components/ProtectedRoute'
import AdminLayout from './admin/components/AdminLayout'
import LoginPage from './admin/pages/LoginPage'
import DashboardPage from './admin/pages/DashboardPage'
import UsersPage from './admin/pages/UsersPage'
import InformationPage from './admin/pages/InformationPage'
import ExercicesPage from './admin/pages/ExercicesPage'
import './admin/admin.css'

export default function App() {
  return (
    <BrowserRouter>
      {/* Fournit le contexte d'authentification à toute l'arborescence */}
      <AuthProvider>
        <Routes>
          {/* Redirection racine vers le back-office */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Login — accessible sans auth */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Back-office — ADMIN uniquement */}
          {/* Chaque route est enveloppée dans <ProtectedRoute> + <AdminLayout> */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <UsersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/information"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <InformationPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exercices"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ExercicesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Toute URL inconnue redirige vers le tableau de bord (ou login si non authentifié) */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
