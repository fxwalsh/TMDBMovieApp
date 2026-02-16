export type AppErrorKind =
  | 'Network'
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'RateLimited'
  | 'Server'
  | 'Validation'
  | 'Unknown'

export interface AppErrorOptions {
  kind: AppErrorKind
  status?: number
  endpoint?: string
  safeDetails: string
  originalError?: unknown
}

export class AppError extends Error {
  readonly kind: AppErrorKind
  readonly status?: number
  readonly endpoint?: string
  readonly safeDetails: string
  readonly originalError?: unknown

  constructor(options: AppErrorOptions) {
    super(options.safeDetails)
    this.name = 'AppError'
    this.kind = options.kind
    this.status = options.status
    this.endpoint = options.endpoint
    this.safeDetails = options.safeDetails
    this.originalError = options.originalError

    // Maintain proper stack trace for where error was thrown
    Object.setPrototypeOf(this, AppError.prototype)
  }

  /**
   * Convert HTTP status code to AppError kind
   */
  static fromHttpStatus(status: number): AppErrorKind {
    if (status === 401) return 'Unauthorized'
    if (status === 403) return 'Forbidden'
    if (status === 404) return 'NotFound'
    if (status === 429) return 'RateLimited'
    if (status >= 500) return 'Server'
    return 'Unknown'
  }

  /**
   * Create AppError from fetch response
   */
  static async fromResponse(response: Response, endpoint?: string): Promise<AppError> {
    const kind = AppError.fromHttpStatus(response.status)
    let safeDetails = 'An unexpected error occurred. Please try again.'

    if (kind === 'Unauthorized') {
      safeDetails = 'Invalid API key. Please check your configuration.'
    } else if (kind === 'Forbidden') {
      safeDetails = 'Access denied. You do not have permission to access this resource.'
    } else if (kind === 'NotFound') {
      safeDetails = 'The requested resource was not found.'
    } else if (kind === 'RateLimited') {
      safeDetails = 'Too many requests. Please wait a moment and try again.'
    } else if (kind === 'Server') {
      safeDetails = 'Server error. Please try again later.'
    }

    return new AppError({
      kind,
      status: response.status,
      endpoint,
      safeDetails,
      originalError: response,
    })
  }
}
