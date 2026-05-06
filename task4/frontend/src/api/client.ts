import axios from 'axios'

import type {
  CompareResponse,
  Destination,
  HourlyStats,
  PreferenceStats,
  SearchRequest,
  SearchResult,
  SearchStatsRow,
  SearchStatsSort,
  SortOrder,
  VisitsStats,
  WhyNowResponse,
} from '@/types/api'

export const api = axios.create({
  baseURL: '/task4/api',
  headers: {
    Accept: 'application/json',
  },
})

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Nastala neočakávaná chyba. Skús to znova.'
  }

  if (!error.response) {
    return 'Server momentálne neodpovedá. Skontroluj pripojenie alebo API server.'
  }

  if (error.response.status === 422) {
    return 'Skontroluj zadané údaje a skús to znova.'
  }

  if (error.response.status === 404) {
    return 'Požadované údaje sa nenašli.'
  }

  if (error.response.status >= 500) {
    return 'Server má momentálne problém. Skús to neskôr.'
  }

  return 'Údaje sa nepodarilo načítať. Skús to znova.'
}

export async function searchDestinations(body: SearchRequest) {
  const response = await api.post<SearchResult[]>('/search', body)
  return response.data
}

export async function getDestination(id: number, month: number) {
  const response = await api.get<Destination>(`/destinations/${id}`, {
    params: { month },
  })
  return response.data
}

export async function getWhyNow(id: number, month: number) {
  const response = await api.get<WhyNowResponse>(
    `/destinations/${id}/why-now`,
    {
      params: { month },
    },
  )
  return response.data
}

export async function getCompare(ids: number[], month: number) {
  const response = await api.get<CompareResponse>('/compare', {
    params: { ids: ids.join(','), month },
  })
  return response.data
}

export async function getVisitStats() {
  const response = await api.get<VisitsStats>('/stats/visits')
  return response.data
}

export async function getHourlyStats() {
  const response = await api.get<HourlyStats>('/stats/hourly')
  return response.data
}

export async function getSearchStats(sort: SearchStatsSort, order: SortOrder) {
  const response = await api.get<SearchStatsRow[]>('/stats/searches', {
    params: { sort, order },
  })
  return response.data
}

export async function getPreferenceStats() {
  const response = await api.get<PreferenceStats>('/stats/preferences')
  return response.data
}
