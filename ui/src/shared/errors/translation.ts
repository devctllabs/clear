import { useTranslation } from 'react-i18next'

import {
  DomainErrorType,
  isDomainError,
  type DomainError,
  type ValidationIssue,
} from './index'

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
    case DomainErrorType.Validation:
      return translateValidationSummary(t)
    case DomainErrorType.Unexpected:
      return error.message
  }
}

export const translateValidationSummary = (t: TFunction): string =>
  t(($) => $.errors.byType.validation)

export const translateValidationIssue = (
  t: TFunction,
  issue: ValidationIssue,
  fieldLabel: string,
): string => {
  switch (issue.code) {
    case 'required':
      return t(($) => $.forms.validation.required, { field: fieldLabel })
    case 'min_length':
    case 'too_small':
      return translateLengthOrNumberMinimum(t, issue, fieldLabel)
    case 'max_length':
    case 'too_big':
      return translateLengthOrNumberMaximum(t, issue, fieldLabel)
    case 'minimum':
      return t(($) => $.forms.validation.minimum, {
        field: fieldLabel,
        min: formatParamValue(issue.params?.min ?? issue.params?.minimum),
      })
    case 'maximum':
      return t(($) => $.forms.validation.maximum, {
        field: fieldLabel,
        max: formatParamValue(issue.params?.max ?? issue.params?.maximum),
      })
    case 'invalid_enum':
    case 'invalid_value':
      return t(($) => $.forms.validation.invalidEnum, { field: fieldLabel })
    case 'invalid_format':
    case 'invalid_string':
      return t(($) => $.forms.validation.invalidFormat, { field: fieldLabel })
    default:
      return t(($) => $.forms.validation.invalid, { field: fieldLabel })
  }
}

export const translateValidationIssuesForPath = (
  t: TFunction,
  error: unknown,
  path: readonly string[],
  fieldLabel: string,
): string[] => {
  if (!isDomainError(error) || error.type !== DomainErrorType.Validation) {
    return []
  }

  const key = validationPathKey(path)

  return error.issues
    .filter((issue) => validationPathMatches(issue.path, path, key))
    .map((issue) => translateValidationIssue(t, issue, fieldLabel))
}

export const useDomainErrorMessage = (error: DomainError): string => {
  const { t } = useTranslation()

  return translateDomainError(t, error)
}

const validationPathKey = (path: readonly string[] | undefined) =>
  path?.join('.') ?? ''

const validationPathMatches = (
  issuePath: readonly string[] | undefined,
  path: readonly string[],
  pathKey: string,
) =>
  validationPathKey(issuePath) === pathKey ||
  Boolean(
    issuePath &&
      issuePath.length > path.length &&
      path.every((segment, index) => issuePath[index] === segment),
  )

const translateLengthOrNumberMinimum = (
  t: TFunction,
  issue: ValidationIssue,
  fieldLabel: string,
) => {
  if (issue.params?.valueType === 'string') {
    return t(($) => $.forms.validation.minLength, {
      field: fieldLabel,
      min: formatParamValue(issue.params.min ?? issue.params.minimum),
    })
  }

  return t(($) => $.forms.validation.minimum, {
    field: fieldLabel,
    min: formatParamValue(issue.params?.min ?? issue.params?.minimum),
  })
}

const translateLengthOrNumberMaximum = (
  t: TFunction,
  issue: ValidationIssue,
  fieldLabel: string,
) => {
  if (issue.params?.valueType === 'string') {
    return t(($) => $.forms.validation.maxLength, {
      field: fieldLabel,
      max: formatParamValue(issue.params.max ?? issue.params.maximum),
    })
  }

  return t(($) => $.forms.validation.maximum, {
    field: fieldLabel,
    max: formatParamValue(issue.params?.max ?? issue.params?.maximum),
  })
}

const formatParamValue = (value: unknown) =>
  value === undefined || value === null ? '' : String(value)
