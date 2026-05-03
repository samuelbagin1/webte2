import { Outlet } from 'react-router-dom'
import type * as React from 'react'

import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/sonner'
import { useTrackVisit } from '@/hooks/useTrackVisit'

export function Layout({ children }: { children?: React.ReactNode }) {
  useTrackVisit()

  return (
    <div className="min-h-svh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-xl bg-card px-4 py-2 text-sm font-medium text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-ring"
      >
        Preskočiť na obsah
      </a>
      <Header />
      <main id="main-content" className="container py-8 md:py-12">
        <ErrorBoundary>{children ?? <Outlet />}</ErrorBoundary>
      </main>
      <Footer />
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
