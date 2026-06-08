import { describe, expect, it } from 'vitest'

import {
  DomainErrorType,
  ValidationIssueCode,
  domainError,
  err,
  isDomainError,
  isValidationIssue,
  ok,
} from './index'

describe('domain errors', () => {
  it('creates typed results', () => {
    expect(ok('value')).toEqual({ ok: true, value: 'value' })
    expect(err(domainError.notFound('Missing'))).toEqual({
      error: {
        entity: undefined,
        entityId: undefined,
        message: 'Missing',
        retryable: false,
        type: DomainErrorType.NotFound,
      },
      ok: false,
    })
  })

  it('exposes factories with retryable semantics', () => {
    expect(domainError.offline()).toMatchObject({
      retryable: true,
      type: DomainErrorType.Offline,
    })
    expect(domainError.timeout()).toMatchObject({
      retryable: true,
      type: DomainErrorType.Timeout,
    })
    expect(domainError.validation([{ code: 'required', path: ['title'] }])).toEqual({
      issues: [{ code: 'required', path: ['title'] }],
      retryable: false,
      type: DomainErrorType.Validation,
    })
  })

  it('creates all non-retryable factory variants', () => {
    expect(domainError.forbidden('No access')).toMatchObject({
      message: 'No access',
      retryable: false,
      type: DomainErrorType.Forbidden,
    })
    expect(domainError.unauthorized('Sign in')).toMatchObject({
      message: 'Sign in',
      retryable: false,
      type: DomainErrorType.Unauthorized,
    })
    expect(domainError.unexpected()).toMatchObject({
      retryable: false,
      type: DomainErrorType.Unexpected,
    })
    expect(domainError.unavailable()).toMatchObject({
      retryable: true,
      type: DomainErrorType.Unavailable,
    })
    expect(domainError.notFound('Missing note', 'note', 'note-1')).toMatchObject({
      entity: 'note',
      entityId: 'note-1',
      retryable: false,
      type: DomainErrorType.NotFound,
    })
  })

  it('strictly detects validation domain error payloads', () => {
    expect(isDomainError(domainError.validation([{ code: 'required' }]))).toBe(true)
    expect(
      isDomainError({
        issues: [{ code: '' }],
        retryable: false,
        type: DomainErrorType.Validation,
      }),
    ).toBe(false)
    expect(
      isDomainError({
        fieldErrors: { title: ['Required'] },
        message: 'Invalid',
        retryable: false,
        type: DomainErrorType.Validation,
      }),
    ).toBe(false)
    expect(
      isDomainError({
        issues: [{ code: 'required' }],
        retryable: false,
        type: 'custom',
      }),
    ).toBe(false)
  })

  it('strictly detects validation issue payloads', () => {
    expect(isValidationIssue({ code: ValidationIssueCode.Required })).toBe(true)
    expect(
      isValidationIssue({
        code: ValidationIssueCode.Minimum,
        params: { min: 1 },
        path: ['settings', 'limit'],
      }),
    ).toBe(true)
    expect(isValidationIssue({ code: 'custom_code' })).toBe(true)

    expect(isValidationIssue(null)).toBe(false)
    expect(isValidationIssue('required')).toBe(false)
    expect(isValidationIssue({ path: ['title'] })).toBe(false)
    expect(isValidationIssue({ code: '' })).toBe(false)
    expect(isValidationIssue({ code: 42 })).toBe(false)
    expect(isValidationIssue({ code: 'required', path: 'title' })).toBe(false)
    expect(isValidationIssue({ code: 'required', path: ['title', 0] })).toBe(false)
    expect(isValidationIssue({ code: 'minimum', params: null })).toBe(false)
    expect(isValidationIssue({ code: 'minimum', params: ['min'] })).toBe(false)
  })

  it('strictly detects message domain error payloads', () => {
    expect(isDomainError(domainError.notFound('Missing note', 'note', 'note-1'))).toBe(
      true,
    )
    expect(isDomainError(domainError.offline('No connection'))).toBe(true)

    expect(
      isDomainError({
        message: 42,
        retryable: false,
        type: DomainErrorType.NotFound,
      }),
    ).toBe(false)
    expect(
      isDomainError({
        message: 'Missing',
        retryable: true,
        type: DomainErrorType.NotFound,
      }),
    ).toBe(false)
    expect(
      isDomainError({
        message: 'No connection',
        retryable: false,
        type: DomainErrorType.Offline,
      }),
    ).toBe(false)
    expect(
      isDomainError({
        entity: 42,
        message: 'Missing',
        retryable: false,
        type: DomainErrorType.NotFound,
      }),
    ).toBe(false)
    expect(
      isDomainError({
        entityId: 42,
        message: 'Missing',
        retryable: false,
        type: DomainErrorType.NotFound,
      }),
    ).toBe(false)
  })
})
