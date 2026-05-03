import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage, getVisitStats } from '@/api/client'
import { EmptyState } from '@/components/design/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function VisitsCard() {
  const visitsQuery = useQuery({
    queryKey: ['stats', 'visits'],
    queryFn: getVisitStats,
    refetchInterval: 30_000,
  })

  useEffect(() => {
    if (visitsQuery.isError) {
      toast.error(getApiErrorMessage(visitsQuery.error))
    }
  }, [visitsQuery.error, visitsQuery.isError])

  const stats = visitsQuery.data

  return (
    <Card className="col-span-12 lg:col-span-6">
      <CardHeader>
        <CardTitle>Návštevnosť</CardTitle>
      </CardHeader>
      <CardContent>
        {visitsQuery.isError ? (
          <EmptyState
            title="Návštevnosť sa nepodarilo načítať"
            description={getApiErrorMessage(visitsQuery.error)}
            className="border-0 bg-transparent p-4"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <StatNumber
              label="Celkom"
              value={stats?.total}
              isLoading={visitsQuery.isLoading}
            />
            <StatNumber
              label="Unikátne"
              value={stats?.unique}
              isLoading={visitsQuery.isLoading}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatNumber({
  label,
  value,
  isLoading,
}: {
  label: string
  value?: number
  isLoading: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card-muted p-5">
      {isLoading ? (
        <Skeleton className="h-14 w-32" />
      ) : (
        <p className="font-display text-5xl font-medium tabular-nums">
          {(value ?? 0).toLocaleString('sk-SK')}
        </p>
      )}
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
