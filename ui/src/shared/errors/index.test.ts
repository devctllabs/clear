import { describe, expect, it } from 'vitest'

import { DomainErrorType, domainError, err, getUserMessage, ok } from './index'

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
    expect(domainError.validation('Invalid', { title: ['Required'] })).toMatchObject({
      fieldErrors: { title: ['Required'] },
      retryable: false,
      type: DomainErrorType.Validation,
    })
  })

  it('renders user-facing messages by error type', () => {
    expect(getUserMessage(domainError.conflict())).toBe(
      'The data changed. Refresh and try again.',
    )
    expect(getUserMessage(domainError.forbidden())).toBe(
      'You do not have permission to do this.',
    )
    expect(getUserMessage(domainError.notFound())).toBe('We could not find this item.')
    expect(getUserMessage(domainError.offline())).toBe('Cannot reach the service.')
    expect(getUserMessage(domainError.timeout())).toBe('This took too long. Try again.')
    expect(getUserMessage(domainError.unauthorized())).toBe('Sign in to continue.')
    expect(getUserMessage(domainError.unavailable())).toBe(
      'The service is temporarily unavailable.',
    )
    expect(getUserMessage(domainError.unexpected('Server exploded.'))).toBe(
      'Server exploded.',
    )
    expect(getUserMessage(domainError.validation('Title is required.', {}))).toBe(
      'Title is required.',
    )
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
})
