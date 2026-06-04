import { describe, expect, it } from 'vitest'

import { domainError, err, ok } from '@shared/errors'

import { unwrapDomainResult } from './domain-query'

describe('unwrapDomainResult', () => {
  it('returns successful values', async () => {
    await expect(unwrapDomainResult(Promise.resolve(ok('value')))).resolves.toBe('value')
  })

  it('throws domain errors', async () => {
    const error = domainError.notFound('Missing')

    await expect(unwrapDomainResult(Promise.resolve(err(error)))).rejects.toBe(error)
  })
})
