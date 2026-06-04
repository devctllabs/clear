import { err, ok, type DomainResult } from '@shared/errors'
import { createAbortError } from '@shared/lib/abort'

import { mapApiErrorToDomainError } from './error-mapping'

type ApiResponse<T> = {
  data: T
}

type ApiResponseData<TRequest> =
  Awaited<TRequest> extends ApiResponse<infer TValue> ? TValue : never

export function toDomainResult<TRequest extends Promise<ApiResponse<unknown>>>(
  request: TRequest,
  mapValue?: undefined,
  fallbackMessage?: string,
): DomainResult<ApiResponseData<TRequest>>

export function toDomainResult<TRequest extends Promise<ApiResponse<unknown>>, TResult>(
  request: TRequest,
  mapValue: (value: ApiResponseData<TRequest>) => TResult,
  fallbackMessage?: string,
): DomainResult<TResult>

export async function toDomainResult<
  TRequest extends Promise<ApiResponse<unknown>>,
  TResult = ApiResponseData<TRequest>,
>(
  request: TRequest,
  mapValue?: (value: ApiResponseData<TRequest>) => TResult,
  fallbackMessage?: string,
): DomainResult<TResult | ApiResponseData<TRequest>> {
  try {
    const response = await request
    const data = response.data as ApiResponseData<TRequest>

    if (mapValue) {
      return ok(mapValue(data))
    }

    return ok(data)
  } catch (error) {
    if (isCanceledError(error)) {
      throw createAbortError()
    }

    return err(mapApiErrorToDomainError(error, fallbackMessage))
  }
}

export const toVoidDomainResult = <TRequest extends Promise<ApiResponse<unknown>>>(
  request: TRequest,
  fallbackMessage?: string,
) => toDomainResult(request, () => undefined, fallbackMessage)

const isCanceledError = (value: unknown) =>
  isObject(value) && value.code === 'ERR_CANCELED'

const isObject = (value: unknown): value is { code?: unknown } =>
  typeof value === 'object' && value !== null
