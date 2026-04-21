export type CTAResponse<T> = {
  success: true
  data: T
  meta?: {
    count?: number
    source?: string
  }
}

export type CTAError = {
  success: false
  message: string
}
