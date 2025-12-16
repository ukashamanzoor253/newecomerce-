export default function Loading({ 
  message = 'Loading...',
  size = 'md',
  fullScreen = false 
}) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-2',
    xl: 'h-24 w-24 border-b-4'
  }

  const containerClasses = fullScreen 
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center min-h-[200px]'

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-blue-600 mx-auto ${sizeClasses[size]}`}></div>
        {message && (
          <p className="mt-4 text-gray-600 animate-pulse">{message}</p>
        )}
        
        {/* Optional dots animation */}
        {message === 'Loading...' && (
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
          </div>
        )}
      </div>
    </div>
  )
}

// Variant for inline loading
export function LoadingInline({ size = 'sm' }) {
  const sizeClasses = {
    xs: 'h-4 w-4 border',
    sm: 'h-5 w-5 border',
    md: 'h-6 w-6 border'
  }

  return (
    <div className="inline-flex items-center">
      <div className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]}`}></div>
    </div>
  )
}

// Variant for button loading
export function LoadingButton() {
  return (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    </>
  )
}

// Variant for page loading with skeleton
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}