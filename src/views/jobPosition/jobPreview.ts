export interface JobPreview {
  title: string
  description: string
  employmentType: string
  workArrangement: string
  workLocation: string
}

export const previewStorageKey = (id: string) => `job-preview:${id}`

export const newPreviewStorageKey = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return previewStorageKey(Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(''))
}

export const readJobPreview = (key: unknown): JobPreview | null => {
  if (typeof key !== 'string' || !/^job-preview:[0-9a-f]{32}$/i.test(key)) return null
  const value = sessionStorage.getItem(key)
  if (!value) return null
  try {
    const data: unknown = JSON.parse(value)
    if (typeof data !== 'object' || data === null || !('title' in data) || !('description' in data)) return null
    if (typeof data.title !== 'string' || typeof data.description !== 'string') return null
    return {
      title: data.title,
      description: data.description,
      employmentType: 'employmentType' in data && typeof data.employmentType === 'string' ? data.employmentType : '',
      workArrangement: 'workArrangement' in data && typeof data.workArrangement === 'string' ? data.workArrangement : '',
      workLocation: 'workLocation' in data && typeof data.workLocation === 'string' ? data.workLocation : ''
    }
  } catch (error) {
    console.error('Invalid job preview data', error)
    return null
  }
}
