const abortErrorMessage = 'The operation was aborted.'

export const createAbortError = () => {
  if (typeof DOMException !== 'undefined') {
    return new DOMException(abortErrorMessage, 'AbortError')
  }

  const error = new Error(abortErrorMessage)
  error.name = 'AbortError'

  return error
}

export const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === 'AbortError'

export const abortable = <T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> => {
  if (!signal) {
    return promise
  }

  if (signal.aborted) {
    return Promise.reject(createAbortError())
  }

  return new Promise<T>((resolve, reject) => {
    const handleAbort = () => {
      reject(createAbortError())
    }

    signal.addEventListener('abort', handleAbort, { once: true })

    promise.then(resolve, reject).finally(() => {
      signal.removeEventListener('abort', handleAbort)
    })
  })
}
