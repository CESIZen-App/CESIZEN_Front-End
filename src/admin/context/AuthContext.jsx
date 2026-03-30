import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))

  const user = token ? parseJwt(token) : null
  const role =
    user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    user?.role ??
    null

  const login = useCallback((jwt) => {
    localStorage.setItem('admin_token', jwt)
    setToken(jwt)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setToken(null)
  }, [])

  const isAdmin = role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ token, user, role, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
