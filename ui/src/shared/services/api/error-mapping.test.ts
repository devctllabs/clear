import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { DomainErrorType } from '@shared/errors'

import { mapApiErrorToDomainError } from './error-mapping'

describe('mapApiErrorToDomainError', () => {
  it('maps Zod response validation errors to service unavailable', () => {
    let caught: unknown

    try {
      z.array(z.string()).parse('not an array')
    } catch (error) {
      caught = error
    }

    expect(mapApiErrorToDomainError(caught)).toMatchObject({
      retryable: true,
      type: DomainErrorType.Unavailable,
    })
  })

  it('maps Zod-like response validation errors to service unavailable', () => {
    expect(
      mapApiErrorToDomainError({
        message: '[{"expected":"array","message":"Invalid input"}]',
        name: 'ZodError',
      }),
    ).toMatchObject({
      retryable: true,
      type: DomainErrorType.Unavailable,
    })
  })

  it.each([502, 503, 504])('maps status %s to service unavailable', (status) => {
    expect(
      mapApiErrorToDomainError({
        response: {
          data: { message: 'Gateway failed.' },
          status,
        },
      }),
    ).toMatchObject({
      message: 'Gateway failed.',
      retryable: true,
      type: DomainErrorType.Unavailable,
    })
  })

  it('keeps 422 API validation errors as issue validation', () => {
    expect(
      mapApiErrorToDomainError({
        response: {
          data: {
            issues: [{ code: 'required', path: ['title'] }],
            retryable: false,
            type: DomainErrorType.Validation,
          },
          status: 422,
        },
      }),
    ).toEqual({
      issues: [{ code: 'required', path: ['title'] }],
      retryable: false,
      type: DomainErrorType.Validation,
    })
  })

  it('drops malformed 422 validation issues', () => {
    expect(
      mapApiErrorToDomainError({
        response: {
          data: {
            issues: [{ code: 42, path: ['title'] }],
          },
          status: 422,
        },
      }),
    ).toMatchObject({
      issues: [],
      type: DomainErrorType.Validation,
    })
  })

  it('keeps network and timeout errors retryable', () => {
    expect(mapApiErrorToDomainError({ code: 'ERR_NETWORK' })).toMatchObject({
      retryable: true,
      type: DomainErrorType.Offline,
    })

    expect(mapApiErrorToDomainError({ code: 'ETIMEDOUT' })).toMatchObject({
      retryable: true,
      type: DomainErrorType.Timeout,
    })
  })
})
