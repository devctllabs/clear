import { invoke } from '@tauri-apps/api/core'

import { err, ok, type DomainResult } from '@shared/errors'

import { mapTauriErrorToDomainError } from './tauri-error'

export const invokeDomain = async <T>(
  command: string,
  args?: Record<string, unknown>,
  fallbackMessage?: string,
): DomainResult<T> => {
  try {
    return ok(await invoke<T>(command, args))
  } catch (error) {
    return err(mapTauriErrorToDomainError(error, fallbackMessage))
  }
}
