import { Outlet } from 'react-router-dom'
import type * as React from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/sonner'
import { useTrackVisit } from '@/hooks/useTrackVisit'

export function Layout({ children }: { children?: React.ReactNode }) {
  useTrackVisit()

  return (
    <div className="min-h-svh bg-background text-foreground">
      <Header />
      <main className="container py-8 md:py-12">
        {children ?? <Outlet />}
      </main>
      <Footer />
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
