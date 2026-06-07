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

export type ValidationIssue = {
  path?: string[]
  code: string
  params?: Record<string, unknown>
}

export type DomainError =
  | {
      type: typeof DomainErrorType.Validation
      issues: ValidationIssue[]
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
  validation(issues: ValidationIssue[]): DomainError {
    return {
      type: DomainErrorType.Validation,
      issues,
      retryable: false,
    }
  },
} as const

export const isDomainError = (value: unknown): value is DomainError => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as {
    entity?: unknown
    entityId?: unknown
    issues?: unknown
    message?: unknown
    retryable?: unknown
    type?: unknown
  }

  if (
    typeof candidate.type !== 'string' ||
    !Object.values(DomainErrorType).includes(candidate.type as DomainErrorType)
  ) {
    return false
  }

  if (candidate.type === DomainErrorType.Validation) {
    return candidate.retryable === false && isValidationIssues(candidate.issues)
  }

  if (typeof candidate.message !== 'string') {
    return false
  }

  switch (candidate.type) {
    case DomainErrorType.Conflict:
    case DomainErrorType.Forbidden:
    case DomainErrorType.NotFound:
    case DomainErrorType.Unauthorized:
    case DomainErrorType.Unexpected:
      return (
        candidate.retryable === false &&
        (candidate.entity === undefined || typeof candidate.entity === 'string') &&
        (candidate.entityId === undefined || typeof candidate.entityId === 'string')
      )
    case DomainErrorType.Offline:
    case DomainErrorType.Timeout:
    case DomainErrorType.Unavailable:
      return candidate.retryable === true
  }

  return false
}

export const isValidationIssues = (value: unknown): value is ValidationIssue[] =>
  Array.isArray(value) && value.every(isValidationIssue)

export const isValidationIssue = (value: unknown): value is ValidationIssue => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as {
    code?: unknown
    params?: unknown
    path?: unknown
  }

  return (
    typeof candidate.code === 'string' &&
    (candidate.path === undefined ||
      (Array.isArray(candidate.path) &&
        candidate.path.every((segment) => typeof segment === 'string'))) &&
    (candidate.params === undefined ||
      (typeof candidate.params === 'object' &&
        candidate.params !== null &&
        !Array.isArray(candidate.params)))
  )
}
