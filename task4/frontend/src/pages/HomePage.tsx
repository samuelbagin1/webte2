import { SearchForm } from '@/components/search/SearchForm'

export function HomePage() {
  return (
    <div className="relative isolate overflow-hidden py-8 lg:py-14">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-8 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-[hsl(var(--copper-glow)/0.32)] blur-3xl"
      />

      <section className="mx-auto mb-10 max-w-3xl space-y-4 text-center">
        <h1 className="text-balance font-display text-4xl font-medium leading-tight md:text-6xl">
          Kam na dovolenku?
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          Vyber si typ zážitku, termín a vzdialenosť. Aplikácia odporučí
          destinácie podľa počasia, štýlu cesty a letovej dostupnosti z Viedne.
        </p>
      </section>

      <SearchForm />
    </div>
  )
}
