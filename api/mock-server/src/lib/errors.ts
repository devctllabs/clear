import { z } from 'zod'

export const zValidationIssue = z.object({
  path: z.array(z.string()).optional(),
  code: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
})

const zMessageDomainError = z.object({
  type: z.enum([
    'conflict',
    'forbidden',
    'not_found',
    'offline',
    'timeout',
    'unauthorized',
    'unexpected',
    'unavailable',
  ]),
  message: z.string().min(1),
  retryable: z.boolean(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
})

const zValidationDomainError = z.object({
  type: z.literal('validation'),
  retryable: z.literal(false),
  issues: z.array(zValidationIssue),
})

export const zMockErrorBody = z.discriminatedUnion('type', [
  zMessageDomainError,
  zValidationDomainError,
])

export type MockErrorBody = z.infer<typeof zMockErrorBody>
export type ValidationIssue = z.infer<typeof zValidationIssue>

export class MockHttpError extends Error {
  readonly body: MockErrorBody
  readonly status: number

  constructor(status: number, body: MockErrorBody) {
    super(body.type === 'validation' ? 'Validation failed' : body.message)
    this.status = status
    this.body = body
  }
}

const messageError = (
  status: number,
  type: Exclude<MockErrorBody['type'], 'validation'>,
  message: string,
  retryable = false,
  metadata?: { entity?: string; entityId?: string },
) =>
  new MockHttpError(status, {
    type,
    message,
    retryable,
    ...metadata,
  })

export const badRequest = (message: string) =>
  messageError(400, 'unexpected', message)

export const validationError = (issues: ValidationIssue[]) =>
  new MockHttpError(422, {
    type: 'validation',
    retryable: false,
    issues,
  })

export const notFound = (resource: string, id: string) =>
  messageError(404, 'not_found', `${resource} ${id} was not found`, false, {
    entity: resource,
    entityId: id,
  })

export const conflict = (message: string) =>
  messageError(409, 'conflict', message)

export const unexpected = (message = 'Unexpected mock server error') =>
  messageError(500, 'unexpected', message)
