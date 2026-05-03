import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage, getWhyNow } from '@/api/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type WhyNowCardProps = {
  destinationId: number
  month: number
}

export function WhyNowCard({ destinationId, month }: WhyNowCardProps) {
  const whyNowQuery = useQuery({
    queryKey: ['why-now', destinationId, month],
    queryFn: () => getWhyNow(destinationId, month),
  })

  useEffect(() => {
    if (whyNowQuery.isError) {
      toast.error(getApiErrorMessage(whyNowQuery.error))
    }
  }, [whyNowQuery.error, whyNowQuery.isError])

  return (
    <Card className="border-l-4 border-l-accent">
      <CardHeader>
        <CardTitle>Prečo práve teraz</CardTitle>
      </CardHeader>
      <CardContent>
        {whyNowQuery.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        )}
        {whyNowQuery.isError && (
          <p className="text-sm leading-6 text-muted-foreground">
            Text sa momentálne nepodarilo načítať.
          </p>
        )}
        {whyNowQuery.data && (
          <p className="leading-7 text-muted-foreground">
            {whyNowQuery.data.why_now}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
