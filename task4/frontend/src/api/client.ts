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
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
})

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
