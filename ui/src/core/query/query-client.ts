import { QueryClient } from '@tanstack/react-query'

import { isDomainError } from '@shared/errors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isDomainError(error)) {
          return error.retryable && failureCount < 1
        }

        return failureCount < 1
      },
      staleTime: 10_000,
    },
  },
})
