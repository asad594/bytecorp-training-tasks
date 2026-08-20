/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import { logoutUser } from '../api/authApi'

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
  const [refreshToken, setRefreshToken] = useState(() => {
    try {
      return localStorage.getItem('jobboard_refresh') || null
    } catch {
      return null
    }
  })

  const login = (userData, accessToken, refreshTokenData) => {
    setUser(userData)
    setToken(accessToken)
    setRefreshToken(refreshTokenData || null)
    try {
      localStorage.setItem('jobboard_user', JSON.stringify(userData))
      localStorage.setItem('jobboard_token', accessToken)
      if (refreshTokenData) {
        localStorage.setItem('jobboard_refresh', refreshTokenData)
      }
    } catch (e) {
      console.error('Failed to save auth session to localStorage:', e)
    }
  }

  const logout = async () => {
    const currentRefreshToken = refreshToken || localStorage.getItem('jobboard_refresh')
    try {
      if (currentRefreshToken) {
        await logoutUser(currentRefreshToken)
      }
    } catch (e) {
      console.warn('Backend logout request failed or already invalidated:', e)
    } finally {
      setUser(null)
      setToken(null)
      setRefreshToken(null)
      try {
        localStorage.removeItem('jobboard_user')
        localStorage.removeItem('jobboard_token')
        localStorage.removeItem('jobboard_refresh')
      } catch (e) {
        console.error('Failed to clear auth session from localStorage:', e)
      }
    }
  }

  const value = {
    user,
    token,
    refreshToken,
    loading: false,
    isAuthenticated: !!token,
    role: user?.role || 'guest',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

