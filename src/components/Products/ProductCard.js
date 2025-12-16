'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ProductCard({ 
  product, 
  userRole = 'user',
  onEdit,
  onDelete,
  onToggleStatus,
  onUpdateStock,
  onOrder,
  showActions = true,
  showStockControls = false,
  hasOrdered = false
}) {
  const [loading, setLoading] = useState(false)

  const handleAction = async (action) => {
    if (loading) return
    
    setLoading(true)
    try {
      switch(action) {
        case 'edit':
          if (onEdit) await onEdit(product.id)
          break
        case 'delete':
          if (onDelete) await onDelete(product.id)
          break
        case 'toggle':
          if (onToggleStatus) await onToggleStatus(product.id, product.is_active)
          break
        case 'order':
          if (onOrder) await onOrder(product.id)
          break
        case 'increase':
          if (onUpdateStock) await onUpdateStock(product.id, product.stock, 1)
          break
        case 'decrease':
          if (onUpdateStock) await onUpdateStock(product.id, product.stock, -1)
          break
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockColor = (stock) => {
    if (stock === 0) return 'bg-red-100 text-red-800'
    if (stock < 10) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-gray-400">
            <span className="text-4xl">📦</span>
            <p className="mt-2 text-sm">No Image</p>
          </div>
        )}
        
        {/* Status Badge */}
        {userRole !== 'user' && (
          <div className="absolute top-3 right-3">
            <button
              onClick={() => handleAction('toggle')}
              disabled={loading}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${getStatusColor(product.is_active)} ${loading ? 'opacity-50' : 'hover:opacity-80'}`}
            >
              {product.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStockColor(product.stock)}`}>
            {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
        </div>

        {/* Category Badge */}
        {product.category && (
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 text-xs font-medium bg-white/80 backdrop-blur-sm rounded-full text-gray-700">
              {product.category}
            </span>
          </div>
        )}

        {/* Ordered Badge (for users) */}
        {hasOrdered && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Ordered
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {product.description || 'No description available'}
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${parseFloat(product.price).toFixed(2)}
            </span>
          </div>
          {userRole === 'user' && (
            <div className="text-sm text-gray-500">
              {new Date(product.created_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-3">
            {userRole === 'user' ? (
              <button
                onClick={() => handleAction('order')}
                disabled={loading || product.stock === 0 || hasOrdered}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  product.stock > 0 && !hasOrdered
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : hasOrdered ? 'Already Ordered' : product.stock === 0 ? 'Out of Stock' : 'Order Now'}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg text-center transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleAction('delete')}
                  disabled={loading}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stock Controls (for admin) */}
        {showStockControls && userRole !== 'user' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Stock Management</span>
              <div className="flex items-center">
                <button
                  onClick={() => handleAction('decrease')}
                  disabled={loading || product.stock === 0}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <div className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300">
                  <span className="font-medium">{product.stock}</span>
                </div>
                <button
                  onClick={() => handleAction('increase')}
                  disabled={loading}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}