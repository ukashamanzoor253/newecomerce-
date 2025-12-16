'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchUsers()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser || !['admin', 'super_admin'].includes(currentUser.profile.role)) {
      router.push('/login')
      return
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserLimits = async (userId, limit, timeLimit) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          user_limit: parseInt(limit),
          order_time_limit: timeLimit || null
        })
        .eq('id', userId)

      if (error) throw error
      alert('User limits updated successfully!')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user limits:', error)
      alert('Failed to update user limits')
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">View and manage user accounts and limits</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredUsers.length} users found
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">{user.email}</h3>
                  <span className={`mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'admin' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Limit
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    defaultValue={user.user_limit || 5}
                    min="1"
                    max="100"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    onBlur={(e) => updateUserLimits(user.id, e.target.value, user.order_time_limit)}
                  />
                  <span className="text-sm text-gray-500">orders</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit
                </label>
                <input
                  type="datetime-local"
                  defaultValue={user.order_time_limit ? new Date(user.order_time_limit).toISOString().slice(0, 16) : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  onBlur={(e) => updateUserLimits(user.id, user.user_limit, e.target.value)}
                />
                {user.order_time_limit && (
                  <button
                    onClick={() => updateUserLimits(user.id, user.user_limit, null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Clear time limit
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                  {user.order_time_limit && (
                    <p className="mt-1">
                      Time limit ends: {new Date(user.order_time_limit).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try a different search term' : 'No users registered yet'}
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="font-medium text-gray-900 mb-4">User Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Regular Users</p>
            <p className="text-2xl font-bold">
              {users.filter(u => u.role === 'user').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Admins</p>
            <p className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}