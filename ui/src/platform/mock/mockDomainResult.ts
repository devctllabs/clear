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
import { mapApiErrorToDomainError } from '@shared/services/api/error-mapping'
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

  return mapApiErrorToDomainError(error.body, error.message)
}
