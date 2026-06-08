import {
  domainError,
  isDomainError,
  isValidationIssues,
  type DomainError,
  type ValidationIssue,
} from '@shared/errors'
import { ZodError } from 'zod'

type ErrorLike = {
  code?: unknown
  error?: unknown
  message?: unknown
  name?: unknown
  response?: {
    data?: unknown
    status?: unknown
  }
}

type ApiErrorInfo = {
  code?: string
  message: string
  payload: unknown
  status?: number
}

const ProblemType = {
  BadRequest: '/problems/bad-request',
  Conflict: '/problems/conflict',
  Forbidden: '/problems/forbidden',
  NotFound: '/problems/not-found',
  Timeout: '/problems/timeout',
  Unauthorized: '/problems/unauthorized',
  Unexpected: '/problems/unexpected',
  Unavailable: '/problems/unavailable',
  Validation: '/problems/validation',
} as const

export const mapApiErrorToDomainError = (
  error: unknown,
  fallbackMessage = 'Request failed.',
): DomainError => {
  const { code, message, payload, status } = readApiError(error, fallbackMessage)

  if (isDomainError(payload)) {
    return payload
  }

  if (isResponseValidationError(error)) {
    return domainError.unavailable(fallbackMessage)
  }

  const problemError = mapProblemDetailsToDomainError(payload, message)

  if (problemError) {
    return problemError
  }

  switch (code) {
    case 'ERR_NETWORK':
      return domainError.offline(message)
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
      return domainError.timeout(message)
  }

  switch (status) {
    case 401:
      return domainError.unauthorized(message)
    case 403:
      return domainError.forbidden(message)
    case 404:
      return domainError.notFound(
        message,
        readStringProperty(payload, 'entity'),
        readStringProperty(payload, 'entityId'),
      )
    case 408:
      return domainError.timeout(message)
    case 409:
      return domainError.conflict(message)
    case 422:
      return domainError.validation(getValidationIssues(payload))
    case 502:
    case 503:
    case 504:
      return domainError.unavailable(message)
    default:
      return domainError.unexpected(message)
  }
}

const readApiError = (error: unknown, fallbackMessage: string): ApiErrorInfo => {
  if (!isObject(error)) {
    return {
      message: fallbackMessage,
      payload: error,
    }
  }

  const candidate = error as ErrorLike
  const payload = candidate.error ?? candidate.response?.data ?? error
  const responseStatus = candidate.response?.status
  const code = candidate.code
  const payloadStatus = isObject(payload) ? payload.status : undefined
  const payloadMessage = readProblemMessage(payload)

  return {
    code: typeof code === 'string' ? code : undefined,
    message:
      readMessage(payloadMessage) ?? readMessage(candidate.message) ?? fallbackMessage,
    payload,
    status:
      typeof responseStatus === 'number'
        ? responseStatus
        : typeof payloadStatus === 'number'
          ? payloadStatus
          : undefined,
  }
}

const mapProblemDetailsToDomainError = (
  payload: unknown,
  fallbackMessage: string,
): DomainError | undefined => {
  if (!isObject(payload) || typeof payload.type !== 'string') {
    return undefined
  }

  const message = readProblemMessage(payload) ?? fallbackMessage

  switch (payload.type) {
    case ProblemType.BadRequest:
      return domainError.unexpected(message)
    case ProblemType.Conflict:
      return domainError.conflict(message)
    case ProblemType.Forbidden:
      return domainError.forbidden(message)
    case ProblemType.NotFound:
      return domainError.notFound(
        message,
        readStringProperty(payload, 'entity'),
        readStringProperty(payload, 'entityId'),
      )
    case ProblemType.Timeout:
      return domainError.timeout(message)
    case ProblemType.Unauthorized:
      return domainError.unauthorized(message)
    case ProblemType.Unexpected:
      return domainError.unexpected(message)
    case ProblemType.Unavailable:
      return domainError.unavailable(message)
    case ProblemType.Validation:
      return domainError.validation(getValidationIssues(payload))
    default:
      return undefined
  }
}

const getValidationIssues = (value: unknown): ValidationIssue[] => {
  if (!isObject(value)) {
    return []
  }

  const { issues } = value

  return isValidationIssues(issues) ? issues : []
}

const isResponseValidationError = (error: unknown) =>
  error instanceof ZodError ||
  (isObject(error) && (error as ErrorLike).name === 'ZodError')

const readMessage = (message: unknown) =>
  typeof message === 'string' && message.trim().length > 0 ? message : undefined

const readProblemMessage = (value: unknown) => {
  if (!isObject(value)) {
    return undefined
  }

  return readMessage(value.detail) ?? readMessage(value.title) ?? readMessage(value.message)
}

const readStringProperty = (value: unknown, property: string) => {
  if (!isObject(value)) {
    return undefined
  }

  const propertyValue = value[property]

  return typeof propertyValue === 'string' ? propertyValue : undefined
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
