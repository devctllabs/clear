import type { TFunction } from 'i18next'
import type { FieldError } from 'react-hook-form'
import { z } from 'zod'

export const requiredFieldMessage = (t: TFunction, fieldLabel: string): string =>
  t(($) => $.forms.validation.required, { field: fieldLabel })

export const requiredTrimmedText = (t: TFunction, fieldLabel: string) =>
  z.string().trim().min(1, requiredFieldMessage(t, fieldLabel))

export const fieldErrorMessages = (error?: FieldError): string[] | undefined =>
  typeof error?.message === 'string' && error.message.length > 0
    ? [error.message]
    : undefined

const hasFieldMessages = (messages: object): boolean =>
  Object.values(messages).some(
    (fieldMessages) => Array.isArray(fieldMessages) && fieldMessages.length > 0,
  )

export const mergeFieldValidationMessages = <T extends object>(
  ...sources: Array<T | undefined>
): T | undefined => {
  const merged = Object.assign({}, ...sources) as T

  return hasFieldMessages(merged) ? merged : undefined
}
