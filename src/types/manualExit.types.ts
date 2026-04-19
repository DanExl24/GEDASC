export type ManualExitMessageType = 'error' | 'success'

export type ManualExitDocumentHandler = (
  documento: string,
) => void | Promise<void>

export interface ManualExitFormData {
  documento: string
  nombre: string
  apellido: string
  formacion: string
}

export interface ManualExitLookupResponse {
  result: {
    nombre: string
    apellido: string
    formacion: string
  }
}
