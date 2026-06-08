import type { Hono } from 'hono'
import { ZodError, type ZodIssue, type z } from 'zod'

import {
  ValidationIssueCode,
  badRequest,
  MockHttpError,
  unexpected,
  validationError,
  type ValidationIssue,
} from './errors.ts'
import { newMockRequestContext, type MockRequestContext } from './requestContext.ts'

type RuntimeRoute = {
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  operationId: string
  path: string
  requestBody: boolean
}

type Runtime = {
  generatedErrorResponseSchemas: Partial<Record<string, Partial<Record<string, z.ZodType>>>>
  generatedOperationHandlers: Record<
    string,
    (request: never) => Promise<{ body?: unknown; status: number }>
  >
  generatedRequestBodySchemas: Partial<Record<string, z.ZodType>>
  generatedResponseSchemas: Record<string, z.ZodType>
  generatedRouteDefinitions: readonly RuntimeRoute[]
}

const methods = {
  DELETE: 'delete',
  GET: 'get',
  PATCH: 'patch',
  POST: 'post',
  PUT: 'put',
} as const

export const mockJsonResponse = (body: unknown, status: number, headers?: Headers) =>
  mockBodyResponse(body, status, 'application/json', headers)

export const mockProblemResponse = (body: unknown, status: number, headers?: Headers) =>
  mockBodyResponse(body, status, 'application/problem+json', headers)

const mockBodyResponse = (
  body: unknown,
  status: number,
  contentType: string,
  headers?: Headers,
) =>
  new Response(JSON.stringify(body), {
    headers: {
      ...(headers ? Object.fromEntries(headers.entries()) : {}),
      'content-type': contentType,
    },
    status,
  })

const parseBody = async (
  request: Request,
  route: RuntimeRoute,
  schema: z.ZodType | undefined,
) => {
  if (!route.requestBody) {
    return undefined
  }

  const rawBody = await request.json().catch(() => {
    throw badRequest('Request body must be valid JSON.')
  })

  if (!schema) {
    return rawBody
  }

  try {
    return schema.parse(rawBody)
  } catch (error) {
    if (error instanceof ZodError) {
      throw validationError(error.issues.map(toValidationIssue))
    }

    throw error
  }
}

const toValidationIssue = (issue: ZodIssue): ValidationIssue => {
  const rawIssue = issue as unknown as Record<string, unknown>
  const path = issue.path.map(String)
  const params = readValidationParams(rawIssue)
  const validationIssue: ValidationIssue = {
    code: toValidationIssueCode(issue, rawIssue),
  }

  if (path.length > 0) {
    validationIssue.path = path
  }
  if (Object.keys(params).length > 0) {
    validationIssue.params = params
  }

  return validationIssue
}

const toValidationIssueCode = (
  issue: ZodIssue,
  rawIssue: Record<string, unknown>,
): string => {
  switch (issue.code) {
    case 'invalid_type':
      return typeof issue.message === 'string' && issue.message.includes('received undefined')
        ? ValidationIssueCode.Required
        : ValidationIssueCode.Invalid
    case 'too_small':
      return rawIssue.origin === 'string'
        ? ValidationIssueCode.MinLength
        : ValidationIssueCode.Minimum
    case 'too_big':
      return rawIssue.origin === 'string'
        ? ValidationIssueCode.MaxLength
        : ValidationIssueCode.Maximum
    case 'invalid_value':
      return ValidationIssueCode.InvalidValue
    case 'invalid_format':
      return ValidationIssueCode.InvalidFormat
    default:
      return issue.code
  }
}

const readValidationParams = (issue: Record<string, unknown>) => {
  const params: Record<string, unknown> = {}

  if (typeof issue.origin === 'string') {
    params.valueType = issue.origin
  }
  if (issue.minimum !== undefined) {
    params.min = issue.minimum
  }
  if (issue.maximum !== undefined) {
    params.max = issue.maximum
  }
  if (issue.format !== undefined) {
    params.format = issue.format
  }
  if (issue.values !== undefined) {
    params.values = issue.values
  }

  return params
}

export const registerGeneratedMockRoutes = (
  app: Hono,
  options: {
    basePath?: string
    controllers: Record<string, unknown>
    runtime: Runtime
  },
) => {
  for (const route of options.runtime.generatedRouteDefinitions) {
    const method = methods[route.method]
    const routePath = `${options.basePath ?? ''}${route.path}`

    app[method](routePath, async (context) => {
      const requestContext = newMockRequestContext(context.req.raw)

      try {
        const body = await parseBody(
          context.req.raw,
          route,
          options.runtime.generatedRequestBodySchemas[route.operationId],
        )
        const result = await options.runtime.generatedOperationHandlers[route.operationId]({
          context: requestContext,
          controllers: options.controllers,
          input: {
            body,
            path: context.req.param(),
            query: context.req.query(),
          },
        } as never)
        const responseSchema = options.runtime.generatedResponseSchemas[route.operationId]
        const responseBody =
          result.body === undefined ? undefined : responseSchema.parse(result.body)

        if (responseBody === undefined) {
          return new Response(null, {
            headers: requestContext.responseHeaders,
            status: result.status,
          })
        }

        return mockJsonResponse(responseBody, result.status, requestContext.responseHeaders)
      } catch (caught) {
        const error =
          caught instanceof MockHttpError
            ? caught
            : caught instanceof Error
              ? unexpected(caught.message)
              : unexpected()

        return mockProblemResponse(error.body, error.status, requestContext.responseHeaders)
      }
    })
  }
}
