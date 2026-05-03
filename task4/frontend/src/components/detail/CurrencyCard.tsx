import { CircleDollarSign } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type CurrencyCardProps = {
  currencyCode: string
  currencyRate: number | null
}

export function CurrencyCard({
  currencyCode,
  currencyRate,
}: CurrencyCardProps) {
  const isEuro = currencyCode.toUpperCase() === 'EUR'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
          Mena
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium">
          {isEuro
            ? 'Používa sa euro'
            : currencyRate
              ? `1 EUR = ${currencyRate.toFixed(2)} ${currencyCode}`
              : `Kurz pre ${currencyCode} nie je dostupný`}
        </p>
      </CardContent>
    </Card>
  )
}
