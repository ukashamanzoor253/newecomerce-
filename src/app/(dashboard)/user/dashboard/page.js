'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserDashboard() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
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
      // Fetch user's orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, products(*)')
        .eq('user_id', user?.user?.id)
        .order('created_at', { ascending: false })

      // Fetch available products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })

      setOrders(ordersData || [])
      setProducts(productsData || [])
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const profile = user.profile
  const ordersLeft = (profile.user_limit || 5) - orders.length
  const timeLimit = profile.order_time_limit ? new Date(profile.order_time_limit) : null
  const now = new Date()
  const timeLimitValid = timeLimit ? timeLimit > now : true

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <p className="text-gray-600 mt-2">Shop products within your limits</p>
        </div>
        <div className="text-sm text-gray-500">
          Welcome, {profile.email}
        </div>
      </div>

      {/* Limits Banner */}
      <div className={`p-6 rounded-xl mb-8 ${
        ordersLeft > 0 && timeLimitValid
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Your Order Limits</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Orders placed: {orders.length} / {profile.user_limit || 5}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      ordersLeft > 0 ? 'bg-green-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${(orders.length / (profile.user_limit || 5)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Time limit: {timeLimit ? timeLimit.toLocaleDateString() : 'No time limit'}
                </p>
                {timeLimit && (
                  <p className={`text-sm ${timeLimitValid ? 'text-green-600' : 'text-red-600'}`}>
                    {timeLimitValid 
                      ? `Valid until ${timeLimit.toLocaleTimeString()}`
                      : 'Time limit expired'}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {ordersLeft > 0 && timeLimitValid ? ordersLeft : 0}
            </p>
            <p className="text-sm text-gray-600">orders left</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Products */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Available Products</h2>
            <span className="text-sm text-gray-500">{products.length} products</span>
          </div>
          
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center mt-4">
                      <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                      <span className="ml-4 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {product.category || 'Uncategorized'}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => placeOrder(product.id)}
                    disabled={!canPlaceOrder() || product.stock === 0}
                    className={`ml-4 px-4 py-2 rounded-lg font-medium ${
                      canPlaceOrder() && product.stock > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
            
            {products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🛍️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-600">Check back later for new products</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Recent Orders</h2>
            <Link 
              href="/user/orders" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{order.products?.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Ordered on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center mt-4">
                      <span className="text-lg font-bold text-gray-900">${order.total_price}</span>
                      <span className={`ml-4 px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {orders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600">Place your first order from available products</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {orders.length > 0 && (
            <div className="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Order Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold">
                    ${orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'completed').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}