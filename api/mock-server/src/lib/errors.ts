import { z } from 'zod'

export const ValidationIssueCode = {
  Invalid: 'invalid',
  InvalidEnum: 'invalid_enum',
  InvalidFormat: 'invalid_format',
  InvalidValue: 'invalid_value',
  Maximum: 'maximum',
  MaxLength: 'max_length',
  Minimum: 'minimum',
  MinLength: 'min_length',
  Required: 'required',
} as const

export type ValidationIssueCode =
  (typeof ValidationIssueCode)[keyof typeof ValidationIssueCode]

export const zValidationIssue = z.object({
  path: z.array(z.string()).optional(),
  code: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
})

export const ProblemType = {
  BadRequest: '/problems/bad-request',
  Conflict: '/problems/conflict',
  Forbidden: '/problems/forbidden',
  NotFound: '/problems/not-found',
  Timeout: '/problems/timeout',
  Unauthorized: '/problems/unauthorized',
  Unexpected: '/problems/unexpected',
  Unavailable: '/problems/unavailable',
  Validation: '/problems/validation',
} as const

export type ProblemType = (typeof ProblemType)[keyof typeof ProblemType]

const zMessageProblemDetails = z.object({
  type: z.enum([
    ProblemType.BadRequest,
    ProblemType.Conflict,
    ProblemType.Forbidden,
    ProblemType.NotFound,
    ProblemType.Timeout,
    ProblemType.Unauthorized,
    ProblemType.Unexpected,
    ProblemType.Unavailable,
  ]),
  title: z.string().min(1),
  status: z.number().int().min(400).max(599),
  detail: z.string().min(1).optional(),
  retryable: z.boolean(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
})

const zValidationProblemDetails = z.object({
  type: z.literal(ProblemType.Validation),
  title: z.string().min(1),
  status: z.literal(422),
  detail: z.string().min(1).optional(),
  retryable: z.literal(false),
  issues: z.array(zValidationIssue),
})

export const zMockErrorBody = z.discriminatedUnion('type', [
  zMessageProblemDetails,
  zValidationProblemDetails,
])

export type MockErrorBody = z.infer<typeof zMockErrorBody>
export type ValidationIssue = z.infer<typeof zValidationIssue>

export class MockHttpError extends Error {
  readonly body: MockErrorBody
  readonly status: number

  constructor(status: number, body: MockErrorBody) {
    super(
      body.type === ProblemType.Validation ? 'Validation failed' : (body.detail ?? body.title),
    )
    this.status = status
    this.body = body
  }
}

const messageError = (
  status: number,
  type: Exclude<MockErrorBody['type'], typeof ProblemType.Validation>,
  title: string,
  detail: string,
  retryable = false,
  metadata?: { entity?: string; entityId?: string },
) =>
  new MockHttpError(status, {
    type,
    title,
    status,
    detail,
    retryable,
    ...metadata,
  })

export const badRequest = (message: string) =>
  messageError(400, ProblemType.BadRequest, 'Bad Request', message)

export const validationError = (issues: ValidationIssue[]) =>
  new MockHttpError(422, {
    type: ProblemType.Validation,
    title: 'Validation Failed',
    status: 422,
    retryable: false,
    issues,
  })

export const notFound = (resource: string, id: string) =>
  messageError(
    404,
    ProblemType.NotFound,
    'Not Found',
    `${resource} ${id} was not found`,
    false,
    {
      entity: resource,
      entityId: id,
    },
  )

export const conflict = (message: string) =>
  messageError(409, ProblemType.Conflict, 'Conflict', message)

export const unexpected = (message = 'Unexpected mock server error') =>
  messageError(500, ProblemType.Unexpected, 'Unexpected Error', message)
