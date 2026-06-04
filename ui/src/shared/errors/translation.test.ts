import { describe, expect, it } from 'vitest'

import { createAppI18n } from '@core/i18n'

import { domainError, type DomainError } from './index'
import { translateDomainError } from './translation'

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

  it('keeps specific messages for unexpected and validation errors', () => {
    expect(translate(domainError.unexpected('Sync failed.'))).toBe('Sync failed.')
    expect(translate(domainError.validation('Title is required.', {}))).toBe(
      'Title is required.',
    )
  })
})
