import { addDays, differenceInCalendarDays, format, lastDayOfMonth } from 'date-fns'

import type {
  SearchRequest,
  TemperaturePreference,
  TripTypeCode,
} from '@/types/api'

export const MONTHS = [
  { value: 1, label: 'Január' },
  { value: 2, label: 'Február' },
  { value: 3, label: 'Marec' },
  { value: 4, label: 'Apríl' },
  { value: 5, label: 'Máj' },
  { value: 6, label: 'Jún' },
  { value: 7, label: 'Júl' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Október' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
] as const

export const TRIP_TYPES: Array<{
  code: TripTypeCode
  label: string
  description: string
}> = [
  {
    code: 'sea_beach',
    label: 'More a pláž',
    description: 'Teplo, pobrežie a oddych pri vode.',
  },
  {
    code: 'mountains',
    label: 'Hory a príroda',
    description: 'Výhľady, turistika a pokoj mimo mesta.',
  },
  {
    code: 'historic',
    label: 'Historické mestá',
    description: 'Pamiatky, architektúra a staré centrá.',
  },
  {
    code: 'city_break',
    label: 'Mestský výlet',
    description: 'Kaviarne, galérie a víkendové tempo.',
  },
  {
    code: 'adventure',
    label: 'Aktivity a dobrodružstvo',
    description: 'Pohyb, objavovanie a výraznejší zážitok.',
  },
]

export const TEMPERATURE_OPTIONS: Array<{
  value: TemperaturePreference
  label: string
}> = [
  { value: 'hot', label: 'Horúco' },
  { value: 'warm', label: 'Teplo' },
  { value: 'mild', label: 'Mierne' },
  { value: 'any', label: 'Nezáleží' },
]

export const DISTANCE_OPTIONS = [
  { value: 'near', label: 'Do 2 h', maxFlightHours: 2 },
  { value: 'medium', label: 'Do 4 h', maxFlightHours: 4 },
  { value: 'any', label: 'Nezáleží', maxFlightHours: null },
] as const

export type DistancePreference = (typeof DISTANCE_OPTIONS)[number]['value']
export type SearchMode = 'month' | 'range'

const VALID_TRIP_TYPES = new Set(TRIP_TYPES.map((type) => type.code))
const VALID_TEMPERATURES = new Set(TEMPERATURE_OPTIONS.map((option) => option.value))
const VALID_DISTANCES = new Set(DISTANCE_OPTIONS.map((option) => option.value))

export function monthLabel(month: number) {
  return MONTHS.find((item) => item.value === month)?.label ?? `Mesiac ${month}`
}

export function imageForDestination(id: number, imageUrl?: string | null) {
  return imageUrl || `https://picsum.photos/seed/destination-${id}/900/675`
}

export function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export function createMonthRange(month: number, days: number) {
  const start = new Date(2026, month - 1, 1)
  const end = addDays(start, Math.max(1, days) - 1)
  const maxEnd = lastDayOfMonth(start)

  return {
    start: formatDate(start),
    end: formatDate(end > maxEnd ? maxEnd : end),
  }
}

export function daysBetween(start: Date, end: Date) {
  return Math.max(1, differenceInCalendarDays(end, start) + 1)
}

export function parseSearchParams(params: URLSearchParams): SearchRequest | null {
  const types = (params.get('types') ?? '')
    .split(',')
    .filter((value): value is TripTypeCode =>
      VALID_TRIP_TYPES.has(value as TripTypeCode),
    )

  const tempParam = params.get('temp') as TemperaturePreference | null
  const distanceParam = params.get('distance') as DistancePreference | null
  const start = params.get('start')
  const end = params.get('end')
  const month = Number(params.get('month'))

  if (
    types.length === 0 ||
    !start ||
    !end ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null
  }

  const temperature_pref =
    tempParam && VALID_TEMPERATURES.has(tempParam) ? tempParam : 'any'
  const distance =
    distanceParam && VALID_DISTANCES.has(distanceParam) ? distanceParam : 'any'
  const max_flight_hours =
    DISTANCE_OPTIONS.find((option) => option.value === distance)?.maxFlightHours ??
    null

  return {
    trip_types: types,
    temperature_pref,
    max_flight_hours,
    start_date: start,
    end_date: end,
    month,
  }
}
