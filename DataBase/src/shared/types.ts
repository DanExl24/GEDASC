export type APIResponse<T> = {
  success: true
  data: T
  meta?: {
    count?: number
    source?: string
  }
}

export type APIError = {
  success: false
  message: string
}
