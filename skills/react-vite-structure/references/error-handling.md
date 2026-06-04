# Error Handling

Defines typed domain errors, `Result`/`DomainResult`, transport mapping boundaries, and React Query unwrapping.

For user-facing loading, empty, partial-data, and error rendering policy, read `ui-error-states.md`. This file owns the domain/model/query boundary; `ui-error-states.md` owns where errors appear in the UI.

## Contents

- Ownership
- Result
- Domain Errors
- Domain Result
- User Messages
- API Error Mapping
- Tauri Error Mapping
- React Query Boundary
- Testing

## Ownership

Keep error handling split by responsibility:

```text
src/shared/errors/
  result.ts                         # Generic Result<T, E>
  domain-error.ts                   # DomainErrorType, DomainError, factories
  domain-result.ts                  # DomainResult<T>
  messages.ts                       # Generic user-facing fallback messages
  index.ts

src/shared/services/api/
  error-mapping.ts                  # HTTP/API -> DomainError

src/platform/tauri/
  tauri-error.ts                    # Tauri/IPC unknown fallback -> DomainError
  invoke.ts                         # invokeDomain helper

src/core/query/
  domain-query.ts                   # React Query unwrap helper
```

Rules:

- Service contracts return `Promise<DomainResult<T>>` for async backend/runtime operations.
- Platform implementations normalize transport/runtime failures into `DomainError`.
- Feature hooks unwrap `DomainResult<T>` at the React Query boundary so `query.data` is `T` and `query.error` is `DomainError`.
- Do not throw from services for expected domain failures. Return `err(domainError.*(...))`.
- Abort/cancel errors are control flow, not domain failures; rethrow them when using an `AbortSignal`.

## Result

Keep `Result` generic and domain-agnostic:

```ts
// shared/errors/result.ts
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

export const err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});
```

## Domain Errors

Use a string enum for type-safe error constants and a discriminated union for narrowing:

```ts
// shared/errors/domain-error.ts
export enum DomainErrorType {
  Validation = 'validation',
  Unauthorized = 'unauthorized',
  Forbidden = 'forbidden',
  NotFound = 'not_found',
  Conflict = 'conflict',
  RateLimited = 'rate_limited',
  Network = 'network',
  Unexpected = 'unexpected',
}

export type FieldErrors = Record<string, string[]>;
export type NetworkReason = 'offline' | 'timeout' | 'unavailable';

type BaseDomainError<TType extends DomainErrorType> = {
  type: TType;
  message: string;
  retryable: boolean;
};

export type ValidationError = BaseDomainError<DomainErrorType.Validation> & {
  fieldErrors: FieldErrors;
};

export type NotFoundError = BaseDomainError<DomainErrorType.NotFound> & {
  entity?: string;
  entityId?: string;
};

export type RateLimitedError = BaseDomainError<DomainErrorType.RateLimited> & {
  retryAfterMs?: number;
};

export type NetworkError = BaseDomainError<DomainErrorType.Network> & {
  reason: NetworkReason;
};

export type DomainError =
  | ValidationError
  | BaseDomainError<DomainErrorType.Unauthorized>
  | BaseDomainError<DomainErrorType.Forbidden>
  | NotFoundError
  | BaseDomainError<DomainErrorType.Conflict>
  | RateLimitedError
  | NetworkError
  | BaseDomainError<DomainErrorType.Unexpected>;

export const domainError = {
  validation(message: string, fieldErrors: FieldErrors): ValidationError {
    return { type: DomainErrorType.Validation, message, fieldErrors, retryable: false };
  },

  unauthorized(message = 'Unauthorized'): DomainError {
    return { type: DomainErrorType.Unauthorized, message, retryable: false };
  },

  forbidden(message = 'Forbidden'): DomainError {
    return { type: DomainErrorType.Forbidden, message, retryable: false };
  },

  notFound(message = 'Not found', params?: { entity?: string; entityId?: string }): NotFoundError {
    return {
      type: DomainErrorType.NotFound,
      message,
      entity: params?.entity,
      entityId: params?.entityId,
      retryable: false,
    };
  },

  conflict(message = 'Conflict'): DomainError {
    return { type: DomainErrorType.Conflict, message, retryable: false };
  },

  rateLimited(message = 'Rate limited', retryAfterMs?: number): RateLimitedError {
    return { type: DomainErrorType.RateLimited, message, retryAfterMs, retryable: true };
  },

  network(message: string, reason: NetworkReason): NetworkError {
    return { type: DomainErrorType.Network, message, reason, retryable: true };
  },

  unexpected(message = 'Unexpected error'): DomainError {
    return { type: DomainErrorType.Unexpected, message, retryable: false };
  },
} as const;

export function isDomainError(value: unknown): value is DomainError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'message' in value &&
    'retryable' in value &&
    typeof (value as { type?: unknown }).type === 'string' &&
    typeof (value as { message?: unknown }).message === 'string' &&
    typeof (value as { retryable?: unknown }).retryable === 'boolean'
  );
}

export const isRetryableDomainError = (error: DomainError): boolean =>
  error.retryable;
```

Do not model domain errors with classes or inheritance. Keep them as plain data objects so they serialize cleanly across HTTP/Tauri, narrow with `switch`, and compare cleanly in tests.

## Domain Result

