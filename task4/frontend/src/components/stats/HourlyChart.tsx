import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'

import { getApiErrorMessage, getHourlyStats } from '@/api/client'
import { EmptyState } from '@/components/design/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  chartGridColor,
  chartTextColor,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from '@/lib/chart'

const HOUR_LABELS = {
  '6-15': 'Ráno a deň',
  '15-21': 'Popoludnie',
  '21-24': 'Večer',
  '0-6': 'Noc',
} as const

export function HourlyChart() {
  const hourlyQuery = useQuery({
    queryKey: ['stats', 'hourly'],
    queryFn: getHourlyStats,
  })

  useEffect(() => {
    if (hourlyQuery.isError) {
      toast.error(getApiErrorMessage(hourlyQuery.error))
    }
  }, [hourlyQuery.error, hourlyQuery.isError])

  const data = (['6-15', '15-21', '21-24', '0-6'] as const).map((key) => ({
    key,
    label: HOUR_LABELS[key],
    visits: hourlyQuery.data?.[key] ?? 0,
  }))

  return (
    <Card className="col-span-12 lg:col-span-6">
      <CardHeader>
        <CardTitle>Návštevy podľa času</CardTitle>
      </CardHeader>
      <CardContent>
        {hourlyQuery.isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : hourlyQuery.isError ? (
          <EmptyState
            title="Graf sa nepodarilo načítať"
            description={getApiErrorMessage(hourlyQuery.error)}
            className="border-0 bg-transparent p-4"
          />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: chartTextColor }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: chartTextColor }}
                  label={{
                    value: 'Počet návštev',
                    angle: -90,
                    position: 'insideLeft',
                    fill: chartTextColor,
                  }}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  labelStyle={chartTooltipLabelStyle}
                  formatter={(value) => [`${value}`, 'Počet návštev']}
                  labelFormatter={(label) => `Čas: ${label}`}
                />
                <Bar
                  dataKey="visits"
                  name="Návštevy"
                  fill="hsl(var(--accent))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
