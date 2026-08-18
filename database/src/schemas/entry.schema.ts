import { z } from 'zod'

export const documentoParamSchema = z.object({
  documento: z
    .string()
    .trim()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20, 'El documento no puede exceder 20 caracteres')
    .regex(/^[A-Za-z0-9-]+$/, 'El documento solo puede contener números, letras y guiones')
})

export const createEntrySchema = z.object({
  documento: z
    .string()
    .trim()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20, 'El documento no puede exceder 20 caracteres')
    .regex(/^[A-Za-z0-9-]+$/, 'El documento solo puede contener números, letras y guiones'),
  tipoSesion: z.enum(['formacion', 'monitoria']).default('formacion'),
  motivo_reingreso: z
    .string()
    .trim()
    .max(255, 'El motivo de reingreso no puede exceder 255 caracteres')
    .optional()
    .nullable(),
  id_formacion: z.coerce.number().positive().optional().nullable(),
  motivo_visita: z
    .string()
    .trim()
    .max(255, 'El motivo de visita no puede exceder 255 caracteres')
    .optional()
    .nullable()
})
