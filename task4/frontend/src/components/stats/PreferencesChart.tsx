import { useQuery } from '@tanstack/react-query'
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

import { getPreferenceStats } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} margin={{ left: -20, right: 10 }}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => [`${value}`, 'Počet']} />
                  <Legend />
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
                  <Tooltip formatter={(value) => [`${value}`, 'Počet']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
