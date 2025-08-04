'use client'

import { useEffect, useState } from 'react'

interface MSWProviderProps {
  children: React.ReactNode
}

export function MSWProvider({ children }: MSWProviderProps) {
  const [isMSWReady, setIsMSWReady] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    async function initMSW() {
      // Only run in development
      if (process.env.NODE_ENV === 'development') {
        try {
          console.log('MSW Provider: Starting MSW...')
          const { worker } = await import('../src/mocks/browser')
          await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
              url: '/mockServiceWorker.js'
            }
          })
          console.log('✅ MSW ready and intercepting requests')
        } catch (error) {
          console.error('❌ Failed to start MSW:', error)
        }
      } else {
        console.log('MSW Provider: MSW disabled (not in development mode)')
      }
      setIsMSWReady(true)
    }

    initMSW()
  }, [isClient])

  // Don't render anything until we're on the client to avoid hydration mismatch
  if (!isClient) {
    return null
  }

  if (!isMSWReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  return <>{children}</>
}