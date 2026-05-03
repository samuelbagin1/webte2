import * as React from 'react'

import { cn } from '@/lib/utils'

type CountryFlagProps = {
  isoCode: string
  countryName: string
  className?: string
}

export function CountryFlag({
  isoCode,
  countryName,
  className,
}: CountryFlagProps) {
  const [hasError, setHasError] = React.useState(false)
  const normalizedCode = isoCode.toLowerCase()

  if (hasError || normalizedCode.length !== 2) {
    return (
      <span
        aria-label={`Vlajka krajiny ${countryName}`}
        className={cn(
          'inline-flex h-5 w-7 items-center justify-center rounded-md border border-border bg-muted text-[10px] font-medium uppercase text-muted-foreground',
          className,
        )}
      >
        {isoCode.slice(0, 2)}
      </span>
    )
  }

  return (
    <img
      src={`https://img.geonames.org/flags/x/${normalizedCode}.gif`}
      alt={`Vlajka krajiny ${countryName}`}
      className={cn('h-5 w-7 rounded-md border border-border object-cover', className)}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}
