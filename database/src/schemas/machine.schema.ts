import { z } from 'zod'

export const createComputerSchema = z.object({
  serial: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'El serial debe tener al menos 3 caracteres')
    .max(50, 'El serial no puede exceder 50 caracteres'),
  marca: z
    .string()
    .trim()
    .min(2, 'La marca debe tener al menos 2 caracteres')
    .max(50, 'La marca no puede exceder 50 caracteres'),
  modelo: z.string().trim().max(50).optional().nullable(),
  color: z.string().trim().max(30).optional().nullable()
})

export const createVehicleSchema = z.object({
  tipo_vehiculo: z.enum(['CARRO', 'MOTO', 'BICICLETA', 'PATINETA']),
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .transform((val) => val.replace(/[-\s]/g, ''))
    .optional()
    .nullable(),
  marca: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable(),
  modelo: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable()
})

export const signatureSchema = z.object({
  firma: z
    .string()
    .regex(/^data:image\/(png|jpeg|jpg);base64,/, 'La firma debe ser una imagen Base64 válida')
    .max(3000000, 'La firma no puede exceder 3MB')
})
