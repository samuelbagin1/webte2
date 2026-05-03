import * as React from 'react'
import { RotateCcw } from 'lucide-react'

import { EmptyState } from '@/components/design/EmptyState'
import { Button } from '@/components/ui/button'

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('Chyba vykreslenia aplikácie:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          title="Niečo sa pokazilo"
          description="Aplikácia narazila na problém pri zobrazení stránky. Skús stránku načítať znova."
          action={
            <Button
              type="button"
              variant="accent"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="h-4 w-4" />
              Načítať znova
            </Button>
          }
        />
      )
    }

    return this.props.children
  }
}
