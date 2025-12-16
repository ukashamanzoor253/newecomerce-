'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function OrderCard({ 
  order, 
  userRole = 'user',
  onUpdateStatus,
  onCancel,
  showUserInfo = false,
  showProductInfo = true
}) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(order.status)

  const handleStatusChange = async (newStatus) => {
    if (loading) return
    
    setLoading(true)
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(order.id, newStatus)
      }
      setStatus(newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    
    setLoading(true)
    try {
      if (onCancel) {
        await onCancel(order.id)
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return '✅'
      case 'processing': return '🔄'
      case 'pending': return '⏳'
      case 'cancelled': return '❌'
      default: return '📦'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(status)}`}>
                <span className="text-lg">{getStatusIcon(status)}</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {userRole !== 'user' && (
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={loading}
                  className={`text-sm border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    getStatusColor(status).split(' ')[0]
                  } border-opacity-50 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {loading && (
                  <div className="absolute right-2 top-2">
                    <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            )}
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(order.total_price)}
              </p>
              <p className="text-sm text-gray-500">Total Amount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product Information */}
          {showProductInfo && order.products && (
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Product Details</h4>
              <div className="flex items-start space-x-4">
                {order.products.image_url ? (
                  <img 
                    src={order.products.image_url} 
                    alt={order.products.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">📦</span>
                  </div>
                )}
                <div>
                  <h5 className="font-medium text-gray-900">{order.products.name}</h5>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {order.products.description || 'No description'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm font-medium text-gray-700">
                      Qty: {order.quantity}
                    </span>
                    <span className="text-sm text-gray-500">
                      Price: {formatCurrency(order.products.price)} each
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Order Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="text-sm font-medium">{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="text-sm font-medium">{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unit Price:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(order.total_price / order.quantity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Information (for admins) */}
        {showUserInfo && order.profiles && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {order.profiles.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.profiles.email}</p>
                <p className="text-sm text-gray-500">
                  Ordered on {formatDate(order.created_at)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {(userRole === 'user' && status === 'pending') && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}