"use client";

import React from 'react'
import { Button } from '@/components/ui/button'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: Error | null }

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error) {
    // Let GlobalError page handle route-level; here we just set state
    // Additional reporting is handled by ErrorReporter
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-xl font-semibold">An error occurred</h2>
            <p className="text-sm text-muted-foreground">Try refreshing the page. If the problem persists, contact support.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => { this.setState({ hasError: false, error: null }); }}>Try again</Button>
              <Button variant="outline" onClick={() => { if (typeof window !== 'undefined') window.location.href = '/'; }}>Go home</Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

