import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, Plane, Scale } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getApiErrorMessage, getCompare } from '@/api/client'
import { EmptyState } from '@/components/design/EmptyState'
import { CountryFlag } from '@/components/design/CountryFlag'
import { WeatherIcon } from '@/components/design/WeatherIcon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { imageForDestination, monthLabel } from '@/lib/search'
import { cn } from '@/lib/utils'
import type { Destination } from '@/types/api'

type CompareValue = {
  key: string
  label: string
  values: [React.ReactNode, React.ReactNode]
  matches: boolean
}

function parseCompareParams(params: URLSearchParams) {
  const ids = (params.get('ids') ?? '')
    .split(',')
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0)
  const month = Number(params.get('month'))

  if (ids.length !== 2 || new Set(ids).size !== 2) {
    return null
  }

  return {
    ids: ids.slice(0, 2),
    month:
      Number.isInteger(month) && month >= 1 && month <= 12
        ? month
        : new Date().getMonth() + 1,
  }
}

function formatTemperature(value?: number | null) {
  return typeof value === 'number' ? `${Math.round(value)} °C` : 'Nie je dostupné'
}

function formatCurrency(destination: Destination) {
  const code = destination.country.currency_code

  if (code === 'EUR') {
    return 'Používa sa euro'
  }

  return typeof destination.currency_rate === 'number'
    ? `1 EUR = ${destination.currency_rate.toFixed(2)} ${code}`
    : `Kurz pre ${code} nie je dostupný`
}

function sameTypeSet(a: Destination, b: Destination) {
  const left = a.types.map((type) => type.code).sort().join(',')
  const right = b.types.map((type) => type.code).sort().join(',')

  return left === right
}

function buildRows(destinations: [Destination, Destination]): CompareValue[] {
  const [left, right] = destinations

  return [
    {
      key: 'country',
      label: 'Krajina',
      values: [
        <FlagValue destination={left} />,
        <FlagValue destination={right} />,
      ],
      matches: left.country.iso_code === right.country.iso_code,
    },
    {
      key: 'capital',
      label: 'Hlavné mesto',
      values: [left.country.capital, right.country.capital],
      matches: left.country.capital === right.country.capital,
    },
    {
      key: 'currency',
      label: 'Mena + kurz',
      values: [formatCurrency(left), formatCurrency(right)],
      matches:
        left.country.currency_code === right.country.currency_code &&
        left.currency_rate === right.currency_rate,
    },
    {
      key: 'types',
      label: 'Typy dovolenky',
      values: [<TypeBadges destination={left} />, <TypeBadges destination={right} />],
      matches: sameTypeSet(left, right),
    },
    {
      key: 'avg-temp',
      label: 'Priemerná teplota',
      values: [
        formatTemperature(left.monthly_climate?.temp_avg),
        formatTemperature(right.monthly_climate?.temp_avg),
      ],
      matches:
        Math.round(left.monthly_climate?.temp_avg ?? Number.NaN) ===
        Math.round(right.monthly_climate?.temp_avg ?? Number.NaN),
    },
    {
      key: 'min-max-temp',
      label: 'Min / max teplota',
      values: [
        `${formatTemperature(left.monthly_climate?.temp_min)} / ${formatTemperature(
          left.monthly_climate?.temp_max,
        )}`,
        `${formatTemperature(right.monthly_climate?.temp_min)} / ${formatTemperature(
          right.monthly_climate?.temp_max,
        )}`,
      ],
      matches:
        Math.round(left.monthly_climate?.temp_min ?? Number.NaN) ===
          Math.round(right.monthly_climate?.temp_min ?? Number.NaN) &&
        Math.round(left.monthly_climate?.temp_max ?? Number.NaN) ===
          Math.round(right.monthly_climate?.temp_max ?? Number.NaN),
    },
    {
      key: 'current-weather',
      label: 'Aktuálne počasie',
      values: [
        <CurrentWeather destination={left} />,
        <CurrentWeather destination={right} />,
      ],
      matches:
        left.current_weather.weather_code === right.current_weather.weather_code,
    },
    {
      key: 'flight-hours',
      label: 'Letové hodiny z Viedne',
      values: [
        <FlightHours destination={left} />,
        <FlightHours destination={right} />,
      ],
      matches:
        left.flight_hours_from_vienna.toFixed(1) ===
        right.flight_hours_from_vienna.toFixed(1),
    },
  ]
}

