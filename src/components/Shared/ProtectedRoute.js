'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Loading from './Loading'
import Error from './Error'

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login',
  showLoading = true
}) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const currentUser = await getCurrentUser()
      
      if (!currentUser) {
        // No user logged in
        router.push(redirectTo)
        return
      }

      // Check if user has required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.profile.role)) {
        // User doesn't have required role
        setError('You do not have permission to access this page')
        
        // Redirect based on user role
        switch(currentUser.profile.role) {
          case 'super_admin':
            router.push('/super-admin/dashboard')
            break
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'user':
            router.push('/user/dashboard')
            break
          default:
            router.push(redirectTo)
        }
        return
      }

      setUser(currentUser)
    } catch (error) {
      console.error('Auth check error:', error)
      setError('Authentication check failed')
      router.push(redirectTo)
    } finally {
      setLoading(false)
    }
  }

  if (loading && showLoading) {
    return <Loading message="Checking authentication..." fullScreen={true} />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Error 
          message={error}
          onRetry={checkAuth}
          onClose={() => router.push('/')}
        />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return children
}

// Higher-order component version
export function withAuth(Component, options = {}) {
  return function ProtectedComponent(props) {
    const { allowedRoles = [], redirectTo = '/login' } = options
    
    return (
      <ProtectedRoute 
        allowedRoles={allowedRoles} 
        redirectTo={redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Role-specific protected routes
export const withSuperAdmin = (Component) => withAuth(Component, { allowedRoles: ['super_admin'] })
export const withAdmin = (Component) => withAuth(Component, { allowedRoles: ['admin', 'super_admin'] })
export const withUser = (Component) => withAuth(Component, { allowedRoles: ['user', 'admin', 'super_admin'] })

// Public route that redirects if already logged in
export function PublicRoute({ children, redirectTo = '/dashboard' }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      
      if (currentUser) {
        // User is logged in, redirect to appropriate dashboard
        switch(currentUser.profile.role) {
          case 'super_admin':
            router.push('/super-admin/dashboard')
            break
          case 'admin':
            router.push('/admin/dashboard')
            break
          default:
            router.push('/user/dashboard')
        }
        return
      }

      setUser(currentUser)
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading message="Loading..." fullScreen={true} />
  }

  if (user) {
    return null // Will redirect in useEffect
  }

  return children
}