import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/layout/Layout'
import { RouteTransition } from '@/components/layout/RouteTransition'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Skeleton } from '@/components/ui/skeleton'

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({ default: module.HomePage })),
)
const ResultsPage = lazy(() =>
  import('@/pages/ResultsPage').then((module) => ({ default: module.ResultsPage })),
)
const DetailPage = lazy(() =>
  import('@/pages/DetailPage').then((module) => ({ default: module.DetailPage })),
)
const ComparePage = lazy(() =>
  import('@/pages/ComparePage').then((module) => ({ default: module.ComparePage })),
)
const StatsPage = lazy(() =>
  import('@/pages/StatsPage').then((module) => ({ default: module.StatsPage })),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
      staleTime: 60_000,
    },
  },
})

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/task4">
          <Routes>
            <Route element={<Layout />}>
              <Route element={<RouteTransition />}>
                <Route
                  index
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <HomePage />
                    </Suspense>
                  }
                />
                <Route
                  path="results"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <ResultsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="destination/:id"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <DetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path="compare"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <ComparePage />
                    </Suspense>
                  }
                />
                <Route
                  path="stats"
                  element={
                    <Suspense fallback={<PageSkeleton />}>
                      <StatsPage />
                    </Suspense>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-72 max-w-full" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