export function ComparePage() {
  const [searchParams] = useSearchParams()
  const parsedParams = parseCompareParams(searchParams)

  const compareQuery = useQuery({
    queryKey: ['compare', parsedParams?.ids, parsedParams?.month],
    queryFn: () => getCompare(parsedParams?.ids ?? [], parsedParams?.month ?? 1),
    enabled: parsedParams !== null,
  })

  useEffect(() => {
    if (compareQuery.isError) {
      toast.error(getApiErrorMessage(compareQuery.error))
    }
  }, [compareQuery.error, compareQuery.isError])

  if (!parsedParams) {
    return (
      <EmptyCompareState
        title="Porovnanie nie je kompletné"
        description="Vyber presne dve destinácie a otvor porovnanie z výsledkov."
      />
    )
  }

  if (compareQuery.isLoading) {
    return <CompareSkeleton />
  }

  const destinations = compareQuery.data?.destinations ?? []

  if (compareQuery.isError || destinations.length !== 2) {
    return (
      <EmptyCompareState
        title="Porovnanie sa nepodarilo načítať"
        description="Skontroluj, či destinácie existujú a či beží Laravel API server."
      />
    )
  }

  const typedDestinations = destinations as [Destination, Destination]
  const rows = buildRows(typedDestinations)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-4 w-fit">
            <Link to="/results">
              <ArrowLeft className="h-4 w-4" />
              Späť
            </Link>
          </Button>
          <h1 className="font-display text-4xl font-medium md:text-5xl">
            Porovnanie destinácií
          </h1>
          <p className="mt-2 text-muted-foreground">
            Zobrazené počasie je pre {monthLabel(parsedParams.month).toLowerCase()}.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {typedDestinations.map((destination) => (
          <HeroCard key={destination.id} destination={destination} />
        ))}
      </section>

      <DesktopComparison rows={rows} destinations={typedDestinations} />
      <MobileComparison rows={rows} />
    </div>
  )
}

function EmptyCompareState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <Button asChild variant="accent">
          <Link to="/">Späť na hľadanie</Link>
        </Button>
      }
    />
  )
}

function HeroCard({ destination }: { destination: Destination }) {
  return (
    <Card className="overflow-hidden">
      <img
        src={imageForDestination(destination.id, destination.image_url)}
        alt={`Destinácia ${destination.name}`}
        className="aspect-[16/9] w-full object-cover"
        loading="lazy"
      />
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-semibold">{destination.name}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CountryFlag
              isoCode={destination.country.iso_code}
              countryName={destination.country.name_sk}
            />
            <span>{destination.country.name_sk}</span>
          </div>
        </div>
        <Scale className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </CardContent>
    </Card>
  )
}

function DesktopComparison({
  rows,
  destinations,
}: {
  rows: CompareValue[]
  destinations: [Destination, Destination]
}) {
  return (
    <Card className="hidden overflow-hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parameter</TableHead>
            {destinations.map((destination) => (
              <TableHead key={destination.id}>{destination.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.key}
              className={cn(row.matches && 'bg-accent-soft/70 hover:bg-accent-soft')}
            >
              <TableCell className="w-56 font-medium">
                <MatchIcon matches={row.matches} />
                {row.label}
              </TableCell>
              <TableCell className="tabular-nums">{row.values[0]}</TableCell>
              <TableCell className="tabular-nums">{row.values[1]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function MobileComparison({ rows }: { rows: CompareValue[] }) {
  return (
    <div className="space-y-4 md:hidden">
      {rows.map((row) => (
        <Card
          key={row.key}
          className={cn(row.matches && 'bg-accent-soft/70')}
        >
          <CardContent className="space-y-3 p-4">
            <div className="font-medium">
              <MatchIcon matches={row.matches} />
              {row.label}
            </div>
            <div className="grid gap-3 text-sm tabular-nums">
              <div>{row.values[0]}</div>
              <div className="border-t border-border pt-3">{row.values[1]}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function MatchIcon({ matches }: { matches: boolean }) {
  if (!matches) {
    return null
  }

  return (
    <Check
      className="mr-2 inline h-4 w-4 text-foreground"
      aria-label="Zhodná hodnota"
    />
  )
}

function FlagValue({ destination }: { destination: Destination }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CountryFlag
        isoCode={destination.country.iso_code}
        countryName={destination.country.name_sk}
      />
      {destination.country.name_sk}
    </span>
  )
}

function TypeBadges({ destination }: { destination: Destination }) {
  return (
    <span className="flex flex-wrap gap-2">
      {destination.types.map((type) => (
        <Badge key={type.code} variant="accent">
          {type.name_sk}
        </Badge>
      ))}
    </span>
  )
}

function CurrentWeather({ destination }: { destination: Destination }) {
  const weatherCode = destination.current_weather.weather_code ?? -1

  return (
    <span className="inline-flex items-center gap-2">
      <WeatherIcon code={weatherCode} className="h-4 w-4" />
      <span>
        {destination.current_weather.description_sk},{' '}
        {formatTemperature(destination.current_weather.temperature)}
      </span>
    </span>
  )
}

function FlightHours({ destination }: { destination: Destination }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Plane className="h-4 w-4" aria-hidden="true" />
      {destination.flight_hours_from_vienna.toFixed(1)} hod
    </span>
  )
}

function CompareSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-5 w-56" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
