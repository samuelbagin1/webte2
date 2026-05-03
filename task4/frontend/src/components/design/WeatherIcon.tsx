import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const weatherIconMap: Array<{
  codes: number[]
  icon: LucideIcon
  label: string
}> = [
  { codes: [0], icon: Sun, label: 'Jasno' },
  { codes: [1, 2], icon: CloudSun, label: 'Polojasno' },
  { codes: [3], icon: Cloud, label: 'Zamračené' },
  { codes: [45, 48], icon: CloudFog, label: 'Hmla' },
  { codes: [51, 53, 55, 56, 57], icon: CloudDrizzle, label: 'Mrholenie' },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], icon: CloudRain, label: 'Dážď' },
  { codes: [71, 73, 75, 77, 85, 86], icon: CloudSnow, label: 'Sneženie' },
  { codes: [95, 96, 99], icon: CloudHail, label: 'Búrka' },
]

export function getWeatherMeta(code: number) {
  return (
    weatherIconMap.find((entry) => entry.codes.includes(code)) ?? {
      icon: Cloud,
      label: 'Neznáme počasie',
    }
  )
}

export function WeatherIcon({
  code,
  className,
}: {
  code: number
  className?: string
}) {
  const { icon: Icon, label } = getWeatherMeta(code)

  return <Icon aria-label={label} className={cn('h-5 w-5', className)} />
}
