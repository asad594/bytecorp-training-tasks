import { createContext, useState } from 'react'

/**
 * Note for React Fast Refresh: AuthContext object and AuthProvider component
 * are kept together for simplicity. If Fast Refresh warnings occur, split into
 * AuthContext.js (context object) and AuthProvider.jsx (provider component).
 */
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('jobboard_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('jobboard_token') || null
    } catch {
      return null
    }
  })

  const login = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    try {
      localStorage.setItem('jobboard_user', JSON.stringify(userData))
      localStorage.setItem('jobboard_token', tokenData)
    } catch (e) {
      console.error('Failed to save auth session to localStorage:', e)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    try {
      localStorage.removeItem('jobboard_user')
      localStorage.removeItem('jobboard_token')
    } catch (e) {
      console.error('Failed to clear auth session from localStorage:', e)
    }
  }

  const value = {
    user,
    token,
    loading: false,
    isAuthenticated: !!token,
    role: user?.role || 'guest',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
