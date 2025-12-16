'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function UserOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchOrders()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.profile.role !== 'user') {
      router.push('/login')
      return
    }
  }

  const fetchOrders = async () => {
    try {
      const currentUser = await getCurrentUser()
      const { data, error } = await supabase
        .from('orders')
        .select('*, products(*)')
        .eq('user_id', currentUser.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">View your order history and status</p>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-700">Total Orders</p>
          <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-700">Completed</p>
          <p className="text-2xl font-bold text-green-900">
            {orders.filter(o => o.status === 'completed').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-red-700">Cancelled</p>
          <p className="text-2xl font-bold text-red-900">
            {orders.filter(o => o.status === 'cancelled').length}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Start shopping to see your orders here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {order.products?.image_url ? (
                      <img 
                        src={order.products.image_url} 
                        alt={order.products.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">📦</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{order.products?.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Order #: {order.id.slice(0, 8)}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-lg font-bold text-gray-900">
                          ${order.total_price}
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full">
                          Qty: {order.quantity}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {/* Order Details */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Order Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Order Status</p>
                      <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">${order.total_price}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Legend */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="font-medium text-gray-900 mb-4">Order Status Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <div>
              <p className="text-sm font-medium">Pending</p>
              <p className="text-xs text-gray-600">Order received, awaiting processing</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <div>
              <p className="text-sm font-medium">Processing</p>
              <p className="text-xs text-gray-600">Order is being prepared</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <div>
              <p className="text-sm font-medium">Completed</p>
              <p className="text-xs text-gray-600">Order has been completed</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <div>
              <p className="text-sm font-medium">Cancelled</p>
              <p className="text-xs text-gray-600">Order has been cancelled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}