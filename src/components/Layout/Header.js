'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header({ 
  user, 
  onMenuClick, 
  showSidebarButton = true 
}) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()

  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    if (pathSegments.length === 0) return 'Dashboard'
    
    const lastSegment = pathSegments[pathSegments.length - 1]
    
    // Map path segments to readable titles
    const titleMap = {
      'dashboard': 'Dashboard',
      'products': 'Products',
      'orders': 'Orders',
      'users': 'Users',
      'admins': 'Admins',
      'settings': 'Settings'
    }
    
    return titleMap[lastSegment] || lastSegment.replace('-', ' ')
  }

  const getUserRole = () => {
    const role = user?.profile?.role || 'user'
    return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          {showSidebarButton && (
            <button
              onClick={onMenuClick}
              className="mr-4 text-gray-500 hover:text-gray-700 md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {getPageTitle()}
            </h2>
            <p className="text-sm text-gray-600 hidden md:block">
              {user?.profile?.role === 'super_admin' ? 'Super Admin Panel' :
               user?.profile?.role === 'admin' ? 'Admin Panel' :
               'User Dashboard'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {user?.profile?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.profile?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">
                  {getUserRole()}
                </p>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.profile?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.profile?.role?.replace('_', ' ')}</p>
                </div>
                <Link
                  href={`/${user?.profile?.role}/dashboard`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href={`/${user?.profile?.role}/settings`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  Settings
                </Link>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      signOut()
                      window.location.href = '/login'
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}