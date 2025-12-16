'use client'

import { useState } from 'react'

export default function Error({ 
  message = 'Something went wrong',
  details,
  onRetry,
  onClose,
  showCloseButton = true,
  type = 'error' // 'error', 'warning', 'info', 'success'
}) {
  const [showDetails, setShowDetails] = useState(false)

  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700',
      button: 'bg-green-600 hover:bg-green-700'
    }
  }

  const typeIcons = {
    error: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  }

  const styles = typeStyles[type]

  return (
    <div className={`rounded-xl border p-6 ${styles.container}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {typeIcons[type]}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-lg font-medium ${styles.title}`}>
            {type === 'error' && 'Error'}
            {type === 'warning' && 'Warning'}
            {type === 'info' && 'Information'}
            {type === 'success' && 'Success'}
          </h3>
          <div className={`mt-2 ${styles.message}`}>
            <p>{message}</p>
            
            {details && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm font-medium hover:underline"
                >
                  {showDetails ? 'Hide details' : 'Show details'}
                </button>
                
                {showDetails && (
                  <pre className="mt-2 p-3 bg-white/50 rounded-lg text-xs overflow-auto max-h-48">
                    {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${styles.button}`}
              >
                Try Again
              </button>
            )}
            
            {onClose && showCloseButton && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Variant for inline errors
export function ErrorInline({ message, type = 'error' }) {
  const typeStyles = {
    error: 'text-red-600 bg-red-50 border-red-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
    success: 'text-green-600 bg-green-50 border-green-200'
  }

  return (
    <div className={`text-sm px-3 py-2 rounded-lg border ${typeStyles[type]}`}>
      {message}
    </div>
  )
}

// Variant for form field errors
export function ErrorField({ message }) {
  return (
    <p className="mt-1 text-sm text-red-600">
      {message}
    </p>
  )
}