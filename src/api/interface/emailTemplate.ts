declare namespace EmailTemplate {
  interface EmailInfo {
    id: number
    name: string
    subject: string
    content: string
    recruitment_type: number[] | string
    recruitment_type_name: string
    work_location: number[] | string
    work_location_name: string
    status: number
    fields: any
    share_to_ids: number[]
  }

  interface ShareList {
    from_email: string
    from_id: number
    id: number
    template_id: number
    to_email: string
    to_id: number
  }

  interface DetailInfo {
    id: number
    name: string
    subject: string
    content: string
    recruitment_type?: number[]
    recruitment_type_name: string
    work_location?: number[]
    work_location_name: string
    create_time?: string
    create_by?: number
    create_by_name?: string
    last_modified_time?: string
    last_modified_by?: number
    last_modified_by_name?: string
    status: number
    fields?: any
    sharing_list?: ShareList[]
  }

  interface ShareParam {
    template_id: number
    share_to_ids: number[]
  }
}
export default EmailTemplate
