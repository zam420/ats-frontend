declare namespace User {
  interface UserInfo {
    id: string
    name: string
    join_data: string
    email: string
    password: string
    permissions: string[]
    phone: string
    roles: string[] | number[]
    status: number
    type: number
  }

  interface EmailUser {
    id: number
    name: string
    email: string
  }

  interface UserInactive {
    id: number
    status: number
  }

  interface UserSetting {
    type: number
    settings: any
  }
}
export default User
