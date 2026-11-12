import http from '@/api'
import type { ResPage } from '@/api/interface'

export interface Tenant {
  id: string
  name: string
  description: string | null
  owner_id: string
  has_logo: boolean
}

export interface TenantRequest {
  id?: string
  name: string
  description: string
}

export const getTenants = (params: Record<string, unknown>) =>
  http.get<ResPage<Tenant>>('/api/tenant/all', params)

export const getTenant = (id: string) =>
  http.get<Tenant>(`/api/tenant/${encodeURIComponent(id)}`)

export const getTenantLogo = (id: string) =>
  http.getFile<never>(`/api/tenant/${encodeURIComponent(id)}/logo`, undefined, { noLoading: true })

export const saveTenant = (data: TenantRequest, logo: File | null) => {
  const form = new FormData()
  form.append('tenant', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (logo) form.append('logo', logo)
  return http.post<{ id: string }>(`/api/tenant/${data.id ? 'update' : 'create'}`, form)
}

export const deactivateTenant = (id: string) =>
  http.post<boolean>(`/api/tenant/deactivate/${encodeURIComponent(id)}`)
