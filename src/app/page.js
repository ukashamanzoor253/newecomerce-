import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            E-Commerce Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive role-based e-commerce system with Next.js 14 and Supabase backend
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="text-3xl mb-4">👑</div>
            <h3 className="text-xl font-semibold mb-2">Super Admin</h3>
            <p className="text-gray-600 mb-4">Full system control and user management</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="text-3xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2">Admin</h3>
            <p className="text-gray-600 mb-4">Product and order management</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="text-3xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-2">User</h3>
            <p className="text-gray-600 mb-4">Limited order capabilities with restrictions</p>
          </div>
        </div>
        
        <div className="space-x-4 pt-8">
          <Link 
            href="/login" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300 transform hover:-translate-y-1"
          >
            Get Started - Login
          </Link>
          <Link 
            href="/register" 
            className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
          >
            Create Account
          </Link>
        </div>
        
        <div className="pt-8 text-sm text-gray-500">
          <p>Built with Next.js 14 • Supabase • Tailwind CSS • Role-Based Access Control</p>
        </div>
      </div>
    </div>
  )
}