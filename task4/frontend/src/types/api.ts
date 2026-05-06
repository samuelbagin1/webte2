export type TripTypeCode =
  | 'sea_beach'
  | 'mountains'
  | 'historic'
  | 'city_break'
  | 'adventure'

export type TemperaturePreference = 'hot' | 'warm' | 'mild' | 'any'

export type SearchRequest = {
  trip_types: TripTypeCode[]
  temperature_pref: TemperaturePreference
  max_flight_hours: number | null
  start_date: string
  end_date: string
  month: number
}

export type Country = {
  id: number
  iso_code: string
  name_sk: string
  capital: string
  currency_code: string
  flag_url: string
  external_info?: unknown
}

export type SearchResultCountry = Pick<Country, 'id' | 'iso_code' | 'name_sk' | 'flag_url'>

export type DestinationType = {
  code: TripTypeCode
  name_sk: string
}

export type CurrentWeather = {
  temperature: number | null
  humidity: number | null
  wind_speed: number | null
  weather_code: number | null
  icon: string
  description_sk: string
  observed_at: string | null
  source: string
  fallback_hub?: string
}

export type MonthlyClimate = {
  month: number
  temp_avg: number
  temp_min: number
  temp_max: number
  precipitation_pct: number
  wind_avg: number
}

export type Destination = {
  id: number
  name: string
  latitude: number
  longitude: number
  flight_hours_from_vienna: number
  description_sk: string
  image_url: string | null
  country: Country
  types: DestinationType[]
  monthly_climate: MonthlyClimate | null
  currency_rate: number | null
  current_weather: CurrentWeather
}

export type SearchResult = {
  id: number
  name: string
  image_url: string | null
  country: SearchResultCountry
  match_score: number
  reasons: string[]
}

export type WhyNowResponse = {
  destination_id: number
  month: number
  why_now: string
}

export type CompareResponse = {
  destinations: Destination[]
}

export type VisitsStats = {
  total: number
  unique: number
}

export type HourlyStats = Record<'0-6' | '6-15' | '15-21' | '21-24', number>

export type SearchStatsSort = 'name' | 'country' | 'count'
export type SortOrder = 'asc' | 'desc'

export type SearchStatsRow = {
  id: number
  name: string
  country: string
  count: number
}

export type PreferenceStats = {
  types: Partial<Record<TripTypeCode, number>>
  temperatures: Partial<Record<TemperaturePreference, number>>
}
