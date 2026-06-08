import { z } from 'zod'

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

export const ValidationIssueCode = {
  Invalid: 'invalid',
  InvalidEnum: 'invalid_enum',
  InvalidFormat: 'invalid_format',
  InvalidValue: 'invalid_value',
  Maximum: 'maximum',
  MaxLength: 'max_length',
  Minimum: 'minimum',
  MinLength: 'min_length',
  Required: 'required',
} as const

export type ValidationIssueCode =
  (typeof ValidationIssueCode)[keyof typeof ValidationIssueCode]

const validationIssueSchema = z.object({
  path: z.array(z.string()).optional(),
  code: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
})

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

const messageDomainErrorSchema = z.object({
  message: z.string(),
})

const nonRetryableMessageDomainErrorSchema = messageDomainErrorSchema.extend({
  type: z.enum([
    DomainErrorType.Conflict,
    DomainErrorType.Forbidden,
    DomainErrorType.NotFound,
    DomainErrorType.Unauthorized,
    DomainErrorType.Unexpected,
  ]),
  retryable: z.literal(false),
  entity: z.string().optional(),
  entityId: z.string().optional(),
})

const retryableMessageDomainErrorSchema = messageDomainErrorSchema.extend({
  type: z.enum([
    DomainErrorType.Offline,
    DomainErrorType.Timeout,
    DomainErrorType.Unavailable,
  ]),
  retryable: z.literal(true),
})

const validationDomainErrorSchema = z.object({
  type: z.literal(DomainErrorType.Validation),
  issues: z.array(validationIssueSchema),
  retryable: z.literal(false),
})

const domainErrorSchema = z.union([
  validationDomainErrorSchema,
  nonRetryableMessageDomainErrorSchema,
  retryableMessageDomainErrorSchema,
])

export const isDomainError = (value: unknown): value is DomainError =>
  domainErrorSchema.safeParse(value).success

export const isValidationIssues = (value: unknown): value is ValidationIssue[] =>
  Array.isArray(value) && value.every(isValidationIssue)

export const isValidationIssue = (value: unknown): value is ValidationIssue =>
  validationIssueSchema.safeParse(value).success
