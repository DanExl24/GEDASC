import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export interface RequestValidationSchemas {
  body?: ZodSchema
  params?: ZodSchema
  query?: ZodSchema
}

export const validateRequest = (schemas: RequestValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as any
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación en los datos de entrada',
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        })
      }
      next(error)
    }
  }
}
