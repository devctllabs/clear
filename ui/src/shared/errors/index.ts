export const DomainErrorType = {
  Conflict: 'conflict',
  Forbidden: 'forbidden',
  NotFound: 'not_found',
  Offline: 'offline',
  Timeout: 'timeout',
  Unauthorized: 'unauthorized',
  Unexpected: 'unexpected',
  Unavailable: 'unavailable',
  Validation: 'validation',
} as const

export type DomainErrorType =
  (typeof DomainErrorType)[keyof typeof DomainErrorType]

export type FieldErrors = Record<string, string[]>

export type DomainError =
  | {
      type: typeof DomainErrorType.Validation
      message: string
      fieldErrors: FieldErrors
      retryable: false
    }
  | {
      type:
        | typeof DomainErrorType.Conflict
        | typeof DomainErrorType.Forbidden
        | typeof DomainErrorType.NotFound
        | typeof DomainErrorType.Unauthorized
        | typeof DomainErrorType.Unexpected
      message: string
      retryable: false
      entity?: string
      entityId?: string
    }
  | {
      type:
        | typeof DomainErrorType.Offline
        | typeof DomainErrorType.Timeout
        | typeof DomainErrorType.Unavailable
      message: string
      retryable: true
    }

export type Result<T, E = DomainError> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export type DomainResult<T> = Promise<Result<T>>

export const ok = <T>(value: T): Result<T> => ({ ok: true, value })

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

export const domainError = {
  conflict(message = 'Conflict'): DomainError {
    return { type: DomainErrorType.Conflict, message, retryable: false }
  },
  forbidden(message = 'Forbidden'): DomainError {
    return { type: DomainErrorType.Forbidden, message, retryable: false }
  },
  notFound(message = 'Not found', entity?: string, entityId?: string): DomainError {
    return {
      type: DomainErrorType.NotFound,
      message,
      retryable: false,
      entity,
      entityId,
    }
  },
  offline(message = 'Offline'): DomainError {
    return { type: DomainErrorType.Offline, message, retryable: true }
  },
  timeout(message = 'Timeout'): DomainError {
    return { type: DomainErrorType.Timeout, message, retryable: true }
  },
  unexpected(message = 'Unexpected error'): DomainError {
    return { type: DomainErrorType.Unexpected, message, retryable: false }
  },
  unavailable(message = 'Unavailable'): DomainError {
    return { type: DomainErrorType.Unavailable, message, retryable: true }
  },
  unauthorized(message = 'Unauthorized'): DomainError {
    return { type: DomainErrorType.Unauthorized, message, retryable: false }
  },
  validation(message: string, fieldErrors: FieldErrors): DomainError {
    return {
      type: DomainErrorType.Validation,
      message,
      fieldErrors,
      retryable: false,
    }
  },
} as const

export const isDomainError = (value: unknown): value is DomainError => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as {
    fieldErrors?: unknown
    message?: unknown
    retryable?: unknown
    type?: unknown
  }

  return (
    typeof candidate.type === 'string' &&
    Object.values(DomainErrorType).includes(candidate.type as DomainErrorType) &&
    typeof candidate.message === 'string' &&
    typeof candidate.retryable === 'boolean' &&
    (candidate.type !== DomainErrorType.Validation ||
      isFieldErrors(candidate.fieldErrors))
  )
}

export const isFieldErrors = (value: unknown): value is FieldErrors => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return Object.values(value).every(
    (entry) => Array.isArray(entry) && entry.every((message) => typeof message === 'string'),
  )
}

export const getUserMessage = (error: DomainError) => {
  switch (error.type) {
    case DomainErrorType.Conflict:
      return 'The data changed. Refresh and try again.'
    case DomainErrorType.Forbidden:
      return 'You do not have permission to do this.'
    case DomainErrorType.NotFound:
      return 'We could not find this item.'
    case DomainErrorType.Offline:
      return 'Cannot reach the service.'
    case DomainErrorType.Timeout:
      return 'This took too long. Try again.'
    case DomainErrorType.Unauthorized:
      return 'Sign in to continue.'
    case DomainErrorType.Unavailable:
      return 'The service is temporarily unavailable.'
    case DomainErrorType.Unexpected:
    case DomainErrorType.Validation:
      return error.message
  }
}
