import { domainError, isDomainError, type DomainError } from '@shared/errors'

export const mapTauriErrorToDomainError = (
  error: unknown,
  fallbackMessage = 'Tauri runtime failed.',
): DomainError => {
  if (isDomainError(error)) {
    return error
  }

  if (error instanceof Error && error.message.trim()) {
    return domainError.unexpected(error.message.trim())
  }

  if (typeof error === 'string' && error.trim()) {
    return domainError.unexpected(error.trim())
  }

  return domainError.unexpected(fallbackMessage)
}
