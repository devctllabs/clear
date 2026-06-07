import { validationError } from './errors.ts'

export const trimOptionalText = (value: string): string => value.trim()

export const requireNonBlankText = (value: string, path: string): string => {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    throw validationError([{ code: 'required', path: [path] }])
  }

  return trimmed
}
