import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token, isAdmin } = useAuth()

  if (!token) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return children
}
