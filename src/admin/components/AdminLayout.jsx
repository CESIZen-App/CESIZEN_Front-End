import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout({ children }) {
  const { user } = useAuth()

  const email =
    user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
    user?.email ??
    'Admin'

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header-title">Back-office CESIZen</h1>
          <div className="admin-header-user">
            <span className="admin-header-email">{email}</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
