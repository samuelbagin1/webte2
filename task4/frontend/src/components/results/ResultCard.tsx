import { Link } from 'react-router-dom'

import { CountryFlag } from '@/components/design/CountryFlag'
import { MatchProgress } from '@/components/design/MatchProgress'
import { MatchReasons } from '@/components/results/MatchReasons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { imageForDestination } from '@/lib/search'
import type { SearchResult } from '@/types/api'

type ResultCardProps = {
  result: SearchResult
  month: number
  selected: boolean
  onToggleCompare: () => void
}

export function ResultCard({
  result,
  month,
  selected,
  onToggleCompare,
}: ResultCardProps) {
  return (
    <Card className="overflow-hidden transition-colors duration-150 hover:border-accent">
      <img
        src={imageForDestination(result.id, result.image_url)}
        alt={`Destinácia ${result.name}`}
        className="aspect-[4/3] w-full object-cover"
        loading="lazy"
      />
      <CardHeader className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CountryFlag
                isoCode={result.country.iso_code}
                countryName={result.country.name_sk}
              />
              <h2 className="truncate text-lg font-semibold leading-tight">
                {result.name}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.country.name_sk}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-foreground">
            {Math.round(result.match_score)}% zhoda
          </span>
        </div>
        <MatchProgress value={result.match_score} />
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <MatchReasons reasons={result.reasons} />
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 p-5 pt-0">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl pr-2 text-sm font-medium">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleCompare}
            aria-label={`Vybrať destináciu ${result.name} na porovnanie`}
          />
          Porovnať
        </label>
        <Button variant="outline" asChild>
          <Link to={`/destination/${result.id}?month=${month}`}>Detail</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
