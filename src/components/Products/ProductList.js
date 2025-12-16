'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'
import Loading from '@/components/Shared/Loading'

export default function ProductList({ 
  products = [],
  userRole = 'user',
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onUpdateStock,
  onOrder,
  onRefresh,
  showFilters = true,
  title = 'Products',
  emptyMessage = 'No products found'
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && product.is_active) ||
                           (statusFilter === 'inactive' && !product.is_active) ||
                           (statusFilter === 'in_stock' && product.stock > 0) ||
                           (statusFilter === 'out_of_stock' && product.stock === 0)
      
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'price_low':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'price_high':
          return parseFloat(b.price) - parseFloat(a.price)
        case 'name_asc':
          return a.name.localeCompare(b.name)
        case 'name_desc':
          return b.name.localeCompare(a.name)
        case 'stock_low':
          return a.stock - b.stock
        case 'stock_high':
          return b.stock - a.stock
        default:
          return 0
      }
    })

  if (loading) {
    return <Loading />
  }

  const hasProducts = filteredProducts.length > 0
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const activeProducts = products.filter(p => p.is_active).length
  const outOfStockProducts = products.filter(p => p.stock === 0).length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">
            {hasProducts 
              ? `Showing ${filteredProducts.length} of ${products.length} products`
              : emptyMessage
            }
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                {userRole !== 'user' && <option value="active">Active Only</option>}
                {userRole !== 'user' && <option value="inactive">Inactive Only</option>}
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="stock_low">Stock: Low to High</option>
                <option value="stock_high">Stock: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {hasProducts ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                userRole={userRole}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                onUpdateStock={onUpdateStock}
                onOrder={onOrder}
                showStockControls={userRole !== 'user'}
              />
            ))}
          </div>

          {/* Summary Stats */}
          {userRole !== 'user' && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Total Products</p>
                <p className="text-2xl font-bold text-blue-900">{products.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-700">Active Products</p>
                <p className="text-2xl font-bold text-green-900">{activeProducts}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-700">Total Stock</p>
                <p className="text-2xl font-bold text-yellow-900">{totalStock}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-red-700">Out of Stock</p>
                <p className="text-2xl font-bold text-red-900">{outOfStockProducts}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No products available at the moment'
            }
          </p>
          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setStatusFilter('all')
              }}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}