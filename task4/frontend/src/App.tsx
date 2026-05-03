import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/layout/Layout'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { ComparePage } from '@/pages/ComparePage'
import { DetailPage } from '@/pages/DetailPage'
import { HomePage } from '@/pages/HomePage'
import { ResultsPage } from '@/pages/ResultsPage'
import { StatsPage } from '@/pages/StatsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
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
              <Route index element={<HomePage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="destination/:id" element={<DetailPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
