import {
  domainError,
  isDomainError,
  isFieldErrors,
  type DomainError,
  type FieldErrors,
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
      return domainError.notFound(message)
    case 408:
      return domainError.timeout(message)
    case 409:
      return domainError.conflict(message)
    case 422:
      return domainError.validation(message, getFieldErrors(payload))
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
  const status = candidate.response?.status
  const code = candidate.code
  const payloadMessage = isObject(payload) ? payload.message : undefined

  return {
    code: typeof code === 'string' ? code : undefined,
    message:
      readMessage(payloadMessage) ?? readMessage(candidate.message) ?? fallbackMessage,
    payload,
    status: typeof status === 'number' ? status : undefined,
  }
}

const getFieldErrors = (value: unknown): FieldErrors => {
  if (!isObject(value)) {
    return {}
  }

  const { fieldErrors } = value

  return isFieldErrors(fieldErrors) ? fieldErrors : {}
}

const isResponseValidationError = (error: unknown) =>
  error instanceof ZodError ||
  (isObject(error) && (error as ErrorLike).name === 'ZodError')

const readMessage = (message: unknown) =>
  typeof message === 'string' && message.trim().length > 0 ? message : undefined

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
