export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center min-h-screen">
          {children}
        </div>
      </div>
    </div>
  )
}