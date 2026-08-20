import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from './useAuth'
import * as authApi from '../api/authApi'

export default function useGoogleAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hiddenButtonNode, setHiddenButtonNode] = useState(null)
  const [googleReady, setGoogleReady] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const hiddenButtonRef = (node) => {
    setHiddenButtonNode(node)
  }

  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response || !response.credential) return

      try {
        setLoading(true)
        setError(null)
        const result = await authApi.googleLogin(response.credential)
        login(result.user, result.access, result.refresh)
        navigate('/jobs')
      } catch (err) {
        let message = 'Google Sign-In failed. Please try again or log in with email.'
        if (!err.response) {
          message = 'Unable to connect to the backend server. Please ensure Django is running.'
        } else if (err.response?.data) {
          const d = err.response.data
          if (typeof d.detail === 'string') {
            message = d.detail
          } else if (typeof d.message === 'string') {
            message = d.message
          } else if (Array.isArray(d.non_field_errors)) {
            message = d.non_field_errors.join(' ')
          } else if (typeof d === 'object') {
            const firstKey = Object.keys(d)[0]
            if (firstKey && Array.isArray(d[firstKey])) {
              message = `${firstKey}: ${d[firstKey].join(' ')}`
            }
          }
        }
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [login, navigate]
  )

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    let intervalId = null

    const initGoogle = () => {
      if (window.google?.accounts?.id && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          })
          setGoogleReady(true)
        } catch (e) {
          console.error('Failed to initialize Google Identity Services:', e)
        }
        if (intervalId) clearInterval(intervalId)
      }
    }

    initGoogle()

    if (!window.google?.accounts?.id) {
      intervalId = setInterval(initGoogle, 300)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [handleCredentialResponse])

  useEffect(() => {
    if (hiddenButtonNode && window.google?.accounts?.id && googleReady) {
      try {
        window.google.accounts.id.renderButton(hiddenButtonNode, {
          theme: 'outline',
          size: 'large',
          width: 300,
        })
      } catch (e) {
        console.error('Failed to render fallback Google button:', e)
      }
    }
  }, [hiddenButtonNode, googleReady])

  const triggerGoogleSignIn = () => {
    setError(null)
    if (window.google?.accounts?.id && googleReady) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const hiddenBtn = hiddenButtonNode?.querySelector('div[role="button"]')
            if (hiddenBtn) {
              hiddenBtn.click()
            } else {
              setError(
                'Google Sign-In could not start. Please check that third-party cookies are allowed for this site, or try again.'
              )
            }
          }
        })
      } catch (err) {
        console.warn('One Tap prompt error, falling back to hidden button:', err)
        const hiddenBtn = hiddenButtonNode?.querySelector('div[role="button"]')
        if (hiddenBtn) {
          hiddenBtn.click()
        } else {
          setError(
            'Google Sign-In could not start. Please check that third-party cookies are allowed for this site, or try again.'
          )
        }
      }
    } else {
      console.warn('Google Identity Services script is not initialized yet.')
    }
  }

  return { triggerGoogleSignIn, loading, error, hiddenButtonRef }
}