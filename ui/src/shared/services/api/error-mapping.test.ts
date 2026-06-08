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
          data: {
            detail: 'Gateway failed.',
            retryable: true,
            status,
            title: 'Service Unavailable',
            type: '/problems/unavailable',
          },
          status,
        },
      }),
    ).toMatchObject({
      message: 'Gateway failed.',
      retryable: true,
      type: DomainErrorType.Unavailable,
    })
  })

  it('maps 422 problem validation errors to issue validation', () => {
    expect(
      mapApiErrorToDomainError({
        response: {
          data: {
            issues: [{ code: 'required', path: ['title'] }],
            retryable: false,
            status: 422,
            title: 'Validation Failed',
            type: '/problems/validation',
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
            retryable: false,
            status: 422,
            title: 'Validation Failed',
            type: '/problems/validation',
          },
          status: 422,
        },
      }),
    ).toMatchObject({
      issues: [],
      type: DomainErrorType.Validation,
    })
  })

  it('maps not found problem metadata to domain error metadata', () => {
    expect(
      mapApiErrorToDomainError({
        response: {
          data: {
            detail: 'Workspace missing.',
            entity: 'workspace',
            entityId: 'workspace-1',
            retryable: false,
            status: 404,
            title: 'Not Found',
            type: '/problems/not-found',
          },
          status: 404,
        },
      }),
    ).toEqual({
      entity: 'workspace',
      entityId: 'workspace-1',
      message: 'Workspace missing.',
      retryable: false,
      type: DomainErrorType.NotFound,
    })
  })

  it('maps bad request and conflict problems to domain errors', () => {
    expect(
      mapApiErrorToDomainError({
        response: {
          data: {
            detail: 'Request body must be valid JSON.',
            retryable: false,
            status: 400,
            title: 'Bad Request',
            type: '/problems/bad-request',
          },
          status: 400,
        },
      }),
    ).toMatchObject({
      message: 'Request body must be valid JSON.',
      retryable: false,
      type: DomainErrorType.Unexpected,
    })

    expect(
      mapApiErrorToDomainError({
        response: {
          data: {
            detail: 'Workspace already exists.',
            retryable: false,
            status: 409,
            title: 'Conflict',
            type: '/problems/conflict',
          },
          status: 409,
        },
      }),
    ).toMatchObject({
      message: 'Workspace already exists.',
      retryable: false,
      type: DomainErrorType.Conflict,
    })
  })

  it('falls back to HTTP status for unknown problem types', () => {
    expect(
      mapApiErrorToDomainError({
        response: {
          data: {
            detail: 'Custom conflict.',
            status: 409,
            title: 'Custom Conflict',
            type: '/problems/custom-conflict',
          },
          status: 409,
        },
      }),
    ).toMatchObject({
      message: 'Custom conflict.',
      retryable: false,
      type: DomainErrorType.Conflict,
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
