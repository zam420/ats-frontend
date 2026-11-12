import http from '@/api'
import type { ResPage, ResultCreate } from '@/api/interface'
import type { ScreeningFormDetail, ScreeningFormListItem, ScreeningFormRequest, ScreeningQuestionType } from '@/api/interface/screeningQuestionsForm'

export const getScreeningForms = (tab: string, params: Record<string, unknown>) =>
  http.get<ResPage<ScreeningFormListItem>>(`/api/sqform/${tab}`, params)
export const getScreeningFormsList = () =>
  http.get<ScreeningFormListItem[]>('/api/sqform/list')
export const getScreeningForm = (id: string) =>
  http.get<ScreeningFormDetail>(`/api/sqform/${encodeURIComponent(id)}`)
export const getScreeningQuestionTypes = () =>
  http.get<ScreeningQuestionType[]>('/api/sqform/roundtypes')
export const createScreeningForm = (data: ScreeningFormRequest) =>
  http.post<ResultCreate>('/api/sqform/create', data)
export const saveAsScreeningForm = (data: ScreeningFormRequest) =>
  http.post<ResultCreate>('/api/sqform/saveas', data)
export const updateScreeningForm = (data: ScreeningFormRequest) =>
  http.post<ResultCreate>('/api/sqform/update', data)
export const createScreeningFormTemplate = (data: ScreeningFormRequest) =>
  http.post<ResultCreate>('/api/sqform/templates/create', data)
export const updateScreeningFormTemplate = (data: ScreeningFormRequest) =>
  http.post<ResultCreate>('/api/sqform/templates/update', data)
export const deactivateScreeningForm = (id: string) =>
  http.post<boolean>(`/api/sqform/deactivate/${encodeURIComponent(id)}`)
