import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Formato de correo electrónico inválido')
    .min(1, 'El correo electrónico es requerido')
    .max(150, 'El correo no puede exceder 150 caracteres'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
})

export type LoginInput = z.infer<typeof loginSchema>
