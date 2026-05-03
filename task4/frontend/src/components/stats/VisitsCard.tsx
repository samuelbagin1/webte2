import { useQuery } from '@tanstack/react-query'

import { getVisitStats } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function VisitsCard() {
  const visitsQuery = useQuery({
    queryKey: ['stats', 'visits'],
    queryFn: getVisitStats,
    refetchInterval: 30_000,
  })

  const stats = visitsQuery.data

  return (
    <Card className="col-span-12 lg:col-span-6">
      <CardHeader>
        <CardTitle>Návštevnosť</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <StatNumber
          label="Total"
          value={stats?.total}
          isLoading={visitsQuery.isLoading}
        />
        <StatNumber
          label="Unique"
          value={stats?.unique}
          isLoading={visitsQuery.isLoading}
        />
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
