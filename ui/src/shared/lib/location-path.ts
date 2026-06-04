const locationSeparator = ' / '
const compactLocationPrefix = '...'

const normalizeLocationPath = (path: readonly string[]) =>
  path.map((segment) => segment.trim()).filter(Boolean)

export const formatLocationPathLabel = (path: readonly string[]) =>
  normalizeLocationPath(path).join(locationSeparator)

export const formatCompactLocationPath = (path: readonly string[]) => {
  const segments = normalizeLocationPath(path)

  if (segments.length <= 2) {
    return segments.join(locationSeparator)
  }

  return [compactLocationPrefix, ...segments.slice(-2)].join(locationSeparator)
}
