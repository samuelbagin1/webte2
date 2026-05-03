import { HourlyChart } from '@/components/stats/HourlyChart'
import { PreferencesChart } from '@/components/stats/PreferencesChart'
import { SearchTable } from '@/components/stats/SearchTable'
import { VisitsCard } from '@/components/stats/VisitsCard'

export function StatsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <h1 className="font-display text-4xl font-medium md:text-5xl">
          Štatistiky portálu
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Prehľad návštevnosti, vyhľadávaných destinácií a preferencií používateľov.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <VisitsCard />
        <HourlyChart />
        <SearchTable />
        <PreferencesChart />
      </section>
    </div>
  )
}
