import { Thermometer } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { monthLabel } from '@/lib/search'
import type { MonthlyClimate } from '@/types/api'

type WeatherCardProps = {
  climate: MonthlyClimate | null
  month: number
}

export function WeatherCard({ climate, month }: WeatherCardProps) {
  const stats = [
    { label: 'Avg', value: climate?.temp_avg },
    { label: 'Min', value: climate?.temp_min },
    { label: 'Max', value: climate?.temp_max },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" aria-hidden="true" />
          Počasie v {monthLabel(month).toLowerCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-medium tabular-nums">
              {typeof stat.value === 'number' ? `${Math.round(stat.value)} °C` : '-'}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
