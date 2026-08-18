import { z } from 'zod'

export const createCeladorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Formato de correo electrónico inválido')
    .max(150, 'El correo no puede exceder 150 caracteres'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
})

export const updateCeladorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Formato de correo electrónico inválido')
    .max(150, 'El correo no puede exceder 150 caracteres')
    .optional(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .optional()
})

export const createProgramaSchema = z.object({
  nombre_programa: z
    .string()
    .trim()
    .min(3, 'El nombre del programa debe tener al menos 3 caracteres')
    .max(150, 'El nombre del programa no puede exceder 150 caracteres'),
  version: z
    .string()
    .trim()
    .min(1, 'La versión es requerida')
    .max(10, 'La versión no puede exceder 10 caracteres'),
  nivel: z.enum(['Técnico', 'Tecnólogo', 'Especialización', 'Operario', 'Auxiliar']),
  estado: z.enum(['activo', 'inactivo']).default('activo')
})

export const createHorarioSchema = z
  .object({
    hora_inicio: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Formato de hora de inicio inválido (HH:mm)'),
    hora_fin: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Formato de hora de fin inválido (HH:mm)'),
    jornada: z.enum(['Mañana', 'Tarde', 'Noche', 'Mixta']),
    dias_semana: z
      .array(z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']))
      .min(1, 'Debe seleccionar al menos un día de la semana')
  })
  .refine(
    (data) => data.hora_fin > data.hora_inicio,
    {
      message: 'La hora de finalización debe ser posterior a la hora de inicio',
      path: ['hora_fin']
    }
  )

export const createFormacionSchema = z
  .object({
    id_formacion: z.coerce
      .number()
      .int('El número de ficha debe ser entero')
      .positive('El número de ficha debe ser positivo')
      .min(100000, 'Número de ficha debe tener al menos 6 dígitos'),
    id_programa: z.coerce.number().positive(),
    id_horario: z.coerce.number().positive(),
    fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha de inicio inválido (YYYY-MM-DD)'),
    fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha de fin inválido (YYYY-MM-DD)').optional().nullable(),
    estado: z.enum(['activa', 'inactiva', 'finalizada']).default('activa')
  })
  .refine(
    (data) => !data.fecha_fin || data.fecha_fin >= data.fecha_inicio,
    {
      message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
      path: ['fecha_fin']
    }
  )

export const simularHoraSchema = z.object({
  hora: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Formato de hora inválido (HH:mm o HH:mm:ss)')
})

export const deleteRecordSchema = z.object({
  id: z.string(),
  verification: z.string(),
  date: z.string(),
  observation: z.string().optional()
})
