import { z } from 'zod'

export const exitParamSchema = z.object({
  documento: z
    .string()
    .trim()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20, 'El documento no puede exceder 20 caracteres')
    .regex(/^[A-Za-z0-9-]+$/, 'El documento solo puede contener números, letras y guiones')
})

export const createExitSchema = z.object({
  documento: z
    .string()
    .trim()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20, 'El documento no puede exceder 20 caracteres')
    .regex(/^[A-Za-z0-9-]+$/, 'El documento solo puede contener números, letras y guiones'),
  motivo_salida_anticipada: z
    .string()
    .trim()
    .max(255, 'El motivo de salida anticipada no puede exceder 255 caracteres')
    .optional()
    .nullable()
})
