"use client"

import { EndpointsProvider } from '@/contexts/endpoints-context'

export function EndpointsCardProvider({ children }: { children: React.ReactNode }) {
  return <EndpointsProvider>{children}</EndpointsProvider>
}

