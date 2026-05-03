import axios from 'axios'

import type {
  Destination,
  SearchRequest,
  SearchResult,
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
