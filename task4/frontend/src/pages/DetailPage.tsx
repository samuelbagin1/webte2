import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Plane } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { getDestination } from '@/api/client'
import { CountryFlag } from '@/components/design/CountryFlag'
import { WeatherIcon } from '@/components/design/WeatherIcon'
import { CurrencyCard } from '@/components/detail/CurrencyCard'
import { WeatherCard } from '@/components/detail/WeatherCard'
import { WhyNowCard } from '@/components/detail/WhyNowCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompareSelection } from '@/hooks/useCompareSelection'
import { imageForDestination, monthLabel } from '@/lib/search'

export function DetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const destinationId = Number(id)
  const queryMonth = Number(searchParams.get('month'))
  const month =
    Number.isInteger(queryMonth) && queryMonth >= 1 && queryMonth <= 12
      ? queryMonth
      : new Date().getMonth() + 1
  const { add, selectedIds } = useCompareSelection()

  const destinationQuery = useQuery({
    queryKey: ['destination', destinationId, month],
    queryFn: () => getDestination(destinationId, month),
    enabled: Number.isInteger(destinationId) && destinationId > 0,
  })

  if (destinationQuery.isLoading) {
    return <DetailSkeleton />
  }

  if (destinationQuery.isError || !destinationQuery.data) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="text-3xl">Destinácia sa nepodarila načítať</h1>
        <p className="mt-3 text-muted-foreground">
          Skontroluj adresu alebo sa vráť na výsledky vyhľadávania.
        </p>
        <Button className="mt-6" variant="accent" asChild>
          <Link to="/">Späť na hľadanie</Link>
        </Button>
      </div>
    )
  }

  const destination = destinationQuery.data
  const weatherCode = destination.current_weather.weather_code ?? -1

  return (
    <article className="-mx-4 -mt-8 sm:-mx-6 lg:-mx-12 lg:-mt-12">
      <section className="relative h-64 overflow-hidden lg:h-80">
        <img
          src={imageForDestination(destination.id, destination.image_url)}
          alt={`Destinácia ${destination.name}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/25 to-primary/35" />
        <Button
          type="button"
          variant="ghost"
          className="absolute left-4 top-4 bg-primary/25 text-primary-foreground hover:bg-primary/40 hover:text-primary-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Späť
        </Button>
        <div className="absolute bottom-6 left-4 right-4 text-primary-foreground sm:left-6 lg:left-12">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <CountryFlag
              isoCode={destination.country.iso_code}
              countryName={destination.country.name_sk}
            />
            <span>{destination.country.name_sk}</span>
          </div>
          <h1 className="max-w-4xl font-display text-4xl font-medium leading-tight text-primary-foreground md:text-6xl">
            {destination.name}
          </h1>
        </div>
      </section>

      <div className="container grid gap-8 py-8 lg:grid-cols-3 lg:py-12">
        <main className="space-y-6 lg:col-span-2">
          <section className="space-y-3">
            <h2 className="text-3xl">O destinácii</h2>
            <p className="text-base leading-7 text-muted-foreground">
              {destination.description_sk}
            </p>
          </section>

          <WhyNowCard destinationId={destination.id} month={month} />
          <WeatherCard climate={destination.monthly_climate} month={month} />

          <Card>
            <CardHeader>
              <CardTitle>Aktuálne počasie</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <WeatherIcon code={weatherCode} className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-medium">
                    {destination.current_weather.description_sk}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {typeof destination.current_weather.temperature === 'number'
                      ? `${Math.round(destination.current_weather.temperature)} °C`
                      : 'Teplota nie je dostupná'}
                  </p>
                </div>
              </div>
              {destination.current_weather.fallback_hub && (
                <Badge variant="accent">
                  Z najbližšieho mesta {destination.current_weather.fallback_hub}
                </Badge>
              )}
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-5 lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Krajina</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CountryFlag
                  isoCode={destination.country.iso_code}
                  countryName={destination.country.name_sk}
                  className="h-8 w-11"
                />
                <div>
                  <p className="font-semibold">{destination.country.name_sk}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {destination.country.capital}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <CurrencyCard
            currencyCode={destination.country.currency_code}
            currencyRate={destination.currency_rate}
          />

          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2">
                {destination.types.map((type) => (
                  <Badge key={type.code} variant="accent">
                    {type.name_sk}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Plane className="h-4 w-4" aria-hidden="true" />
                {destination.flight_hours_from_vienna.toFixed(1)} hod letu z
                Viedne
              </div>
              <p className="text-sm text-muted-foreground">
                Zobrazené počasie je pre {monthLabel(month).toLowerCase()}.
              </p>
            </CardContent>
          </Card>

          <Button
            type="button"
            variant="accent"
            size="lg"
            className="w-full"
            onClick={() => add(destination.id)}
          >
            {selectedIds.includes(destination.id)
              ? 'V porovnaní'
              : 'Pridať do porovnania'}
          </Button>
        </aside>
      </div>
    </article>
  )
}

function DetailSkeleton() {
  return (
    <div className="-mx-4 -mt-8 sm:-mx-6 lg:-mx-12 lg:-mt-12">
      <Skeleton className="h-64 w-full rounded-none lg:h-80" />
      <div className="container grid gap-8 py-8 lg:grid-cols-3 lg:py-12">
        <main className="space-y-6 lg:col-span-2">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-44 w-full" />
        </main>
        <aside className="space-y-5">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-40 w-full" />
        </aside>
      </div>
    </div>
  )
}
