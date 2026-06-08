import { describe, expect, it } from 'vitest'

import { createAppI18n } from '@core/i18n'

import { ValidationIssueCode, domainError, type DomainError } from './index'
import {
  translateDomainError,
  translateValidationIssue,
  translateValidationIssuesForPath,
} from './translation'

describe('translateDomainError', () => {
  const translate = (error: DomainError) => translateDomainError(createAppI18n().t, error)

  it.each([
    {
      error: domainError.conflict('Server conflict'),
      expected: 'The data changed. Refresh and try again.',
      type: 'conflict',
    },
    {
      error: domainError.forbidden('Server forbidden'),
      expected: 'You do not have permission to do this.',
      type: 'forbidden',
    },
    {
      error: domainError.notFound('Server missing'),
      expected: 'We could not find this item.',
      type: 'not found',
    },
    {
      error: domainError.offline('Server offline'),
      expected: 'Cannot reach the service.',
      type: 'offline',
    },
    {
      error: domainError.timeout('Server timeout'),
      expected: 'This took too long. Try again.',
      type: 'timeout',
    },
    {
      error: domainError.unauthorized('Server unauthorized'),
      expected: 'Sign in to continue.',
      type: 'unauthorized',
    },
    {
      error: domainError.unavailable('Server unavailable'),
      expected: 'The service is temporarily unavailable.',
      type: 'unavailable',
    },
  ])('maps $type errors to translated UI copy', ({ error, expected }) => {
    expect(translate(error)).toBe(expected)
  })

  it('keeps specific messages only for unexpected errors', () => {
    expect(translate(domainError.unexpected('Sync failed.'))).toBe('Sync failed.')
  })

  it('maps validation errors to translated summary copy', () => {
    expect(translate(domainError.validation([{ code: 'required', path: ['title'] }]))).toBe(
      'Check the highlighted fields and try again.',
    )
  })

  it.each([
    {
      expected: 'Title is required.',
      issue: { code: ValidationIssueCode.Required },
      name: 'required',
    },
    {
      expected: 'Title must be at least 3 characters.',
      issue: {
        code: ValidationIssueCode.MinLength,
        params: { min: 3, valueType: 'string' },
      },
      name: 'min length',
    },
    {
      expected: 'Title must be at most 20 characters.',
      issue: {
        code: ValidationIssueCode.MaxLength,
        params: { max: 20, valueType: 'string' },
      },
      name: 'max length',
    },
    {
      expected: 'Title must be at least 1.',
      issue: { code: ValidationIssueCode.Minimum, params: { min: 1 } },
      name: 'minimum',
    },
    {
      expected: 'Title must be at most 100.',
      issue: { code: ValidationIssueCode.Maximum, params: { max: 100 } },
      name: 'maximum',
    },
    {
      expected: 'Enter a valid Title.',
      issue: { code: ValidationIssueCode.InvalidFormat },
      name: 'invalid format',
    },
    {
      expected: 'Title is invalid.',
      issue: { code: 'custom_code' },
      name: 'unknown code fallback',
    },
  ])('translates $name validation issues', ({ expected, issue }) => {
    expect(translateValidationIssue(createAppI18n().t, issue, 'Title')).toBe(expected)
  })

  it('translates validation issues for matching paths and nested paths', () => {
    const error = domainError.validation([
      { code: 'required', path: ['title'] },
      { code: 'minimum', params: { min: 0 }, path: ['fsrsParams', '0'] },
    ])
    const t = createAppI18n().t

    expect(translateValidationIssuesForPath(t, error, ['title'], 'Title')).toEqual([
      'Title is required.',
    ])
    expect(translateValidationIssuesForPath(t, error, ['fsrsParams'], 'FSRS parameters')).toEqual([
      'FSRS parameters must be at least 0.',
    ])
  })
})
