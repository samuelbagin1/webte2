import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, SearchX } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { searchDestinations } from '@/api/client'
import { ResultCard } from '@/components/results/ResultCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompareSelection } from '@/hooks/useCompareSelection'
import { monthLabel, parseSearchParams } from '@/lib/search'

export function ResultsPage() {
  const [searchParams] = useSearchParams()
  const requestBody = parseSearchParams(searchParams)
  const { selectedIds, toggle, isSelected } = useCompareSelection()

  const resultsQuery = useQuery({
    queryKey: ['search', requestBody],
    queryFn: () => {
      if (!requestBody) {
        return []
      }

      return searchDestinations(requestBody)
    },
    enabled: requestBody !== null,
  })

  const compareHref =
    selectedIds.length === 2 && requestBody
      ? `/compare?ids=${selectedIds.join(',')}&month=${requestBody.month}`
      : '#'

  if (!requestBody) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <SearchX className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl">Vyhľadávanie nie je kompletné</h1>
        <p className="mt-3 text-muted-foreground">
          Chýbajú filtre potrebné na odporúčanie destinácií.
        </p>
        <Button asChild variant="accent" className="mt-6">
          <Link to="/">Späť na hľadanie</Link>
        </Button>
      </div>
    )
  }

  const results = resultsQuery.data ?? []

  return (
    <div className="space-y-8">
      <div className="sticky top-14 z-10 -mx-4 border-b border-border bg-page/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" asChild className="w-fit">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Späť na hľadanie
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Vybrané: {selectedIds.length}/2
            </span>
            <Button
              variant="accent"
              asChild={selectedIds.length === 2}
              disabled={selectedIds.length !== 2}
            >
              {selectedIds.length === 2 ? (
                <Link to={compareHref}>
                  Porovnať
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <span>
                  Porovnať
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <section className="space-y-2">
        <h1 className="text-3xl md:text-4xl">Výsledky vyhľadávania</h1>
        <p className="text-muted-foreground">
          Termín {requestBody.start_date} - {requestBody.end_date}, mesiac{' '}
          {monthLabel(requestBody.month).toLowerCase()}.
        </p>
      </section>

      {resultsQuery.isLoading && <ResultsSkeleton />}

      {resultsQuery.isError && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <SearchX className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Výsledky sa nepodarilo načítať</h2>
          <p className="mt-2 text-muted-foreground">
            Skontroluj, či beží Laravel API server na porte 8000.
          </p>
        </div>
      )}

      {!resultsQuery.isLoading && !resultsQuery.isError && results.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <SearchX className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Nenašli sa žiadne destinácie</h2>
          <p className="mt-2 text-muted-foreground">
            Skús upraviť vzdialenosť, teplotu alebo typ dovolenky.
          </p>
          <Button asChild variant="accent" className="mt-6">
            <Link to="/">Upraviť hľadanie</Link>
          </Button>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              month={requestBody.month}
              selected={isSelected(result.id)}
              onToggleCompare={() => toggle(result.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-4 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
