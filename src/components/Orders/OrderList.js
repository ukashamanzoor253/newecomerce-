'use client'

import { useState } from 'react'
import OrderCard from './OrderCard'
import Loading from '@/components/Shared/Loading'
import { formatCurrency } from '@/lib/utils'

export default function OrderList({
  orders = [],
  userRole = 'user',
  loading = false,
  onUpdateStatus,
  onCancel,
  onRefresh,
  title = 'Orders',
  emptyMessage = 'No orders found',
  showFilters = true
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      
      const matchesDate = dateFilter === 'all' || 
        (dateFilter === 'today' && isToday(new Date(order.created_at))) ||
        (dateFilter === 'week' && isThisWeek(new Date(order.created_at))) ||
        (dateFilter === 'month' && isThisMonth(new Date(order.created_at)))
      
      return matchesSearch && matchesStatus && matchesDate
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'price_low':
          return a.total_price - b.total_price
        case 'price_high':
          return b.total_price - a.total_price
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  // Helper functions for date filtering
  const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isThisWeek = (date) => {
    const today = new Date()
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date >= oneWeekAgo
  }

  const isThisMonth = (date) => {
    const today = new Date()
    return date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  if (loading) {
    return <Loading />
  }

  const hasOrders = filteredOrders.length > 0
  
  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const completedOrders = orders.filter(o => o.status === 'completed').length
  const totalOrders = orders.length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">
            {hasOrders 
              ? `Showing ${filteredOrders.length} of ${orders.length} orders`
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
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
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
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {hasOrders ? (
        <>
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole}
                onUpdateStatus={onUpdateStatus}
                onCancel={onCancel}
                showUserInfo={userRole !== 'user'}
                showProductInfo={true}
              />
            ))}
          </div>

          {/* Statistics */}
          {userRole !== 'user' && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{totalOrders}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-700">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingOrders}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-700">Completed Orders</p>
                <p className="text-2xl font-bold text-green-900">{completedOrders}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-700">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          )}

          {/* Status Legend */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-4">Order Status Guide</h4>
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
        </>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No orders found'
            }
          </p>
          {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setDateFilter('all')
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