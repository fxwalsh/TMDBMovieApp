import { z, type ZodSchema } from 'zod'
import { AppError } from './errors'

/**
 * Validate API response data with Zod schema
 * Throws AppError if validation fails
 */
export function validateResponse<T>(data: unknown, schema: ZodSchema<T>, endpoint?: string): T {
  try {
    return schema.parse(data)
  } catch (error) {
    console.error('Validation error:', error)
    throw new AppError({
      kind: 'Validation',
      endpoint,
      safeDetails: 'Invalid data received from server. Please try again.',
      originalError: error,
    })
  }
}

/**
 * Safe validation that returns result object instead of throwing
 */
export function safeValidateResponse<T>(
  data: unknown,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  return result.success ? { success: true, data: result.data } : { success: false, error: result.error }
}
