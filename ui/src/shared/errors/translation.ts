import { useTranslation } from 'react-i18next'

import { DomainErrorType, type DomainError } from './index'

import type { TFunction } from 'i18next'

export const translateDomainError = (
  t: TFunction,
  error: DomainError,
): string => {
  switch (error.type) {
    case DomainErrorType.Conflict:
      return t(($) => $.errors.byType.conflict)
    case DomainErrorType.Forbidden:
      return t(($) => $.errors.byType.forbidden)
    case DomainErrorType.NotFound:
      return t(($) => $.errors.byType.notFound)
    case DomainErrorType.Offline:
      return t(($) => $.errors.byType.offline)
    case DomainErrorType.Timeout:
      return t(($) => $.errors.byType.timeout)
    case DomainErrorType.Unauthorized:
      return t(($) => $.errors.byType.unauthorized)
    case DomainErrorType.Unavailable:
      return t(($) => $.errors.byType.unavailable)
    case DomainErrorType.Unexpected:
    case DomainErrorType.Validation:
      return error.message
  }
}

export const useDomainErrorMessage = (error: DomainError): string => {
  const { t } = useTranslation()

  return translateDomainError(t, error)
}
