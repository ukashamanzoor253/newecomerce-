export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xs">E</span>
              </div>
              <span className="text-sm font-medium text-gray-900">E-Commerce Dashboard</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Built with Next.js & Supabase
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600">
              © {currentYear} E-Commerce Dashboard. All rights reserved.
            </p>
            <div className="flex justify-center md:justify-end space-x-4 mt-2">
              <a href="/privacy" className="text-xs text-gray-500 hover:text-gray-700">
                Privacy Policy
              </a>
              <a href="/terms" className="text-xs text-gray-500 hover:text-gray-700">
                Terms of Service
              </a>
              <a href="/help" className="text-xs text-gray-500 hover:text-gray-700">
                Help Center
              </a>
            </div>
          </div>
        </div>

        {/* Version info */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Version 1.0.0 • Powered by Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}