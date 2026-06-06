import {
  MockHttpError,
  type ReviewSession as ApiReviewSession,
  type ReviewStartResult as ApiReviewStartResult,
} from '@local/mock-server/browser'

import {
  domainError,
  err,
  ok,
  type DomainError,
  type Result,
} from '@shared/errors'
import type {
  DueReviewSession,
  ReviewSession,
  ReviewStartResult,
} from '@features/review/types/review.types'

export const toMockDomainResult = async <TValue, TResult = TValue>(
  operation: () => TValue | Promise<TValue>,
  mapValue: (value: TValue) => TResult = (value) => value as unknown as TResult,
): Promise<Result<TResult>> => {
  try {
    return ok(mapValue(await operation()))
  } catch (error) {
    return err(toMockDomainError(error))
  }
}

export const toMockVoidDomainResult = (operation: () => void | Promise<void>) =>
  toMockDomainResult(operation, () => undefined)

export const toReviewStartResult = (
  result: ApiReviewStartResult,
): ReviewStartResult => {
  if (result.mode === 'unavailable') {
    return result
  }

  return toReviewSession(result)
}

export const toReviewSession = (session: ApiReviewSession): ReviewSession => {
  if (session.mode === 'practice') {
    return session as ReviewSession
  }

  const { currentCard, ...rest } = session
  const dueSession: DueReviewSession = {
    ...rest,
    ...(currentCard ? { currentCard } : {}),
  } as DueReviewSession

  return dueSession
}

const toMockDomainError = (error: unknown): DomainError => {
  if (!(error instanceof MockHttpError)) {
    return domainError.unexpected('Mock service failed.')
  }

  switch (error.status) {
    case 400:
      return domainError.unexpected(error.message)
    case 401:
      return domainError.unauthorized(error.message)
    case 403:
      return domainError.forbidden(error.message)
    case 404:
      return toNotFoundDomainError(error)
    case 409:
      return domainError.conflict(error.message)
    case 422:
      return domainError.validation(error.message, {})
    case 502:
    case 503:
    case 504:
      return domainError.unavailable(error.message)
    default:
      return domainError.unexpected(error.message)
  }
}

const toNotFoundDomainError = (error: MockHttpError): DomainError => {
  const match = /^(.+) (\S+) was not found$/.exec(error.message)

  return domainError.notFound(error.message, match?.[1], match?.[2])
}
