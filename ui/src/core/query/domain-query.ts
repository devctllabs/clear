import type { DomainError, Result } from '@shared/errors'

export const unwrapDomainResult = async <T>(
  resultPromise: Promise<Result<T, DomainError>>,
): Promise<T> => {
  const result = await resultPromise

  if (!result.ok) {
    throw result.error
  }

  return result.value
}
