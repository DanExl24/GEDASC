import { z } from 'zod'

/**
 * Esquema y validador de Documento de Identidad (Aprendices y Personal)
 * Admite Cédula de Ciudadanía, Tarjeta de Identidad, Cédula de Extranjería, PPT, PEP y Pasaporte (5 a 20 caracteres)
 */
export const documentoSchema = z
  .string()
  .trim()
  .min(5, 'El documento debe tener al menos 5 caracteres')
  .max(20, 'El documento no puede exceder 20 caracteres')
  .regex(/^[A-Za-z0-9-]+$/, 'El documento solo puede contener letras, números y guiones')

export const validateDocumento = (doc: string): { valid: boolean; error?: string } => {
  const result = documentoSchema.safeParse(doc)
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message }
  }
  return { valid: true }
}

/**
 * Esquema y validador de Correo Electrónico
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Formato de correo electrónico inválido')
  .max(150, 'El correo no puede exceder 150 caracteres')

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const result = emailSchema.safeParse(email)
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message }
  }
  return { valid: true }
}

/**
 * Esquema y validador de Contraseña (mínimo 8 caracteres)
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'La contraseña no puede exceder 100 caracteres')

export const validatePassword = (pass: string): { valid: boolean; error?: string } => {
  const result = passwordSchema.safeParse(pass)
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message }
  }
  return { valid: true }
}

/**
 * Validador de Placas y Autogenerador para Vehículos Ligeros
 */
export const validatePlacaVehiculo = (
  tipo: 'CARRO' | 'MOTO' | 'BICICLETA' | 'PATINETA',
  placa: string
): { valid: boolean; error?: string } => {
  const cleanPlaca = placa.replace(/[-\s]/g, '').toUpperCase().trim()

  if (tipo === 'CARRO') {
    const isCarPlate = /^[A-Z]{3}\d{3}$/.test(cleanPlaca)
    if (!isCarPlate) {
      return { valid: false, error: 'Placa de carro inválida (Ej: HDT132 o HDT-132)' }
    }
  } else if (tipo === 'MOTO') {
    const isMotoPlate = /^[A-Z]{3}\d{2}[A-Z0-9]$/.test(cleanPlaca)
    if (!isMotoPlate) {
      return { valid: false, error: 'Placa de moto inválida (Ej: ABC12D o ABC123)' }
    }
  }
  return { valid: true }
}

/**
 * Generador de Identificador Institucional para Bicicletas y Patinetas
 */
export const generateLightVehicleId = (
  tipo: 'BICICLETA' | 'PATINETA',
  idAprendiz: number | string
): string => {
  const prefix = tipo === 'PATINETA' ? 'PAT' : 'BIC'
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${idAprendiz}-${randomSuffix}`
}
