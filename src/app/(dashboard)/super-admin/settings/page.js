'use client'

import { useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'E-Commerce Dashboard',
    siteDescription: 'Role-based e-commerce system',
    maintenanceMode: false,
    allowRegistrations: true,
    maxOrderLimit: 100,
    defaultUserLimit: 5
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useState(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.profile.role !== 'super_admin') {
      router.push('/login')
      return
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    // In a real app, you would save to Supabase
    setTimeout(() => {
      alert('Settings saved successfully!')
      setSaving(false)
    }, 1000)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        siteName: 'E-Commerce Dashboard',
        siteDescription: 'Role-based e-commerce system',
        maintenanceMode: false,
        allowRegistrations: true,
        maxOrderLimit: 100,
        defaultUserLimit: 5
      })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure global system settings</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-600">When enabled, only admins can access the site</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Allow New Registrations</h3>
                  <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowRegistrations"
                    checked={settings.allowRegistrations}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* User Limits */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">User Limits Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Order Limit
                </label>
                <input
                  type="number"
                  name="maxOrderLimit"
                  value={settings.maxOrderLimit}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Maximum orders any user can place</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default User Limit
                </label>
                <input
                  type="number"
                  name="defaultUserLimit"
                  value={settings.defaultUserLimit}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Default order limit for new users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Quick Actions</h2>
            
            <div className="space-y-4">
              <button className="w-full text-left p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200">
                <h3 className="font-medium text-red-700">Clear All Data</h3>
                <p className="text-sm text-red-600">Remove all users, products, and orders</p>
              </button>

              <button className="w-full text-left p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-yellow-700">Export Database</h3>
                <p className="text-sm text-yellow-600">Export all data as CSV files</p>
              </button>

              <button className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-700">Backup System</h3>
                <p className="text-sm text-blue-600">Create a complete system backup</p>
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">System Information</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Version</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Database</p>
                <p className="font-medium">Supabase</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Framework</p>
                <p className="font-medium">Next.js 14</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}