```ts
// shared/errors/domain-result.ts
import type { DomainError } from './domain-error';
import type { Result } from './result';

export type DomainResult<T> = Result<T, DomainError>;
```

```ts
// shared/errors/index.ts
export * from './result';
export * from './domain-error';
export * from './domain-result';
export * from './messages';
```

## User Messages

Keep only generic fallback messages in `shared/errors/messages.ts`. Feature-specific copy belongs near the feature UI.

```ts
// shared/errors/messages.ts
import { DomainErrorType, type DomainError } from './domain-error';

export function getDomainErrorMessage(error: DomainError): string {
  switch (error.type) {
    case DomainErrorType.Validation:
      return error.message;
    case DomainErrorType.Unauthorized:
      return 'Authentication required.';
    case DomainErrorType.Forbidden:
      return 'You do not have permission to perform this action.';
    case DomainErrorType.NotFound:
      return 'Requested resource was not found.';
    case DomainErrorType.Conflict:
      return 'The data is out of date. Refresh and try again.';
    case DomainErrorType.RateLimited:
      return 'Too many requests. Try again later.';
    case DomainErrorType.Network:
      return error.reason === 'offline'
        ? 'No network connection.'
        : 'Service is temporarily unavailable.';
    case DomainErrorType.Unexpected:
      return error.message;
  }
}
```

## API Error Mapping

Keep HTTP and API-client specific logic outside `shared/errors`:

```ts
// shared/services/api/error-mapping.ts
import { domainError, isDomainError, type DomainError } from '@shared/errors';

export function mapApiErrorToDomainError(
  error: unknown,
  fallbackMessage = 'Unexpected error occurred.',
): DomainError {
  if (isDomainError(error)) {
    return error;
  }

  // Map the current HTTP client here:
  // - validation payloads -> domainError.validation(...)
  // - 401/403/404/409/429 -> matching domain errors
  // - timeouts/offline/5xx -> domainError.network(...)
  // - unknown failures -> domainError.unexpected(...)

  if (error instanceof Error && error.message.trim()) {
    return domainError.unexpected(error.message);
  }

  return domainError.unexpected(fallbackMessage);
}
```

If the project uses Axios, Axios-specific checks stay in this file. Do not import Axios from `shared/errors`.

## Tauri Error Mapping

Tauri commands should return serialized `DomainError` for expected failures, but the frontend still needs a small fallback for unknown IPC failures:

```ts
// platform/tauri/tauri-error.ts
import { domainError, isDomainError, type DomainError } from '@shared/errors';

export function mapTauriErrorToDomainError(
  error: unknown,
  fallbackMessage: string,
): DomainError {
  if (isDomainError(error)) {
    return error;
  }

  if (error instanceof Error && error.message.trim()) {
    return domainError.unexpected(error.message);
  }

  if (typeof error === 'string' && error.trim()) {
    return domainError.unexpected(error.trim());
  }

  return domainError.unexpected(fallbackMessage);
}
```

Wrap Tauri invoke calls to remove repeated `try/catch` from services:

```ts
// platform/tauri/invoke.ts
import { invoke } from '@tauri-apps/api/core';
import { err, ok, type DomainResult } from '@shared/errors';
import { abortable, isAbortError } from '@shared/utils/abort';
import { mapTauriErrorToDomainError } from './tauri-error';

export async function invokeDomain<T>(
  command: string,
  args: Record<string, unknown> | undefined,
  fallbackMessage: string,
  options: { signal?: AbortSignal } = {},
): Promise<DomainResult<T>> {
  try {
    return ok(await abortable(invoke<T>(command, args), options.signal));
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    return err(mapTauriErrorToDomainError(error, fallbackMessage));
  }
}
```

## React Query Boundary

React Query query functions must reject for error state. Unwrap `DomainResult<T>` at the hook boundary:

```ts
// core/query/domain-query.ts
import type { DomainResult } from '@shared/errors';

export async function unwrapDomainResult<T>(
  resultPromise: Promise<DomainResult<T>>,
): Promise<T> {
  const result = await resultPromise;

  if (result.ok) {
    return result.value;
  }

  throw result.error;
}
```

Use the `TError` generic so `query.error` is typed:

```ts
const query = useQuery<Product[], DomainError>({
  queryKey: ['products'],
  queryFn: () => unwrapDomainResult(productService.getAll()),
});
```

Use `DomainError.retryable` for React Query automatic retry policy:

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isDomainError(error)) {
          return error.retryable && failureCount < 1;
        }

        return failureCount < 1;
      },
    },
  },
});
```

Mutations follow the same boundary:

```ts
const mutation = useMutation<Product, DomainError, CreateProductDto>({
  mutationFn: (data) => unwrapDomainResult(productService.create(data)),
});
```

## Testing

Co-locate tests with the implementation:

```text
shared/errors/domain-error.test.ts
shared/services/api/error-mapping.test.ts
platform/tauri/tauri-error.test.ts
platform/tauri/invoke.test.ts
core/query/domain-query.test.ts
```

Test:

- `ok`/`err` shape and `DomainResult` assignability;
- `DomainErrorType` narrowing and factories;
- retryability rules;
- API status/payload mapping for the current HTTP client;
- Tauri unknown fallback and pass-through of serialized `DomainError`;
- `unwrapDomainResult` resolving values and rejecting with `DomainError`.
