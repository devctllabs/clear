import type { CreateClientConfig } from './generated/clear-api/client.gen'

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseURL: resolveApiBaseUrl(config?.baseURL),
})

const resolveApiBaseUrl = (fallback?: string) => {
  const apiBaseUrl = import.meta.env.VITE_CLEAR_API_BASE_URL?.trim()

  return normalizeBaseUrl(apiBaseUrl || fallback || '/api/v1')
}

const normalizeBaseUrl = (baseUrl: string) =>
  baseUrl.length > 1 ? baseUrl.replace(/\/+$/, '') : baseUrl
