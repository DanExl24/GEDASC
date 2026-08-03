import { z } from 'zod';

export const deleteRecordSchema = z.object({
  id: z.string().min(1, 'El ID del aprendiz es obligatorio'),
  verification: z.string().min(1, 'Debes confirmar con el nombre o documento'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  observation: z.string().min(5, 'La observación debe tener al menos 5 caracteres')
});

export type DeleteRecordInput = z.infer<typeof deleteRecordSchema>;
