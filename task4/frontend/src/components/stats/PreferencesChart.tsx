import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'

import { getApiErrorMessage, getPreferenceStats } from '@/api/client'
import { EmptyState } from '@/components/design/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  chartTextColor,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from '@/lib/chart'
import { TEMPERATURE_OPTIONS, TRIP_TYPES } from '@/lib/search'

const ACCENT_PALETTE = [
  'hsl(var(--accent))',
  'hsl(var(--accent-hover))',
  'hsl(var(--copper-glow))',
  'hsl(var(--warning))',
  'hsl(var(--accent-soft))',
]

export function PreferencesChart() {
  const preferencesQuery = useQuery({
    queryKey: ['stats', 'preferences'],
    queryFn: getPreferenceStats,
  })

  useEffect(() => {
    if (preferencesQuery.isError) {
      toast.error(getApiErrorMessage(preferencesQuery.error))
    }
  }, [preferencesQuery.error, preferencesQuery.isError])

  const typeData = TRIP_TYPES.map((type) => ({
    name: type.label,
    count: preferencesQuery.data?.types[type.code] ?? 0,
  }))

  const temperatureData = TEMPERATURE_OPTIONS.map((temperature) => ({
    name: temperature.label,
    count: preferencesQuery.data?.temperatures[temperature.value] ?? 0,
  })).filter((entry) => entry.count > 0)

  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle>Preferencie používateľov</CardTitle>
      </CardHeader>
      <CardContent>
        {preferencesQuery.isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : preferencesQuery.isError ? (
          <EmptyState
            title="Preferencie sa nepodarilo načítať"
            description={getApiErrorMessage(preferencesQuery.error)}
            className="border-0 bg-transparent p-4"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} margin={{ left: -20, right: 10 }}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: chartTextColor }}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: chartTextColor }}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={chartTooltipLabelStyle}
                    formatter={(value) => [`${value}`, 'Počet']}
                  />
                  <Legend wrapperStyle={{ color: chartTextColor }} />
                  <Bar
                    dataKey="count"
                    name="Typy dovolenky"
                    fill="hsl(var(--accent))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={temperatureData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={102}
                    paddingAngle={2}
                  >
                    {temperatureData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={ACCENT_PALETTE[index % ACCENT_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={chartTooltipLabelStyle}
                    formatter={(value) => [`${value}`, 'Počet']}
                  />
                  <Legend wrapperStyle={{ color: chartTextColor }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
