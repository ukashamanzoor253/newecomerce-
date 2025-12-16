'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function UserProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.profile.role !== 'user') {
      router.push('/login')
      return
    }
    setUser(currentUser)
  }

  const fetchData = async () => {
    try {
      // Fetch available products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })

      // Fetch user's orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('product_id')
        .eq('user_id', user?.user?.id)

      setProducts(productsData || [])
      setOrders(ordersData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const canPlaceOrder = () => {
    if (!user) return false
    
    const profile = user.profile
    const now = new Date()
    
    // Check order limit
    if (orders.length >= (profile.user_limit || 5)) {
      return false
    }
    
    // Check time limit
    if (profile.order_time_limit && new Date(profile.order_time_limit) < now) {
      return false
    }
    
    return true
  }

  const placeOrder = async (productId) => {
    if (!canPlaceOrder()) {
      alert('You have reached your order limit or the time limit has expired')
      return
    }

    const product = products.find(p => p.id === productId)
    if (!product) return

    if (!confirm(`Place order for ${product.name} - $${product.price}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          user_id: user.user.id,
          product_id: productId,
          quantity: 1,
          total_price: product.price,
          status: 'pending'
        }])

      if (error) throw error

      // Update product stock
      await supabase
        .from('products')
        .update({ stock: product.stock - 1 })
        .eq('id', productId)

      alert('Order placed successfully!')
      fetchData()
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order')
    }
  }

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const ordersLeft = (user?.profile?.user_limit || 5) - orders.length

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Products</h1>
          <p className="text-gray-600 mt-2">Browse and order from available products</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Orders left today</p>
          <p className="text-2xl font-bold">
            {canPlaceOrder() ? ordersLeft : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
            <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <p className="text-gray-700">{filteredProducts.length} products found</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const hasOrdered = orders.some(order => order.product_id === product.id)
          
          return (
            <div key={product.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <span className="text-4xl">📦</span>
                    <p className="mt-2">No Image</p>
                  </div>
                )}
                {hasOrdered && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Ordered
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  {product.category && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {product.category}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description || 'No description available'}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {product.stock} in stock
                    </span>
                  </div>
                  <div className={`text-sm px-2 py-1 rounded ${
                    product.stock > 10 ? 'bg-green-100 text-green-800' :
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 10 ? 'In Stock' : 'Low Stock'}
                  </div>
                </div>

                <button
                  onClick={() => placeOrder(product.id)}
                  disabled={!canPlaceOrder() || product.stock === 0 || hasOrdered}
                  className={`w-full py-3 rounded-lg font-medium ${
                    canPlaceOrder() && product.stock > 0 && !hasOrdered
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {hasOrdered ? 'Already Ordered' : 
                   !canPlaceOrder() ? 'Order Limit Reached' :
                   product.stock === 0 ? 'Out of Stock' :
                   'Order Now'}
                </button>

                {hasOrdered && (
                  <p className="text-sm text-green-600 text-center mt-2">
                    ✓ You've ordered this product
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🛍️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'No products are currently available'}
          </p>
        </div>
      )}

      {/* Shopping Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-medium text-blue-900 mb-4">Shopping Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">✓</span>
            </div>
            <div>
              <p className="font-medium text-blue-800">Order Limits</p>
              <p className="text-sm text-blue-700">You can place up to {user?.profile?.user_limit || 5} orders</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">⏰</span>
            </div>
            <div>
              <p className="font-medium text-blue-800">Time Limit</p>
              <p className="text-sm text-blue-700">
                {user?.profile?.order_time_limit 
                  ? `Valid until ${new Date(user.profile.order_time_limit).toLocaleString()}`
                  : 'No time limit'}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">🔄</span>
            </div>
            <div>
              <p className="font-medium text-blue-800">Track Orders</p>
              <p className="text-sm text-blue-700">View your order status in My Orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}