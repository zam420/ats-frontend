import axios from 'axios'

// The /auth endpoints return plain payloads (not the ApiResult wrapper), so they bypass the shared interceptors.
const authHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: 60000
})

export interface LoginReq {
  email: string
  password: string
}

export interface RegisterReq {
  userName: string
  password: string
  email: string
  firstName?: string
  lastName?: string
}

export interface LoginRes {
  email: string
  accessToken: string
  refreshToken: string
  activationRequired: boolean
}

// The backend returns errors as { error, code, category, timestamp }
const extractMessage = (data: any): string | undefined => data?.error || undefined

// The backend serializes JSON in snake_case (property-naming-strategy: SNAKE_CASE in application.yml)
const request = async (url: string, data: object): Promise<LoginRes> => {
  try {
    const res = await authHttp.post(url, data)
    if (!res.data?.access_token) {
      throw new Error(extractMessage(res.data) || 'Request failed')
    }
    return {
      email: res.data.email,
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      activationRequired: !!res.data.activation_required
    }
  } catch (e: any) {
    throw new Error(extractMessage(e?.response?.data) || e?.message || 'Request failed')
  }
}
export const loginApi = (data: LoginReq) => request('/auth/login', data)

export const registerApi = (data: RegisterReq) =>
  request('/auth/register', {
    user_name: data.userName,
    email: data.email,
    password: data.password,
    first_name: data.firstName,
    last_name: data.lastName
  })

export interface ResetPasswordReq {
  email: string
  resetCode: string
  newPassword: string
}

// These endpoints return an empty body on success
const postNoResult = async (url: string, data: object): Promise<void> => {
  try {
    await authHttp.post(url, data)
  } catch (e: any) {
    throw new Error(extractMessage(e?.response?.data) || e?.message || 'Request failed')
  }
}

export const forgotPasswordApi = (email: string) => postNoResult('/auth/forgotPassword', { email })

export const resetPasswordApi = (data: ResetPasswordReq) =>
  postNoResult('/auth/resetPassword', {
    email: data.email,
    reset_code: data.resetCode,
    new_password: data.newPassword
  })

export const refreshApi = (refreshToken: string) => request('/auth/refresh', { refresh_token: refreshToken })

export const activateApi = (email: string, activationCode: string) =>
  postNoResult('/auth/activate', { email, activation_code: activationCode })

export const logoutApi = (refreshToken: string) =>
  authHttp.post('/auth/logout', { refresh_token: refreshToken }).catch(() => undefined)
