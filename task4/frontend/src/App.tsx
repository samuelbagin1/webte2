import { BrowserRouter } from 'react-router-dom'
import { CalendarDays, MapPin, Plane, ThermometerSun } from 'lucide-react'

import { CountryFlag } from '@/components/design/CountryFlag'
import { MatchProgress } from '@/components/design/MatchProgress'
import { WeatherIcon } from '@/components/design/WeatherIcon'
import { Layout } from '@/components/layout/Layout'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SkeletonCard } from '@/components/ui/skeleton'

function DesignSystemPreview() {
  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div className="space-y-6">
          <Badge variant="accent" className="w-fit">
            Design system pripravený
          </Badge>
          <div className="max-w-3xl space-y-4">
            <h1 className="text-balance font-display text-4xl font-medium leading-tight md:text-5xl">
              Kam na dovolenku?
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Tokenizovaný základ aplikácie pre vyhľadávanie dovolenkových
              destinácií. Ďalšie fázy môžu stavať na hotových komponentoch,
              témach a konzistentnom rozhraní.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="accent" size="lg">
              <Plane className="h-4 w-4" />
              Začať vyhľadávanie
            </Button>
            <Button variant="secondary" size="lg">
              <CalendarDays className="h-4 w-4" />
              Pozrieť štatistiky
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ukážka karty destinácie</CardTitle>
            <CardDescription>
              Komponenty používajú výhradne design tokeny.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CountryFlag isoCode="ES" countryName="Španielsko" />
                  <h3 className="text-xl font-semibold">Barcelona</h3>
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Španielsko
                </p>
              </div>
              <Badge variant="chip">city break</Badge>
            </div>
            <MatchProgress value={87} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <WeatherIcon code={1} />
                  Počasie
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Polojasno, ideálne na prechádzky.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ThermometerSun className="h-5 w-5" />
                  Teplota
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Príjemných 24 °C počas dňa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Form prvky</CardTitle>
            <CardDescription>
              Inputy, tlačidlá a badge prvky sú pripravené pre ďalšie fázy.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="destination">Destinácia</Label>
              <Input id="destination" placeholder="Napr. Lisabon" />
            </div>
            <div className="flex items-end gap-2">
              <Button className="flex-1">Default</Button>
              <Button variant="outline" className="flex-1">
                Outline
              </Button>
            </div>
          </CardContent>
        </Card>
        <SkeletonCard />
      </section>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter basename="/z4">
        <Layout>
          <DesignSystemPreview />
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
